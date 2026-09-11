// src/lib/ai-providers/types.ts

export type AIProviderId = 'openrouter' | 'gemini' | 'openai' | 'replicate' | 'stability';

export interface AIProviderMetadata {
  id: AIProviderId;
  name: string;
  tagline: string;
  description: string;
  company: string;
  modelFamily: string;
  defaultModel: string;
  requiresApiKey: boolean;
  apiKeyHelpUrl: string;
  envKeyName: string;
  supportedFeatures: {
    vlmRegionDetection: boolean;
    maskedInpainting: boolean;
    roomVisualization: boolean;
    sequentialRefinement: boolean;
  };
}

export interface RegionAnalysisResult {
  regions: Array<{
    name: string;
    display_name: string;
    description: string;
    location: string;
    order: number;
    multi_component?: boolean;
    replaceable?: boolean;
    bbox?: { x: number; y: number; width: number; height: number };
    polygon_coords: Array<{ x: number; y: number }>;
    suggested_sam_prompt?: string;
  }>;
  source: string;
  suggestedTags?: string[];
}

export interface EditImageParams {
  baseImage: string; // Base64 or DataURL
  mask?: string; // Base64 polygon or alpha mask
  prompt: string;
  referenceImages?: string[]; // Swatch or texture reference
  strength?: number; // 0.1 to 1.0
  zoneName?: string;
  fabricName?: string;
  fabricWeave?: string;
  lightingKelvin?: string;
}

export interface GenerateSceneParams {
  curtainImage: string; // Rendered curtain image
  roomType: 'living_room' | 'penthouse' | 'master_bedroom' | 'french_salon' | 'minimalist_loft';
  prompt?: string;
  wallColorHex?: string;
  windowStyle?: string;
}

export interface AIImageProvider {
  id: AIProviderId;
  name: string;
  metadata: AIProviderMetadata;
  requiresApiKey: boolean;

  // For VLM region detection and catalog tagging
  analyzeImage(imageBase64: string, prompt?: string): Promise<RegionAnalysisResult>;

  // For masked inpainting (applying fabric to a single region)
  editImage(params: EditImageParams): Promise<string>;

  // For outpainting/room visualization
  generateScene(params: GenerateSceneParams): Promise<string>;

  // Connection test
  testConnection(apiKey?: string): Promise<{ success: boolean; latencyMs: number; message: string }>;
}
