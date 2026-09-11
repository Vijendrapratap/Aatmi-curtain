// src/server/openrouter.ts
/**
 * Unified OpenRouter Client
 * Provides a single API gateway for:
 * 1. Multimodal Vision Analysis (Curtain region segmentation, window detection, fabric analysis)
 * 2. Structure-Preserving Inpainting (FLUX.1 Fill Pro / Gemini 3.1 Flash Image)
 * 3. Real-Room Architectural Visualization (Nano Banana Pro / Seedream 4.5)
 *
 * Brands only need to supply ONE API Key: OPENROUTER_API_KEY
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export const OPENROUTER_RECOMMENDED_MODELS = {
  // Stage 1: Vision & Semantic Geometry Segmentation
  vision: 'google/gemini-2.5-flash',
  visionDeep: 'anthropic/claude-3.7-sonnet',
  visionOpen: 'qwen/qwen-2.5-vl-72b-instruct',

  // Stage 2: Structure-Preserving Fabric Inpainting
  inpaintingPro: 'black-forest-labs/flux-fill-pro',
  inpaintingFast: 'google/gemini-3.1-flash-image',
  inpaintingDev: 'black-forest-labs/flux-1-dev',

  // Stage 3: Architectural Room Visualization & Real-Photo Staging
  roomVizArchitectural: 'google/gemini-3-pro-image', // Nano Banana Pro
  roomVizHighRes: 'bytedance-seed/seedream-4.5',
  roomVizStandard: 'google/gemini-3.1-flash-image',
} as const;

/**
 * Resolves the effective OpenRouter API key.
 * Prioritizes brand BYO key (if supplied), falls back to server env OPENROUTER_API_KEY.
 */
export function getEffectiveOpenRouterKey(brandApiKey?: string | null): string | null {
  if (brandApiKey && brandApiKey.trim().length > 10) {
    return brandApiKey.trim();
  }
  return process.env.OPENROUTER_API_KEY || null;
}

/**
 * Normalizes base64 string to a valid data URI
 */
function ensureDataUri(imageStr: string, defaultMime = 'image/jpeg'): string {
  if (imageStr.startsWith('data:image/')) {
    return imageStr;
  }
  return `data:${defaultMime};base64,${imageStr}`;
}

/**
 * 1. Multimodal Vision Call via OpenRouter Chat Completions
 */
export async function callOpenRouterVision(options: {
  imageBase64: string;
  prompt: string;
  model?: string;
  apiKey?: string | null;
  mimeType?: string;
}): Promise<string> {
  const key = getEffectiveOpenRouterKey(options.apiKey);
  if (!key) {
    throw new Error('OPENROUTER_API_KEY is not configured. Please set your OpenRouter key.');
  }

  const model = options.model || OPENROUTER_RECOMMENDED_MODELS.vision;
  const imageDataUri = ensureDataUri(options.imageBase64, options.mimeType || 'image/jpeg');

  const payload = {
    model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: options.prompt },
          {
            type: 'image_url',
            image_url: {
              url: imageDataUri,
            },
          },
        ],
      },
    ],
    temperature: 0.1,
  };

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://aatmi.design',
      'X-Title': 'Aatmi Curtain Studio',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter Vision API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenRouter Vision returned an empty response');
  }

  return content;
}

/**
 * 2. Structure-Preserving Inpainting / Region Edit via OpenRouter
 */
export async function callOpenRouterInpaint(options: {
  baseImage: string;
  fabricImage: string;
  maskImage?: string;
  prompt: string;
  zoneName?: string;
  fabricName?: string;
  fabricWeave?: string;
  model?: string;
  apiKey?: string | null;
}): Promise<string> {
  const key = getEffectiveOpenRouterKey(options.apiKey);
  if (!key) {
    throw new Error('OPENROUTER_API_KEY is not configured for OpenRouter Inpaint.');
  }

  const model = options.model || OPENROUTER_RECOMMENDED_MODELS.inpaintingFast;
  const baseUri = ensureDataUri(options.baseImage);
  const fabricUri = ensureDataUri(options.fabricImage);

  // Method A: Dedicated /images generation endpoint if supported
  try {
    const imgPayload: any = {
      model,
      prompt: options.prompt,
      aspect_ratio: '4:5',
      input_references: [baseUri, fabricUri],
    };

    const imgResponse = await fetch(`${OPENROUTER_BASE_URL}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://aatmi.design',
        'X-Title': 'Aatmi Curtain Studio',
      },
      body: JSON.stringify(imgPayload),
    });

    if (imgResponse.ok) {
      const imgData = await imgResponse.json();
      if (imgData.data?.[0]?.b64_json) {
        return `data:image/png;base64,${imgData.data[0].b64_json}`;
      }
      if (imgData.data?.[0]?.url) {
        return imgData.data[0].url;
      }
    }
  } catch (imgEndpointErr) {
    console.warn('OpenRouter /images endpoint fallback to multimodal inpaint:', imgEndpointErr);
  }

  // Method B: Multimodal chat completion with image output format
  const chatPayload = {
    model,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `High-Precision Architectural Drapery Inpainting:
${options.prompt}
Target Zone: "${options.zoneName || 'Curtain Zone'}"
Target Textile: "${options.fabricName || 'Custom Textile'}" (${options.fabricWeave || 'woven'}).
Strict Directives:
1. Repaint ONLY the designated zone with the target fabric.
2. Preserve all authentic vertical pleat folds, lighting highlights, and shadow creases.
3. Keep all outer room pixels identical. Return the synthesized image candidate.`,
          },
          { type: 'image_url', image_url: { url: baseUri } },
          { type: 'image_url', image_url: { url: fabricUri } },
        ],
      },
    ],
  };

  const chatResponse = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://aatmi.design',
      'X-Title': 'Aatmi Curtain Studio',
    },
    body: JSON.stringify(chatPayload),
  });

  if (!chatResponse.ok) {
    const errText = await chatResponse.text();
    throw new Error(`OpenRouter Inpaint Error (${chatResponse.status}): ${errText}`);
  }

  const chatData = await chatResponse.json();
  const choice = chatData.choices?.[0]?.message;

  // Check for image parts in message
  if (Array.isArray(choice?.content)) {
    for (const part of choice.content) {
      if (part.type === 'image_url' && part.image_url?.url) {
        return part.image_url.url;
      }
    }
  }

  // If text contains base64 image or markdown image
  if (typeof choice?.content === 'string') {
    const b64Match = choice.content.match(/data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+/);
    if (b64Match) return b64Match[0];
  }

  // Fallback to base image if text-only confirmation returned
  return options.baseImage;
}

/**
 * 3. Real-Room Architectural Visualization via OpenRouter
 */
export async function callOpenRouterRoomViz(options: {
  roomPhoto: string;
  designImage: string;
  prompt?: string;
  model?: string;
  apiKey?: string | null;
}): Promise<string> {
  const key = getEffectiveOpenRouterKey(options.apiKey);
  if (!key) {
    throw new Error('OPENROUTER_API_KEY is not configured for OpenRouter Room Visualization.');
  }

  const model = options.model || OPENROUTER_RECOMMENDED_MODELS.roomVizArchitectural;
  const roomUri = ensureDataUri(options.roomPhoto);
  const curtainUri = ensureDataUri(options.designImage);

  // Try /images endpoint first
  try {
    const imgPayload: any = {
      model,
      prompt: `Architectural Real-Room Staging:
Mount the custom drapery design from Image 2 across the window bay in Image 1.
Preserve the real room's exact floorboards, wall paint, lighting, and ceiling moldings.
${options.prompt || ''}`,
      aspect_ratio: '4:3',
      input_references: [roomUri, curtainUri],
    };

    const resp = await fetch(`${OPENROUTER_BASE_URL}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://aatmi.design',
        'X-Title': 'Aatmi Curtain Studio',
      },
      body: JSON.stringify(imgPayload),
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data.data?.[0]?.b64_json) {
        return `data:image/png;base64,${data.data[0].b64_json}`;
      }
      if (data.data?.[0]?.url) {
        return data.data[0].url;
      }
    }
  } catch (e) {
    console.warn('OpenRouter /images room viz fallback to chat:', e);
  }

  // Fallback to chat completions
  const chatPayload = {
    model,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Architectural Real-Room Drapery Staging:
Image 1 = Real customer room photograph.
Image 2 = Rendered custom drapery design.
Integrate the custom drapery into the real room's window track with authentic daylight falloff and contact floor shadows.
Do NOT generate a generic room; preserve 100% of the room in Image 1.`,
          },
          { type: 'image_url', image_url: { url: roomUri } },
          { type: 'image_url', image_url: { url: curtainUri } },
        ],
      },
    ],
  };

  const chatResponse = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://aatmi.design',
      'X-Title': 'Aatmi Curtain Studio',
    },
    body: JSON.stringify(chatPayload),
  });

  if (chatResponse.ok) {
    const chatData = await chatResponse.json();
    const content = chatData.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
      const match = content.match(/data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+/);
      if (match) return match[0];
    }
  }

  return options.designImage || options.roomPhoto;
}

/**
 * 4. Test OpenRouter Connection & Key Validity
 */
export async function testOpenRouterConnection(
  apiKey?: string | null
): Promise<{ success: boolean; latencyMs: number; message: string; modelsCount?: number }> {
  const key = getEffectiveOpenRouterKey(apiKey);
  if (!key) {
    return {
      success: false,
      latencyMs: 0,
      message: 'No OpenRouter API key provided. Set OPENROUTER_API_KEY in .env or Brand Settings.',
    };
  }

  const start = Date.now();
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://aatmi.design',
        'X-Title': 'Aatmi Curtain Studio',
      },
    });

    const latencyMs = Date.now() - start;

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        latencyMs,
        message: `OpenRouter authentication rejected (${response.status}): ${errText.slice(0, 120)}`,
      };
    }

    const data = await response.json();
    const count = Array.isArray(data.data) ? data.data.length : 0;

    return {
      success: true,
      latencyMs,
      modelsCount: count,
      message: `Connected to OpenRouter Unified Gateway (${latencyMs}ms) — ${count} models accessible with 1 API key`,
    };
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Date.now() - start,
      message: `Network error connecting to OpenRouter: ${err.message}`,
    };
  }
}
