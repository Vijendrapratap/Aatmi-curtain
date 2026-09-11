# Aatmi Curtain Visualizer Setup & Implementation Plan

## Goal
Establish a high-fidelity multi-zone curtain visualizer aligning the repository codebase with `Curtain_Design_App_Implementation_Guide.docx`, supporting real-time 2D pleat rendering, on-demand generative AI multi-region inpainting, and freehand raster masking for custom curtain templates.

## Tasks
- [x] Task 1: Clone repository to `/home/pratap/work/Aatmi-curtain` and configure Git identity -> Verify: `git config user.name` is "Vijendrapratap"
- [x] Task 2: Install dependencies, verify TypeScript types, and test production Vite build -> Verify: `npm run lint` and `npm run build` exit code 0
- [x] Task 3: Establish `.gitignore` and `.env.example` configurations -> Verify: files present, secrets and node_modules untracked
- [x] Task 4: Integrate freehand raster brush & eraser tool into `NewTemplateModal.tsx` for organic drape masking alongside polygon snapping -> Verify: FreehandMaskCanvas allows painting and erasing binary masks on custom uploaded curtains
- [x] Task 5: Enhance sequential AI multi-region synthesis flow with real-time canvas preview fallback and progress notifications -> Verify: UI offers instant 2D preview + on-demand "Synthesize Photoreal AI Drapes" button
- [x] Task 6: Validate and align Supabase/database data models for templates, zones, and fabric swatches with Section 4 of implementation guide -> Verify: `lib/supabase-schema.sql` and `types/curtain.ts` match spec
- [x] Task 7: Run end-to-end verification and code health checks -> Verify: `npm run lint`, `npm run build`, and test server startup with `/api/health`

## Done When
- [x] Visualizer codebase builds and runs cleanly with documented environment variables
- [x] Freehand raster brush/eraser masking is available for custom curtain templates
- [x] On-demand generative AI pipeline preserves drape folds with feathered edge blending

## Notes
- Aligns with Section 9 of Implementation Guide: Real-time 2D canvas is primary; AI inpainting runs sequentially with feathered masks to prevent edge seams.
- Includes dynamic toggle between "Organic Brush & Eraser" and "Polygon Snapping" during template creation.
