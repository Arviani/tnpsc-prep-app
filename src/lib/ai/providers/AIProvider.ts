import { AIModel } from '../models';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model: AIModel;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  modelUsed: AIModel;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ProviderError extends Error {
  statusCode?: number;
  isRateLimit?: boolean;
  isProviderBusy?: boolean;
}

export interface AIProvider {
  /**
   * Identifies the provider (e.g. 'openrouter', 'ollama')
   */
  get providerType(): string;
  
  /**
   * Send a non-streaming chat request
   */
  chat(request: ChatRequest): Promise<ChatResponse>;
  
  /**
   * Send a streaming chat request. Returns a ReadableStream for the chunks.
   */
  chatStream(request: ChatRequest): Promise<ReadableStream>;
}
