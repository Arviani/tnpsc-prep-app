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

    let fallbackInfo: FallbackInfo = { wasFallback: false };

    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      const provider = this.getProviderForModel(model);
      
      try {
        console.log(`[ModelManager] Attempting to use model: ${model.displayName} (${model.id})`);
        
        let response;
        if (stream && model.supportsStreaming) {
          response = await provider.chatStream({ messages, model, stream: true });
        } else {
          response = await provider.chat({ messages, model, stream: false });
        }
        
        return { response, fallbackInfo, model };

      } catch (error: any) {
        console.error(`[ModelManager] Error with model ${model.displayName}:`, error.message);
        
        // If it's the last model to try, rethrow the error
        if (i === modelsToTry.length - 1) {
          throw new Error('All free AI models are temporarily unavailable. Please try again later.');
        }

        // If error is RateLimit or Provider Busy, we fallback.
        if (error.isRateLimit || error.isProviderBusy || error.statusCode === 429 || error.statusCode >= 500) {
          console.log(`[ModelManager] Initiating fallback from ${model.displayName}`);
          if (!fallbackInfo.wasFallback) {
            fallbackInfo = {
              wasFallback: true,
              originalModelId: model.id,
              fallbackReason: error.isRateLimit ? 'reached its rate limit' : 'is currently busy'
            };
          }
          fallbackInfo.newModelId = modelsToTry[i + 1].id;
          continue; // Try next model
        }

        // For other errors (e.g. 400 Bad Request, auth failure), throw immediately as retrying won't help
        throw error;
      }
    }

    throw new Error('Unexpected execution path in generateChatWithFallback');
  }
}
