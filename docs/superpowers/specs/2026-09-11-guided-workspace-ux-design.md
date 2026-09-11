# Guided Workspace UX Redesign

Date: 2026-09-11
Status: Approved by user, pending implementation plan

## Goal

Make the Aatmi curtain platform self-explanatory for a brand designer working alone. The core job is linear: choose a curtain style, assign a fabric to each zone, render, stage the curtain in a room, share. The UI must make that journey visible and every action understandable without training, while staying a free-form workspace rather than a locked wizard.

## Primary user

A brand designer preparing options at a desk, later sharing with clients. Fast free-form navigation with strong cues. Admin and multi-tenant features stay available but recede.

## Current state (facts the plan depends on)

- Vite + React 19 + Tailwind 4 + Zustand. Entry `src/App.tsx` routes on `useBrandStore().activeView`.
- Live views: `BrandHeader`, `BrandDashboard`, `TemplatesGallery`, `TemplateEditor`, `CatalogView`, `DesignDetailView`, `BrandSettingsView`, `PlatformAdminView`, `OnboardingWizard`, `SignIn`, modals `NewTemplateModal`, `SpecSheetModal`, `BulkUploadModal`, `CameraCaptureModal`, `FabricPickerSheet`, `FabricPreviewModal`, `FabricCard`, `FreehandMaskCanvas`.
- Two stores: `src/lib/brandStore.ts` (tenancy, designs, brand-scoped templates and fabrics, `activeView`) and `src/lib/store.ts` (`selectedTemplateId`, `assignments`, `activeRegionId`, plus a large legacy AI pipeline).
- Bug: `TemplateEditor` keeps the active zone in local state; `CatalogView` reads `activeRegionId` from `store.ts`, which is never set, so "Apply" from the catalog always targets zone 1.
- 18 top-level components under `src/components/` are unreachable from `App.tsx`: `AIProviderSettingsModal`, `AuthModal`, `BrandStudioStepper`, `CatalogLibraryView`, `CurtainCanvas`, `DatabaseSchemaModal`, `FabricLibraryModal`, `Header`, `LuxuryColorPalette`, `OnboardingTourModal`, `RegionAssignmentPanel`, `RenderLookbookPage`, `RoomLightingControls`, `RoomVizStudio`, `SequentialProgressOverlay`, `TactileLoupeModal`, `TemplateCardDrawer`, `TemplateGalleryPage`.
- Seed design `design-palazzo-01` uses a stock room photo with no curtain as its render, and its room preview compares two unrelated stock rooms.
- Design tokens and shared classes live in `src/index.css` (`.btn`, `.brand-card`, `.segmented`, `.badge`, `.nav-chip`, `.page-shell`, `.studio-shell`). Reuse them; do not introduce a second style system.
- Server: `src/server/api.ts` exposes `/api/generate-curtain-fabric` (per-zone inpaint, called sequentially by `src/utils/maskedPipeline.ts`) and `/api/room-visualize`. An OpenRouter key is configured in `.env`.

## Design

### 1. Navigation and vocabulary

Top nav: **Home, Studio, Library, Designs**. Settings (models, brand, team, billing) and platform admin move under the account menu; the brand switcher stays. The usage meter stays in the header and gains a tooltip: "Photoreal renders used this month".

`activeView` values: `dashboard`, `editor`, `library_styles`, `library_fabrics`, `design_detail`, `settings_*`, `platform_admin`, `onboarding`. `templates` and `catalog` are removed.

Vocabulary, applied to every label, badge, empty state, toast, and title:

| Concept | Word | Never |
|---|---|---|
| A curtain photo with editable zones | Curtain style | template, silhouette, stencil |
| An editable area of a style | Zone | region, stencil N |
| A material swatch | Fabric | swatch, textile, material, catalog item |
| A saved combination | Design | spec |
| The output image | Render (photoreal) or Preview (built-in) | mockup, composite |
| Style origin badges | "Your photo" / "Built-in" | Upload / Stencil |
| Fabric origin badges | "Your fabric" / "Built-in" | Session / Catalog |

Zone display names in `src/data/defaultCatalog.ts` are rewritten to plain names ("Left panel", "Ribbon trim", "Chevron band", "Lower skirt"); the "Stencil N —" and "Region N —" prefixes are dropped. `NewTemplateModal` built-in presets get the same treatment.

### 2. Journey strip

A shared `JourneyStrip` component renders five steps: **Style, Fabrics, Render, Room, Share**. Each step has a state (done, current, todo) and the current step shows a one-line hint. Steps are clickable and jump to the relevant screen or section. It is a map, not a gate.

Step state derivation:
- Style: done when a style is selected (always true in the studio).
- Fabrics: done when every zone has an assignment.
- Render: done when the active design has a photoreal render, else current after save.
- Room: done when the design has at least one room preview.
- Share: current when on the design page with a room preview.

The strip appears at the top of the Studio (steps 1 and 2 active) and the Design page (steps 3 to 5 active). Clicking Style or Fabrics from the design page returns to the studio with that design's style and assignments loaded.

### 3. Studio (`TemplateEditor`)

- Header: a **style picker button** showing the current style thumbnail and name; clicking opens a modal grid of styles (reusing the Library styles card). Replaces the disguised `<select>`.
- Zones rail: each row shows thumbnail, plain zone name, assigned fabric name or "Choose a fabric", and a check or hollow ring. A "Next unassigned" ghost button appears while any zone is unassigned.
- Active zone lives in `useStudioStore().activeRegionId` (shared), not local state. `selectTemplate` sets it to the first zone.
- Fabric panel header: eyebrow "Fabrics for", title = active zone name, plus a "Change zone" ghost button that focuses the zones rail (desktop) or opens a zone chooser (mobile). The segmented Catalog/Camera control is replaced by a search field and a "Photograph a swatch" secondary button that opens `CameraCaptureModal`.
- Bottom action bar (sticky inside the studio shell): left "N of M zones assigned"; right **Photoreal render** (secondary, with subtitle "Uses 1 monthly render, about 20 seconds per zone") and **Save design →** (primary). "Save and open room" copy is removed; saving lands on the design page at the Render step.
- Preview badge: "Live preview" or "Photoreal render", with a tooltip explaining the difference.
- Generation notice becomes a single inline status line under the strip, not a dismissable banner.
- Mobile (below 1024px): the image comes first, zones become a horizontal chip row above it, and the fabric picker stays a bottom sheet.

### 4. Library

One page, two tabs via `.segmented`: **Curtain styles** and **Fabrics**. Page title "Library".

Curtain styles tab: current `TemplatesGallery` grid. Card action reads "Design with this style". Filter chips: All, Your photos, Built-in. "Add a curtain style" primary button opens `NewTemplateModal`.

Fabrics tab: current `CatalogView` grid. Filter rail trimmed to Search, Material, Source (All, Built-in, Your fabrics). The Visibility filter and "Atelier samples" quick filter are removed; `visibility: 'session_only'` still shows as the "Your fabric" badge with a "Keep in library" menu action. Card "Apply" opens a small **zone chooser popover** listing the current style's zones (active zone preselected) and an "All zones" option. Applying shows a toast "Applied to Left panel · Open studio". `FabricPreviewModal` keeps the loupe and reuses the same zone chooser.

### 5. Design page (`DesignDetailView`)

Strip at steps 3 to 5. Three stacked sections replace the Curtain/In room tabs:

- **Render**: the saved image with badge "Live preview" or "Photoreal render". If preview only, a "Create photoreal render" button runs the same pipeline as the studio and updates the design's `final_image_url` and a new `render_kind: 'preview' | 'photoreal'` field on `Design`.
- **Room**: if no previews, an empty state with two choices: "Upload a room photo" and, when the style came from a real photo, "Use the style's original room". Choosing either opens a **confirm panel** showing the room photo beside the curtain render with "Stage curtain in this room" and "Choose another photo". Generation then runs with the shimmer state. Results keep the before/after slider (same room, with and without) and a thumbnail strip with "Stage in another room". Each result shows "Staged with Nano Banana Pro" style wording from a plain-name map, not raw provider ids.
- **Share**: three cards with one-line descriptions: Copy link, Download image (curtain or room, chosen by which is in view), Spec sheet (opens `SpecSheetModal`).

### 6. Home (`BrandDashboard`)

Task-first layout: a primary "Start a new design" card (opens the style picker modal, then studio), a "Continue" card for the newest design with its thumbnail and journey state, then the stats row (renders used, styles, fabrics) and the recent designs grid. Remove the "Models" stat tile.

### 7. Sign-in and settings

Sign-in keeps demo personas, relabelled "Demo accounts". Settings and admin pages are unchanged apart from vocabulary and moving their entry point into the account menu.

### 8. Sample data

- A script under `scripts/` uses Playwright to open the studio for `design-palazzo-01`'s style and assignments, capture the built-in preview at 800x1000, and write `public/designs/palazzo-preview.png`. The seed design's `final_image_url` points there with `render_kind: 'preview'`.
- The same script optionally triggers one photoreal render and one room staging through the running dev server (real OpenRouter calls) and writes `public/designs/palazzo-photoreal.png` and `public/designs/palazzo-room-{before,after}.png`. The user reviews these; if accepted, the seed switches to `render_kind: 'photoreal'` and the room preview uses the real before/after pair. If not accepted, the seed room preview is removed and the design starts at the Room step empty state.
- The stock Unsplash room images in `brandStore.ts` seed data and the settings "quality comparison" block are removed.

### 9. Code cleanup

- Delete the 18 unreachable components.
- Trim `src/lib/store.ts` to what the live app uses: `selectedTemplateId`, `activeRegionId`, `hoveredRegionId`, `assignments`, `selectTemplate`, `setActiveRegionId`, `assignFabricToRegion`, `removeAssignment`, `resetToTemplateDefaults`. Remove the legacy jobs, tabs, provider settings, and room-viz state, and drop the now-unused imports of `sequential-inpainting` and the `ai-providers` registry from the store. The `ai-providers` and `sequential-inpainting` modules are deleted only if nothing live imports them after the trim.
- `App.tsx` drops the `templates` and `catalog` routes in favour of `library_styles` and `library_fabrics`.

### 10. Out of scope

Real authentication, persistence beyond in-memory state, new AI models, pricing display changes, onboarding wizard redesign, platform admin redesign.

## Verification

- `npm run lint` (tsc) and `npm run build` pass.
- Headless screenshot script covers Home, Studio, Library (both tabs), Designs (all three sections), Settings, Sign-in at 1440px and 400px widths. Every image is reviewed.
- Headless click-through of the full journey: open studio, pick a style from the picker, assign every zone via the fabric panel, apply one fabric from the Library with the zone chooser and confirm it hits the chosen zone, save, confirm landing on the Render step, stage a room via the confirm panel, reach Share.
- Catalog apply bug is verified fixed by asserting the chosen zone's assignment changed.
