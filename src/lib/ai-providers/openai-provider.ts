// src/lib/ai-providers/openai-provider.ts
import { AIImageProvider, AIProviderMetadata, EditImageParams, GenerateSceneParams, RegionAnalysisResult } from './types';

export const OPENAI_METADATA: AIProviderMetadata = {
  id: 'openai',
  name: 'OpenAI',
  tagline: 'GPT-4o Vision & DALL-E Inpainting',
  description: 'GPT-4o Vision for semantic cloth parsing and DALL-E / masked image editing for photorealistic textile texture rendering.',
  company: 'OpenAI',
  modelFamily: 'GPT-4o / DALL-E Inpainting',
  defaultModel: 'gpt-4o',
  requiresApiKey: true,
  apiKeyHelpUrl: 'https://platform.openai.com/api-keys',
  envKeyName: 'OPENAI_API_KEY',
  supportedFeatures: {
    vlmRegionDetection: true,
    maskedInpainting: true,
    roomVisualization: true,
    sequentialRefinement: true,
  },
};

export class OpenAIProvider implements AIImageProvider {
  id = 'openai' as const;
  name = 'OpenAI';
  metadata = OPENAI_METADATA;
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
          provider: 'openai',
          apiKey: customKey || this.apiKey,
        }),
      });

      const latencyMs = Math.round(performance.now() - start);
      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          latencyMs,
          message: data.message || `Connected to OpenAI (${data.model || 'gpt-4o'}) in ${latencyMs}ms`,
        };
      }
      return {
        success: false,
        latencyMs,
        message: data.error || 'OpenAI API authentication failed. Verify your key has access.',
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - start),
        message: err.message || 'Network error pinging OpenAI endpoint',
      };
    }
  }

  async analyzeImage(imageBase64: string, prompt?: string): Promise<RegionAnalysisResult> {
    const response = await fetch('/api/ai/analyze-curtain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        apiKey: this.apiKey,
        imageBase64,
        prompt,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Analysis failed' }));
      throw new Error(err.error || 'OpenAI Vision curtain analysis failed');
    }

    const data = await response.json();
    return {
      regions: data.regions || [],
      source: 'openai_gpt4o',
      suggestedTags: data.tags || ['custom drapery', 'pinch pleat', 'architectural'],
    };
  }

  async editImage(params: EditImageParams): Promise<string> {
    const response = await fetch('/api/ai/edit-region', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
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
      throw new Error(err.error || 'OpenAI inpainting failed');
    }

    const data = await response.json();
    return data.imageUrl;
  }

  async generateScene(params: GenerateSceneParams): Promise<string> {
    const response = await fetch('/api/ai/room-viz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        apiKey: this.apiKey,
        curtainImage: params.curtainImage,
        roomType: params.roomType,
        prompt: params.prompt,
        wallColorHex: params.wallColorHex,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Scene generation failed' }));
      throw new Error(err.error || 'OpenAI room visualizer failed');
    }

    const data = await response.json();
    return data.imageUrl;
  }
}
