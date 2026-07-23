import { AIModel, DEFAULT_MODELS } from './models';
import { AIProvider, ChatMessage, ChatResponse } from './providers/AIProvider';
import { OpenRouterProvider } from './providers/OpenRouterProvider';
import fs from 'fs';
import path from 'path';

export interface FallbackInfo {
  wasFallback: boolean;
  originalModelId?: string;
  newModelId?: string;
  fallbackReason?: string;
  diagnostics?: {
    estimatedInputTokens: number;
    requestedOutputTokens: number;
    retries: number;
  };
}

export class ModelManager {
  private providers: Map<string, AIProvider> = new Map();
  private static instance: ModelManager;

  private constructor() {
    // Register available providers
    this.providers.set('openrouter', new OpenRouterProvider());
  }

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  /**
   * Retrieves the current configuration of models, merging with local config file if it exists.
   */
  public async getModels(): Promise<AIModel[]> {
    try {
      const configPath = path.join(process.cwd(), 'config', 'ai-settings.json');
      if (fs.existsSync(configPath)) {
        const fileData = fs.readFileSync(configPath, 'utf8');
        const customModels = JSON.parse(fileData) as AIModel[];
        
        // Merge to ensure we always have valid basic data, but custom priorities/toggles take precedence
        const merged = DEFAULT_MODELS.map(defaultModel => {
          const custom = customModels.find(m => m.id === defaultModel.id);
          return custom ? { ...defaultModel, ...custom } : defaultModel;
        });
        return merged.sort((a, b) => a.priority - b.priority);
      }
    } catch (error) {
      console.warn('Could not read custom AI config, falling back to default.', error);
    }
    return [...DEFAULT_MODELS].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Saves the models configuration to local disk.
   */
  public async saveModels(models: AIModel[]): Promise<void> {
    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    const configPath = path.join(configDir, 'ai-settings.json');
    fs.writeFileSync(configPath, JSON.stringify(models, null, 2), 'utf8');
  }

  /**
   * Get the provider instance for a model
   */
  public getProviderForModel(model: AIModel): AIProvider {
    const provider = this.providers.get(model.provider);
    if (!provider) {
      throw new Error(`Provider ${model.provider} not registered.`);
    }
    return provider;
  }

  /**
   * Estimates the number of tokens in a string (approx 4 chars per token)
   */
  public estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Trims conversation to fit within token limit, keeping system prompt and most recent messages.
   */
  public trimConversation(messages: ChatMessage[], maxInputTokens: number): ChatMessage[] {
    if (messages.length <= 2) return messages; // Always keep system and user

    let currentTokens = 0;
    const keptMessages: ChatMessage[] = [];
    
    // Always keep system prompt
    const systemPrompt = messages.find(m => m.role === 'system');
    if (systemPrompt) {
      currentTokens += this.estimateTokens(systemPrompt.content);
      keptMessages.push(systemPrompt);
    }

    // Work backwards from the newest user/assistant messages
    const recentMessages = messages.filter(m => m.role !== 'system').reverse();
    const tempRecent: ChatMessage[] = [];

    for (const msg of recentMessages) {
      const msgTokens = this.estimateTokens(msg.content);
      if (currentTokens + msgTokens > maxInputTokens && tempRecent.length > 0) {
        // We reached the limit, stop adding old messages
        break;
      }
      currentTokens += msgTokens;
      tempRecent.push(msg);
    }

    // Prepend the recent messages (they were reversed, so reverse them back)
    keptMessages.push(...tempRecent.reverse());
    return keptMessages;
  }

  /**
   * Generates a chat response with automatic fallback support across prioritized models.
   * If startingModelId is provided, it tries that model first before falling back down the priority chain.
   */
  public async generateChatWithFallback(
    messages: ChatMessage[],
    startingModelId?: string,
    stream = false
  ): Promise<{ response: ChatResponse | ReadableStream; fallbackInfo: FallbackInfo; model: AIModel }> {
    const allModels = await this.getModels();
    const enabledModels = allModels.filter(m => m.isEnabled);
    
    if (enabledModels.length === 0) {
      throw new Error('All free AI models are temporarily unavailable. Please try again later.');
    }

    // Determine the list of models to try in order
    let modelsToTry = enabledModels;
    if (startingModelId) {
      const startingIndex = enabledModels.findIndex(m => m.id === startingModelId);
      if (startingIndex !== -1) {
        // Try requested model first, then the remaining ones in order of priority
        modelsToTry = [
          enabledModels[startingIndex],
          ...enabledModels.slice(0, startingIndex),
          ...enabledModels.slice(startingIndex + 1)
        ];
      }
    }

    let fallbackInfo: FallbackInfo = { wasFallback: false, diagnostics: { estimatedInputTokens: 0, requestedOutputTokens: 0, retries: 0 } };

    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      const provider = this.getProviderForModel(model);
      
      let retryCount = 0;
      const MAX_RETRIES = 1;
      
      // Calculate tokens
      const estimatedInput = messages.reduce((acc, msg) => acc + this.estimateTokens(msg.content), 0);
      let requestedOutput = model.recommendedMaxOutputTokens || 4096;
      
      // Trim conversation if it exceeds context limit
      let finalMessages = messages;
      if (estimatedInput + requestedOutput > model.contextLength) {
        const allowedInputTokens = Math.max(1000, model.contextLength - requestedOutput);
        finalMessages = this.trimConversation(messages, allowedInputTokens);
      }
      
      fallbackInfo.diagnostics!.estimatedInputTokens = estimatedInput;
      fallbackInfo.diagnostics!.requestedOutputTokens = requestedOutput;

      while (retryCount <= MAX_RETRIES) {
        try {
          console.log(`[ModelManager] Attempting to use model: ${model.displayName} (${model.id}) [Output: ${requestedOutput} tokens]`);
          
          let response;
          if (stream && model.supportsStreaming) {
            response = await provider.chatStream({ messages: finalMessages, model, stream: true, maxTokens: requestedOutput });
          } else {
            response = await provider.chat({ messages: finalMessages, model, stream: false, maxTokens: requestedOutput });
          }
          
          fallbackInfo.diagnostics!.retries = retryCount;
          return { response, fallbackInfo, model };

        } catch (error: any) {
          console.error(`[ModelManager] Error with model ${model.displayName} (Retry ${retryCount}):`, error.message);
          
          if (error.isOutputLimitExceeded || error.isQuotaExceeded || error.isContextTooLarge) {
            if (retryCount < MAX_RETRIES) {
              console.log(`[ModelManager] Retrying ${model.displayName} with reduced max_tokens`);
              requestedOutput = Math.floor(requestedOutput * 0.5); // Halve requested output
              fallbackInfo.diagnostics!.requestedOutputTokens = requestedOutput;
              retryCount++;
              continue;
            }
          }
          
          // If error is RateLimit, Provider Busy, or we exhausted retries on quota, we fallback.
          if (error.isRateLimit || error.isProviderBusy || error.isOutputLimitExceeded || error.isQuotaExceeded || error.isContextTooLarge || error.statusCode === 429 || error.statusCode >= 500) {
            console.log(`[ModelManager] Initiating fallback from ${model.displayName}`);
            if (!fallbackInfo.wasFallback) {
              fallbackInfo.wasFallback = true;
              fallbackInfo.originalModelId = model.id;
              
              if (error.isQuotaExceeded) fallbackInfo.fallbackReason = 'reached its token/credit quota';
              else if (error.isContextTooLarge) fallbackInfo.fallbackReason = 'context was too large';
              else if (error.isOutputLimitExceeded) fallbackInfo.fallbackReason = 'reached its maximum output tokens';
              else if (error.isRateLimit) fallbackInfo.fallbackReason = 'reached its rate limit';
              else fallbackInfo.fallbackReason = 'is currently busy';
            }
            if (i < modelsToTry.length - 1) {
              fallbackInfo.newModelId = modelsToTry[i + 1].id;
            }
            break; // Break retry loop, go to next model
          }

          // For other errors (e.g. 400 Bad Request, auth failure), throw immediately
          if (i === modelsToTry.length - 1) throw error;
          break; // Break retry loop, go to next model
        }
      }
    }

    throw new Error('All AI models failed or were unavailable. Please try again later.');
  }
}
