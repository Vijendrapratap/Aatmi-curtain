# Graph Report - .  (2026-09-11)

## Corpus Check
- 103 files · ~321,420 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 320 nodes · 519 edges · 18 communities detected
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `AIProviderRegistry` - 15 edges
2. `generateMacroFabricTexture()` - 12 edges
3. `generateRealisticPlate()` - 8 edges
4. `drawPhotographicPleats()` - 8 edges
5. `StabilityProvider` - 7 edges
6. `ReplicateProvider` - 7 edges
7. `OpenAIProvider` - 7 edges
8. `GeminiProvider` - 7 edges
9. `OpenRouterProvider` - 7 edges
10. `OpenRouter Unified API Gateway` - 6 edges

## Surprising Connections (you probably didn't know these)
- `FLUX.1 Fill Pro Inpainting` --powers_inpainting--> `FluxKontextAdapter`  [EXTRACTED]
  README.md → src/server/providers.ts
- `Curtain Studio Layout Reference` --source_reference_for--> `Belgian Linen Embroidery Border Template`  [EXTRACTED]
  Design Templates/Screenshot 2026-09-09 134409.png → public/templates/tpl-linen-embroidery-border.png
- `Pinch Pleat Zone Mask Reference` --source_reference_for--> `Midnight Velvet Houndstooth Template`  [EXTRACTED]
  Design Templates/Screenshot 2026-09-09 134239.png → public/templates/tpl-velvet-houndstooth.png
- `Header & Border Reference` --source_reference_for--> `Ivory Gold Border Tailored Template`  [EXTRACTED]
  Design Templates/Screenshot 2026-09-09 134144.png → public/templates/tpl-ivory-gold-border.png
- `Colorblock Zone Reference` --source_reference_for--> `Modern Colorblock Navy Camel Template`  [EXTRACTED]
  Design Templates/Screenshot 2026-09-09 134257.png → public/templates/tpl-colorblock-navy-camel.png

## Communities

### Community 0 - "Camera Capture & Fabric Catalog Assets"
Cohesion: 0.09
Nodes (33): Botanical Skeleton Leaf Voile, Bold Graphic Noir Chevron, Artisan Herringbone Chevron Twill, Art Nouveau Scrolled Damask, Quilted Trellis Diamond Lattice, Aatmi Tribal Diamond Embroidered Linen, Heritage French Floral Embroidered Linen, Geometric Argyle Diamond Jacquard (+25 more)

### Community 1 - "Brand Management & Studio State"
Cohesion: 0.07
Nodes (8): deriveAccentPalette(), getRelativeLuminance(), parseHexColor(), validateAccentContrast(), Aatmi Couture Drapery AI, Dual Synthesis Pipeline, Multi-Tenant Brand Platform, Real-Room Architectural Staging

### Community 2 - "Curtain Canvas & Interactive Rendering"
Cohesion: 0.08
Nodes (18): handleGlobalMove(), onMouseMove(), onTouchMove(), getCanvasCoords(), handlePointerDown(), handlePointerMove(), Camel Black Duo Panel Template, Modern Colorblock Navy Camel Template (+10 more)

### Community 3 - "AI Provider Adapters & Inpainting Routing"
Cohesion: 0.08
Nodes (12): cleanBase64(), FluxKontextAdapter, GptImage2Adapter, NanoBananaProAdapter, OpenRouterUnifiedAdapter, QwenImageEditAdapter, SeedreamEditAdapter, FLUX.1 Fill Pro Inpainting (+4 more)

### Community 4 - "Catalog Library & Bulk Upload"
Cohesion: 0.07
Nodes (1): Printable Spec Sheet & Yardage Docket

### Community 5 - "Provider Settings & Gemini Client"
Cohesion: 0.1
Nodes (7): handleActivateProvider(), handleSelectProvider(), GeminiProvider, compositeRegionOntoCanvas(), executeSequentialInpainting(), generateRegionMask(), loadImage()

### Community 6 - "Photorealistic Photo Plate Synthesis"
Cohesion: 0.33
Nodes (15): drawBoucleNoise(), drawBrassRod(), drawGreekKeyUnit(), drawHardwoodFloor(), drawHoundstoothPattern(), drawPersianTapestryRibbon(), drawPhotographicPleats(), generateRealisticPlate() (+7 more)

### Community 7 - "AI Provider Registry & Key Management"
Cohesion: 0.18
Nodes (1): AIProviderRegistry

### Community 8 - "Server API & OpenRouter Gateway"
Cohesion: 0.22
Nodes (6): callOpenRouterInpaint(), callOpenRouterRoomViz(), callOpenRouterVision(), ensureDataUri(), getEffectiveOpenRouterKey(), testOpenRouterConnection()

### Community 9 - "Macro Fabric Textures & Weave Engine"
Cohesion: 0.29
Nodes (12): generateMacroFabricTexture(), renderCamelCashmereMacro(), renderChevronJacquardMacro(), renderCreamBoucleMacro(), renderGenericWeaveMacro(), renderGreekKeyTrimMacro(), renderHoundstoothMacro(), renderMetallicGoldSatinMacro() (+4 more)

### Community 10 - "OpenAI Multi-Modal Provider"
Cohesion: 0.29
Nodes (1): OpenAIProvider

### Community 11 - "Stability Generative Provider"
Cohesion: 0.29
Nodes (1): StabilityProvider

### Community 12 - "Replicate Model Provider"
Cohesion: 0.29
Nodes (1): ReplicateProvider

### Community 13 - "OpenRouter Unified Provider"
Cohesion: 0.29
Nodes (1): OpenRouterProvider

### Community 14 - "Feathered Masking & Inpainting Pipeline"
Cohesion: 0.67
Nodes (5): featheredComposite(), generateSequentialRedesign(), polygonMask(), tintRegion(), toCanvas()

### Community 15 - "Backend Server & Architecture Specs"
Cohesion: 0.33
Nodes (4): Freehand Raster Masking Tool, Sequential Generative Inpainting Pipeline, Supabase Multi-Zone & Swatch Schema, Visualizer Setup & Implementation Roadmap

### Community 16 - "Brand Studio Onboarding Stepper"
Cohesion: 0.67
Nodes (0): 

### Community 17 - "Interactive Onboarding Tour"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **4 isolated node(s):** `Gemini 3 Pro Image (Nano Banana Pro)`, `ByteDance Seedream 4.5`, `40x Tactile Optical Loupe`, `Printable Spec Sheet & Yardage Docket`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Interactive Onboarding Tour`** (2 nodes): `OnboardingTourModal.tsx`, `OnboardingTourModal()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AIProviderRegistry` connect `AI Provider Registry & Key Management` to `Provider Settings & Gemini Client`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `StabilityProvider` connect `Stability Generative Provider` to `Provider Settings & Gemini Client`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `ReplicateProvider` connect `Replicate Model Provider` to `Provider Settings & Gemini Client`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `Gemini 3 Pro Image (Nano Banana Pro)`, `ByteDance Seedream 4.5`, `40x Tactile Optical Loupe` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Camera Capture & Fabric Catalog Assets` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Brand Management & Studio State` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Curtain Canvas & Interactive Rendering` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._