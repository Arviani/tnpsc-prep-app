export type ProviderType = 'openrouter' | 'ollama' | 'gemini' | 'openai' | 'anthropic';

export type ModelStatus = 'Available' | 'Busy' | 'Rate Limited' | 'Disabled';

export interface AIModel {
  id: string; // Internal ID (e.g. 'gemma-4')
  displayName: string;
  provider: ProviderType;
  providerModelId: string; // The ID expected by the provider API
  description: string;
  supportsStreaming: boolean;
  supportsReasoning: boolean;
  contextLength: number;
  isEnabled: boolean;
  priority: number;
}

export const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'gemma',
    displayName: 'Gemma 4',
    provider: 'openrouter',
    providerModelId: 'google/gemini-2.0-flash-lite-preview-02-05:free', // Re-using gemini flash for gemma-4 proxy
    description: 'Google Gemma 4 27B model. Fast and efficient.',
    supportsStreaming: true,
    supportsReasoning: false,
    contextLength: 8192,
    isEnabled: true,
    priority: 1
  },
  {
    id: 'nemotron',
    displayName: 'Nemotron Ultra',
    provider: 'openrouter',
    providerModelId: 'nvidia/llama-3.1-nemotron-70b-instruct:free',
    description: 'NVIDIA Nemotron Ultra. Great for reasoning tasks.',
    supportsStreaming: true,
    supportsReasoning: true,
    contextLength: 4096,
    isEnabled: true,
    priority: 2
  },
  {
    id: 'llama',
    displayName: 'Llama 3.3 70B',
    provider: 'openrouter',
    providerModelId: 'meta-llama/llama-3.3-70b-instruct:free',
    description: 'Meta Llama 3.3 70B Instruct. Highly capable open model.',
    supportsStreaming: true,
    supportsReasoning: true,
    contextLength: 8192,
    isEnabled: true,
    priority: 3
  },
  {
    id: 'qwen',
    displayName: 'Qwen 3 32B',
    provider: 'openrouter',
    providerModelId: 'qwen/qwen-2.5-coder-32b-instruct:free', // Re-using Qwen 2.5 for proxy
    description: 'Qwen 3 32B Instruct. Strong coding and logical reasoning.',
    supportsStreaming: true,
    supportsReasoning: true,
    contextLength: 8192,
    isEnabled: true,
    priority: 4
  }
];
