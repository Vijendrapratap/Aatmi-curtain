# Render agent: photoreal fabric swap and room staging

Date: 2026-09-12
Branch: feat/guided-workspace-ux
Status: draft for review

## 1. Problem

Staff use the studio to build catalog product shots: pick a curtain
template photo, assign a fabric to each zone, export an image a client
can be shown. Today the output is not client-grade. Three causes, all
in the current code:

1. The "Live preview" (`src/utils/fabricRenderer.ts`) never touches a
   photo. It draws the curtain procedurally from a synthetic plate
   (`src/utils/realisticPhotoPlates.ts`). Catalog templates set both
   `original_image_url` and `plate_id`, and `getTemplateRealPhotoUrl`
   prefers the plate, so the real photo is never the base.
2. The AI path (`src/utils/maskedPipeline.ts`,
   `POST /api/generate-curtain-fabric`) inpaints one zone at a time from
   the browser, sending a solid-tinted guide image as a mask substitute
   and feather-compositing the result back. Source photos are 242 to
   454 px wide. On the OpenRouter path the guide is never sent
   (`callOpenRouterInpaint` drops `maskImage`). The model never sees the
   whole design.
3. Room staging (`POST /api/room-visualize`) sends the whole room photo
   and the whole curtain render with no spatial guidance. The window
   detection result is computed and discarded. On failure the route
   returns the unstaged curtain as if it had succeeded.

A manual Gemini session with the same inputs (one real curtain photo,
one swatch, one plain instruction, whole-image edit) produced a result
staff would show a client. That is the bar.

## 2. Goals and non-goals

Goals

- A "Render" action that turns a template photo plus zone assignments
  into a photoreal product image comparable to the manual Gemini
  result, in about 60 seconds or less.
- The same machinery stages that image into a real room photo.
- Background outside the curtain is pixel-identical to the source.
- Every render is explainable: staff can see the candidates, the scores
  and the prompt that produced the chosen image.

Non-goals

- Exact pattern-repeat fidelity. A convincing likeness of the swatch is
  the requirement (decided 2026-09-12). A texture-projection stage can
  be added later without changing the pipeline shape.
- Persistent storage. The app has no database wired up. Results land in
  the client Zustand store as today. Database work is a separate task.
- Customer self-serve. The audience is brand staff.

## 3. Pipeline

One server-side job runner, one module per stage under
`src/server/renderAgent/`. Two job kinds share the runner:
`fabric_swap` and `room_stage`.

### Stage 0. Template prep (once per template)

Runs when a template is created or its photo is replaced.

- The existing zone analysis (`POST /api/analyze-curtain`) is extended
  to return, per zone, a plain-language `description` (for example
  "top pleated band, roughly the upper 60% of the curtain"). Staff can
  edit it on the zone review screen.
- A `curtain_mask_url` is computed as the union of all zone polygons,
  rasterised at photo resolution, feathered 6 px, stored on the
  template.
- Upload guard: warn below 1500 px width, reject below 1000 px.

New fields on `CurtainTemplate` (`src/types/curtain.ts`):
`curtain_mask_url: string`; on `Region`: `description: string`.

### Stage 1. Prompt build

`buildFabricSwapPrompt(template, assignments, fabrics)` returns
`{ text, images }`. Pure function, unit-tested against exact text.

Prompt shape, in this order:

1. Task line. "Edit Image 1, a photograph of a curtain, by changing the
   fabric of specific zones. Return one photograph."
2. Image legend. "Image 1: the curtain photograph. Image 2: fabric for
   the top pleated band. Image 3: ..." One swatch image per changed
   zone, in zone order.
3. Per-zone instruction for each changed zone. "Replace the {zone
   description} entirely with the fabric in Image N ({fabric name},
   {weave}, {colour}). The fabric must fall into the existing pleats
   and folds. Pattern repeat about 1/20 of the curtain height. Keep the
   original lighting, shadows and highlights."
4. Preservation clause. Names every unchanged zone by description,
   then: "Keep the rod, wall, floor, window and everything outside the
   curtain exactly as in Image 1. No text, no watermark, no added
   objects, no change of camera angle or crop."

`buildRoomStagePrompt(roomPhoto, curtainImage, windowBbox)` follows the
same four parts. The window box from detection is written into the
instruction as a percentage rectangle ("the window occupies roughly
x 30-70%, y 10-95% of Image 1") and the curtains are to be mounted
floor to ceiling across it.

### Stage 2. Generate

Three calls in parallel to the image model with the same prompt and
images, different seeds where the provider supports it. Requested
output: 2K on the template's own aspect ratio (not the hardcoded 4:5).
Each result is a data URL candidate with an id and the round number.

### Stage 3. Grade

`gradeCandidate(original, swatches, candidate, rubric)` sends the images
to the vision model and asks for JSON only:

```json
{
  "items": [
    { "key": "target_zones", "score": 0, "reason": "" },
    { "key": "other_zones_unchanged", "score": 0, "reason": "" },
    { "key": "pleats_lighting", "score": 0, "reason": "" },
    { "key": "no_artifacts", "score": 0, "reason": "" },
    { "key": "swatch_likeness", "score": 0, "reason": "" }
  ]
}
```

Fabric swap rubric (each 0 to 10):

- `target_zones`: intended fabric is on the intended zones and nowhere
  else.
- `other_zones_unchanged`: every non-target zone keeps its colour and
  pattern.
- `pleats_lighting`: folds, shadows and highlights follow the original.
- `no_artifacts`: no text, watermark, added objects, warped rod, wall
  or floor.
- `swatch_likeness`: fabric resembles the swatch in colour, pattern and
  scale.

Room stage rubric replaces the first two:

- `window_mounted`: curtains hang on the detected window, full height,
  plausible scale.
- `room_unchanged`: furniture, floor, walls and lighting unchanged.

Pass rule: no item below 6 and total at least 35 of 50. Both are named
constants in `src/server/renderAgent/grading.ts`. The JSON is validated
with zod; a malformed grader reply counts as a retryable error.

### Stage 4. Select or retry

Highest total among passing candidates wins. If none pass, the reasons
from the best-scoring candidate are appended to the prompt as
"Previous attempt problems, avoid these: ..." and Stages 2 and 3 run
once more. Hard cap two rounds. After two failed rounds the job
finishes with status `needs_review`, carrying the best candidate and
its reasons.

### Stage 5. Lock

`lockOutsideMask(original, winner, maskUrl)` composites the winner
inside the feathered mask over the original. For `room_stage` the mask
is the detected window box expanded by 15% on each side, feathered.
Runs on the server with `sharp` (to be added) or `canvas`, whichever is
already resolvable in the server bundle; the choice is made in the
implementation plan after checking `package.json`.

### Stage 6. Store and return

The job result is `{ finalImage, candidates: [{ id, round, image,
scores, total, passed }], prompt, chosenId }`. The client writes
`finalImage` to `design.final_image_url`, sets `render_kind:
'photoreal'`, and stores the candidate list and prompt in two new
fields on `Design` (`src/types/brand.ts`): `render_candidates` and
`render_prompt`. Room staging writes to `room_previews[]` as today.

## 4. Job API

`POST /api/render/jobs`

Body: `{ kind: 'fabric_swap' | 'room_stage', brandId, templateId,
assignments, roomPhoto?, curtainImage? }`. Validates with zod, resolves
the brand's OpenRouter key via `getEffectiveOpenRouterKey`, enforces
`monthly_generation_cap` (one unit per job, incremented at creation),
returns `{ jobId }` with 202.

`GET /api/render/jobs/:id`

Returns `{ status, stage, round, candidates, result?, error? }`.
`status` is `queued | running | done | needs_review | failed`.
`stage` is one of `prompt | generate | grade | lock | store`, used
verbatim by the UI for progress copy.

Jobs live in a module-level `Map`, matching how brand configs are held
today. Finished jobs are deleted 30 minutes after completion. Images
travel as data URLs within the existing 50 MB Express body limit.

Client: `src/lib/renderClient.ts` exposes `startRender(input)` and
`pollRender(jobId, onUpdate)` polling every 2 s until terminal.

## 5. Models and configuration

Each stage reads its model from env with a hardcoded default; the env
names already documented in `.env.example` but never read become live:

| Stage | Env var | Default |
| --- | --- | --- |
| Generate (both kinds) | `OPENROUTER_ROOM_VIZ_MODEL` | `google/gemini-3-pro-image` |
| Grade | `OPENROUTER_VISION_MODEL` | `google/gemini-2.5-flash` |
| Template zone analysis | `OPENROUTER_VISION_MODEL` | `google/gemini-2.5-flash` |

`OPENROUTER_INPAINT_MODEL` is retired with the inpaint path. The direct
Gemini SDK fallback (`GEMINI_API_KEY`, `GEMINI_IMAGE_MODEL`) is kept for
the generate stage only.

## 6. Error handling

Provider errors are classified in one place
(`src/server/renderAgent/errors.ts`):

- Retryable: HTTP 429, 5xx, network timeout, malformed grader JSON.
  Up to two retries with 2 s and 6 s backoff inside the stage.
- Fatal: 401/403 (bad key), 400 (rejected input), content refusal,
  missing template mask. Job status `failed` with a readable message.

The current behaviour of returning the unstaged curtain on staging
failure is removed. `NO_WINDOW_DETECTED` remains a fatal error at job
creation for `room_stage`.

## 7. UI

Template editor (`src/components/brand/TemplateEditor.tsx`)

- The preview panel has two layers. The synthetic canvas render is
  kept as an instant "Sketch", dimmed, repainted on every assignment
  change. A "Render" button starts a `fabric_swap` job.
- While running: stage copy ("Generating 3 options", "Checking
  quality", "Locking background") and a progress bar.
- Done: the winner replaces the sketch at full resolution with a
  "Rendered" badge. A strip below shows the other candidates with their
  totals; clicking one makes it the final.
- Needs review: best candidate shown with the grader's reasons and two
  buttons, Accept and Rerun.
- Failed: message and Retry.

Design detail (`src/components/brand/DesignDetailView.tsx`)

- Staging starts a `room_stage` job with the same progress copy and
  candidate strip. The before/after slider appears only after a
  successful job.

Template creation (`src/components/brand/NewTemplateModal.tsx`)

- Width guard on upload (warn under 1500 px, block under 1000 px).
- Zone review gets an editable description field per zone, pre-filled
  by the analyser.

Removed

- `generateSequentialRedesign` and its callers.
- Plate preference in `getTemplateRealPhotoUrl`; the real photo is
  always the base. Plates remain only for the sketch layer where a
  template has no photo.
- `POST /api/generate-curtain-fabric` single-region mode and
  `POST /api/room-visualize`, replaced by the job routes.

## 8. Testing

Unit (vitest, already configured)

- `buildFabricSwapPrompt` and `buildRoomStagePrompt`: exact text for a
  two-zone template with one changed zone, and with all zones changed.
- `parseGrade` and `passes`: valid JSON, missing item, item below
  threshold, total below threshold.
- `lockOutsideMask`: every pixel outside the mask equals the source;
  pixels inside come from the candidate.
- `classifyError`: each listed status maps to the right class.

Stage tests (provider mocked)

- Runner walks prompt, generate, grade, lock, store and returns `done`.
- Retryable error on generate is retried and succeeds.
- Fatal error fails the job with the message.
- All candidates fail grading twice: status `needs_review` with best
  candidate and reasons.
- Quota reached: 429 at job creation, no model call.

Acceptance (manual, real provider)

- Inputs: the two curtains and the denim swatch from the 2026-09-12
  Gemini session. Output compared side by side with the Gemini result.
  Pass when a staff member would show the app's output to a client.

## 9. Open items for the implementation plan

- Pick `sharp` versus `canvas` for server-side compositing after
  checking what already resolves in the server bundle.
- Confirm seed support on the OpenRouter image endpoint; if absent,
  vary a one-word style hint per candidate instead.
- Confirm the grader's image count limit for one request (original,
  up to N swatches, one candidate).
