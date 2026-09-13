# Generate page: one-screen design-in, fabrics-in, image-out

Date: 2026-09-13
Status: approved in conversation, implemented directly

## Problem

The studio was a guided zone editor: style picker, zones rail, painted
sketch, journey strip, save dialog, then a render. Staff read the sketch
as the product and the sequence as friction. What they want is the shape
of a single generator: put a curtain design in, choose fabrics for the
areas the system finds, press one button, get a client-grade image.

## Decisions (2026-09-13)

- The Generate page **replaces** the Studio. The view id `editor` and the
  nav slot stay; the label becomes "Generate".
- Each Generate produces **3 variations**, best shown first, via the
  existing render job (`POST /api/render/jobs`, kind `fabric_swap`).
- Main input is **any curtain design image**: upload, camera, or a saved
  style. The analyzer (`POST /api/analyze-curtain`) finds the fabric areas.
- Fabric sources per area: **catalog** (photographed fabrics only; SVG
  tiles are hidden), **upload**, **camera**.
- Room placement is an optional slot on the same page using the existing
  `room_stage` job.

## Layout

Three columns on desktop, stacked on mobile.

1. **Design.** Drop zone (upload / take photo / pick saved style). After
   upload the image shows numbered markers (1..n) at each detected area's
   centre, with plain names. A small "Redetect" link re-runs the analyzer.
   Uploads under 1000 px wide are refused with a message; under 1500 px
   warned.
2. **Fabrics.** One row per area: number, name, current fabric thumbnail
   (or "as photographed"), and a Choose button opening a picker with three
   tabs: Catalog, Upload, Camera. A row can be reset to "as photographed".
3. **Result.** Generate button with stage copy while running. On success:
   the winner large, the other variations as thumbnails (switching one
   re-locks it server-side through the choose route), Download, and
   "Place in a room" (room photo in → staged image out, same result
   area). Failures show the message and keep the inputs.

A **History** strip under the columns lists every generation of this
session (thumbnail, time, fabrics used); clicking one restores its
inputs and result. Each successful generation is saved as a Design
automatically, so it also appears under Designs.

## Removed from the studio

Painted sketch, zone chips, zones rail, journey strip, pre-render save
dialog, "Not rendered" badges. `TemplateEditor.tsx` is deleted.

## Quality rules

- Design and fabric images are sent to the model at their natural
  resolution (no 800x1000 rasterisation).
- Only photographic fabrics are offered; catalog entries whose image is
  an SVG data URI are filtered out of the picker.
- The analyzer's `description` and `location` feed the prompt as before.

## Out of scope

Text-to-design generation, batch generation, database persistence.
