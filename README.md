# Aatmi Couture Drapery AI

> **Next-Generation Multi-Region Architectural Drapery Visualizer & Textile Specification Platform**

---

## 1. Executive Summary & Objective

In high-end interior architecture and bespoke drapery design, communicating how a custom fabric will drape, reflect natural light, and coordinate across multiple panels has traditionally been one of the highest-friction bottlenecks in the industry.

Clients struggle to visualize how a small 4"x4" fabric swatch translates into floor-to-ceiling 10-foot curtains with deep tailored pleats. Interior designers often spend days waiting for physical showroom memos, manual Photoshop mockups, or expensive 3D renderings that fail to represent real fabric weight.

**Aatmi Couture Drapery AI** transforms this process into a real-time, interactive, and photorealistic design experience. It treats the curtain not merely as an image, but as an architectural system composed of functional fabric zones (main body, leading edge border, weighted hem, headers, and flanking columns) rendered under calibrated environmental lighting.

---

## 2. The Dual Perspective: Designer & Brand Owner

### For the Interior Designer & Architect
- **Zero Ambiguity with Luxury Clients:** Place real, high-resolution textile swatches directly into tailored curtain templates with continuous pleats and real-time shadow depth.
- **Accurate Yardage & Cut Specifications:** Select drapery fullness ratios (**2.0x Casual**, **2.5x Tailored Luxury**, or **3.0x Ultra-Opulent**) and generate immediate fabric cut lengths, bolt width requirements (54"), and estimated yardage dockets.
- **40x Macro Optical Loupe:** Inspect microscopic warp and weft weave textures, slub linen characteristics, jacquard relief, and silk sheen without needing physical fabric in hand.
- **Client Presentation Mode:** Enter a distraction-free, branded presentation view with architectural room backdrops (Haussmannian Parisian Salon, Tribeca Penthouse, Belgravia Townhouse, Tuscan Villa).
- **Environmental Lighting Simulation:** Verify how the fabric looks during Morning Daylight (5500K Crisp), Golden Hour (2800K Warm Sunset), and Evening Luxe (3000K Chandelier Ambient).

### For the Textile Brand Owner & Showroom
- **Accelerate Sample-to-Sale Conversion:** Eliminate the weeks-long sample ordering cycle; allow designers and clients to visualize hundreds of SKU combinations instantaneously.
- **Custom Fabric Swatch Ingestion:** Designers and clients can snap or upload their own custom fabric photos or swatch files, which are immediately mapped onto all curtain zones.
- **Interactive Stencil Creation:** Convert any showroom photograph or architectural CAD stencil into an interactive multi-region template using AI boundary detection.
- **Durable Trade Specifications:** Export printable, client-ready PDF dockets with designer credentials, style codes, heading pleat options, and yardage allocations.

---

## 3. Core Technical Architecture & Rendering Engine

```
[ User Input / Swatch Upload ]
              │
              ▼
[ Client-Side Rasterizer ] ──► RFC 4648 PNG / Base64 Conversion
              │
              ├──► [ Interactive 2D Fabric Canvas Engine ]
              │       ├─ Multi-Region Stencil Masking
              │       ├─ Continuous Pleat Shading Heuristic
              │       └─ Dynamic Room Lighting Filter Overlay
              │
              └──► [ Gemini AI Generative Model ]
                      ├─ High-Resolution Photorealistic Synthesis
                      ├─ Micro-Embroidery & Slub Depth
                      └─ Ambient Window Daylight Falloff
```

### 1. Multi-Zone Geometric Stencil Matrix
Every curtain style is defined as a structured template featuring coordinate-mapped polygon regions:
- **Style AT-101 (Classic Pinch Pleat with Tailored Border):** Main Body Panels, Left/Right Leading Edge Borders, Weighted Bottom Hem.
- **Style AT-102 (Modern Ripplefold Sheer & Blackout Flanks):** Center Diffusing Voile Panels with Outer Flanking Columns.
- **Style AT-103 (Grand Continental Box Pleat with Valance):** Crown Valance Pelmet, Main Body Drops, and Contrast Side Banding.

### 2. High-Fidelity Canvas Shading Engine (`src/utils/fabricRenderer.ts`)
- **Panel-Based Continuous Shading:** Instead of isolated shading that creates artificial seams between adjacent regions, regions belonging to the same vertical panel receive unified sinusoidal vertical pleat shading.
- **Directional Light Simulation:** Highlights and deep trough shadows simulate 3D fabric folds hanging under gravitational tension.
- **Client-Side Swatch Rasterization:** Automatically converts vector SVG patterns and user uploads into high-performance bitmap textures for smooth canvas manipulation.

### 3. Gemini AI Photorealistic Synthesis
- Generates museum-grade photographic renders incorporating real-world environmental reflections, subtle floor pooling, and delicate fabric sheen.
- Built-in fallback to the interactive canvas engine ensures the user experience is always fluid, responsive, and uninterrupted.

### 4. 40x Tactile Weave Loupe (`src/components/TactileLoupeModal.tsx`)
- Interactive circular magnifying glass displaying fabric fiber weave, yarn gauge, thread count density, and lighting response under simulated studio lighting.

---

## 4. Key Application Features & Navigation

| Feature | Description | Access Point |
| :--- | :--- | :--- |
| **Zone Assignment Panel** | Assign fabrics from the curated couture catalog or upload custom samples. Fine-tune pattern repeat scale and rotation. | Left Sidebar / Mobile Tab |
| **Room Lighting Controls** | Toggle between **Crisp Daylight (5500K)**, **Golden Hour (2800K)**, and **Evening Luxe (3000K)**. | Top Dock / Canvas Bar |
| **Architectural Setting** | Select Parisian Haussmann, Tribeca Penthouse, Belgravia Townhouse, or Tuscan Villa backdrops. | Room Setting Selector |
| **Presentation Mode** | Clean, watermark-styled presentation view designed for client meetings and reviews. | Presentation Mode Button |
| **Tactile Loupe (40x)** | Macro fiber inspection tool for warp/weft density, composition, and slub texture. | "Inspect Weave" Buttons |
| **Spec Sheet & Yardage** | Dynamic yardage calculations based on 2.0x, 2.5x, and 3.0x pleat fullness. Print or copy dockets. | "Spec Sheet" in Header |
| **Onboarding Tour** | Guided step-by-step walkthrough explaining the workflow for designers and clients. | "How It Works" in Header |
| **Persona & Auth Modal** | Switch between Lead Designer, Luxury Client, or Showroom Partner profiles. | User Avatar / "Sign In" |

---

## 5. Technology Stack

- **Framework:** React 18+ with TypeScript & Vite
- **Styling:** Tailwind CSS with custom high-contrast typography and sophisticated neutral palettes
- **Icons:** Lucide React
- **Graphics & Rendering:** HTML5 Canvas 2D API, Offscreen Rasterization, SVG Pattern Engines
- **AI Integration:** Google GenAI TypeScript SDK (Gemini multimodal synthesis)
- **State Management:** Reactive React hooks with `localStorage` user profile persistence

---

## 6. How to Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

*Crafted for luxury interior ateliers, high-end textile houses, and discerning architectural designers.*
