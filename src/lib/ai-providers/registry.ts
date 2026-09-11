// src/lib/ai-providers/registry.ts
import { AIImageProvider, AIProviderId, AIProviderMetadata } from './types';
import { OpenRouterProvider, OPENROUTER_METADATA } from './openrouter-provider';
import { GeminiProvider, GEMINI_METADATA } from './gemini-provider';
import { OpenAIProvider, OPENAI_METADATA } from './openai-provider';
import { ReplicateProvider, REPLICATE_METADATA } from './replicate-provider';
import { StabilityProvider, STABILITY_METADATA } from './stability-provider';

const STORAGE_KEY_ACTIVE = 'aatmi_active_ai_provider';
const STORAGE_KEY_KEYS = 'aatmi_ai_provider_keys';

export class AIProviderRegistry {
  private providers: Map<AIProviderId, AIImageProvider> = new Map();
  private metadatas: Map<AIProviderId, AIProviderMetadata> = new Map();
  private activeProviderId: AIProviderId = 'openrouter';
  private apiKeys: Record<string, string> = {};

  constructor() {
    // Register metadata
    this.metadatas.set('openrouter', OPENROUTER_METADATA);
    this.metadatas.set('gemini', GEMINI_METADATA);
    this.metadatas.set('openai', OPENAI_METADATA);
    this.metadatas.set('replicate', REPLICATE_METADATA);
    this.metadatas.set('stability', STABILITY_METADATA);

    // Initialize adapters
    this.loadPersistedState();
    this.initProviders();
  }

  private loadPersistedState() {
    try {
      if (typeof window !== 'undefined') {
        const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE) as AIProviderId;
        if (savedActive && ['openrouter', 'gemini', 'openai', 'replicate', 'stability'].includes(savedActive)) {
          this.activeProviderId = savedActive;
        }

        const savedKeys = localStorage.getItem(STORAGE_KEY_KEYS);
        if (savedKeys) {
          this.apiKeys = JSON.parse(savedKeys);
        }
      }
    } catch (e) {
      console.warn('Failed to load persisted AI Provider settings', e);
    }
  }

  private initProviders() {
    this.providers.set('openrouter', new OpenRouterProvider(this.apiKeys.openrouter));
    this.providers.set('gemini', new GeminiProvider(this.apiKeys.gemini));
    this.providers.set('openai', new OpenAIProvider(this.apiKeys.openai));
    this.providers.set('replicate', new ReplicateProvider(this.apiKeys.replicate));
    this.providers.set('stability', new StabilityProvider(this.apiKeys.stability));
  }

  public getActiveProviderId(): AIProviderId {
    return this.activeProviderId;
  }

  public setActiveProviderId(id: AIProviderId): AIImageProvider {
    if (!['openrouter', 'gemini', 'openai', 'replicate', 'stability'].includes(id)) {
      throw new Error(`Unknown AI Provider: ${id}`);
    }
    this.activeProviderId = id;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE, id);
      } catch {}
    }
    return this.getActiveProvider();
  }

  public getActiveProvider(): AIImageProvider {
    const provider = this.providers.get(this.activeProviderId);
    if (!provider) {
      return this.providers.get('gemini')!;
    }
    return provider;
  }

  public getProvider(id: AIProviderId): AIImageProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Provider "${id}" not found in registry`);
    }
    return provider;
  }

  public getAllMetadata(): AIProviderMetadata[] {
    return Array.from(this.metadatas.values());
  }

  public getMetadata(id: AIProviderId): AIProviderMetadata | undefined {
    return this.metadatas.get(id);
  }

  public getApiKey(id: AIProviderId): string {
    return this.apiKeys[id] || '';
  }

  public setApiKey(id: AIProviderId, key: string) {
    this.apiKeys[id] = key.trim();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_KEYS, JSON.stringify(this.apiKeys));
      } catch {}
    }
    // Update active provider instance
    const provider = this.providers.get(id);
    if (provider && 'setApiKey' in provider) {
      (provider as any).setApiKey(this.apiKeys[id]);
    }
  }

  public clearApiKey(id: AIProviderId) {
    delete this.apiKeys[id];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_KEYS, JSON.stringify(this.apiKeys));
      } catch {}
    }
    const provider = this.providers.get(id);
    if (provider && 'setApiKey' in provider) {
      (provider as any).setApiKey('');
    }
  }

  public hasApiKey(id: AIProviderId): boolean {
    return Boolean(this.apiKeys[id] && this.apiKeys[id].length > 5);
  }

  public async testProvider(id: AIProviderId, customKey?: string) {
    const provider = this.getProvider(id);
    return provider.testConnection(customKey || this.apiKeys[id]);
  }
}

// Global Singleton instance
export const providerRegistry = new AIProviderRegistry();
