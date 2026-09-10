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

/**
 * Helper to safely extract clean base64 data and mimeType from data URIs.
 * Returns null if the string is not a valid raster base64 image (rejects SVGs, malformed URIs, etc.).
 */
function parseBase64Image(dataUri: string | undefined): { mimeType: string; base64: string } | null {
  if (!dataUri || typeof dataUri !== 'string') return null;
  // Match standard base64 data URLs: data:image/(png|jpeg|jpg|webp);base64,XXXX
  const match = dataUri.match(/^data:(image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+[\r\n]*)$/i);
  if (match) {
    const rawMime = match[1].toLowerCase();
    const mime = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime;
    return { mimeType: mime, base64: match[3].replace(/\s+/g, '') };
  }
  // Check if it's already a raw base64 string without prefix
  const cleaned = dataUri.replace(/\s+/g, '');
  if (/^[A-Za-z0-9+/=]+$/.test(cleaned) && cleaned.length > 200) {
    return { mimeType: 'image/jpeg', base64: cleaned };
  }
  return null;
}

/**
 * Health & Capabilities Endpoint
 */
apiApp.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    brand: 'Aatmi',
    hasApiKey: hasKey,
    features: ['vlm_region_detection', 'ai_fabric_redesign', 'custom_template_creation'],
  });
});

/**
 * Endpoint: Analyze a Curtain Image and detect replaceable fabric regions (VLM)
 * Implements Section 6.1 of the specification.
 */
apiApp.post('/api/analyze-curtain', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
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

    // Clean base64 data if it has data URL prefix
    const parsedImg = parseBase64Image(imageBase64);
    if (!parsedImg) {
      return res.status(400).json({ error: 'imageBase64 must be a valid base64 encoded raster image (JPEG/PNG/WEBP)' });
    }

    const prompt = `Analyze this curtain drapery photograph with extreme precision.
Identify every distinct fabric region and design zone that can receive a custom fabric, stencil, or trim (main drape panels, vertical borders, horizontal accent bands, ribbon trims, pleated headers, valance, bottom hems, etc.).

CRITICAL ACCURACY RULES:
1. FULL TRACKING COVERAGE: Do NOT miss or skip small sections, narrow ribbon trims, accent borders, or lower skirts. Every single portion of the curtain drapery must be captured.
2. SEAMLESS SNAPPING: Boundaries of adjacent regions must snap tightly together with zero gaps between them.
3. POLYGON INTEGRITY: Return ordered clockwise perimeter coordinates { "x": number, "y": number } as percentages from 0 to 100. The coordinates must form a clean, non-self-intersecting polygon.
4. DETAIL GRANULARITY: Identify 2 to 6 distinct regions covering 100% of the curtain fabric surface.

For each region return:
- name: snake_case identifier (e.g. "left_main_panel", "horizontal_accent_band", "upper_ribbon_trim", "lower_ribbon_trim", "lower_skirt")
- display_name: clear title (e.g. "Left Chevron Panel", "Inset Accent Band", "Upper Gold Ribbon Trim", "Lower Skirt")
- description: visual description of the weave, fold structure, and position
- location: position description (e.g. "Left panel 5% to 47% width", "Mid band 25% to 35% height")
- suggested_sam_prompt: precise visual prompt for segmentation
- polygon_coords: array of 4 to 8 ordered clockwise points [{ "x": number, "y": number }] from 0 to 100

Output ONLY a valid JSON array of these region objects. Do not include markdown or explanations.`;

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
      const regions = Array.isArray(parsed) ? parsed : (parsed.regions || []);
      return res.json({ regions, source: 'gemini_vlm' });
    } catch (parseErr) {
      console.warn('VLM JSON parse failed, returning fallback regions', rawText);
      return res.json({
        regions: [
          {
            name: 'main_panel',
            display_name: 'Main Curtain Panel',
            description: 'Central body of curtain drapery',
            location: 'Central 70%',
            suggested_sam_prompt: 'main drapery panel with vertical folds',
            polygon_coords: [
              { x: 10, y: 5 }, { x: 90, y: 5 }, { x: 90, y: 80 }, { x: 10, y: 80 }
            ]
          },
          {
            name: 'bottom_hem',
            display_name: 'Bottom Border',
            description: 'Lower architectural hem border',
            location: 'Lower 20%',
            suggested_sam_prompt: 'bottom hem border',
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

/**
 * Endpoint: Generate realistic curtain with applied fabrics using Gemini Generative AI
 * Implements Section 6.2 & 6.3 of the specification.
 */
apiApp.post('/api/generate-curtain-fabric', async (req, res) => {
  try {
    const {
      templateName,
      templateImage,
      assignments, // Array of { regionName, regionDisplayName, fabricName, fabricWeave, fabricImageBase64 }
      customInstructions = '',
    } = req.body;

    if (!templateImage) {
      return res.status(400).json({ error: 'templateImage is required' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please add your key in Settings > Secrets.',
      });
    }

    const curtainImg = parseBase64Image(templateImage);
    if (!curtainImg) {
      return res.status(400).json({
        error: 'templateImage must be a valid base64 encoded raster image (PNG, JPEG, or WEBP).',
      });
    }

    // Construct region description string from assignments
    const fabricDescriptions = (assignments || [])
      .map((a: any) => `Zone "${a.regionDisplayName || a.regionName}" draped with "${a.fabricName}" fabric (${a.fabricWeave || 'luxury weave'}, ${a.fabricCategory || 'interior drapery'})`)
      .join(', and ');

    const positivePrompt = `Professional photorealistic catalog product photography of a hanging luxury drapery curtain from brand Aatmi, style "${templateName}".
Natural soft columnar folds and realistic gravity draping with authentic pleat shadows.
Fabric specification: ${fabricDescriptions}.
All zones must strictly preserve the deep pleats, vertical folds, shadows, highlights, and window daylight from the original curtain image.
Accurate lighting direction and ambient interior room shadows.
Sharp focus, 8k architectural interior design detail, tactile weave texture.`;

    const negativePrompt = `flat texture, plastic look, distorted folds, mismatched lighting, visible hard seams between regions, low resolution, blurry weave, warped geometry, cartoonish, oversaturated, floating fabric, incorrect perspective, extra windows, distorted background`;

    const parts: any[] = [
      {
        inlineData: {
          data: curtainImg.base64,
          mimeType: curtainImg.mimeType,
        },
      },
    ];

    // Add only validated raster swatch images as reference parts if provided
    if (Array.isArray(assignments)) {
      assignments.forEach((assignment: any) => {
        if (assignment.fabricImageBase64) {
          const swatch = parseBase64Image(assignment.fabricImageBase64);
          if (swatch) {
            parts.push({
              inlineData: {
                data: swatch.base64,
                mimeType: swatch.mimeType,
              },
            });
          }
        }
      });
    }

    parts.push({
      text: `${positivePrompt}\n\nAvoid: ${negativePrompt}\n${customInstructions ? `Additional client styling note: ${customInstructions}` : ''}`,
    });

    // We use gemini-3.1-flash-lite-image or gemini-3.1-flash-image for image generation/editing
    let resultImageUrl: string | null = null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts,
        },
      });

      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            resultImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (genErr: any) {
      console.warn('Direct image gen failed, falling back to gemini-3.8-flash design descriptor:', genErr.message);
      const isPaidKeyError =
        genErr.message?.includes('paid') ||
        genErr.message?.includes('quota') ||
        genErr.message?.includes('RESOURCE_EXHAUSTED') ||
        genErr.status === 429;

      return res.status(422).json({
        error: genErr.message || 'Image generation model encountered an issue.',
        needsPaidKey: isPaidKeyError,
      });
    }

    if (!resultImageUrl) {
      return res.status(500).json({ error: 'No image was generated by the model.' });
    }

    return res.json({
      success: true,
      imageUrl: resultImageUrl,
      positivePrompt,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in /api/generate-curtain-fabric:', err);
    res.status(500).json({ error: err.message || 'Failed to generate curtain' });
  }
});
