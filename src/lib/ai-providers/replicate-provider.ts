// src/lib/ai-providers/replicate-provider.ts
import { AIImageProvider, AIProviderMetadata, EditImageParams, GenerateSceneParams, RegionAnalysisResult } from './types';

export const REPLICATE_METADATA: AIProviderMetadata = {
  id: 'replicate',
  name: 'Replicate (Flux / ControlNet)',
  tagline: 'Black Forest Labs FLUX.1 & ControlNet Drapery Inpaint',
  description: 'State-of-the-art FLUX.1 Fill and SDXL ControlNet models for sub-millimeter drape contour snapping, fold depth preservation, and ultra-high texture fidelity.',
  company: 'Replicate / Black Forest Labs',
  modelFamily: 'FLUX.1 Fill / ControlNet Depth',
  defaultModel: 'black-forest-labs/flux-fill-pro',
  requiresApiKey: true,
  apiKeyHelpUrl: 'https://replicate.com/account/api-tokens',
  envKeyName: 'REPLICATE_API_TOKEN',
  supportedFeatures: {
    vlmRegionDetection: true,
    maskedInpainting: true,
    roomVisualization: true,
    sequentialRefinement: true,
  },
};

export class ReplicateProvider implements AIImageProvider {
  id = 'replicate' as const;
  name = 'Replicate (Flux / ControlNet)';
  metadata = REPLICATE_METADATA;
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
          provider: 'replicate',
          apiKey: customKey || this.apiKey,
        }),
      });

      const latencyMs = Math.round(performance.now() - start);
      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          latencyMs,
          message: data.message || `Connected to Replicate (FLUX.1 Fill Pro) in ${latencyMs}ms`,
        };
      }
      return {
        success: false,
        latencyMs,
        message: data.error || 'Replicate API authentication failed. Verify your API token.',
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - start),
        message: err.message || 'Network error pinging Replicate endpoint',
      };
    }
  }

  async analyzeImage(imageBase64: string, prompt?: string): Promise<RegionAnalysisResult> {
    const response = await fetch('/api/ai/analyze-curtain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'replicate',
        apiKey: this.apiKey,
        imageBase64,
        prompt,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Analysis failed' }));
      throw new Error(err.error || 'Replicate region analysis failed');
    }

    const data = await response.json();
    return {
      regions: data.regions || [],
      source: 'replicate_vlm',
      suggestedTags: ['flux-fill', 'controlnet', 'couture'],
    };
  }

  async editImage(params: EditImageParams): Promise<string> {
    const response = await fetch('/api/ai/edit-region', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'replicate',
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
      throw new Error(err.error || 'Replicate FLUX.1 Fill inpainting failed');
    }

    const data = await response.json();
    return data.imageUrl;
  }

  async generateScene(params: GenerateSceneParams): Promise<string> {
    const response = await fetch('/api/ai/room-viz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'replicate',
        apiKey: this.apiKey,
        curtainImage: params.curtainImage,
        roomType: params.roomType,
        prompt: params.prompt,
        wallColorHex: params.wallColorHex,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Scene generation failed' }));
      throw new Error(err.error || 'Replicate room scene visualizer failed');
    }

    const data = await response.json();
    return data.imageUrl;
  }
}
