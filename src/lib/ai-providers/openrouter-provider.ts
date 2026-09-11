// src/lib/ai-providers/openrouter-provider.ts
import { AIImageProvider, AIProviderMetadata, EditImageParams, GenerateSceneParams, RegionAnalysisResult } from './types';

export const OPENROUTER_METADATA: AIProviderMetadata = {
  id: 'openrouter',
  name: 'OpenRouter Unified Gateway',
  tagline: 'Single API Key for FLUX.1, Nano Banana Pro, Claude 3.7 & Seedream',
  description:
    'One unified API key powers the entire drapery pipeline: FLUX.1 Fill Pro for fold inpainting, Google Nano Banana Pro for architectural room staging, and Gemini 2.5 / Claude 3.7 for textile vision.',
  company: 'OpenRouter Unified AI',
  modelFamily: 'FLUX.1 Fill / Nano Banana Pro / Gemini 2.5 Flash',
  defaultModel: 'black-forest-labs/flux-fill-pro',
  requiresApiKey: true,
  apiKeyHelpUrl: 'https://openrouter.ai/keys',
  envKeyName: 'OPENROUTER_API_KEY',
  supportedFeatures: {
    vlmRegionDetection: true,
    maskedInpainting: true,
    roomVisualization: true,
    sequentialRefinement: true,
  },
};

export class OpenRouterProvider implements AIImageProvider {
  id = 'openrouter' as const;
  name = 'OpenRouter Unified Gateway';
  metadata = OPENROUTER_METADATA;
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
          provider: 'openrouter',
          apiKey: customKey || this.apiKey,
        }),
      });

      const latencyMs = Math.round(performance.now() - start);
      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          latencyMs,
          message: data.message || `Connected to OpenRouter Unified Gateway in ${latencyMs}ms`,
        };
      }

      return {
        success: false,
        latencyMs,
        message: data.error || data.message || 'OpenRouter authentication failed',
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - start),
        message: err.message || 'Failed to communicate with OpenRouter test endpoint',
      };
    }
  }

  async analyzeImage(imageBase64: string, _prompt?: string): Promise<RegionAnalysisResult> {
    const response = await fetch('/api/analyze-curtain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
      throw new Error(`Curtain analysis failed (${response.status})`);
    }

    const data = await response.json();
    return {
      regions: data.regions || [],
      source: data.source || 'openrouter_vlm',
      suggestedTags: ['bespoke-drapes', 'openrouter', 'architectural'],
    };
  }

  async editImage(params: EditImageParams): Promise<string> {
    const response = await fetch('/api/ai/edit-region', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openrouter',
        apiKey: this.apiKey,
        baseImage: params.baseImage,
        mask: params.mask,
        referenceImage: params.referenceImages?.[0],
        zoneName: params.zoneName,
        fabricName: params.fabricName,
        fabricWeave: params.fabricWeave,
        prompt: params.prompt,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'OpenRouter region inpaint failed');
    }

    const data = await response.json();
    return data.imageUrl || params.baseImage;
  }

  async generateScene(params: GenerateSceneParams): Promise<string> {
    const response = await fetch('/api/room-visualize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomPhoto: params.curtainImage,
        designImage: params.curtainImage,
        prompt: params.prompt,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenRouter room visualization failed');
    }

    const data = await response.json();
    return data.outputUrl || params.curtainImage;
  }
}
