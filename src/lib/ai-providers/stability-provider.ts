// src/lib/ai-providers/stability-provider.ts
import { AIImageProvider, AIProviderMetadata, EditImageParams, GenerateSceneParams, RegionAnalysisResult } from './types';

export const STABILITY_METADATA: AIProviderMetadata = {
  id: 'stability',
  name: 'Stability AI',
  tagline: 'Stable Diffusion 3.5 & Ultra Inpainting',
  description: 'Stable Diffusion 3.5 Large and SD Inpainting Search & Replace, engineered for precise fabric drape replacement and daylight specular reflections.',
  company: 'Stability AI',
  modelFamily: 'SD 3.5 Large / Stable Inpaint',
  defaultModel: 'sd3.5-large',
  requiresApiKey: true,
  apiKeyHelpUrl: 'https://platform.stability.ai/account/keys',
  envKeyName: 'STABILITY_API_KEY',
  supportedFeatures: {
    vlmRegionDetection: false,
    maskedInpainting: true,
    roomVisualization: true,
    sequentialRefinement: true,
  },
};

export class StabilityProvider implements AIImageProvider {
  id = 'stability' as const;
  name = 'Stability AI';
  metadata = STABILITY_METADATA;
  requiresApiKey = true;

  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async testConnection(customKey?: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const start = performance.now();
    try {
      const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'stability',
          apiKey: customKey || this.apiKey,
        }),
      });

      const latencyMs = Math.round(performance.now() - start);
      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          latencyMs,
          message: data.message || `Connected to Stability AI (SD 3.5 Large) in ${latencyMs}ms`,
        };
      }
      return {
        success: false,
        latencyMs,
        message: data.error || 'Stability AI authentication failed. Verify your key.',
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - start),
        message: err.message || 'Network error pinging Stability endpoint',
      };
    }
  }

  async analyzeImage(imageBase64: string, prompt?: string): Promise<RegionAnalysisResult> {
    // Stability AI does not have native VLM; route through VLM analyzer fallback
    const response = await fetch('/api/ai/analyze-curtain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'stability',
        apiKey: this.apiKey,
        imageBase64,
        prompt,
      }),
    });

    const data = await response.json();
    return {
      regions: data.regions || [],
      source: 'vlm_assisted',
      suggestedTags: ['sd3-inpaint', 'stability', 'drapery'],
    };
  }

  async editImage(params: EditImageParams): Promise<string> {
    const response = await fetch('/api/ai/edit-region', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'stability',
        apiKey: this.apiKey,
        baseImage: params.baseImage,
        mask: params.mask,
        referenceImage: params.referenceImages?.[0],
        zoneName: params.zoneName,
        fabricName: params.fabricName,
        fabricWeave: params.fabricWeave,
        prompt: params.prompt,
        strength: params.strength,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Edit failed' }));
      throw new Error(err.error || 'Stability inpainting failed');
    }

    const data = await response.json();
    return data.imageUrl;
  }

  async generateScene(params: GenerateSceneParams): Promise<string> {
    const response = await fetch('/api/ai/room-viz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'stability',
        apiKey: this.apiKey,
        curtainImage: params.curtainImage,
        roomType: params.roomType,
        prompt: params.prompt,
        wallColorHex: params.wallColorHex,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Scene generation failed' }));
      throw new Error(err.error || 'Stability room visualizer failed');
    }

    const data = await response.json();
    return data.imageUrl;
  }
}
