// src/lib/ai-providers/gemini-provider.ts
import { AIImageProvider, AIProviderMetadata, EditImageParams, GenerateSceneParams, RegionAnalysisResult } from './types';

export const GEMINI_METADATA: AIProviderMetadata = {
  id: 'gemini',
  name: 'Google Gemini',
  tagline: 'Multimodal VLM & Image Generation',
  description: 'Native multimodal reasoning with Gemini 3.8 Flash for VLM architectural region parsing, and Gemini 3.1 Flash Image for high-fidelity fabric photorealism.',
  company: 'Google DeepMind',
  modelFamily: 'Gemini 3.8 Flash / Gemini 3.1 Flash Image',
  defaultModel: 'gemini-3.1-flash-image',
  requiresApiKey: true,
  apiKeyHelpUrl: 'https://aistudio.google.com/apikey',
  envKeyName: 'GEMINI_API_KEY',
  supportedFeatures: {
    vlmRegionDetection: true,
    maskedInpainting: true,
    roomVisualization: true,
    sequentialRefinement: true,
  },
};

export class GeminiProvider implements AIImageProvider {
  id = 'gemini' as const;
  name = 'Google Gemini';
  metadata = GEMINI_METADATA;
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
          provider: 'gemini',
          apiKey: customKey || this.apiKey,
        }),
      });

      const latencyMs = Math.round(performance.now() - start);
      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          latencyMs,
          message: data.message || `Connected to Google Gemini (${data.model || 'gemini-3.8-flash'}) in ${latencyMs}ms`,
        };
      }
      return {
        success: false,
        latencyMs,
        message: data.error || 'Gemini API authentication failed. Check your API key.',
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - start),
        message: err.message || 'Network error pinging Gemini endpoint',
      };
    }
  }

  async analyzeImage(imageBase64: string, prompt?: string): Promise<RegionAnalysisResult> {
    const response = await fetch('/api/analyze-curtain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        prompt,
        customApiKey: this.apiKey,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Analysis failed' }));
      throw new Error(err.error || 'Gemini VLM region analysis failed');
    }

    const data = await response.json();
    return {
      regions: data.regions || [],
      source: data.source || 'gemini_vlm',
      suggestedTags: ['couture drapery', 'architectural pleats', 'bespoke header'],
    };
  }

  async editImage(params: EditImageParams): Promise<string> {
    const response = await fetch('/api/ai/edit-region', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'gemini',
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
      throw new Error(err.error || 'Gemini region inpainting failed');
    }

    const data = await response.json();
    return data.imageUrl;
  }

  async generateScene(params: GenerateSceneParams): Promise<string> {
    const response = await fetch('/api/ai/room-viz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'gemini',
        apiKey: this.apiKey,
        curtainImage: params.curtainImage,
        roomType: params.roomType,
        prompt: params.prompt,
        wallColorHex: params.wallColorHex,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Scene generation failed' }));
      throw new Error(err.error || 'Gemini room visualizer failed');
    }

    const data = await response.json();
    return data.imageUrl;
  }
}
