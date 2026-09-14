# Guided Workspace UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the six-page curtain platform into a self-explanatory guided workspace (Style → Fabrics → Render → Room → Share) with four nav items, one vocabulary, a fixed cross-page apply bug, honest sample data, and no dead code.

**Architecture:** Keep the existing React 19 + Zustand + Tailwind 4 app and its `index.css` token system. Add a pure `journey.ts` step-derivation module and a `JourneyStrip` component shared by Studio and Design pages. Move the active zone into the shared studio store so Library and Studio agree. Replace Templates and Catalog pages with one Library page. Rewrite Studio, Design, and Home views around the journey.

**Tech Stack:** Vite 6, React 19, TypeScript 5.8, Tailwind 4, Zustand 5, lucide-react, Express (unchanged), Vitest (added for pure logic), Playwright (global install at `~/.nvm/versions/node/v24.15.0/lib/node_modules/@playwright/cli/node_modules/playwright`, Chromium at `~/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome`) for screenshots and journey checks.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-11-guided-workspace-ux-design.md`. Read it before starting any task.
- Vocabulary (exact words, everywhere in UI copy): **Curtain style** (never template, silhouette, stencil), **Zone** (never region, "Stencil N"), **Fabric** (never swatch, textile, material, catalog item), **Design** (never spec), **Render** for photoreal output and **Preview** for the built-in image. Style badges: "Your photo" / "Built-in". Fabric badges: "Your fabric" / "Built-in".
- Reuse `src/index.css` classes (`.btn .btn-primary .btn-secondary .btn-ghost .btn-sm`, `.brand-card`, `.segmented .segmented-item`, `.badge .badge-muted .badge-accent .badge-brass`, `.eyebrow-label`, `.page-shell`, `.page-title`, `.page-lede`, `.field`, `.field-label`, `.menu-panel`, `.nav-chip`, `.media-frame`, `.studio-shell`, `.studio-stage`). Do not add a second style system or new colour literals outside `index.css` tokens.
- Nav is exactly: Home, Studio, Library, Designs. Settings and platform admin live in the account menu.
- `activeView` union: `'dashboard' | 'editor' | 'library_styles' | 'library_fabrics' | 'design_detail' | 'settings_profile' | 'settings_models' | 'settings_team' | 'settings_billing' | 'platform_admin' | 'onboarding'`.
- Every task ends with `npm run lint` (tsc) and `npm run build` passing, plus `npm test` once Task 1 exists.
- Git identity is `Vijendrapratap` / `44225657+Vijendrapratap@users.noreply.github.com`.
- A dev server may already be running on port 3000 or 3001. Scripts take the base URL from `APP_URL` (default `http://localhost:3000`).

## File Map

| Path | Responsibility |
|---|---|
| `vitest.config.ts` (create) | Vitest config, node environment, `src/**/*.test.ts` |
| `src/lib/store.ts` (rewrite) | Studio selection state only: selected style, active/hovered zone, assignments |
| `src/lib/journey.ts` (create) | Pure `deriveJourney()` returning five step states |
| `src/lib/labels.ts` (create) | Plain-language maps: provider ids → names, source → badge text |
| `src/types/brand.ts` (modify) | Add `render_kind` to `Design` |
| `src/data/defaultCatalog.ts` (modify) | Plain zone display names |
| `src/components/NewTemplateModal.tsx` (modify) | Plain preset zone names, vocabulary |
| `src/lib/brandStore.ts` (modify) | New `activeView` union, honest seed design, `updateDesign` |
| `src/components/JourneyStrip.tsx` (create) | Five-step strip |
| `src/components/brand/ZoneChooser.tsx` (create) | Small dialog: pick a zone or all zones |
| `src/components/brand/StylePickerModal.tsx` (create) | Modal grid of curtain styles |
| `src/components/brand/StyleCard.tsx` (create) | Card used by Library styles tab and StylePickerModal |
| `src/components/brand/library/LibraryPage.tsx` (create) | Two-tab page |
| `src/components/brand/library/StylesTab.tsx` (create, replaces `TemplatesGallery.tsx`) | Styles grid with filters |
| `src/components/brand/library/FabricsTab.tsx` (create, replaces `CatalogView.tsx`) | Fabrics grid, trimmed filters, zone chooser apply |
| `src/components/brand/FabricCard.tsx` (modify) | New badges and "Apply" wiring |
| `src/components/brand/FabricPreviewModal.tsx` (modify) | Uses ZoneChooser |
| `src/components/brand/FabricPickerSheet.tsx` (rewrite) | Studio fabric panel with "Fabrics for" header |
| `src/components/brand/TemplateEditor.tsx` (rewrite) | Studio |
| `src/components/brand/DesignDetailView.tsx` (rewrite) | Render / Room / Share sections |
| `src/components/brand/BrandDashboard.tsx` (rewrite) | Task-first home |
| `src/components/brand/BrandHeader.tsx` (modify) | Four nav items, settings in account menu, meter tooltip |
| `src/components/brand/BrandSettingsView.tsx` (modify) | Remove stock comparison block |
| `src/pages/SignIn.tsx` (modify) | "Demo accounts" label |
| `src/App.tsx` (modify) | Routes |
| `scripts/capture-samples.mjs` (create) | Produces `public/designs/*.png` |
| `scripts/screenshots.mjs` (create) | Screenshot every screen at two widths |
| `scripts/journey-check.mjs` (create) | Headless click-through of the full journey |

---

### Task 1: Test infrastructure (Vitest)

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts, devDependencies)
- Create: `src/lib/smoke.test.ts`

**Interfaces:**
- Produces: `npm test` runs `vitest run` over `src/**/*.test.ts` in a node environment.

- [ ] **Step 1: Install vitest**

Run: `npm install -D vitest@^3`
Expected: `package.json` devDependencies gains `"vitest"`.

- [ ] **Step 2: Add config and script**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

In `package.json` scripts, add `"test": "vitest run"` after `"lint"`.

- [ ] **Step 3: Write a smoke test**

Create `src/lib/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('test runner', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Run it**

Run: `npm test`
Expected: `1 passed`.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json src/lib/smoke.test.ts
git commit -m "chore: add vitest for pure-logic tests"
```

---

### Task 2: Trim the studio store and share the active zone

**Files:**
- Rewrite: `src/lib/store.ts`
- Create: `src/lib/store.test.ts`
- Delete: `src/lib/smoke.test.ts`

**Interfaces:**
- Produces `useStudioStore` with state `{ selectedTemplateId: string; activeRegionId: string | null; hoveredRegionId: string | null; assignments: FabricAssignment[] }` and actions `selectTemplate(templateId, templates)`, `setActiveRegionId(id)`, `setHoveredRegionId(id)`, `assignFabricToRegion(regionId, fabricId)`, `assignFabricToAllRegions(regionIds, fabricId)`, `removeAssignment(regionId)`, `loadAssignments(templateId, assignments)`.
- `selectTemplate` now takes the template list as its second argument because templates live in `brandStore`, not here.

- [ ] **Step 1: Write failing tests**

Create `src/lib/store.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useStudioStore } from './store';
import { DEFAULT_TEMPLATES } from '../data/defaultCatalog';

const velvet = DEFAULT_TEMPLATES.find((t) => t.id === 'tpl-velvet-houndstooth')!;
const chevron = DEFAULT_TEMPLATES.find((t) => t.id === 'tpl-chevron-accent-band')!;

describe('useStudioStore', () => {
  beforeEach(() => {
    useStudioStore.getState().selectTemplate(chevron.id, DEFAULT_TEMPLATES);
  });

  it('selectTemplate loads default assignments and activates the first zone', () => {
    useStudioStore.getState().selectTemplate(velvet.id, DEFAULT_TEMPLATES);
    const s = useStudioStore.getState();
    expect(s.selectedTemplateId).toBe(velvet.id);
    expect(s.activeRegionId).toBe(velvet.regions[0].id);
    expect(s.assignments.map((a) => a.region_id)).toEqual(
      velvet.regions.filter((r) => r.default_fabric_id).map((r) => r.id)
    );
  });

  it('assignFabricToRegion replaces an existing assignment for that zone', () => {
    const zone = chevron.regions[1].id;
    useStudioStore.getState().assignFabricToRegion(zone, 'fab-emerald-velvet');
    useStudioStore.getState().assignFabricToRegion(zone, 'fab-croc-espresso');
    const matches = useStudioStore.getState().assignments.filter((a) => a.region_id === zone);
    expect(matches).toHaveLength(1);
    expect(matches[0].fabric_id).toBe('fab-croc-espresso');
  });

  it('assignFabricToAllRegions covers every given zone', () => {
    const ids = chevron.regions.map((r) => r.id);
    useStudioStore.getState().assignFabricToAllRegions(ids, 'fab-emerald-velvet');
    const s = useStudioStore.getState();
    expect(ids.every((id) => s.assignments.find((a) => a.region_id === id)?.fabric_id === 'fab-emerald-velvet')).toBe(true);
  });

  it('setActiveRegionId is shared state', () => {
    useStudioStore.getState().setActiveRegionId(chevron.regions[2].id);
    expect(useStudioStore.getState().activeRegionId).toBe(chevron.regions[2].id);
  });

  it('loadAssignments restores a saved design', () => {
    useStudioStore.getState().loadAssignments(velvet.id, [
      { region_id: velvet.regions[0].id, fabric_id: 'fab-emerald-velvet', scale: 1, rotation: 0 },
    ]);
    const s = useStudioStore.getState();
    expect(s.selectedTemplateId).toBe(velvet.id);
    expect(s.assignments).toHaveLength(1);
    expect(s.activeRegionId).toBe(velvet.regions[0].id);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL (`selectTemplate` has wrong arity, `assignFabricToAllRegions` and `loadAssignments` do not exist).

- [ ] **Step 3: Rewrite the store**

Replace the whole of `src/lib/store.ts` with:

```ts
// src/lib/store.ts
// Studio selection state: which curtain style is open, which zone is active,
// and which fabric is assigned to each zone. Everything else lives in brandStore.
import { create } from 'zustand';
import { CurtainTemplate, FabricAssignment } from '../types/curtain';
import { DEFAULT_TEMPLATES } from '../data/defaultCatalog';

export interface StudioStoreState {
  selectedTemplateId: string;
  activeRegionId: string | null;
  hoveredRegionId: string | null;
  assignments: FabricAssignment[];

  selectTemplate: (templateId: string, templates: CurtainTemplate[]) => void;
  setActiveRegionId: (regionId: string | null) => void;
  setHoveredRegionId: (regionId: string | null) => void;
  assignFabricToRegion: (regionId: string, fabricId: string) => void;
  assignFabricToAllRegions: (regionIds: string[], fabricId: string) => void;
  removeAssignment: (regionId: string) => void;
  loadAssignments: (templateId: string, assignments: FabricAssignment[]) => void;
}

function defaultAssignments(template: CurtainTemplate): FabricAssignment[] {
  return template.regions
    .filter((r) => r.default_fabric_id)
    .map((r) => ({
      region_id: r.id,
      fabric_id: r.default_fabric_id!,
      scale: 1.0,
      rotation: 0,
      brightness: 1.0,
    }));
}

const initialTemplate = DEFAULT_TEMPLATES[0];

export const useStudioStore = create<StudioStoreState>((set, get) => ({
  selectedTemplateId: initialTemplate.id,
  activeRegionId: initialTemplate.regions[0]?.id ?? null,
  hoveredRegionId: null,
  assignments: defaultAssignments(initialTemplate),

  selectTemplate: (templateId, templates) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    set({
      selectedTemplateId: templateId,
      activeRegionId: template.regions[0]?.id ?? null,
      hoveredRegionId: null,
      assignments: defaultAssignments(template),
    });
  },

  setActiveRegionId: (activeRegionId) => set({ activeRegionId }),
  setHoveredRegionId: (hoveredRegionId) => set({ hoveredRegionId }),

  assignFabricToRegion: (regionId, fabricId) => {
    set((state) => ({
      assignments: [
        ...state.assignments.filter((a) => a.region_id !== regionId),
        { region_id: regionId, fabric_id: fabricId, scale: 1.0, rotation: 0, brightness: 1.0 },
      ],
    }));
  },

  assignFabricToAllRegions: (regionIds, fabricId) => {
    regionIds.forEach((id) => get().assignFabricToRegion(id, fabricId));
  },

  removeAssignment: (regionId) => {
    set((state) => ({
      assignments: state.assignments.filter((a) => a.region_id !== regionId),
    }));
  },

  loadAssignments: (templateId, assignments) => {
    set({
      selectedTemplateId: templateId,
      activeRegionId: assignments[0]?.region_id ?? null,
      hoveredRegionId: null,
      assignments: assignments.map((a) => ({ ...a })),
    });
  },
}));
```

- [ ] **Step 4: Fix the four callers so tsc passes**

These will be fully rewritten in later tasks; for now make minimal edits so the build stays green.

`src/components/brand/TemplatesGallery.tsx` line 44: change `selectTemplate(tpl.id);` to `selectTemplate(tpl.id, brandTemplates);`.

`src/components/brand/TemplateEditor.tsx` line 251: change `onChange={(e) => selectTemplate(e.target.value)}` to `onChange={(e) => selectTemplate(e.target.value, brandTemplates)}`.

`src/components/brand/CatalogView.tsx` lines 138-141: replace the `handleApplyToAllRegions` body with:

```ts
  const handleApplyToAllRegions = (fabricId: string) => {
    useStudioStore.getState().assignFabricToAllRegions(
      (currentTemplate?.regions || []).map((r) => r.id),
      fabricId
    );
    setToastMessage(`Applied to all ${currentTemplate?.regions.length} zones!`);
    setTimeout(() => setToastMessage(null), 3000);
  };
```

`src/components/brand/DesignDetailView.tsx` line 4: delete the unused `useStudioStore` import.

- [ ] **Step 5: Delete the smoke test, run everything**

```bash
rm src/lib/smoke.test.ts
npm test && npm run lint && npm run build
```
Expected: 5 tests pass, tsc clean, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A src/lib/store.ts src/lib/store.test.ts src/lib/smoke.test.ts src/components/brand
git commit -m "refactor(store): trim studio store to selection state and share the active zone"
```

---

### Task 3: Delete dead code

**Files:**
- Delete: the 18 unreachable components, `src/lib/sequential-inpainting.ts`, `src/lib/ai-providers/` (whole folder)

- [ ] **Step 1: Confirm nothing live imports them**

Run:
```bash
grep -rn "ai-providers\|sequential-inpainting" src --include=*.ts --include=*.tsx | grep -v "^src/lib/ai-providers\|^src/lib/sequential-inpainting\|^src/components/AIProviderSettingsModal\|^src/components/CatalogLibraryView\|^src/components/DatabaseSchemaModal\|^src/components/Header.tsx\|^src/components/RoomVizStudio\|^src/components/SequentialProgressOverlay"
```
Expected: no output. If any line prints, stop and report it instead of deleting.

- [ ] **Step 2: Delete**

```bash
git rm -q src/components/AIProviderSettingsModal.tsx src/components/AuthModal.tsx src/components/BrandStudioStepper.tsx src/components/CatalogLibraryView.tsx src/components/CurtainCanvas.tsx src/components/DatabaseSchemaModal.tsx src/components/FabricLibraryModal.tsx src/components/Header.tsx src/components/LuxuryColorPalette.tsx src/components/OnboardingTourModal.tsx src/components/RegionAssignmentPanel.tsx src/components/RenderLookbookPage.tsx src/components/RoomLightingControls.tsx src/components/RoomVizStudio.tsx src/components/SequentialProgressOverlay.tsx src/components/TactileLoupeModal.tsx src/components/TemplateCardDrawer.tsx src/components/TemplateGalleryPage.tsx src/lib/sequential-inpainting.ts
git rm -rq src/lib/ai-providers
```

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build && npm test`
Expected: all pass. If tsc reports a missing module, the import is in a live file; restore only that file with `git checkout HEAD -- <path>` and report it.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove 18 unreachable components and the legacy AI pipeline"
```

---

### Task 4: Vocabulary, types, labels, and honest seed data

**Files:**
- Modify: `src/types/brand.ts` (Design), `src/data/defaultCatalog.ts` (zone display names), `src/components/NewTemplateModal.tsx` (preset names and copy), `src/lib/brandStore.ts` (activeView union, seed design, `updateDesign`), `src/components/brand/BrandSettingsView.tsx` (remove stock comparison), `src/App.tsx` (routes compile)
- Create: `src/lib/labels.ts`, `src/lib/labels.test.ts`

**Interfaces:**
- `Design` gains `render_kind: 'preview' | 'photoreal'`.
- `labels.ts` exports `providerLabel(id: string): string`, `styleOriginBadge(t: CurtainTemplate, currentBrandId: string): 'Your photo' | 'Built-in'`, `fabricOriginBadge(f: Fabric): 'Your fabric' | 'Built-in'`.
- `useBrandStore` gains `updateDesign(designId: string, updates: Partial<Design>): void`.
- `activeView` union per Global Constraints. `'templates'` and `'catalog'` are removed; App.tsx temporarily maps `library_styles` → `TemplatesGallery` and `library_fabrics` → `CatalogView` until Task 7 replaces them.

- [ ] **Step 1: Failing label tests**

Create `src/lib/labels.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { providerLabel, styleOriginBadge, fabricOriginBadge } from './labels';
import { DEFAULT_TEMPLATES, DEFAULT_FABRICS } from '../data/defaultCatalog';

describe('labels', () => {
  it('maps provider ids to plain names and falls back to the id', () => {
    expect(providerLabel('nano_banana_pro')).toBe('Nano Banana Pro');
    expect(providerLabel('openrouter_flux')).toBe('FLUX Fill Pro');
    expect(providerLabel('Nano Banana Pro (Gemini 3 Pro Image)')).toBe('Nano Banana Pro');
    expect(providerLabel('something_new')).toBe('something_new');
  });

  it('badges styles by origin', () => {
    const builtIn = { ...DEFAULT_TEMPLATES[0], brand_id: null, source: 'catalog' as const };
    const mine = { ...DEFAULT_TEMPLATES[0], brand_id: 'b1', source: 'user_upload' as const };
    expect(styleOriginBadge(builtIn, 'b1')).toBe('Built-in');
    expect(styleOriginBadge(mine, 'b1')).toBe('Your photo');
  });

  it('badges fabrics by origin', () => {
    expect(fabricOriginBadge({ ...DEFAULT_FABRICS[0], source: 'catalog' })).toBe('Built-in');
    expect(fabricOriginBadge({ ...DEFAULT_FABRICS[0], source: 'camera_capture' })).toBe('Your fabric');
    expect(fabricOriginBadge({ ...DEFAULT_FABRICS[0], visibility: 'session_only' })).toBe('Your fabric');
  });
});
```

Run: `npm test` → FAIL, module `./labels` not found.

- [ ] **Step 2: Create labels.ts**

```ts
// src/lib/labels.ts
// Plain-language names for ids that leak into the UI.
import { CurtainTemplate, Fabric } from '../types/curtain';

const PROVIDER_NAMES: Record<string, string> = {
  nano_banana_pro: 'Nano Banana Pro',
  seedream_edit: 'Seedream 4.5',
  gpt_image_2: 'GPT Image 2',
  openrouter_unified: 'OpenRouter',
  openrouter_flux: 'FLUX Fill Pro',
  flux_kontext: 'FLUX Kontext',
  qwen_image_edit: 'Qwen Image Edit',
};

export function providerLabel(id: string): string {
  if (PROVIDER_NAMES[id]) return PROVIDER_NAMES[id];
  const lower = id.toLowerCase();
  if (lower.includes('nano banana')) return 'Nano Banana Pro';
  if (lower.includes('flux')) return 'FLUX Fill Pro';
  if (lower.includes('seedream')) return 'Seedream 4.5';
  return id;
}

export function styleOriginBadge(t: CurtainTemplate, currentBrandId: string): 'Your photo' | 'Built-in' {
  return t.brand_id === currentBrandId && t.source === 'user_upload' ? 'Your photo' : 'Built-in';
}

export function fabricOriginBadge(f: Fabric): 'Your fabric' | 'Built-in' {
  const own = f.source === 'camera_capture' || f.source === 'bulk_upload' || f.source === 'custom' || f.visibility === 'session_only' || f.is_custom;
  return own ? 'Your fabric' : 'Built-in';
}
```

Run: `npm test` → PASS.

- [ ] **Step 3: Add `render_kind` to Design**

In `src/types/brand.ts`, inside `interface Design`, after `final_image_url: string;` add:

```ts
  render_kind: 'preview' | 'photoreal';
```

- [ ] **Step 4: Plain zone names in the seed catalog**

In `src/data/defaultCatalog.ts`, replace each `display_name` exactly as listed (search for the old string, replace with the new):

| Old | New |
|---|---|
| `Stencil 1 — Left Chevron Drapery` | `Left chevron panel` |
| `Stencil 2 — Right Cream Upper Body` | `Right upper panel` |
| `Stencil 3 — Upper Metallic Ribbon Trim` | `Upper ribbon trim` |
| `Stencil 4 — Inset Chevron Accent Band` | `Chevron accent band` |
| `Stencil 5 — Lower Metallic Ribbon Trim` | `Lower ribbon trim` |
| `Stencil 6 — Right Lower Skirt` | `Right lower skirt` |
| `Stencil 1 — Left Champagne Body (Upper 65%)` | `Left upper body` |
| `Stencil 2 — Left Terracotta Stripe (Mid 10%)` | `Left stripe` |
| `Stencil 3 — Left Midnight Navy Base (Lower 25%)` | `Left base` |
| `Stencil 4 — Right Midnight Navy Header (Upper 25%)` | `Right header` |
| `Stencil 5 — Right Terracotta Stripe (Mid 10%)` | `Right stripe` |
| `Stencil 6 — Right Champagne Skirt (Lower 60%)` | `Right skirt` |
| `Stencil 1 — Top Velvet Header (Upper 50%)` | `Upper header` |
| `Stencil 2 — Brass Satin Transition Band (8% Height)` | `Transition band` |
| `Stencil 3 — Houndstooth Drapery Skirt (Lower 42.5%)` | `Lower skirt` |
| `Stencil 1 — Center Ivory Velvet Field` | `Centre field` |
| `Stencil 2 — Greek Key Embroidered Ribbon (L-Shape)` | `Greek key ribbon` |
| `Stencil 3 — Outer Mustard Gold Velvet Frame & Hem` | `Outer frame and hem` |
| `Stencil 1 — Camel Tan Pleated Header (Upper 25%)` | `Pleated header` |
| `Stencil 2 — Midnight Black Velvet Gathered Drape (Lower 75%)` | `Gathered body` |
| `Stencil 1 — Left Natural Oatmeal Linen Body` | `Left panel` |
| `Stencil 2 — Left Leading Edge Persian Tapestry` | `Left leading edge` |
| `Stencil 3 — Right Leading Edge Persian Tapestry` | `Right leading edge` |
| `Stencil 4 — Right Natural Oatmeal Linen Body` | `Right panel` |
| `Region 1 — Main Panel` | `Main panel` |
| `Region 2 — Decorative Band` | `Decorative band` |
| `Region 3 — Bottom Hem Border` | `Bottom hem` |
| `Region 1 — Main Panel Body` | `Main panel` |
| `Region 2 — Leading Edge Vertical Border` | `Leading edge border` |
| `Region 1 — Center Drapery Body` | `Centre body` |
| `Region 2 — Left Vertical Flank` | `Left flank` |
| `Region 3 — Right Vertical Flank` | `Right flank` |
| `Region 4 — Floor Hem Trim` | `Floor hem` |
| `Region 1 — Top Swag Valance` | `Swag valance` |
| `Region 2 — Cascading Drop Drapes` | `Drop drapes` |
| `Region 3 — Contrast Flange Trim` | `Flange trim` |

Also in the same file, rename the two template names that contain the word "Stencil": `Chevron & Cream Drape with Ribbon Stencil` → `Chevron & Cream Drape with Ribbon Trim`, and `High-Ceiling Linen with Persian Tapestry Stencil` → `High-Ceiling Linen with Persian Tapestry Edge`.

Run: `grep -n "Stencil\|Region [0-9]" src/data/defaultCatalog.ts` → expected: no output.

- [ ] **Step 5: Plain names in NewTemplateModal presets**

In `src/components/NewTemplateModal.tsx` replace:

| Old | New |
|---|---|
| `Region 1 — Upper Drape Body` | `Upper body` |
| `Region 2 — Dynamic Chevron Band` | `Chevron band` |
| `Region 3 — Grounding Lower Skirt` | `Lower skirt` |
| `Region 1 — Header Band` | `Header band` |
| `Region 2 — Main Center Field` | `Centre field` |
| `Region 3 — Floor Hem Skirt` | `Floor hem` |
| `Region 1 — Main Drapery Panel` | `Main panel` |
| `Region 2 — Tailored Leading Border` | `Leading border` |
| `Region 1 — Center Field Drapery` | `Centre field` |
| `Region 2 — Mitred Outer Border` | `Outer border` |
| `Region 1 — Left Drapery Panel` | `Left panel` |
| `Region 2 — Right Drapery Panel` | `Right panel` |
| `Region 1 — Jacquard Tapestry Body` | `Tapestry body` |
| `Region 2 — Weighted Base Hem` | `Base hem` |
| `Region 1 — Main Panel` | `Main panel` |
| `Region 2 — Bottom Border` | `Bottom border` |
| `` `Region ${idx + 1}` `` | `` `Zone ${idx + 1}` `` |
| `` `Region ${nextOrder} — Accent Zone` `` | `` `Zone ${nextOrder}` `` |

Then run `grep -n -i "stencil\|template\|region" src/components/NewTemplateModal.tsx | grep -v "CurtainTemplate\|Region\b\|region\.\|regions\|polygon\|StencilPresetDef\|BUILT_IN_STENCILS\|stencil_type\|stencil_preset\|regionId\|region_id\|detectedRegions\|setDetectedRegions\|Region\[\]"` and rewrite every remaining user-facing string so that "template" reads "curtain style", "stencil" reads "built-in style", and "region" reads "zone". Identifiers, types, and prop names stay unchanged. Also change the modal title to "Add a curtain style".

- [ ] **Step 6: Update brandStore**

In `src/lib/brandStore.ts`:

Replace the `activeView` union (lines 51-62) with:

```ts
  activeView:
    | 'dashboard'
    | 'editor'
    | 'library_styles'
    | 'library_fabrics'
    | 'design_detail'
    | 'settings_profile'
    | 'settings_models'
    | 'settings_team'
    | 'settings_billing'
    | 'platform_admin'
    | 'onboarding';
```

Add to the interface after `getDesign`:

```ts
  updateDesign: (designId: string, updates: Partial<Design>) => void;
```

Replace `INITIAL_DESIGNS` (lines 181-212) with:

```ts
const INITIAL_DESIGNS: Design[] = [
  {
    id: 'design-velvet-salon-01',
    brand_id: 'brand-aatmi-01',
    template_id: 'tpl-velvet-houndstooth',
    template_name: 'Haute Couture Velvet & Houndstooth Drape',
    name: 'Velvet & Houndstooth Salon',
    assignments: [
      { region_id: 'reg-vh-top-velvet', fabric_id: 'fab-charcoal-slate', scale: 1, rotation: 0 },
      { region_id: 'reg-vh-mid-brass', fabric_id: 'fab-metallic-gold-satin', scale: 1, rotation: 0 },
      { region_id: 'reg-vh-skirt-houndstooth', fabric_id: 'fab-classic-houndstooth', scale: 1, rotation: 0 },
    ],
    final_image_url: '/designs/velvet-salon-preview.png',
    render_kind: 'preview',
    created_at: '2026-03-08T14:30:00Z',
    created_by_user_id: 'usr-elena-01',
    room_previews: [],
  },
];
```

Add the action implementation after `getDesign`:

```ts
    updateDesign: (designId, updates) => {
      set((state) => ({
        designs: state.designs.map((d) => (d.id === designId ? { ...d, ...updates } : d)),
      }));
    },
```

Remove the Unsplash `logo_url` on `brand-aatmi-01` (set `logo_url: null`) and the four Unsplash `avatar_url` values on the demo users (delete those lines) so no stock photos remain in seed data.

- [ ] **Step 7: Temporary fallback image and route compile**

Copy the velvet template photo as a stand-in until Task 12 generates the real preview:

```bash
mkdir -p public/designs && cp public/templates/tpl-velvet-houndstooth.png public/designs/velvet-salon-preview.png
```

In `src/App.tsx`, replace the `templates` and `catalog` branches:

```tsx
        {activeView === 'library_styles' && (
          <TemplatesGallery onOpenNewTemplateModal={() => setIsNewTemplateModalOpen(true)} />
        )}

        {activeView === 'library_fabrics' && <CatalogView />}
```

In `src/components/brand/TemplateEditor.tsx` `saveDesign` call, add `render_kind: generatedImageUrl ? 'photoreal' : 'preview',` after `final_image_url: finalUrl,`.

Replace every `setActiveView('templates')` in `src/components/brand/` with `setActiveView('library_styles')` and every `setActiveView('catalog')` with `setActiveView('library_fabrics')`. In `BrandHeader.tsx` nav items, change ids `templates` → `library_styles` and `catalog` → `library_fabrics` (labels are fixed in Task 8).

- [ ] **Step 8: Remove the stock comparison block from settings**

In `src/components/brand/BrandSettingsView.tsx` delete the block that starts with the comment `{/* Static Example Image Pair (Section 3.4.2) */}` through its closing `</div>` (the `pt-2` wrapper, ending just before `</div>` that closes card 1). Remove any now-unused imports tsc flags.

- [ ] **Step 9: Verify and commit**

```bash
npm test && npm run lint && npm run build
git add -A
git commit -m "feat(vocabulary): plain zone names, render_kind, labels helper, honest seed design"
```

---

### Task 5: Journey derivation and the JourneyStrip component

**Files:**
- Create: `src/lib/journey.ts`, `src/lib/journey.test.ts`, `src/components/JourneyStrip.tsx`

**Interfaces:**
- `journey.ts` exports:
  ```ts
  export type JourneyStepId = 'style' | 'fabrics' | 'render' | 'room' | 'share';
  export type JourneyStepState = 'done' | 'current' | 'todo';
  export interface JourneyStep { id: JourneyStepId; label: string; hint: string; state: JourneyStepState }
  export interface JourneyInput {
    page: 'studio' | 'design';
    zoneCount: number;
    assignedCount: number;
    hasPhotoreal: boolean;     // design has a photoreal render (or studio holds one)
    roomPreviewCount: number;  // 0 when not on a design
  }
  export function deriveJourney(input: JourneyInput): JourneyStep[];
  ```
- `JourneyStrip` props: `{ steps: JourneyStep[]; onStepClick: (id: JourneyStepId) => void }`.

- [ ] **Step 1: Failing tests**

Create `src/lib/journey.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { deriveJourney } from './journey';

const states = (steps: ReturnType<typeof deriveJourney>) => steps.map((s) => s.state);

describe('deriveJourney', () => {
  it('studio with unassigned zones: style done, fabrics current, rest todo', () => {
    const steps = deriveJourney({ page: 'studio', zoneCount: 3, assignedCount: 1, hasPhotoreal: false, roomPreviewCount: 0 });
    expect(states(steps)).toEqual(['done', 'current', 'todo', 'todo', 'todo']);
    expect(steps[1].hint).toContain('2 zones');
  });

  it('studio fully assigned: render becomes current', () => {
    const steps = deriveJourney({ page: 'studio', zoneCount: 3, assignedCount: 3, hasPhotoreal: false, roomPreviewCount: 0 });
    expect(states(steps)).toEqual(['done', 'done', 'current', 'todo', 'todo']);
  });

  it('design page with preview only: render current', () => {
    const steps = deriveJourney({ page: 'design', zoneCount: 3, assignedCount: 3, hasPhotoreal: false, roomPreviewCount: 0 });
    expect(states(steps)).toEqual(['done', 'done', 'current', 'todo', 'todo']);
  });

  it('design page with photoreal, no room: room current', () => {
    const steps = deriveJourney({ page: 'design', zoneCount: 3, assignedCount: 3, hasPhotoreal: true, roomPreviewCount: 0 });
    expect(states(steps)).toEqual(['done', 'done', 'done', 'current', 'todo']);
  });

  it('design page with a room preview: share current', () => {
    const steps = deriveJourney({ page: 'design', zoneCount: 3, assignedCount: 3, hasPhotoreal: true, roomPreviewCount: 1 });
    expect(states(steps)).toEqual(['done', 'done', 'done', 'done', 'current']);
  });

  it('always returns five labelled steps in order', () => {
    const steps = deriveJourney({ page: 'studio', zoneCount: 0, assignedCount: 0, hasPhotoreal: false, roomPreviewCount: 0 });
    expect(steps.map((s) => s.label)).toEqual(['Style', 'Fabrics', 'Render', 'Room', 'Share']);
  });
});
```

Run: `npm test` → FAIL, `./journey` missing.

- [ ] **Step 2: Implement journey.ts**

```ts
// src/lib/journey.ts
// Pure derivation of the five-step journey shown on Studio and Design pages.
export type JourneyStepId = 'style' | 'fabrics' | 'render' | 'room' | 'share';
export type JourneyStepState = 'done' | 'current' | 'todo';

export interface JourneyStep {
  id: JourneyStepId;
  label: string;
  hint: string;
  state: JourneyStepState;
}

export interface JourneyInput {
  page: 'studio' | 'design';
  zoneCount: number;
  assignedCount: number;
  hasPhotoreal: boolean;
  roomPreviewCount: number;
}

export function deriveJourney(input: JourneyInput): JourneyStep[] {
  const remaining = Math.max(0, input.zoneCount - input.assignedCount);
  const fabricsDone = input.zoneCount > 0 && remaining === 0;
  const renderDone = input.hasPhotoreal;
  const roomDone = input.roomPreviewCount > 0;

  const done: Record<JourneyStepId, boolean> = {
    style: true,
    fabrics: fabricsDone,
    render: renderDone,
    room: roomDone,
    share: false,
  };

  const order: JourneyStepId[] = ['style', 'fabrics', 'render', 'room', 'share'];
  const currentId = order.find((id) => !done[id]) ?? 'share';

  const hints: Record<JourneyStepId, string> = {
    style: 'Pick the curtain style you want to work on.',
    fabrics:
      remaining > 0
        ? `Choose a fabric for ${remaining} ${remaining === 1 ? 'zone' : 'zones'}.`
        : 'Every zone has a fabric. Change any zone at any time.',
    render: renderDone
      ? 'Photoreal render saved.'
      : 'Save the design, then create a photoreal render.',
    room: roomDone ? 'Curtain staged in a room.' : 'Stage the curtain in a real room photo.',
    share: 'Copy a link, download the image, or print the spec sheet.',
  };

  const labels: Record<JourneyStepId, string> = {
    style: 'Style',
    fabrics: 'Fabrics',
    render: 'Render',
    room: 'Room',
    share: 'Share',
  };

  return order.map((id) => ({
    id,
    label: labels[id],
    hint: hints[id],
    state: id === currentId ? 'current' : done[id] ? 'done' : 'todo',
  }));
}
```

Run: `npm test` → PASS.

- [ ] **Step 3: Create JourneyStrip**

`src/components/JourneyStrip.tsx`:

```tsx
// src/components/JourneyStrip.tsx
import React from 'react';
import { Check } from 'lucide-react';
import { JourneyStep, JourneyStepId } from '../lib/journey';

interface JourneyStripProps {
  steps: JourneyStep[];
  onStepClick: (id: JourneyStepId) => void;
}

export const JourneyStrip: React.FC<JourneyStripProps> = ({ steps, onStepClick }) => {
  const current = steps.find((s) => s.state === 'current');
  return (
    <nav aria-label="Design journey" className="journey-strip">
      <ol className="journey-steps">
        {steps.map((step, index) => (
          <li key={step.id} className={`journey-step is-${step.state}`}>
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              aria-current={step.state === 'current' ? 'step' : undefined}
              className="journey-step-button"
            >
              <span className="journey-step-index">
                {step.state === 'done' ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="journey-step-label">{step.label}</span>
            </button>
            {index < steps.length - 1 && <span className="journey-step-line" aria-hidden="true" />}
          </li>
        ))}
      </ol>
      {current && <p className="journey-hint">{current.hint}</p>}
    </nav>
  );
};
```

Append to `src/index.css` before the `/* Scrollbars */` comment:

```css
/* Journey strip */
.journey-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  padding: 10px 14px;
  border-radius: 14px;
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-ring);
}

.journey-steps {
  display: flex;
  align-items: center;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.journey-step {
  display: flex;
  align-items: center;
}

.journey-step-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 10px 0 4px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
}

.journey-step-button:hover { background: var(--color-bg-sunken); color: var(--color-text-primary); }
.journey-step-button:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }

.journey-step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: var(--color-bg-sunken);
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  font-size: 11px;
}

.journey-step.is-done .journey-step-index { background: var(--color-accent); color: #fff; }
.journey-step.is-done .journey-step-button { color: var(--color-text-secondary); }
.journey-step.is-current .journey-step-button { background: var(--color-accent-tint); color: var(--color-accent); }
.journey-step.is-current .journey-step-index { background: var(--color-accent); color: #fff; }

.journey-step-line {
  width: 18px;
  height: 1px;
  margin: 0 2px;
  background: var(--color-border-strong);
}

.journey-hint {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

@media (max-width: 640px) {
  .journey-step-label { display: none; }
  .journey-step.is-current .journey-step-label { display: inline; }
  .journey-step-line { width: 8px; }
  .journey-hint { width: 100%; }
}
```

- [ ] **Step 4: Verify and commit**

```bash
npm test && npm run lint && npm run build
git add src/lib/journey.ts src/lib/journey.test.ts src/components/JourneyStrip.tsx src/index.css
git commit -m "feat(journey): add step derivation and JourneyStrip"
```

---

### Task 6: Shared pieces: ZoneChooser, StyleCard, StylePickerModal

**Files:**
- Create: `src/components/brand/ZoneChooser.tsx`, `src/components/brand/StyleCard.tsx`, `src/components/brand/StylePickerModal.tsx`

**Interfaces:**
- `ZoneChooser` props: `{ isOpen: boolean; onClose: () => void; title: string; regions: Region[]; activeRegionId: string | null; assignments: FabricAssignment[]; fabrics: Fabric[]; onChoose: (regionId: string | 'all') => void }`. Renders a small centred dialog listing zones with their current fabric, the active one preselected, plus an "All zones" row.
- `StyleCard` props: `{ template: CurtainTemplate; badge: 'Your photo' | 'Built-in'; actionLabel: string; onSelect: (t: CurtainTemplate) => void; compact?: boolean }`.
- `StylePickerModal` props: `{ isOpen: boolean; onClose: () => void; onPick: (t: CurtainTemplate) => void; onAddStyle: () => void }`. Reads `brandTemplates` and `currentBrandId` from `useBrandStore`.

- [ ] **Step 1: ZoneChooser**

```tsx
// src/components/brand/ZoneChooser.tsx
import React, { useEffect } from 'react';
import { X, Layers } from 'lucide-react';
import { Fabric, FabricAssignment, Region } from '../../types/curtain';

interface ZoneChooserProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  regions: Region[];
  activeRegionId: string | null;
  assignments: FabricAssignment[];
  fabrics: Fabric[];
  onChoose: (regionId: string | 'all') => void;
}

export const ZoneChooser: React.FC<ZoneChooserProps> = ({
  isOpen,
  onClose,
  title,
  regions,
  activeRegionId,
  assignments,
  fabrics,
  onChoose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={title}
        className="brand-card w-full max-w-sm p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow-label">Apply to</p>
            <h3 className="mt-0.5 font-display text-[16px] font-semibold">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          {regions.map((region) => {
            const assignment = assignments.find((a) => a.region_id === region.id);
            const fabric = fabrics.find((f) => f.id === assignment?.fabric_id);
            const isActive = region.id === activeRegionId;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => onChoose(region.id)}
                className={`flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left transition-colors ${
                  isActive ? 'bg-[var(--color-accent-tint)]' : 'hover:bg-[var(--color-bg-sunken)]'
                }`}
              >
                {fabric ? (
                  <img src={fabric.image_url} alt="" className="h-8 w-8 shrink-0 rounded-[8px] object-cover" />
                ) : (
                  <span className="h-8 w-8 shrink-0 rounded-[8px]" style={{ backgroundColor: region.default_color || '#DDD6C7' }} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{region.display_name}</span>
                  <span className="block truncate text-[11px] text-[var(--color-text-tertiary)]">
                    {fabric ? `Now: ${fabric.name}` : 'No fabric yet'}
                  </span>
                </span>
                {isActive && <span className="badge badge-accent">Active</span>}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onChoose('all')}
            className="mt-1 flex w-full items-center gap-3 rounded-[12px] border-t border-[var(--color-border-subtle)] px-2.5 py-2.5 text-left hover:bg-[var(--color-bg-sunken)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--color-bg-sunken)]">
              <Layers className="h-4 w-4 text-[var(--color-accent)]" />
            </span>
            <span className="text-[13px] font-semibold">All {regions.length} zones</span>
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: StyleCard**

```tsx
// src/components/brand/StyleCard.tsx
import React from 'react';
import { CurtainTemplate } from '../../types/curtain';

interface StyleCardProps {
  template: CurtainTemplate;
  badge: 'Your photo' | 'Built-in';
  actionLabel: string;
  onSelect: (t: CurtainTemplate) => void;
  compact?: boolean;
}

export const StyleCard: React.FC<StyleCardProps> = ({ template, badge, actionLabel, onSelect, compact = false }) => {
  const zoneNames = template.regions.map((r) => r.display_name).slice(0, 3).join(', ');
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      className="brand-card brand-card-interactive flex flex-col overflow-hidden text-left"
    >
      <div className={`media-frame ${compact ? 'aspect-[4/4]' : 'aspect-[4/5]'}`}>
        <img
          src={template.real_photo_url || template.original_image_url}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className={badge === 'Your photo' ? 'badge badge-accent' : 'badge badge-muted'}>{badge}</span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="badge badge-muted">{template.regions.length} zones</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate font-display text-[15px] font-semibold">{template.name}</h3>
        {!compact && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
            {template.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--color-border-subtle)] pt-3 text-[12px]">
          <span className="truncate text-[var(--color-text-tertiary)]">{zoneNames}</span>
          <span className="shrink-0 font-semibold text-[var(--color-accent)]">{actionLabel}</span>
        </div>
      </div>
    </button>
  );
};
```

- [ ] **Step 3: StylePickerModal**

```tsx
// src/components/brand/StylePickerModal.tsx
import React, { useEffect, useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { useBrandStore } from '../../lib/brandStore';
import { CurtainTemplate } from '../../types/curtain';
import { styleOriginBadge } from '../../lib/labels';
import { StyleCard } from './StyleCard';

interface StylePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPick: (t: CurtainTemplate) => void;
  onAddStyle: () => void;
}

export const StylePickerModal: React.FC<StylePickerModalProps> = ({ isOpen, onClose, onPick, onAddStyle }) => {
  const { brandTemplates, currentBrandId } = useBrandStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const styles = brandTemplates
    .filter((t) => t.brand_id === currentBrandId || !t.brand_id)
    .filter((t) => !query.trim() || t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Choose a curtain style"
        className="brand-card flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-3 border-b border-[var(--color-border-subtle)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow-label">Step 1</p>
            <h2 className="mt-0.5 font-display text-[20px] font-semibold">Choose a curtain style</h2>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Each style has zones you can dress with different fabrics.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-disabled)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search styles"
                className="field w-48 pl-9"
              />
            </div>
            <button type="button" onClick={onAddStyle} className="btn btn-secondary">
              <Plus className="h-4 w-4" />
              Add your own
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto p-5 md:grid-cols-3 lg:grid-cols-4">
          {styles.map((t) => (
            <StyleCard
              key={t.id}
              template={t}
              badge={styleOriginBadge(t, currentBrandId)}
              actionLabel="Use this style"
              compact
              onSelect={(picked) => {
                onPick(picked);
                onClose();
              }}
            />
          ))}
          {styles.length === 0 && (
            <div className="col-span-full py-12 text-center text-[13px] text-[var(--color-text-tertiary)]">
              No styles match that search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Verify and commit**

```bash
npm run lint && npm run build
git add src/components/brand/ZoneChooser.tsx src/components/brand/StyleCard.tsx src/components/brand/StylePickerModal.tsx
git commit -m "feat(ui): add ZoneChooser, StyleCard and StylePickerModal"
```

---

### Task 7: Library page (styles tab + fabrics tab) and the zone-chooser apply

**Files:**
- Create: `src/components/brand/library/LibraryPage.tsx`, `src/components/brand/library/StylesTab.tsx`, `src/components/brand/library/FabricsTab.tsx`
- Modify: `src/components/brand/FabricCard.tsx`, `src/components/brand/FabricPreviewModal.tsx`, `src/App.tsx`
- Delete: `src/components/brand/TemplatesGallery.tsx`, `src/components/brand/CatalogView.tsx`

**Interfaces:**
- `LibraryPage` props: `{ tab: 'styles' | 'fabrics'; onOpenNewStyle: () => void }`. Tab switching calls `setActiveView('library_styles' | 'library_fabrics')`.
- `FabricCard` props become `{ fabric: Fabric; onPreview: (f: Fabric) => void; onApply: (f: Fabric) => void; onKeepInLibrary?: (f: Fabric) => void; onRename?: (f: Fabric) => void; onArchive?: (f: Fabric) => void; viewSize?: 'compact' | 'comfortable' }`.
- `FabricPreviewModal` props become `{ isOpen; onClose; fabric: Fabric | null; regions: Region[]; activeRegionId: string | null; assignments: FabricAssignment[]; fabrics: Fabric[]; onApply: (regionId: string | 'all', fabricId: string) => void; onGoToStudio: () => void }`.

- [ ] **Step 1: Update FabricCard**

In `src/components/brand/FabricCard.tsx`:
- Replace the props interface with the one above (rename `onApplyDirect` → `onApply`, `onPromoteToCatalog` → `onKeepInLibrary`).
- Replace `const isCatalog = fabric.visibility !== 'session_only';` with `const badge = fabricOriginBadge(fabric); const isOwn = badge === 'Your fabric';` and add `import { fabricOriginBadge } from '../../lib/labels';`.
- Replace the badge span with `<span className={isOwn ? 'badge badge-accent' : 'badge badge-muted'}>{badge}</span>`.
- Replace the hover overlay's Apply button `onClick` body with `onApply(fabric);` and label `Apply to zone…`.
- Replace the menu's first item condition and label: `{fabric.visibility === 'session_only' && onKeepInLibrary && (` … label `Keep in library`, calling `onKeepInLibrary(fabric)`.

- [ ] **Step 2: Update FabricPreviewModal**

Replace the props interface, the state, and the whole "Apply To Zone Section" (the `<div className="p-4 rounded-2xl bg-white border …">` block) in `src/components/brand/FabricPreviewModal.tsx`:

Props and imports:

```tsx
import { ZoneChooser } from './ZoneChooser';
import { Fabric, FabricAssignment, Region } from '../../types/curtain';

interface FabricPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fabric: Fabric | null;
  regions: Region[];
  activeRegionId: string | null;
  assignments: FabricAssignment[];
  fabrics: Fabric[];
  onApply: (regionId: string | 'all', fabricId: string) => void;
  onGoToStudio: () => void;
}
```

Remove `selectedRegionId` state and the `handleApplySingle`, `handleApplyAndGo`, `handleApplyAll` functions. Add `const [isChooserOpen, setIsChooserOpen] = useState(false);` and:

```tsx
  const activeRegion = regions.find((r) => r.id === activeRegionId) || regions[0] || null;

  const applyTo = (target: string | 'all') => {
    onApply(target, fabric.id);
    const name = target === 'all' ? `all ${regions.length} zones` : regions.find((r) => r.id === target)?.display_name || 'zone';
    setAppliedNotice(`Applied to ${name}`);
    setIsChooserOpen(false);
    setTimeout(() => setAppliedNotice(null), 2500);
  };
```

New apply block (replaces the old one entirely):

```tsx
            <div className="space-y-2 rounded-2xl border border-[var(--color-border-strong)] bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="eyebrow-label flex items-center gap-1.5 text-[var(--color-text-primary)]">
                  <Layers className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                  Use this fabric
                </span>
                <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">{regions.length} zones</span>
              </div>
              {activeRegion && (
                <button type="button" onClick={() => applyTo(activeRegion.id)} className="btn btn-primary btn-block">
                  Apply to {activeRegion.display_name}
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setIsChooserOpen(true)} className="btn btn-secondary btn-sm">
                  Choose a zone…
                </button>
                <button type="button" onClick={() => applyTo('all')} className="btn btn-secondary btn-sm">
                  All zones
                </button>
              </div>
              <button type="button" onClick={onGoToStudio} className="btn btn-ghost btn-sm w-full">
                Open studio <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
```

Before the closing `</div>` of the outer modal, add:

```tsx
        <ZoneChooser
          isOpen={isChooserOpen}
          onClose={() => setIsChooserOpen(false)}
          title={fabric.name}
          regions={regions}
          activeRegionId={activeRegionId}
          assignments={assignments}
          fabrics={fabrics}
          onChoose={applyTo}
        />
```

Remove imports tsc reports as unused.

- [ ] **Step 3: StylesTab**

`src/components/brand/library/StylesTab.tsx`:

```tsx
// src/components/brand/library/StylesTab.tsx
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useBrandStore } from '../../../lib/brandStore';
import { useStudioStore } from '../../../lib/store';
import { styleOriginBadge } from '../../../lib/labels';
import { StyleCard } from '../StyleCard';

interface StylesTabProps {
  onOpenNewStyle: () => void;
}

export const StylesTab: React.FC<StylesTabProps> = ({ onOpenNewStyle }) => {
  const { brandTemplates, currentBrandId, setActiveView } = useBrandStore();
  const { selectTemplate } = useStudioStore();
  const [filter, setFilter] = useState<'all' | 'mine' | 'built_in'>('all');
  const [query, setQuery] = useState('');

  const scoped = brandTemplates.filter((t) => t.brand_id === currentBrandId || !t.brand_id);
  const filtered = scoped.filter((t) => {
    const badge = styleOriginBadge(t, currentBrandId);
    if (filter === 'mine' && badge !== 'Your photo') return false;
    if (filter === 'built_in' && badge !== 'Built-in') return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="segmented self-start">
          {(
            [
              { id: 'all', label: `All · ${scoped.length}` },
              { id: 'mine', label: 'Your photos' },
              { id: 'built_in', label: 'Built-in' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`segmented-item ${filter === tab.id ? 'is-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-disabled)]" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search styles" className="field pl-9" />
          </div>
          <button type="button" onClick={onOpenNewStyle} className="btn btn-primary shrink-0">
            <Plus className="h-4 w-4" />
            Add a curtain style
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="brand-card flex flex-col items-start gap-3 px-6 py-12">
          <p className="eyebrow-label">No matches</p>
          <h3 className="font-display text-[18px] font-semibold">No curtain styles here yet</h3>
          <p className="max-w-md text-[14px] text-[var(--color-text-secondary)]">
            Try another filter, or upload a photo of a curtain to create your own style.
          </p>
          <button type="button" onClick={onOpenNewStyle} className="btn btn-secondary">Upload a curtain photo</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <StyleCard
              key={t.id}
              template={t}
              badge={styleOriginBadge(t, currentBrandId)}
              actionLabel="Design with this style"
              onSelect={(picked) => {
                selectTemplate(picked.id, brandTemplates);
                setActiveView('editor');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 4: FabricsTab**

`src/components/brand/library/FabricsTab.tsx`:

```tsx
// src/components/brand/library/FabricsTab.tsx
import React, { useState } from 'react';
import { Search, Plus, Camera, Upload, Check, LayoutGrid, Grid3X3 } from 'lucide-react';
import { useBrandStore } from '../../../lib/brandStore';
import { useStudioStore } from '../../../lib/store';
import { Fabric } from '../../../types/curtain';
import { fabricOriginBadge } from '../../../lib/labels';
import { CameraCaptureModal } from '../CameraCaptureModal';
import { BulkUploadModal } from '../BulkUploadModal';
import { FabricCard } from '../FabricCard';
import { FabricPreviewModal } from '../FabricPreviewModal';
import { ZoneChooser } from '../ZoneChooser';

const CATEGORIES = ['All', 'Velvet', 'Linen', 'Silk', 'Geometric', 'Jacquard & Damask', 'Textured & Bouclé', 'Exotic Relief', 'Embroidered & Textured', 'Luxury Sheers', 'Custom'];

export const FabricsTab: React.FC = () => {
  const { brandFabrics, currentBrandId, brandTemplates, updateBrandFabric, archiveBrandFabric, setActiveView } = useBrandStore();
  const { selectedTemplateId, assignments, activeRegionId, assignFabricToRegion, assignFabricToAllRegions } = useStudioStore();

  const currentTemplate = brandTemplates.find((t) => t.id === selectedTemplateId) || brandTemplates[0];
  const regions = currentTemplate?.regions || [];

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [source, setSource] = useState<'all' | 'built_in' | 'mine'>('all');
  const [viewSize, setViewSize] = useState<'comfortable' | 'compact'>('comfortable');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [previewFabric, setPreviewFabric] = useState<Fabric | null>(null);
  const [chooserFabric, setChooserFabric] = useState<Fabric | null>(null);
  const [renaming, setRenaming] = useState<Fabric | null>(null);
  const [newName, setNewName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const scoped = brandFabrics.filter((f) => !f.brand_id || f.brand_id === currentBrandId);
  const filtered = scoped.filter((f) => {
    const badge = fabricOriginBadge(f);
    if (source === 'mine' && badge !== 'Your fabric') return false;
    if (source === 'built_in' && badge !== 'Built-in') return false;
    if (category !== 'All' && f.category !== category) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q)) || (f.metadata?.weave || '').toLowerCase().includes(q);
    }
    return true;
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const applyFabric = (target: string | 'all', fabricId: string) => {
    const fabric = scoped.find((f) => f.id === fabricId);
    if (target === 'all') {
      assignFabricToAllRegions(regions.map((r) => r.id), fabricId);
      showToast(`Applied ${fabric?.name || 'fabric'} to all ${regions.length} zones`);
    } else {
      assignFabricToRegion(target, fabricId);
      const zone = regions.find((r) => r.id === target)?.display_name || 'zone';
      showToast(`Applied ${fabric?.name || 'fabric'} to ${zone}`);
    }
    setChooserFabric(null);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div role="status" className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-[14px] bg-[var(--color-bg-surface)] px-4 py-3 text-[13px] shadow-[var(--shadow-modal)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-white"><Check className="h-3.5 w-3.5" /></span>
          <span className="font-medium">{toast}</span>
          <button type="button" onClick={() => setActiveView('editor')} className="ml-1 font-semibold text-[var(--color-accent)]">Open studio</button>
        </div>
      )}

      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Applying a fabric changes the style open in the studio: <strong className="font-semibold text-[var(--color-text-primary)]">{currentTemplate?.name}</strong>.
        </p>
        <div className="relative flex items-center gap-2">
          <button type="button" onClick={() => setIsAddMenuOpen((o) => !o)} className="btn btn-primary">
            <Plus className="h-4 w-4" /> Add fabric
          </button>
          {isAddMenuOpen && (
            <div className="menu-panel absolute top-full right-0 z-50 mt-2 w-64">
              <button type="button" onClick={() => { setIsAddMenuOpen(false); setIsCameraOpen(true); }} className="flex w-full items-start gap-2.5 rounded-[10px] p-2.5 text-left hover:bg-[var(--color-bg-sunken)]">
                <Camera className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                <span><span className="block text-[13px] font-semibold">Photograph a swatch</span><span className="block text-[11px] text-[var(--color-text-tertiary)]">Use your camera on a physical sample</span></span>
              </button>
              <button type="button" onClick={() => { setIsAddMenuOpen(false); setIsBulkOpen(true); }} className="flex w-full items-start gap-2.5 rounded-[10px] p-2.5 text-left hover:bg-[var(--color-bg-sunken)]">
                <Upload className="mt-0.5 h-4 w-4 text-[var(--color-premium)]" />
                <span><span className="block text-[13px] font-semibold">Upload image files</span><span className="block text-[11px] text-[var(--color-text-tertiary)]">Add many fabric photos at once</span></span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 space-y-5 rounded-[18px] bg-[var(--color-bg-surface)] p-4 shadow-[var(--shadow-card)] lg:w-56">
          <div>
            <label className="field-label">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-disabled)]" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Velvet, damask…" className="field pl-9" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="eyebrow-label mb-1 block">Material</span>
            {CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className={`flex w-full items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-[13px] ${category === c ? 'bg-[var(--color-accent-tint)] font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-sunken)]'}`}>
                <span>{c}</span>{category === c && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
          <div className="space-y-1 border-t border-[var(--color-border-subtle)] pt-3">
            <span className="eyebrow-label mb-1 block">Source</span>
            {([['all', 'All'], ['built_in', 'Built-in'], ['mine', 'Your fabrics']] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setSource(id)} className={`flex w-full items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-[13px] ${source === id ? 'bg-[var(--color-accent-tint)] font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-sunken)]'}`}>
                <span>{label}</span>{source === id && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </aside>

        <div className="w-full flex-1 space-y-4">
          <div className="flex items-center justify-between px-1 text-[13px] text-[var(--color-text-secondary)]">
            <span><strong className="font-semibold text-[var(--color-text-primary)]">{filtered.length}</strong> of {scoped.length} fabrics</span>
            <div className="segmented">
              <button type="button" onClick={() => setViewSize('comfortable')} className={`segmented-item ${viewSize === 'comfortable' ? 'is-active' : ''}`} aria-pressed={viewSize === 'comfortable'} title="Larger cards"><LayoutGrid className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => setViewSize('compact')} className={`segmented-item ${viewSize === 'compact' ? 'is-active' : ''}`} aria-pressed={viewSize === 'compact'} title="Smaller cards"><Grid3X3 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className={`grid gap-4 ${viewSize === 'comfortable' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'}`}>
            {filtered.length === 0 ? (
              <div className="col-span-full brand-card px-6 py-12">
                <p className="eyebrow-label">No fabrics</p>
                <h3 className="mt-2 font-display text-[18px] font-semibold">Nothing matches these filters</h3>
                <p className="mt-1 max-w-md text-[14px] text-[var(--color-text-secondary)]">Clear a filter, or add a fabric with the camera or an upload.</p>
              </div>
            ) : (
              filtered.map((f) => (
                <FabricCard
                  key={f.id}
                  fabric={f}
                  viewSize={viewSize}
                  onPreview={setPreviewFabric}
                  onApply={setChooserFabric}
                  onKeepInLibrary={(fab) => updateBrandFabric(fab.id, { visibility: 'catalog' })}
                  onRename={(fab) => { setRenaming(fab); setNewName(fab.name); }}
                  onArchive={(fab) => archiveBrandFabric(fab.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <ZoneChooser
        isOpen={Boolean(chooserFabric)}
        onClose={() => setChooserFabric(null)}
        title={chooserFabric?.name || ''}
        regions={regions}
        activeRegionId={activeRegionId}
        assignments={assignments}
        fabrics={scoped}
        onChoose={(target) => chooserFabric && applyFabric(target, chooserFabric.id)}
      />

      <FabricPreviewModal
        isOpen={Boolean(previewFabric)}
        onClose={() => setPreviewFabric(null)}
        fabric={previewFabric}
        regions={regions}
        activeRegionId={activeRegionId}
        assignments={assignments}
        fabrics={scoped}
        onApply={applyFabric}
        onGoToStudio={() => setActiveView('editor')}
      />

      {renaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm">
          <div className="brand-card w-full max-w-sm space-y-4 p-5">
            <h3 className="font-display text-[16px] font-semibold">Rename fabric</h3>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="field" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRenaming(null)} className="btn btn-ghost">Cancel</button>
              <button type="button" onClick={() => { if (newName.trim()) updateBrandFabric(renaming.id, { name: newName.trim() }); setRenaming(null); }} className="btn btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      <CameraCaptureModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />
      <BulkUploadModal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} />
    </div>
  );
};
```

- [ ] **Step 5: LibraryPage**

`src/components/brand/library/LibraryPage.tsx`:

```tsx
// src/components/brand/library/LibraryPage.tsx
import React from 'react';
import { useBrandStore } from '../../../lib/brandStore';
import { StylesTab } from './StylesTab';
import { FabricsTab } from './FabricsTab';

interface LibraryPageProps {
  tab: 'styles' | 'fabrics';
  onOpenNewStyle: () => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({ tab, onOpenNewStyle }) => {
  const { setActiveView } = useBrandStore();
  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow-label">Library</p>
          <h1 className="page-title">{tab === 'styles' ? 'Curtain styles' : 'Fabrics'}</h1>
          <p className="page-lede">
            {tab === 'styles'
              ? 'A curtain style is a photo with zones you can dress. Pick one to start a design.'
              : 'Inspect a fabric up close, then apply it to a zone of the style open in the studio.'}
          </p>
        </div>
        <div className="segmented self-start">
          <button type="button" aria-pressed={tab === 'styles'} onClick={() => setActiveView('library_styles')} className={`segmented-item ${tab === 'styles' ? 'is-active' : ''}`}>Curtain styles</button>
          <button type="button" aria-pressed={tab === 'fabrics'} onClick={() => setActiveView('library_fabrics')} className={`segmented-item ${tab === 'fabrics' ? 'is-active' : ''}`}>Fabrics</button>
        </div>
      </div>
      {tab === 'styles' ? <StylesTab onOpenNewStyle={onOpenNewStyle} /> : <FabricsTab />}
    </div>
  );
};
```

- [ ] **Step 6: Wire App.tsx and delete the old pages**

In `src/App.tsx` replace the `TemplatesGallery` and `CatalogView` imports with `import { LibraryPage } from './components/brand/library/LibraryPage';` and replace the two library branches with:

```tsx
        {(activeView === 'library_styles' || activeView === 'library_fabrics') && (
          <LibraryPage
            tab={activeView === 'library_styles' ? 'styles' : 'fabrics'}
            onOpenNewStyle={() => setIsNewTemplateModalOpen(true)}
          />
        )}
```

Then:

```bash
git rm -q src/components/brand/TemplatesGallery.tsx src/components/brand/CatalogView.tsx
```

`FabricPickerSheet.tsx` still calls `FabricPreviewModal` with the old props; update its call to the new shape so tsc passes (it is fully rewritten in Task 9):

```tsx
        <FabricPreviewModal
          isOpen={!!previewingFabric}
          onClose={() => setPreviewingFabric(null)}
          fabric={previewingFabric}
          regions={activeRegion ? [activeRegion] : []}
          activeRegionId={activeRegion?.id || null}
          assignments={[]}
          fabrics={scopedFabrics}
          onApply={(_target, fabId) => {
            onAssignFabric(fabId);
            setPreviewingFabric(null);
            if (variant === 'modal') onClose();
          }}
          onGoToStudio={() => {
            setPreviewingFabric(null);
            if (variant === 'modal') onClose();
          }}
        />
```

- [ ] **Step 7: Verify and commit**

```bash
npm test && npm run lint && npm run build
git add -A
git commit -m "feat(library): merge styles and fabrics into one Library page with zone-chooser apply"
```

---

### Task 8: Navigation: four items, settings in the account menu, meter tooltip

**Files:**
- Modify: `src/components/brand/BrandHeader.tsx`, `src/pages/SignIn.tsx`

- [ ] **Step 1: Nav items**

In `src/components/brand/BrandHeader.tsx` replace the `navItems` array with:

```tsx
  const navItems: Array<{ id: BrandStoreState['activeView']; label: string; icon: typeof Layers; match: (view: string) => boolean }> = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, match: (v) => v === 'dashboard' },
    { id: 'editor', label: 'Studio', icon: Sparkles, match: (v) => v === 'editor' },
    { id: 'library_styles', label: 'Library', icon: Layers, match: (v) => v.startsWith('library') },
    { id: 'design_detail', label: 'Designs', icon: FolderKanban, match: (v) => v === 'design_detail' },
  ];
```

Add `import { useBrandStore, BrandStoreState } from '../../lib/brandStore';` (replace the existing import line). Change `go` to accept `BrandStoreState['activeView']` and drop the `as any` cast. Remove the `Palette` import.

- [ ] **Step 2: Move Settings and Ops out of the nav**

Delete the `{canManage && (…Settings…)}` and `{currentUser?.role === 'platform_admin' && (…Ops…)}` blocks from both the desktop `<nav>` and the mobile `<nav>`.

In the account menu `<div className="py-1">` block, replace the two buttons with:

```tsx
                  {canManage && (
                    <button type="button" className="w-full rounded-[10px] px-3 py-2 text-left text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)]" onClick={() => go('settings_models')}>
                      Settings
                    </button>
                  )}
                  <button type="button" className="w-full rounded-[10px] px-3 py-2 text-left text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)]" onClick={() => go('settings_profile')}>
                    Brand profile
                  </button>
                  {currentUser?.role === 'platform_admin' && (
                    <button type="button" className="w-full rounded-[10px] px-3 py-2 text-left text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)]" onClick={() => go('platform_admin')}>
                      Platform admin
                    </button>
                  )}
```

Remove the now-unused `Settings` and `Shield` icon imports.

- [ ] **Step 3: Meter tooltip**

Change the meter wrapper's `title` to `` `${used} of ${cap} photoreal renders used this month` `` and add `aria-label` with the same string.

- [ ] **Step 4: Sign-in label**

In `src/pages/SignIn.tsx` change the `Personas` span text to `Demo accounts` and the lede to `Pick a demo account, or sign in with workspace credentials.`

- [ ] **Step 5: Verify and commit**

```bash
npm run lint && npm run build
git add src/components/brand/BrandHeader.tsx src/pages/SignIn.tsx
git commit -m "feat(nav): four-item navigation with settings in the account menu"
```

---

### Task 9: Studio rewrite

**Files:**
- Rewrite: `src/components/brand/FabricPickerSheet.tsx`, `src/components/brand/TemplateEditor.tsx`
- Modify: `src/App.tsx` (TemplateEditor props, new-style save handler), `src/index.css` (studio bottom bar)

**Interfaces:**
- `FabricPickerSheet` props: `{ variant: 'dock' | 'modal'; isOpen: boolean; onClose: () => void; activeRegion: Region | null; regions: Region[]; assignments: FabricAssignment[]; fabrics: Fabric[]; currentAssignedFabricId: string | null; onAssignFabric: (fabricId: string) => void; onChangeZone: () => void }`.
- `TemplateEditor` props: `{ onOpenNewStyle: () => void }`.
- Consumes: `useStudioStore` (Task 2), `deriveJourney`/`JourneyStrip` (Task 5), `StylePickerModal`, `ZoneChooser` (Task 6), `FabricPreviewModal` new props (Task 7), `Design.render_kind` and `updateDesign` (Task 4).

- [ ] **Step 1: Rewrite FabricPickerSheet**

Replace the whole file:

```tsx
// src/components/brand/FabricPickerSheet.tsx
// The studio's fabric panel. Dock variant sits beside the canvas on desktop;
// modal variant is the bottom sheet on small screens.
import React, { useState } from 'react';
import { X, Camera, Search, Check, Eye, Palette, ArrowLeftRight } from 'lucide-react';
import { Fabric, FabricAssignment, Region } from '../../types/curtain';
import { fabricOriginBadge } from '../../lib/labels';
import { CameraCaptureModal } from './CameraCaptureModal';
import { FabricPreviewModal } from './FabricPreviewModal';

interface FabricPickerSheetProps {
  variant: 'dock' | 'modal';
  isOpen: boolean;
  onClose: () => void;
  activeRegion: Region | null;
  regions: Region[];
  assignments: FabricAssignment[];
  fabrics: Fabric[];
  currentAssignedFabricId: string | null;
  onAssignFabric: (fabricId: string) => void;
  onChangeZone: () => void;
}

const CATEGORIES = ['All', 'Your fabrics', 'Velvet', 'Linen', 'Silk', 'Geometric', 'Jacquard & Damask', 'Textured & Bouclé', 'Exotic Relief'];

const PickerFabricItem: React.FC<{ fabric: Fabric; isAssigned: boolean; onSelect: () => void; onPreview: () => void; compact: boolean }> = ({ fabric, isAssigned, onSelect, onPreview, compact }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      title={`Use ${fabric.name}`}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-[12px] text-left transition-shadow ${isAssigned ? 'ring-2 ring-[var(--color-accent)] ring-offset-1' : 'shadow-[var(--shadow-ring)] hover:shadow-[var(--shadow-card)]'}`}
    >
      <div className="relative w-full overflow-hidden bg-[var(--color-bg-sunken)]" style={{ backgroundColor: fabric.color_hex || '#EDE8DE', aspectRatio: '1 / 1', minHeight: compact ? 88 : 112 }}>
        {!imgError ? (
          <img src={fabric.image_url} alt={fabric.name} onError={() => setImgError(true)} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-white" style={{ backgroundColor: fabric.color_hex || '#5B4FE0' }}>
            <Palette className="mb-1 h-5 w-5 opacity-80" />
            <span className="max-w-full truncate px-1 text-[10px] font-semibold">{fabric.name}</span>
          </div>
        )}
        {isAssigned && (
          <span className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-xs"><Check className="h-3 w-3 stroke-[2.5]" /></span>
        )}
        {fabricOriginBadge(fabric) === 'Your fabric' && <span className="badge badge-accent absolute top-2 left-2">Yours</span>}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPreview(); }}
          title="Look closer"
          className="absolute right-2 bottom-2 z-10 flex items-center gap-1 rounded-lg bg-white/95 p-1.5 text-[var(--color-text-primary)] opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <Eye className="h-3.5 w-3.5 text-[var(--color-accent)]" />
          <span className="pr-0.5 text-[10px] font-semibold">Look closer</span>
        </button>
      </div>
      {!compact && (
        <div className="p-2">
          <h4 className="truncate text-[12px] font-semibold">{fabric.name}</h4>
          <div className="mt-0.5 truncate text-[10px] text-[var(--color-text-tertiary)]">{fabric.category}</div>
        </div>
      )}
    </div>
  );
};

export const FabricPickerSheet: React.FC<FabricPickerSheetProps> = ({ variant, isOpen, onClose, activeRegion, regions, assignments, fabrics, currentAssignedFabricId, onAssignFabric, onChangeZone }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewing, setPreviewing] = useState<Fabric | null>(null);

  if (variant === 'modal' && !isOpen) return null;

  const filtered = fabrics.filter((f) => {
    if (category === 'Your fabrics' && fabricOriginBadge(f) !== 'Your fabric') return false;
    if (category !== 'All' && category !== 'Your fabrics' && f.category !== category) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q));
    }
    return true;
  });

  const pick = (fabricId: string) => {
    onAssignFabric(fabricId);
    if (variant === 'modal') onClose();
  };

  const body = (
    <>
      <div className="flex items-start justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-3">
        <div className="min-w-0">
          <p className="eyebrow-label">Fabrics for</p>
          <h3 className="truncate font-display text-[15px] font-semibold">{activeRegion ? activeRegion.display_name : 'Pick a zone first'}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {regions.length > 1 && (
            <button type="button" onClick={onChangeZone} className="btn btn-ghost btn-sm" title="Choose a different zone">
              <ArrowLeftRight className="h-3.5 w-3.5" /> Change zone
            </button>
          )}
          {variant === 'modal' && (
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close fabric panel"><X className="h-5 w-5" /></button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-disabled)]" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fabrics" className="field pl-9" />
        </div>
        <button type="button" onClick={() => setIsCameraOpen(true)} className="btn btn-secondary shrink-0" title="Photograph a physical swatch and use it here">
          <Camera className="h-4 w-4" /><span className="hidden xl:inline">Photograph a swatch</span>
        </button>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} className={`shrink-0 rounded-[8px] px-2.5 py-1 text-[11px] font-medium ${category === c ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-sunken)] text-[var(--color-text-secondary)]'}`}>{c}</button>
        ))}
      </div>

      <div className={`grid min-h-0 flex-1 auto-rows-max content-start gap-2 overflow-y-auto p-0.5 ${variant === 'dock' ? 'grid-cols-2' : 'grid-cols-3 sm:grid-cols-4'}`}>
        {!activeRegion ? (
          <div className="col-span-full px-2 py-10 text-center text-[13px] text-[var(--color-text-tertiary)]">Click a zone on the curtain or in the zones list.</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-10 text-center text-[13px] text-[var(--color-text-tertiary)]">No fabrics match.</div>
        ) : (
          filtered.map((f) => (
            <PickerFabricItem key={f.id} fabric={f} compact={variant === 'dock'} isAssigned={currentAssignedFabricId === f.id} onSelect={() => pick(f.id)} onPreview={() => setPreviewing(f)} />
          ))
        )}
      </div>

      <CameraCaptureModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onFabricCaptured={(f) => pick(f.id)} />

      <FabricPreviewModal
        isOpen={!!previewing}
        onClose={() => setPreviewing(null)}
        fabric={previewing}
        regions={regions}
        activeRegionId={activeRegion?.id || null}
        assignments={assignments}
        fabrics={fabrics}
        onApply={(_target, fabId) => { pick(fabId); setPreviewing(null); }}
        onGoToStudio={() => setPreviewing(null)}
      />
    </>
  );

  if (variant === 'dock') {
    return <div className="flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden rounded-[18px] bg-[var(--color-bg-surface)] p-3 shadow-[var(--shadow-card)]">{body}</div>;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1A1814]/40 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative flex h-[min(640px,90dvh)] w-full max-w-2xl flex-col gap-3 rounded-t-[24px] bg-[var(--color-bg-surface)] p-4 shadow-[var(--shadow-modal)] sm:rounded-[24px]">{body}</div>
    </div>
  );
};
```

Note: in the dock variant the preview modal's `onApply` ignores the chosen target because the dock always assigns to the active zone; the `FabricPreviewModal` "Choose a zone…" button therefore assigns to the active zone. That is acceptable in the studio because the zones rail is the zone chooser.

- [ ] **Step 2: Studio CSS**

Append to `src/index.css` before `/* Scrollbars */`:

```css
/* Studio action bar */
.studio-actionbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  padding: 10px 14px;
  border-radius: 14px;
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-card);
}

.studio-action-note {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--color-text-tertiary);
}

.zone-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 10px 0 4px;
  border-radius: 999px;
  border: 1px solid var(--color-border-subtle);
  background: var(--color-bg-surface);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.zone-chip.is-active {
  border-color: var(--color-accent);
  background: var(--color-accent-tint);
  color: var(--color-accent);
}
```

- [ ] **Step 3: Rewrite TemplateEditor**

Replace the whole file:

```tsx
// src/components/brand/TemplateEditor.tsx
// The Studio: pick a curtain style, dress each zone with a fabric, then save.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Layers, Check, ChevronDown, CircleDashed, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { useBrandStore } from '../../lib/brandStore';
import { useStudioStore } from '../../lib/store';
import { CurtainTemplate } from '../../types/curtain';
import { deriveJourney, JourneyStepId } from '../../lib/journey';
import { generateSequentialRedesign } from '../../utils/maskedPipeline';
import { renderCurtainOnCanvas, getTemplateRealPhotoUrl } from '../../utils/fabricRenderer';
import { JourneyStrip } from '../JourneyStrip';
import { FabricPickerSheet } from './FabricPickerSheet';
import { StylePickerModal } from './StylePickerModal';
import { ZoneChooser } from './ZoneChooser';

interface TemplateEditorProps {
  onOpenNewStyle: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ onOpenNewStyle }) => {
  const { brandTemplates, brandFabrics, currentBrandId, getModelConfig, saveDesign, setActiveDesignId, setActiveView } = useBrandStore();
  const { selectedTemplateId, selectTemplate, assignments, activeRegionId, setActiveRegionId, hoveredRegionId, setHoveredRegionId, assignFabricToRegion } = useStudioStore();

  const templates = useMemo(() => brandTemplates.filter((t) => t.brand_id === currentBrandId || !t.brand_id), [brandTemplates, currentBrandId]);
  const currentTemplate: CurtainTemplate | undefined = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const scopedFabrics = useMemo(() => brandFabrics.filter((f) => f.brand_id === currentBrandId || !f.brand_id), [brandFabrics, currentBrandId]);

  const [isStylePickerOpen, setIsStylePickerOpen] = useState(false);
  const [isZoneChooserOpen, setIsZoneChooserOpen] = useState(false);
  const [isPickerSheetOpen, setIsPickerSheetOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepText, setGenerationStepText] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [canvasDataUrl, setCanvasDataUrl] = useState('');
  const [hasCanvasFrame, setHasCanvasFrame] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'info'; text: string } | null>(null);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [designName, setDesignName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const renderSeq = useRef(0);
  const zonesRailRef = useRef<HTMLDivElement | null>(null);

  const templateId = currentTemplate?.id;

  useEffect(() => {
    if (!currentTemplate) return;
    setGeneratedImageUrl(null);
    setHasCanvasFrame(false);
    setStatus(null);
    setDesignName(`${currentTemplate.name} · ${new Date().toLocaleDateString()}`);
  }, [templateId]);

  // If the store's template is not in this brand's list (brand switched), fall back to the first.
  useEffect(() => {
    if (currentTemplate && currentTemplate.id !== selectedTemplateId) selectTemplate(currentTemplate.id, templates);
  }, [currentTemplate?.id, selectedTemplateId]);

  useEffect(() => {
    if (!currentTemplate) return;
    const seq = ++renderSeq.current;
    let cancelled = false;
    const run = async () => {
      if (!offscreenRef.current) offscreenRef.current = document.createElement('canvas');
      const offscreen = offscreenRef.current;
      try {
        const dataUrl = await renderCurtainOnCanvas(offscreen, currentTemplate, assignments, scopedFabrics, { width: 800, height: 1000 });
        if (cancelled || seq !== renderSeq.current) return;
        const visible = canvasRef.current;
        const ctx = visible?.getContext('2d');
        if (!visible || !ctx) return;
        if (visible.width !== offscreen.width) visible.width = offscreen.width;
        if (visible.height !== offscreen.height) visible.height = offscreen.height;
        ctx.drawImage(offscreen, 0, 0);
        setHasCanvasFrame(true);
        setCanvasDataUrl((prev) => (prev === dataUrl ? prev : dataUrl));
      } catch (e) {
        console.error('Preview render error:', e);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [currentTemplate, assignments, scopedFabrics]);

  const plateUrl = useMemo(() => (currentTemplate ? getTemplateRealPhotoUrl(currentTemplate, 800, 1000) : ''), [currentTemplate?.id]);

  const isCompact = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;

  const handleSelectRegion = (regionId: string) => {
    setActiveRegionId(regionId);
    if (isCompact()) setIsPickerSheetOpen(true);
  };

  const handleAssignFabric = useCallback((fabricId: string) => {
    if (!activeRegionId) return;
    assignFabricToRegion(activeRegionId, fabricId);
    setGeneratedImageUrl(null);
  }, [activeRegionId, assignFabricToRegion]);

  const handlePhotoreal = async () => {
    if (!currentTemplate) return;
    setIsGenerating(true);
    setStatus(null);
    setGeneratedImageUrl(null);
    try {
      const result = await generateSequentialRedesign({
        template: currentTemplate,
        assignments,
        fabrics: scopedFabrics,
        onStep: (msg) => setGenerationStepText(msg),
        callEdit: (payload) => fetch('/api/generate-curtain-fabric', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, brandId: currentBrandId, provider: getModelConfig(currentBrandId).region_edit_provider }),
        }).then((r) => r.json()),
      });
      if (result?.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        setStatus({ kind: 'ok', text: 'Photoreal render ready. Save the design to keep it.' });
      }
    } catch (err: any) {
      setStatus({ kind: 'info', text: `Photoreal render did not finish (${err.message || 'unknown error'}). Showing the live preview instead.` });
    } finally {
      setIsGenerating(false);
      setGenerationStepText('');
    }
  };

  const handleConfirmSave = () => {
    if (!currentTemplate) return;
    const finalUrl = generatedImageUrl || canvasDataUrl || currentTemplate.original_image_url;
    const design = saveDesign({
      brand_id: currentBrandId,
      template_id: currentTemplate.id,
      template_name: currentTemplate.name,
      name: designName.trim() || `${currentTemplate.name} design`,
      assignments,
      final_image_url: finalUrl,
      render_kind: generatedImageUrl ? 'photoreal' : 'preview',
      created_by_user_id: 'usr-current',
      room_previews: [],
    });
    setIsSaveOpen(false);
    setActiveDesignId(design.id);
    setActiveView('design_detail');
  };

  if (!currentTemplate) {
    return (
      <div className="studio-shell items-start justify-center">
        <div className="brand-card max-w-md p-6">
          <p className="eyebrow-label">Studio</p>
          <h1 className="page-title mt-1">No curtain style yet</h1>
          <p className="page-lede">Add a curtain style before choosing fabrics.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={onOpenNewStyle}>Add a curtain style</button>
        </div>
      </div>
    );
  }

  const regions = currentTemplate.regions;
  const activeRegion = regions.find((r) => r.id === activeRegionId) || null;
  const activeAssignment = assignments.find((a) => a.region_id === activeRegionId);
  const assignedCount = regions.filter((r) => assignments.some((a) => a.region_id === r.id)).length;
  const firstUnassigned = regions.find((r) => !assignments.some((a) => a.region_id === r.id)) || null;
  const steps = deriveJourney({ page: 'studio', zoneCount: regions.length, assignedCount, hasPhotoreal: Boolean(generatedImageUrl), roomPreviewCount: 0 });

  const onStepClick = (id: JourneyStepId) => {
    if (id === 'style') setIsStylePickerOpen(true);
    else if (id === 'fabrics') {
      if (firstUnassigned) handleSelectRegion(firstUnassigned.id);
      zonesRailRef.current?.scrollIntoView({ block: 'nearest' });
    } else {
      setSaveHint('Save the design first. You can render, stage in a room, and share from the design page.');
      setIsSaveOpen(true);
    }
  };

  const zoneRow = (region: CurtainTemplate['regions'][number], asChip: boolean) => {
    const isSelected = region.id === activeRegionId;
    const assignment = assignments.find((a) => a.region_id === region.id);
    const fabric = scopedFabrics.find((f) => f.id === assignment?.fabric_id);
    const thumb = fabric ? (
      <img src={fabric.image_url} alt="" className={`${asChip ? 'h-6 w-6' : 'h-9 w-9'} shrink-0 rounded-[8px] object-cover shadow-[var(--shadow-ring)]`} />
    ) : (
      <span className={`${asChip ? 'h-6 w-6' : 'h-9 w-9'} shrink-0 rounded-[8px]`} style={{ backgroundColor: region.default_color || '#DDD6C7' }} />
    );
    if (asChip) {
      return (
        <button key={region.id} type="button" onClick={() => handleSelectRegion(region.id)} className={`zone-chip ${isSelected ? 'is-active' : ''}`}>
          {thumb}<span>{region.display_name}</span>
          {fabric ? <Check className="h-3.5 w-3.5 text-[var(--color-accent)]" /> : <CircleDashed className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />}
        </button>
      );
    }
    return (
      <button
        key={region.id}
        type="button"
        onClick={() => handleSelectRegion(region.id)}
        onMouseEnter={() => setHoveredRegionId(region.id)}
        onMouseLeave={() => setHoveredRegionId(null)}
        aria-pressed={isSelected}
        className={`flex w-full items-center gap-2.5 rounded-[12px] px-2 py-2 text-left transition-colors ${isSelected ? 'bg-[var(--color-accent-tint)]' : 'hover:bg-[var(--color-bg-sunken)]'}`}
      >
        {thumb}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold">{region.display_name}</span>
          <span className={`block truncate text-[11px] ${fabric ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-accent)]'}`}>{fabric ? fabric.name : 'Choose a fabric'}</span>
        </span>
        {fabric ? <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-accent)]" /> : <CircleDashed className="h-4 w-4 shrink-0 text-[var(--color-text-disabled)]" />}
      </button>
    );
  };

  return (
    <div className="studio-shell gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <button
          type="button"
          onClick={() => setIsStylePickerOpen(true)}
          className="flex min-w-0 items-center gap-3 rounded-[14px] bg-[var(--color-bg-surface)] py-1.5 pr-3 pl-1.5 text-left shadow-[var(--shadow-ring)] transition-colors hover:bg-[var(--color-bg-sunken)]"
          title="Change curtain style"
        >
          <img src={currentTemplate.real_photo_url || currentTemplate.original_image_url} alt="" className="h-11 w-9 shrink-0 rounded-[8px] object-cover" />
          <span className="min-w-0">
            <span className="eyebrow-label block">Curtain style</span>
            <span className="flex items-center gap-1.5 font-display text-[17px] font-semibold leading-tight">
              <span className="truncate">{currentTemplate.name}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
            </span>
          </span>
        </button>
        <div className="min-w-0 flex-1 lg:max-w-[720px]">
          <JourneyStrip steps={steps} onStepClick={onStepClick} />
        </div>
      </div>

      {status && (
        <p role="status" className={`flex items-center gap-2 px-1 text-[13px] ${status.kind === 'ok' ? 'text-[#1F6B48]' : 'text-[#6B5420]'}`}>
          <Info className="h-4 w-4 shrink-0" />{status.text}
        </p>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">{regions.map((r) => zoneRow(r, true))}</div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[250px_minmax(0,1fr)_300px]">
        <aside ref={zonesRailRef} className="hidden min-h-0 flex-col overflow-hidden rounded-[18px] bg-[var(--color-bg-surface)] p-3 shadow-[var(--shadow-card)] lg:flex">
          <div className="mb-2 flex items-center justify-between px-1 py-1">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold"><Layers className="h-3.5 w-3.5 text-[var(--color-accent)]" /> Zones</span>
            <span className="font-mono text-[11px] text-[var(--color-text-tertiary)] tabular-nums">{assignedCount}/{regions.length}</span>
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5">{regions.map((r) => zoneRow(r, false))}</div>
          {firstUnassigned && (
            <button type="button" onClick={() => handleSelectRegion(firstUnassigned.id)} className="btn btn-ghost btn-sm mt-2 w-full justify-between">
              Next zone without a fabric <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </aside>

        <section className="relative flex min-h-[420px] min-w-0 items-center justify-center overflow-hidden rounded-[18px] bg-[var(--color-bg-sunken)] p-4 shadow-[var(--shadow-card)] lg:min-h-0">
          <div className="studio-stage media-frame overflow-hidden rounded-[16px] bg-[var(--color-bg-surface)]">
            {plateUrl && !hasCanvasFrame && !generatedImageUrl && <img src={plateUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <canvas ref={canvasRef} width={800} height={1000} className={`relative h-full w-full object-contain ${generatedImageUrl ? 'hidden' : 'block'}`} />
            {generatedImageUrl && <img src={generatedImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {regions.map((region) => {
                const isSelected = region.id === activeRegionId;
                const isHovered = region.id === hoveredRegionId;
                const points = region.polygon_coords.map((p) => `${p.x},${p.y}`).join(' ');
                return (
                  <polygon
                    key={region.id}
                    points={points}
                    onClick={() => handleSelectRegion(region.id)}
                    onMouseEnter={() => setHoveredRegionId(region.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                    className="cursor-pointer"
                    fill={isSelected ? 'var(--color-accent)' : isHovered ? 'white' : 'transparent'}
                    fillOpacity={isSelected ? 0.08 : isHovered ? 0.12 : 0}
                    stroke={isSelected ? 'var(--color-accent)' : isHovered ? 'white' : 'transparent'}
                    strokeWidth={isSelected ? 0.7 : isHovered ? 0.45 : 0}
                    vectorEffect="non-scaling-stroke"
                  >
                    <title>{region.display_name}</title>
                  </polygon>
                );
              })}
            </svg>
            {isGenerating && <div className="ai-generation-shimmer pointer-events-none absolute inset-0" />}
            <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2">
              <span className="badge badge-muted" title={generatedImageUrl ? 'Made by the AI model from your fabrics. This is what clients see.' : 'Instant preview drawn by the studio. Create a photoreal render for the final image.'}>
                {generatedImageUrl ? 'Photoreal render' : 'Live preview'}
              </span>
              <button type="button" className="compact-only rounded-[8px] bg-[var(--color-bg-surface)] px-3 py-1.5 text-[12px] font-semibold shadow-[var(--shadow-ring)]" onClick={() => setIsPickerSheetOpen(true)}>
                {activeRegion ? `Fabric for ${activeRegion.display_name}` : 'Choose a fabric'}
              </button>
            </div>
          </div>
        </section>

        <aside className="hidden min-h-0 overflow-hidden lg:flex">
          <FabricPickerSheet
            variant="dock"
            isOpen
            onClose={() => undefined}
            activeRegion={activeRegion}
            regions={regions}
            assignments={assignments}
            fabrics={scopedFabrics}
            currentAssignedFabricId={activeAssignment?.fabric_id || null}
            onAssignFabric={handleAssignFabric}
            onChangeZone={() => setIsZoneChooserOpen(true)}
          />
        </aside>
      </div>

      <div className="studio-actionbar">
        <span className="text-[13px] text-[var(--color-text-secondary)]">
          <strong className="font-semibold text-[var(--color-text-primary)] tabular-nums">{assignedCount} of {regions.length}</strong> zones have a fabric
          {firstUnassigned ? <> · next: <button type="button" className="font-semibold text-[var(--color-accent)]" onClick={() => handleSelectRegion(firstUnassigned.id)}>{firstUnassigned.display_name}</button></> : ' · ready to save'}
        </span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={isGenerating} onClick={handlePhotoreal} className="btn btn-secondary flex-col items-start gap-0 py-1" style={{ height: 'auto', minHeight: 40 }}>
            <span className="flex items-center gap-2"><Sparkles className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />{isGenerating ? generationStepText || 'Rendering…' : 'Photoreal render'}</span>
            <span className="studio-action-note">Uses 1 monthly render · about 20s per zone</span>
          </button>
          <button type="button" onClick={() => { setSaveHint(null); setIsSaveOpen(true); }} className="btn btn-primary">
            <Check className="h-3.5 w-3.5" /> Save design <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="lg:hidden">
        <FabricPickerSheet
          variant="modal"
          isOpen={isPickerSheetOpen}
          onClose={() => setIsPickerSheetOpen(false)}
          activeRegion={activeRegion}
          regions={regions}
          assignments={assignments}
          fabrics={scopedFabrics}
          currentAssignedFabricId={activeAssignment?.fabric_id || null}
          onAssignFabric={handleAssignFabric}
          onChangeZone={() => { setIsPickerSheetOpen(false); setIsZoneChooserOpen(true); }}
        />
      </div>

      <ZoneChooser
        isOpen={isZoneChooserOpen}
        onClose={() => setIsZoneChooserOpen(false)}
        title="Which zone do you want to dress?"
        regions={regions}
        activeRegionId={activeRegionId}
        assignments={assignments}
        fabrics={scopedFabrics}
        onChoose={(target) => {
          if (target !== 'all') handleSelectRegion(target);
          setIsZoneChooserOpen(false);
        }}
      />

      <StylePickerModal
        isOpen={isStylePickerOpen}
        onClose={() => setIsStylePickerOpen(false)}
        onPick={(t) => selectTemplate(t.id, templates)}
        onAddStyle={() => { setIsStylePickerOpen(false); onOpenNewStyle(); }}
      />

      {isSaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/45 p-4 backdrop-blur-sm">
          <div className="brand-card w-full max-w-md space-y-4 p-6">
            <div>
              <p className="eyebrow-label">Save</p>
              <h3 className="mt-1 font-display text-[20px] font-semibold">Save this design</h3>
              <p className="page-lede">{saveHint || 'Keeps the style and fabric choices together so you can render, stage it in a room, and share it.'}</p>
            </div>
            <div>
              <label className="field-label" htmlFor="design-name">Design name</label>
              <input id="design-name" type="text" value={designName} onChange={(e) => setDesignName(e.target.value)} className="field" />
            </div>
            {assignedCount < regions.length && (
              <p className="text-[12px] text-[#6B5420]">{regions.length - assignedCount} {regions.length - assignedCount === 1 ? 'zone has' : 'zones have'} no fabric yet. You can still save and come back.</p>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button type="button" onClick={() => setIsSaveOpen(false)} className="btn btn-ghost">Cancel</button>
              <button type="button" onClick={handleConfirmSave} className="btn btn-primary">Save and continue <ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 4: App.tsx wiring**

In `src/App.tsx`:
- Change `<TemplateEditor onOpenSpecModal={…} />` to `<TemplateEditor onOpenNewStyle={() => setIsNewTemplateModalOpen(true)} />`.
- Import `useStudioStore` is already there; in `handleSaveNewTemplate` after `addBrandTemplate({...})` add:

```tsx
    useStudioStore.getState().selectTemplate(template.id, [
      { ...template, brand_id: currentBrandId, source: 'user_upload' },
      ...useBrandStore.getState().brandTemplates,
    ]);
```

- [ ] **Step 5: Verify, screenshot, commit**

```bash
npm test && npm run lint && npm run build
```
Then, with the dev server running, open the Studio in a browser (or run the Task 13 screenshot script if it already exists) and confirm: style button opens the picker; clicking a zone updates the fabric panel title; the action bar shows the count; on a 400px viewport the chips row shows above the image.

```bash
git add -A
git commit -m "feat(studio): style picker, shared active zone, explained actions, mobile order"
```

---

### Task 10: Design page rewrite (Render, Room, Share)

**Files:**
- Rewrite: `src/components/brand/DesignDetailView.tsx`
- Modify: `src/App.tsx` (props)

**Interfaces:**
- `DesignDetailView` props: `{ onOpenSpecSheet: () => void }`.
- Consumes `useBrandStore().updateDesign`, `Design.render_kind`, `providerLabel`, `deriveJourney`, `JourneyStrip`, `useStudioStore().loadAssignments`, `generateSequentialRedesign`.

- [ ] **Step 1: Rewrite DesignDetailView**

```tsx
// src/components/brand/DesignDetailView.tsx
// A saved design: its render, room stagings, and sharing options.
import React, { useMemo, useState } from 'react';
import { Share2, Download, Copy, Check, Sparkles, Plus, Upload, ArrowLeft, FileText, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import { useBrandStore } from '../../lib/brandStore';
import { useStudioStore } from '../../lib/store';
import { Design } from '../../types/brand';
import { deriveJourney, JourneyStepId } from '../../lib/journey';
import { providerLabel } from '../../lib/labels';
import { generateSequentialRedesign } from '../../utils/maskedPipeline';
import { JourneyStrip } from '../JourneyStrip';

interface DesignDetailViewProps {
  onOpenSpecSheet: () => void;
}

type RoomSource = 'template_original' | 'uploaded';

export const DesignDetailView: React.FC<DesignDetailViewProps> = ({ onOpenSpecSheet }) => {
  const { designs, activeDesignId, setActiveDesignId, brandTemplates, brandFabrics, currentBrandId, getModelConfig, addRoomPreview, updateDesign, setActiveView } = useBrandStore();
  const { loadAssignments } = useStudioStore();

  const brandDesigns = designs.filter((d) => d.brand_id === currentBrandId);
  const design: Design | undefined = brandDesigns.find((d) => d.id === activeDesignId) || brandDesigns[0];

  const [copied, setCopied] = useState(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingRoom, setPendingRoom] = useState<{ source: RoomSource; photo: string } | null>(null);
  const [isStaging, setIsStaging] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderStep, setRenderStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const template = useMemo(() => brandTemplates.find((t) => t.id === design?.template_id), [brandTemplates, design?.template_id]);
  const fabrics = useMemo(() => brandFabrics.filter((f) => f.brand_id === currentBrandId || !f.brand_id), [brandFabrics, currentBrandId]);

  if (!design) {
    return (
      <div className="page-shell max-w-3xl space-y-4 text-center">
        <p className="eyebrow-label">Designs</p>
        <h1 className="page-title">No saved designs yet</h1>
        <p className="page-lede mx-auto">Pick a curtain style, choose fabrics for its zones, and save. Your designs will appear here.</p>
        <button type="button" onClick={() => setActiveView('editor')} className="btn btn-primary">Open studio</button>
      </div>
    );
  }

  const roomPreviews = design.room_previews || [];
  const currentPreview = roomPreviews[selectedPreviewIndex] || roomPreviews[0];
  // Every curtain style is a real photograph (built-in ones live in /templates/, uploads are user photos),
  // so the style's own photo is always a valid room to stage in.
  const templateHasRealRoom = Boolean(template);
  const modelConfig = getModelConfig(currentBrandId);
  const steps = deriveJourney({ page: 'design', zoneCount: design.assignments.length, assignedCount: design.assignments.length, hasPhotoreal: design.render_kind === 'photoreal', roomPreviewCount: roomPreviews.length });

  const goToStudio = () => {
    loadAssignments(design.template_id, design.assignments);
    setActiveView('editor');
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const onStepClick = (id: JourneyStepId) => {
    if (id === 'style' || id === 'fabrics') goToStudio();
    else scrollTo(`design-${id}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = (src: string, suffix: string) => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `${design.name.toLowerCase().replace(/\s+/g, '-')}-${suffix}.png`;
    a.click();
  };

  const handlePhotoreal = async () => {
    if (!template) return;
    setIsRendering(true);
    setError(null);
    try {
      const result = await generateSequentialRedesign({
        template,
        assignments: design.assignments,
        fabrics,
        onStep: setRenderStep,
        callEdit: (payload) => fetch('/api/generate-curtain-fabric', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, brandId: currentBrandId, provider: modelConfig.region_edit_provider }),
        }).then((r) => r.json()),
      });
      if (result?.imageUrl) updateDesign(design.id, { final_image_url: result.imageUrl, render_kind: 'photoreal' });
    } catch (err: any) {
      setError(`Photoreal render did not finish: ${err.message || 'unknown error'}.`);
    } finally {
      setIsRendering(false);
      setRenderStep('');
    }
  };

  const chooseRoomFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingRoom({ source: 'uploaded', photo: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleStage = async () => {
    if (!pendingRoom) return;
    const { source, photo } = pendingRoom;
    setIsStaging(true);
    setError(null);
    setPendingRoom(null);
    try {
      const resp = await fetch('/api/room-visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomPhoto: photo, designImage: design.final_image_url, brandId: currentBrandId, roomSource: source }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.error || 'Room staging failed');
      addRoomPreview(design.id, { design_id: design.id, brand_id: currentBrandId, room_source: source, room_photo_url: photo, output_url: data.outputUrl, provider_used: data.providerUsed || modelConfig.room_preview_provider });
      setSelectedPreviewIndex(roomPreviews.length);
      setTimeout(() => scrollTo('design-room'), 50);
    } catch (err: any) {
      setError(err.message || 'Room staging failed.');
    } finally {
      setIsStaging(false);
    }
  };

  const sectionHeader = (id: string, step: string, title: string, lede: string) => (
    <div id={id} className="scroll-mt-24">
      <p className="eyebrow-label">{step}</p>
      <h2 className="mt-0.5 font-display text-[20px] font-semibold">{title}</h2>
      <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{lede}</p>
    </div>
  );

  return (
    <div className="page-shell max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={goToStudio} className="btn btn-ghost btn-sm -ml-2"><ArrowLeft className="h-3.5 w-3.5" /> Edit in studio</button>
            {brandDesigns.length > 1 && (
              <select aria-label="Switch design" value={design.id} onChange={(e) => { setActiveDesignId(e.target.value); setSelectedPreviewIndex(0); }} className="field h-8 w-auto text-[12px]">
                {brandDesigns.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            )}
          </div>
          <h1 className="page-title">{design.name}</h1>
          <p className="page-lede">{design.template_name} · {design.assignments.length} zones · saved {new Date(design.created_at).toLocaleDateString()}</p>
        </div>
        <div className="w-full lg:max-w-[640px]"><JourneyStrip steps={steps} onStepClick={onStepClick} /></div>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-900">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0 text-red-600" />{error}</span>
          <button type="button" onClick={() => setError(null)} className="btn btn-ghost btn-sm">Dismiss</button>
        </div>
      )}

      {/* Step 3: Render */}
      <section className="brand-card space-y-4 p-5 sm:p-6">
        {sectionHeader('design-render', 'Step 3', 'Render', design.render_kind === 'photoreal' ? 'Photoreal render made from your fabric choices.' : 'This is the studio preview. Create a photoreal render for the client-ready image.')}
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="media-frame relative mx-auto aspect-[4/5] w-full max-w-lg rounded-[16px]">
            <img src={design.final_image_url} alt={design.name} className="h-full w-full object-cover" />
            <span className="badge badge-muted absolute top-3 left-3">{design.render_kind === 'photoreal' ? 'Photoreal render' : 'Live preview'}</span>
            {isRendering && <div className="ai-generation-shimmer pointer-events-none absolute inset-0" />}
          </div>
          <div className="space-y-3">
            <div className="rounded-[14px] bg-[var(--color-bg-sunken)] p-3">
              <p className="eyebrow-label mb-2">Fabrics in this design</p>
              <ul className="space-y-1.5">
                {design.assignments.map((a) => {
                  const region = template?.regions.find((r) => r.id === a.region_id);
                  const fabric = fabrics.find((f) => f.id === a.fabric_id);
                  return (
                    <li key={a.region_id} className="flex items-center gap-2 text-[12px]">
                      {fabric && <img src={fabric.image_url} alt="" className="h-6 w-6 rounded-[6px] object-cover" />}
                      <span className="min-w-0 flex-1 truncate"><span className="font-semibold">{region?.display_name || 'Zone'}</span> · {fabric?.name || 'No fabric'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            {design.render_kind !== 'photoreal' && (
              <button type="button" disabled={isRendering} onClick={handlePhotoreal} className="btn btn-primary btn-block">
                <Sparkles className={`h-3.5 w-3.5 ${isRendering ? 'animate-spin' : ''}`} />{isRendering ? renderStep || 'Rendering…' : 'Create photoreal render'}
              </button>
            )}
            <p className="text-[11px] text-[var(--color-text-tertiary)]">Uses 1 monthly render · about 20 seconds per zone.</p>
          </div>
        </div>
      </section>

      {/* Step 4: Room */}
      <section className="brand-card space-y-4 p-5 sm:p-6">
        {sectionHeader('design-room', 'Step 4', 'Room', 'Stage the curtain in a real room photo. The AI keeps the walls, floor, and furniture and hangs your curtain on the window.')}

        {isStaging ? (
          <div className="relative flex h-80 flex-col items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-bg-sunken)]">
            <div className="ai-generation-shimmer absolute inset-0" />
            <Sparkles className="z-10 h-8 w-8 animate-spin text-[var(--color-accent)]" />
            <p className="z-10 mt-3 text-[13px] font-semibold">Staging with {providerLabel(modelConfig.room_preview_provider)}…</p>
            <p className="z-10 text-[12px] text-[var(--color-text-secondary)]">Finding the window and matching the daylight. About 30 seconds.</p>
          </div>
        ) : currentPreview ? (
          <div className="space-y-3">
            <div
              className="relative mx-auto aspect-[16/10] w-full max-w-4xl cursor-ew-resize overflow-hidden rounded-2xl bg-neutral-100 shadow-lg select-none"
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={(e) => { if (!isDragging) return; const r = e.currentTarget.getBoundingClientRect(); setSliderPos(Math.round((Math.max(0, Math.min(e.clientX - r.left, r.width)) / r.width) * 100)); }}
              onTouchMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const t = e.touches[0]; setSliderPos(Math.round((Math.max(0, Math.min(t.clientX - r.left, r.width)) / r.width) * 100)); }}
            >
              <img src={currentPreview.room_photo_url} alt="Room before" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute right-3 bottom-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">Before</span>
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                <img src={currentPreview.output_url} alt="Room with curtain" className="absolute inset-0 h-full w-full max-w-none object-cover" style={{ width: '100%', height: '100%' }} />
                <span className="absolute bottom-3 left-3 rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-semibold text-white">With your curtain · {providerLabel(currentPreview.provider_used)}</span>
              </div>
              <div className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white shadow-xl" style={{ left: `${sliderPos}%` }}>
                <div className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white text-xs font-bold text-[var(--color-accent)] shadow-lg">↔</div>
              </div>
            </div>
            <p className="text-center text-[12px] text-[var(--color-text-tertiary)]">Drag the handle to compare before and after.</p>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {roomPreviews.map((p, idx) => (
                <button key={p.id} type="button" onClick={() => setSelectedPreviewIndex(idx)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 ${selectedPreviewIndex === idx ? 'border-[var(--color-accent)]' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={p.output_url} alt={`Room ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
              <label className="flex h-16 shrink-0 cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-sunken)] px-4 text-[12px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                <Plus className="h-4 w-4" /> Stage in another room
                <input type="file" accept="image/*" className="hidden" onChange={chooseRoomFile} />
              </label>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="brand-card brand-card-interactive flex cursor-pointer items-center gap-4 p-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)]"><Upload className="h-6 w-6" /></span>
              <span>
                <span className="block text-[14px] font-semibold">Upload a room photo</span>
                <span className="block text-[12px] text-[var(--color-text-secondary)]">A straight-on photo of the wall with the window works best.</span>
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={chooseRoomFile} />
            </label>
            {templateHasRealRoom && template && (
              <button type="button" onClick={() => setPendingRoom({ source: 'template_original', photo: template.real_photo_url || template.original_image_url })} className="brand-card brand-card-interactive flex items-center gap-4 p-4 text-left">
                <img src={template.real_photo_url || template.original_image_url} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                <span>
                  <span className="block text-[14px] font-semibold">Use the style's original room</span>
                  <span className="block text-[12px] text-[var(--color-text-secondary)]">Reuses the photo this curtain style came from.</span>
                </span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* Step 5: Share */}
      <section className="brand-card space-y-4 p-5 sm:p-6">
        {sectionHeader('design-share', 'Step 5', 'Share', 'Send the design to a client or hand it to the workroom.')}
        <div className="grid gap-3 sm:grid-cols-3">
          <button type="button" onClick={handleCopy} className="brand-card brand-card-interactive flex flex-col items-start gap-2 p-4 text-left">
            {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Share2 className="h-5 w-5 text-[var(--color-accent)]" />}
            <span className="text-[14px] font-semibold">{copied ? 'Link copied' : 'Copy link'}</span>
            <span className="text-[12px] text-[var(--color-text-secondary)]">Share a link to this design page.</span>
          </button>
          <div className="brand-card flex flex-col items-start gap-2 p-4">
            <Download className="h-5 w-5 text-[var(--color-accent)]" />
            <span className="text-[14px] font-semibold">Download image</span>
            <span className="text-[12px] text-[var(--color-text-secondary)]">Full-size image for email or a deck.</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <button type="button" onClick={() => download(design.final_image_url, 'curtain')} className="btn btn-secondary btn-sm"><ImageIcon className="h-3.5 w-3.5" /> Curtain</button>
              {currentPreview && <button type="button" onClick={() => download(currentPreview.output_url, 'room')} className="btn btn-secondary btn-sm"><ImageIcon className="h-3.5 w-3.5" /> Room</button>}
            </div>
          </div>
          <button type="button" onClick={onOpenSpecSheet} className="brand-card brand-card-interactive flex flex-col items-start gap-2 p-4 text-left">
            <FileText className="h-5 w-5 text-[var(--color-accent)]" />
            <span className="text-[14px] font-semibold">Spec sheet</span>
            <span className="text-[12px] text-[var(--color-text-secondary)]">Printable fabric list and yardage for the workroom.</span>
          </button>
        </div>
      </section>

      {pendingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/45 p-4 backdrop-blur-sm" onClick={() => setPendingRoom(null)}>
          <div role="dialog" aria-label="Confirm room photo" className="brand-card w-full max-w-2xl space-y-4 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow-label">Step 4</p>
                <h3 className="mt-0.5 font-display text-[18px] font-semibold">Stage this curtain in this room?</h3>
                <p className="text-[13px] text-[var(--color-text-secondary)]">The room stays as photographed. Only the window dressing changes.</p>
              </div>
              <button type="button" onClick={() => setPendingRoom(null)} className="btn btn-ghost btn-sm" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
              <div className="media-frame aspect-[16/10] rounded-[14px]"><img src={pendingRoom.photo} alt="Room" className="h-full w-full object-cover" /></div>
              <div className="media-frame aspect-[4/5] rounded-[14px]"><img src={design.final_image_url} alt="Curtain" className="h-full w-full object-cover" /></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="btn btn-ghost cursor-pointer">Choose another photo<input type="file" accept="image/*" className="hidden" onChange={chooseRoomFile} /></label>
              <button type="button" onClick={handleStage} className="btn btn-primary"><Sparkles className="h-3.5 w-3.5" /> Stage curtain in this room</button>
            </div>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">Uses 1 monthly render · staged with {providerLabel(modelConfig.room_preview_provider)}.</p>
          </div>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: App.tsx**

Change `<DesignDetailView onBackToEditor={…} onOpenSpecSheet={…} />` to `<DesignDetailView onOpenSpecSheet={() => setIsSpecSheetOpen(true)} />`. In the `SpecSheetModal` template prop, the `regions: []` and `style_code` values stay as they are.

- [ ] **Step 3: Verify and commit**

```bash
npm test && npm run lint && npm run build
git add -A
git commit -m "feat(design): render, room and share sections with a confirm step before staging"
```

---

### Task 11: Task-first Home

**Files:**
- Rewrite: `src/components/brand/BrandDashboard.tsx`
- Modify: `src/App.tsx` (props)

**Interfaces:**
- `BrandDashboard` props: `{ onOpenNewStyle: () => void }`. Uses `StylePickerModal` to start a design.

- [ ] **Step 1: Rewrite BrandDashboard**

```tsx
// src/components/brand/BrandDashboard.tsx
import React, { useState } from 'react';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import { useBrandStore } from '../../lib/brandStore';
import { useStudioStore } from '../../lib/store';
import { deriveJourney } from '../../lib/journey';
import { StylePickerModal } from './StylePickerModal';

interface BrandDashboardProps {
  onOpenNewStyle: () => void;
}

export const BrandDashboard: React.FC<BrandDashboardProps> = ({ onOpenNewStyle }) => {
  const { brands, currentBrandId, currentUser, getModelConfig, designs, brandTemplates, brandFabrics, setActiveView, setActiveDesignId } = useBrandStore();
  const { selectTemplate, loadAssignments } = useStudioStore();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const brand = brands.find((b) => b.id === currentBrandId) || brands[0];
  const config = getModelConfig(brand.id);
  const cap = config.monthly_generation_cap || 200;
  const used = config.monthly_generations_used || 0;
  const styles = brandTemplates.filter((t) => t.brand_id === brand.id || !t.brand_id);
  const fabrics = brandFabrics.filter((f) => f.brand_id === brand.id || !f.brand_id);
  const myDesigns = designs.filter((d) => d.brand_id === brand.id);
  const latest = myDesigns[0];
  const firstName = currentUser?.name?.split(' ')[0] || 'there';

  const latestSteps = latest
    ? deriveJourney({ page: 'design', zoneCount: latest.assignments.length, assignedCount: latest.assignments.length, hasPhotoreal: latest.render_kind === 'photoreal', roomPreviewCount: latest.room_previews.length })
    : [];
  const latestNext = latestSteps.find((s) => s.state === 'current');

  const openDesign = (id: string) => {
    setActiveDesignId(id);
    setActiveView('design_detail');
  };

  return (
    <div className="page-shell space-y-8">
      <div className="space-y-2">
        <p className="eyebrow-label">{brand.name}</p>
        <h1 className="page-title">Hello, {firstName}</h1>
        <p className="page-lede">Pick a curtain style, dress each zone with a fabric, then see it in a real room.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button type="button" onClick={() => setIsPickerOpen(true)} className="brand-card brand-card-interactive flex flex-col items-start gap-3 p-6 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white"><Sparkles className="h-5 w-5" /></span>
          <span className="font-display text-[20px] font-semibold">Start a new design</span>
          <span className="text-[13px] text-[var(--color-text-secondary)]">Choose one of {styles.length} curtain styles, then pick fabrics for its zones.</span>
          <span className="mt-auto flex items-center gap-1 text-[13px] font-semibold text-[var(--color-accent)]">Choose a style <ArrowRight className="h-3.5 w-3.5" /></span>
        </button>

        {latest ? (
          <button type="button" onClick={() => openDesign(latest.id)} className="brand-card brand-card-interactive flex gap-4 overflow-hidden p-4 text-left">
            <div className="media-frame h-full w-28 shrink-0 rounded-[12px]"><img src={latest.final_image_url} alt="" className="h-full w-full object-cover" /></div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="eyebrow-label">Continue</span>
              <span className="mt-1 truncate font-display text-[17px] font-semibold">{latest.name}</span>
              <span className="text-[12px] text-[var(--color-text-tertiary)]">{latest.template_name}</span>
              {latestNext && <span className="mt-2 text-[13px] text-[var(--color-text-secondary)]">Next: <strong className="font-semibold text-[var(--color-text-primary)]">{latestNext.label}</strong> · {latestNext.hint}</span>}
              <span className="mt-auto flex items-center gap-1 pt-2 text-[13px] font-semibold text-[var(--color-accent)]">Open design <ArrowRight className="h-3.5 w-3.5" /></span>
            </div>
          </button>
        ) : (
          <div className="brand-card flex flex-col items-start gap-3 p-6">
            <span className="eyebrow-label">Continue</span>
            <span className="font-display text-[18px] font-semibold">No designs yet</span>
            <span className="text-[13px] text-[var(--color-text-secondary)]">Your saved designs will show up here with what to do next.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[16px] bg-[var(--color-border-subtle)] shadow-[var(--shadow-card)]">
        <div className="bg-[var(--color-bg-surface)] px-5 py-4" title="Photoreal renders and room stagings used this month">
          <div className="text-[11px] font-medium tracking-wide text-[var(--color-text-tertiary)] uppercase">Renders this month</div>
          <div className="mt-1 flex items-baseline gap-1.5"><span className="font-display text-[22px] font-semibold tabular-nums">{used}</span><span className="text-[12px] text-[var(--color-text-tertiary)]">/ {cap}</span></div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--color-bg-sunken)]"><div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${Math.min(100, Math.round((used / cap) * 100))}%` }} /></div>
        </div>
        <button type="button" onClick={() => setActiveView('library_styles')} className="bg-[var(--color-bg-surface)] px-5 py-4 text-left hover:bg-[var(--color-bg-sunken)]">
          <div className="text-[11px] font-medium tracking-wide text-[var(--color-text-tertiary)] uppercase">Curtain styles</div>
          <div className="mt-1 font-display text-[22px] font-semibold tabular-nums">{styles.length}</div>
          <div className="mt-2 text-[12px] text-[var(--color-accent)]">Browse styles</div>
        </button>
        <button type="button" onClick={() => setActiveView('library_fabrics')} className="bg-[var(--color-bg-surface)] px-5 py-4 text-left hover:bg-[var(--color-bg-sunken)]">
          <div className="text-[11px] font-medium tracking-wide text-[var(--color-text-tertiary)] uppercase">Fabrics</div>
          <div className="mt-1 font-display text-[22px] font-semibold tabular-nums">{fabrics.length}</div>
          <div className="mt-2 text-[12px] text-[var(--color-accent)]">Browse fabrics</div>
        </button>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[20px] font-semibold tracking-tight">Your designs</h2>
            <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">Open one to render, stage it in a room, or share.</p>
          </div>
          <button type="button" onClick={onOpenNewStyle} className="btn btn-ghost btn-sm"><Plus className="h-3.5 w-3.5" /> Add a curtain style</button>
        </div>
        {myDesigns.length === 0 ? (
          <div className="brand-card px-6 py-10 text-[14px] text-[var(--color-text-secondary)]">Start a new design above. It will appear here once saved.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {myDesigns.map((d) => (
              <button key={d.id} type="button" onClick={() => openDesign(d.id)} className="brand-card brand-card-interactive overflow-hidden text-left">
                <div className="media-frame aspect-[4/5]">
                  <img src={d.final_image_url} alt="" className="h-full w-full object-cover" />
                  <span className="badge badge-muted absolute top-3 left-3">{d.render_kind === 'photoreal' ? 'Photoreal render' : 'Live preview'}</span>
                  {d.room_previews.length > 0 && <span className="badge badge-accent absolute top-3 right-3">In room</span>}
                </div>
                <div className="p-4">
                  <div className="text-[11px] text-[var(--color-text-tertiary)]">{d.template_name}</div>
                  <h3 className="mt-0.5 truncate font-display text-[15px] font-semibold">{d.name}</h3>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <StylePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onPick={(t) => { selectTemplate(t.id, brandTemplates); setActiveView('editor'); }}
        onAddStyle={() => { setIsPickerOpen(false); onOpenNewStyle(); }}
      />
    </div>
  );
};
```

Remove the unused `loadAssignments` destructure if tsc flags it.

- [ ] **Step 2: App.tsx**

Change the dashboard branch to `<BrandDashboard onOpenNewStyle={() => setIsNewTemplateModalOpen(true)} />` and remove the now-unused `isBulkUploadOpen` state and `BulkUploadModal` render from `App.tsx` (the Library fabrics tab owns bulk upload). Keep `CameraCaptureModal` only if still referenced; otherwise remove it too.

- [ ] **Step 3: Verify and commit**

```bash
npm test && npm run lint && npm run build
git add -A
git commit -m "feat(home): task-first dashboard with start and continue cards"
```

---

### Task 12: Sample images (built-in preview, then an optional real AI pass)

**Files:**
- Create: `scripts/browser.mjs` (shared launcher), `scripts/capture-samples.mjs`
- Produces: `public/designs/velvet-salon-preview.png`; optionally `public/designs/velvet-salon-photoreal.png`, `public/designs/velvet-salon-room-before.png`, `public/designs/velvet-salon-room-after.png`
- Modify: `src/lib/brandStore.ts` seed (only if the AI pass is accepted)

**Interfaces:**
- `scripts/browser.mjs` exports `launch(): Promise<Browser>` resolving Playwright from `PLAYWRIGHT_MODULE` (default the global `@playwright/cli` path) and Chromium from `CHROME_PATH` (default `~/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome`).
- Scripts read `APP_URL` (default `http://localhost:3000`).

- [ ] **Step 1: Shared launcher**

```js
// scripts/browser.mjs
import os from 'node:os';
import path from 'node:path';

const DEFAULT_MODULE = path.join(os.homedir(), '.nvm/versions/node/v24.15.0/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs');
const DEFAULT_CHROME = path.join(os.homedir(), '.cache/ms-playwright/chromium-1223/chrome-linux64/chrome');

export const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function launch() {
  const mod = await import(process.env.PLAYWRIGHT_MODULE || DEFAULT_MODULE);
  return mod.chromium.launch({ executablePath: process.env.CHROME_PATH || DEFAULT_CHROME });
}
```

- [ ] **Step 2: Capture script**

```js
// scripts/capture-samples.mjs
// Usage: node scripts/capture-samples.mjs            -> built-in preview only (no API cost)
//        node scripts/capture-samples.mjs --ai       -> also one photoreal render + one room staging (spends OpenRouter credits)
import fs from 'node:fs';
import path from 'node:path';
import { launch, APP_URL } from './browser.mjs';

const OUT = path.resolve('public/designs');
fs.mkdirSync(OUT, { recursive: true });
const withAi = process.argv.includes('--ai');

const saveDataUrl = (dataUrl, file) => {
  const b64 = dataUrl.split(',')[1];
  fs.writeFileSync(path.join(OUT, file), Buffer.from(b64, 'base64'));
  console.log('wrote', file);
};

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(APP_URL, { waitUntil: 'networkidle' });

// Open the design's style in the studio with the design's assignments.
await page.getByRole('button', { name: 'Designs', exact: true }).click();
await page.getByRole('button', { name: /Edit in studio/ }).click();
await page.waitForSelector('canvas');
await page.waitForTimeout(2500);

const previewDataUrl = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
saveDataUrl(previewDataUrl, 'velvet-salon-preview.png');

if (withAi) {
  await page.getByRole('button', { name: /Photoreal render/ }).click();
  await page.waitForSelector('text=Photoreal render ready', { timeout: 600000 });
  const photoreal = await page.evaluate(() => {
    const img = Array.from(document.querySelectorAll('img')).find((i) => i.src.startsWith('data:image') && i.closest('.studio-stage'));
    return img ? img.src : null;
  });
  if (photoreal) saveDataUrl(photoreal, 'velvet-salon-photoreal.png');

  await page.getByRole('button', { name: /Save design/ }).first().click();
  await page.getByRole('button', { name: /Save and continue/ }).click();
  await page.getByRole('button', { name: /Use the style's original room/ }).click();
  await page.getByRole('button', { name: /Stage curtain in this room/ }).click();
  await page.waitForSelector('img[alt="Room with curtain"]', { timeout: 600000 });
  const before = await page.getAttribute('img[alt="Room before"]', 'src');
  const after = await page.getAttribute('img[alt="Room with curtain"]', 'src');
  const toDataUrl = async (src) => src.startsWith('data:') ? src : await page.evaluate(async (s) => {
    const blob = await (await fetch(s)).blob();
    return await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
  }, src);
  saveDataUrl(await toDataUrl(before), 'velvet-salon-room-before.png');
  saveDataUrl(await toDataUrl(after), 'velvet-salon-room-after.png');
}

await browser.close();
```

- [ ] **Step 3: Run the free pass**

Start the dev server if needed (`npm run dev` in the background; note the port and set `APP_URL`). Then:

```bash
APP_URL=http://localhost:3000 node scripts/capture-samples.mjs
```
Expected: `wrote velvet-salon-preview.png`. Open the PNG (Read tool) and confirm it shows the velvet and houndstooth curtain, not a blank canvas.

- [ ] **Step 4: Run the AI pass and stop for the user's review**

```bash
APP_URL=http://localhost:3000 node scripts/capture-samples.mjs --ai
```
Expected: three more PNGs. Open all three. Report to the user with the images (SendUserFile) and ask whether the photoreal quality is acceptable. Do not change the seed until they answer.

- [ ] **Step 5: Wire the accepted images**

If accepted, in `src/lib/brandStore.ts` `INITIAL_DESIGNS[0]` set `final_image_url: '/designs/velvet-salon-photoreal.png'`, `render_kind: 'photoreal'`, and:

```ts
    room_previews: [
      {
        id: 'room-prev-01',
        design_id: 'design-velvet-salon-01',
        brand_id: 'brand-aatmi-01',
        room_source: 'template_original',
        room_photo_url: '/designs/velvet-salon-room-before.png',
        output_url: '/designs/velvet-salon-room-after.png',
        provider_used: 'nano_banana_pro',
        created_at: '2026-03-08T15:00:00Z',
      },
    ],
```

If not accepted, keep the preview seed and delete the three AI PNGs.

- [ ] **Step 6: Commit**

```bash
npm run lint && npm run build
git add scripts/browser.mjs scripts/capture-samples.mjs public/designs src/lib/brandStore.ts
git commit -m "feat(samples): generate seed design images from the app itself"
```

---

### Task 13: Screenshot and journey verification scripts

**Files:**
- Create: `scripts/screenshots.mjs`, `scripts/journey-check.mjs`
- Modify: `package.json` scripts (`"shots": "node scripts/screenshots.mjs"`, `"journey": "node scripts/journey-check.mjs"`)

- [ ] **Step 1: Screenshot script**

```js
// scripts/screenshots.mjs
// Captures every screen at desktop and phone width into scripts/out/.
import fs from 'node:fs';
import path from 'node:path';
import { launch, APP_URL } from './browser.mjs';

const OUT = path.resolve('scripts/out');
fs.mkdirSync(OUT, { recursive: true });
const browser = await launch();

for (const [tag, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 400, height: 860 }]]) {
  const page = await browser.newPage({ viewport });
  page.on('pageerror', (e) => console.log(tag, 'PAGEERROR', e.message));
  const shot = async (name) => { await page.waitForTimeout(1200); await page.screenshot({ path: path.join(OUT, `${tag}-${name}.png`), fullPage: true }); };
  const nav = async (label) => {
    if (viewport.width < 1024) await page.getByRole('button', { name: /Open menu/ }).click();
    await page.getByRole('button', { name: label, exact: true }).first().click();
  };

  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await shot('01-home');
  await nav('Library'); await shot('02-library-styles');
  await page.getByRole('button', { name: 'Fabrics', exact: true }).click(); await shot('03-library-fabrics');
  await nav('Studio'); await page.waitForTimeout(2000); await shot('04-studio');
  await nav('Designs'); await shot('05-design');
  await page.getByRole('button', { name: 'Account menu' }).click();
  if (await page.getByRole('button', { name: 'Settings', exact: true }).count()) { await page.getByRole('button', { name: 'Settings', exact: true }).click(); await shot('06-settings'); }
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('button', { name: /Sign out/ }).click(); await shot('07-signin');
  await page.close();
}
await browser.close();
console.log('screenshots in', OUT);
```

Add `scripts/out/` to `.gitignore`.

- [ ] **Step 2: Journey check script**

```js
// scripts/journey-check.mjs
// Clicks through the whole journey and asserts each step; exits 1 on failure.
import { launch, APP_URL } from './browser.mjs';

const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exitCode = 1; throw new Error(msg); } console.log('ok:', msg); };

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

try {
  await page.goto(APP_URL, { waitUntil: 'networkidle' });

  // Home -> style picker -> studio
  await page.getByRole('button', { name: /Start a new design/ }).click();
  await page.getByRole('dialog', { name: 'Choose a curtain style' }).waitFor();
  await page.getByRole('button', { name: /Camel & Midnight/ }).first().click();
  await page.waitForSelector('canvas');
  assert(await page.getByText('Curtain style').count() > 0, 'studio opened from the style picker');

  // Zones rail syncs with the fabric panel title
  const zoneButtons = page.locator('aside button[aria-pressed]');
  const zoneCount = await zoneButtons.count();
  assert(zoneCount === 2, `Camel & Midnight has 2 zones (got ${zoneCount})`);
  await zoneButtons.nth(1).click();
  const panelTitle = await page.locator('h3', { hasText: 'Gathered body' }).count();
  assert(panelTitle > 0, 'fabric panel shows the clicked zone');

  // Assign a fabric from the panel
  await page.locator('[title="Use Emerald Royale Velvet"]').first().click();
  await page.waitForTimeout(500);
  assert(await page.getByText('Emerald Royale Velvet').count() > 0, 'zone row shows the chosen fabric');

  // Library apply targets the chosen zone (the former bug)
  await page.getByRole('button', { name: 'Library', exact: true }).click();
  await page.getByRole('button', { name: 'Fabrics', exact: true }).click();
  const card = page.locator('[role="button"]', { hasText: 'Blush Rose Silk Dupioni' }).first();
  await card.hover();
  await card.getByRole('button', { name: /Apply to zone/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: /Pleated header/ }).click();
  assert(await page.getByText(/Applied Blush Rose Silk Dupioni to Pleated header/).count() > 0, 'library apply confirms the chosen zone');
  await page.getByRole('button', { name: 'Studio', exact: true }).click();
  await page.waitForTimeout(800);
  const headerRow = page.locator('aside button[aria-pressed]', { hasText: 'Pleated header' });
  assert((await headerRow.innerText()).includes('Blush Rose Silk Dupioni'), 'studio shows the library assignment on the right zone');

  // Save -> design page at Render
  await page.getByRole('button', { name: /Save design/ }).click();
  await page.getByRole('button', { name: /Save and continue/ }).click();
  await page.waitForSelector('#design-render');
  assert(await page.getByText('Live preview').count() > 0, 'design page shows the preview render');
  const current = await page.locator('.journey-step.is-current').innerText();
  assert(current.includes('Render'), `journey current step is Render (got ${current})`);

  // Room confirm panel appears before any staging
  await page.getByRole('button', { name: /Use the style's original room/ }).click();
  assert(await page.getByRole('dialog', { name: 'Confirm room photo' }).count() === 1, 'confirm panel shown before staging');
  await page.getByRole('button', { name: 'Close' }).last().click();

  // Share section present
  assert(await page.locator('#design-share').count() === 1, 'share section present');
  console.log('JOURNEY OK');
} finally {
  await browser.close();
}
```

- [ ] **Step 3: Run both**

```bash
APP_URL=http://localhost:3000 npm run journey
APP_URL=http://localhost:3000 npm run shots
```
Expected: `JOURNEY OK`; 14 PNGs in `scripts/out/`. Open every PNG with the Read tool and check: four nav items; the strip is visible on Studio and Design; no "Stencil", "Region", "Template", "Catalog", "Swatch", "Spec" wording anywhere; phone Studio shows chips above the image; no page scrolls horizontally.

Then grep the live UI copy for banned words and fix any hits:

```bash
grep -rn -i "stencil\|swatch\|textile\|silhouette" src/components/brand src/pages src/components/JourneyStrip.tsx src/components/NewTemplateModal.tsx | grep -v "StencilPresetDef\|BUILT_IN_STENCILS\|stencil_type\|stencil_preset\|import\|//"
```
Expected: no user-facing string hits (identifiers are fine).

- [ ] **Step 4: Commit**

```bash
git add scripts package.json .gitignore
git commit -m "test: add screenshot and journey click-through scripts"
```

---

## Self-review checklist (run after Task 13)

- Every spec section maps to a task: §1 → Tasks 4, 8; §2 → 5; §3 → 9; §4 → 7; §5 → 10; §6 → 11; §7 → 8; §8 → 12; §9 → 2, 3, 7; verification → 13.
- `npm test`, `npm run lint`, `npm run build`, `npm run journey` all pass.
- README section 6 "Core Application Features" access points still name old pages ("Room Viz Studio Tab", "Left Sidebar"); update that table's Access Point column to the new names (Studio, Library › Fabrics, Designs › Room, Designs › Share) in a final `docs:` commit.
