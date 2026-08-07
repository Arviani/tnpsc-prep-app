export type ProviderType = 'openrouter' | 'ollama' | 'gemini' | 'openai' | 'anthropic';

export type ModelStatus = 'Available' | 'Busy' | 'Rate Limited' | 'Disabled';

export interface AIModel {
  id: string; // Internal ID
  displayName: string;
  provider: ProviderType;
  providerModelId: string; // The ID expected by the provider API
  description: string;
  supportsStreaming: boolean;
  supportsReasoning: boolean;
  contextLength: number;
  recommendedMaxOutputTokens: number;
  isEnabled: boolean;
  priority: number;
}

export const FREE_TIER_MODELS: AIModel[] = [
  {
    id: 'gemma-free',
    displayName: 'Gemma 2 9B (Free)',
    provider: 'openrouter',
    providerModelId: 'google/gemma-4-31b-it:free',
    description: 'Google Gemma 2 9B model. Free tier.',
    supportsStreaming: true,
    supportsReasoning: false,
    contextLength: 8192,
    recommendedMaxOutputTokens: 2000,
    isEnabled: true,
    priority: 1
  },
  {
    id: 'llama-free',
    displayName: 'Llama 3 8B (Free)',
    provider: 'openrouter',
    providerModelId: 'openai/gpt-oss-20b:free',
    description: 'Meta Llama 3 8B Instruct. Free tier.',
    supportsStreaming: true,
    supportsReasoning: false,
    contextLength: 8192,
    recommendedMaxOutputTokens: 2000,
    isEnabled: true,
    priority: 2
  },
  {
    id: 'phi-free',
    displayName: 'Phi-3 Mini (Free)',
    provider: 'openrouter',
    providerModelId: 'nvidia/nemotron-nano-9b-v2:free',
    description: 'Microsoft Phi-3 Mini. Free tier.',
    supportsStreaming: true,
    supportsReasoning: false,
    contextLength: 128000,
    recommendedMaxOutputTokens: 2000,
    isEnabled: true,
    priority: 3
  }
];

// Re-export for compatibility with existing codebase
export const DEFAULT_MODELS = FREE_TIER_MODELS;
