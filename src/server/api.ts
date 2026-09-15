import express from 'express';
import { GoogleGenAI } from '@google/genai';

export const apiApp = express();

apiApp.use(express.json({ limit: '50mb' }));
apiApp.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialization of GoogleGenAI
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

import { getRegionEditProvider, getRoomPreviewProvider } from './providers';
import { callOpenRouterVision, testOpenRouterConnection, getEffectiveOpenRouterKey, OPENROUTER_RECOMMENDED_MODELS } from './openrouter';
import { parseBase64Image } from './images';
import { createRenderRouter } from './renderAgent/routes';
import { getDb } from './db';
import { attachUser, syncAdminFromEnv, requireUser } from './auth';
import { IMAGES_DIR } from './imageStore';
import { createAuthRouter, createAdminRouter, createDataRouter, createModelConfigRouter } from './accountRoutes';

// Accounts: one SQLite file under DATA_DIR; the first admin comes from ADMIN_EMAIL / ADMIN_PASSWORD.
const db = getDb();
const adminSync = syncAdminFromEnv(db);
if (adminSync.action !== 'skipped') console.log(`[accounts] admin ${adminSync.email}: ${adminSync.action} from ADMIN_EMAIL / ADMIN_PASSWORD`);
else console.warn('[accounts] ADMIN_EMAIL / ADMIN_PASSWORD not set; no admin can sign in until they are');
apiApp.use(attachUser(db));
// Design photos are only for signed-in users; <img> and fetch send the session cookie same-origin.
apiApp.use('/images', requireUser, express.static(IMAGES_DIR, { maxAge: '365d', immutable: true }));
apiApp.use('/api/auth', createAuthRouter(db));
apiApp.use('/api/admin', createAdminRouter(db, { appUrl: () => process.env.APP_URL || '' }));
apiApp.use('/api/data', createDataRouter(db));
apiApp.use('/api/render', requireUser, createRenderRouter());
apiApp.use('/api/model-config', createModelConfigRouter());

/**
 * Health & Capabilities Endpoint
 */
apiApp.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY);
  res.json({
    status: 'ok',
    brand: 'Aatmi Brand Platform',
    hasApiKey: hasGeminiKey || hasOpenRouterKey,
    hasOpenRouterKey,
    hasGeminiKey,
    features: [
      'multi_tenant_isolation',
      'brand_onboarding',
      'model_switching_provider_abstraction',
      'openrouter_unified_gateway',
      'flux_kontext_adapter',
      'nano_banana_pro_room_preview',
      'bulk_fabric_upload',
    ],
  });
});

/**
 * Test Provider Endpoint
 */
apiApp.post('/api/test-provider', requireUser, async (req, res) => {
  const { provider, apiKey, type = 'region_edit' } = req.body;
  try {
    if (provider === 'openrouter' || provider === 'openrouter_unified') {
      const result = await testOpenRouterConnection(apiKey);
      return res.json(result);
    }
    const adapter =
      type === 'room_preview'
        ? getRoomPreviewProvider(provider || 'openrouter_unified')
        : getRegionEditProvider(provider || 'openrouter_unified');
    const result = await adapter.testConnection(apiKey);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, latencyMs: 0, message: err.message || 'Connection test failed' });
  }
});

/**
 * Endpoint: Analyze a Curtain Image and detect replaceable fabric regions (VLM)
 * Implements Section 6.1 of the specification.
 */
apiApp.post('/api/analyze-curtain', requireUser, async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    // Clean base64 data if it has data URL prefix
    const parsedImg = parseBase64Image(imageBase64);
    if (!parsedImg) {
      return res.status(400).json({ error: 'imageBase64 must be a valid base64 encoded raster image (JPEG/PNG/WEBP)' });
    }

    const prompt = `Analyze this curtain drapery photograph with extreme architectural precision.
Identify every distinct fabric region and design zone that can receive a custom fabric, stencil, or trim (main drape panels, vertical borders, horizontal accent bands, ribbon trims, pleated headers, valance, bottom hems, etc.).

CRITICAL ACCURACY RULES:
1. FULL COVERAGE & TOPOLOGICAL ORDER: Order regions hierarchically from largest panels (order: 1) to smaller accent bands (order: 2-3) and fine borders/hems (order: 4-5).
2. BOUNDING BOX & POLYGON: For each region, provide both a normalized bounding box { "x": number, "y": number, "width": number, "height": number } (0-100%) and ordered clockwise perimeter polygon coordinates { "x": number, "y": number } from 0 to 100.
3. SEAMLESS SNAPPING: Boundaries of adjacent regions must snap tightly together with zero gaps between them.
4. DETAIL GRANULARITY: Identify 2 to 6 distinct regions covering 100% of the curtain fabric surface.
5. FLAGS: Mark multi_component: true if a zone repeats symmetrically (e.g. left & right panels, or matching flank borders). Mark replaceable: true for curtain fabric, and false for rigid hardware/rods.

For each region return:
- name: snake_case identifier (e.g. "main_drape_panel", "horizontal_accent_band", "leading_edge_border", "bottom_weighted_hem")
- display_name: clear title (e.g. "Main Drapery Panel", "Inset Accent Band", "Leading Edge Border", "Weighted Bottom Hem")
- description: visual description of the weave, fold structure, and position
- location: position description (e.g. "Central drape 15% to 85% width", "Lower 12% height")
- order: integer (1 for primary drapes, 2 for side borders, 3 for accent bands, 4 for hems/trims)
- multi_component: boolean
- replaceable: boolean
- bbox: { "x": number, "y": number, "width": number, "height": number }
- polygon_coords: array of 4 to 8 ordered clockwise points [{ "x": number, "y": number }] from 0 to 100
- suggested_sam_prompt: precise visual segmentation prompt

Output ONLY a valid JSON array of these region objects. Do not include markdown or explanations.`;

    // 1. Primary Route: OpenRouter Unified Vision (Single API Key)
    const openRouterKey = getEffectiveOpenRouterKey();
    if (openRouterKey) {
      try {
        const rawText = await callOpenRouterVision({
          imageBase64,
          prompt,
          model: OPENROUTER_RECOMMENDED_MODELS.vision,
          apiKey: openRouterKey,
          mimeType,
        });
        const cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        let regions = Array.isArray(parsed) ? parsed : (parsed.regions || []);
        regions.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        return res.json({ regions, source: 'openrouter_gemini_vlm' });
      } catch (orErr) {
        console.warn('OpenRouter vision call failed, falling back to direct Gemini SDK:', orErr);
      }
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Return smart fallback regions based on typical curtain architecture
      return res.json({
        regions: [
          {
            name: 'main_panel',
            display_name: 'Main Drapery Panel',
            description: 'Large vertical central drape with natural gravity folds',
            location: 'Full height central area',
            suggested_sam_prompt: 'central curtain fabric body with vertical pinch pleats',
            polygon_coords: [
              { x: 15, y: 5 }, { x: 85, y: 5 }, { x: 85, y: 78 }, { x: 15, y: 78 }
            ]
          },
          {
            name: 'decorative_band',
            display_name: 'Horizontal Accent Band',
            description: 'Mid-height decorative accent section',
            location: 'Horizontal stripe across drapery',
            suggested_sam_prompt: 'horizontal textured accent stripe across curtain',
            polygon_coords: [
              { x: 15, y: 78 }, { x: 85, y: 78 }, { x: 85, y: 88 }, { x: 15, y: 88 }
            ]
          },
          {
            name: 'bottom_hem',
            display_name: 'Bottom Hem Border',
            description: 'Weighted floor hem border',
            location: 'Bottom base of the curtain',
            suggested_sam_prompt: 'bottom hem border band of curtain',
            polygon_coords: [
              { x: 15, y: 88 }, { x: 85, y: 88 }, { x: 85, y: 98 }, { x: 15, y: 98 }
            ]
          }
        ],
        source: 'default_geometry'
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: parsedImg.base64,
              mimeType: parsedImg.mimeType || mimeType || 'image/jpeg',
            },
          },
          { text: prompt },
        ],
      },
    });

    let rawText = response.text || '[]';
    // Clean out any markdown wrappers like ```json ... ```
    rawText = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(rawText);
      let regions = Array.isArray(parsed) ? parsed : (parsed.regions || []);
      // Ensure sorted by order
      regions.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      return res.json({ regions, source: 'gemini_vlm' });
    } catch (parseErr) {
      console.warn('VLM JSON parse failed, returning fallback regions', rawText);
      return res.json({
        regions: [
          {
            name: 'main_panel',
            display_name: 'Main Curtain Panel',
            description: 'Central body of curtain drapery with vertical pleats',
            location: 'Central 70%',
            order: 1,
            multi_component: false,
            replaceable: true,
            suggested_sam_prompt: 'main drapery panel with vertical folds',
            bbox: { x: 10, y: 5, width: 80, height: 75 },
            polygon_coords: [
              { x: 10, y: 5 }, { x: 90, y: 5 }, { x: 90, y: 80 }, { x: 10, y: 80 }
            ]
          },
          {
            name: 'bottom_hem',
            display_name: 'Bottom Border',
            description: 'Lower architectural hem border',
            location: 'Lower 20%',
            order: 2,
            multi_component: false,
            replaceable: true,
            suggested_sam_prompt: 'bottom hem border',
            bbox: { x: 10, y: 80, width: 80, height: 18 },
            polygon_coords: [
              { x: 10, y: 80 }, { x: 90, y: 80 }, { x: 90, y: 98 }, { x: 10, y: 98 }
            ]
          }
        ],
        source: 'fallback'
      });
    }
  } catch (error: any) {
    console.error('Error in /api/analyze-curtain:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze curtain' });
  }
});
