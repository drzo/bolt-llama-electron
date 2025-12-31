/**
 * LLM Engine - Integrates node-llama-cpp for local model inference
 */

import { getLlama, LlamaChatSession, LlamaContext, LlamaModel } from 'node-llama-cpp';
import path from 'path';
import { LLMEngineConfig, GenerationRequest, GenerationResponse, StreamMessage } from '@shared/types';
import { LLM_DEFAULTS, SYSTEM_PROMPTS } from '@shared/constants';

export class LLMEngine {
  private model: LlamaModel | null = null;
  private context: LlamaContext | null = null;
  private session: LlamaChatSession | null = null;
  private config: LLMEngineConfig;
  private isLoading: boolean = false;
  private isCancelled: boolean = false;

  constructor(config: Partial<LLMEngineConfig> = {}) {
    this.config = {
      modelPath: config.modelPath || path.join(process.env.HOME || '', '.bolt-llama/models/model.gguf'),
      gpuLayers: config.gpuLayers ?? LLM_DEFAULTS.gpuLayers,
      contextSize: config.contextSize ?? LLM_DEFAULTS.contextSize,
      batchSize: config.batchSize ?? 512,
      temperature: config.temperature ?? LLM_DEFAULTS.temperature,
      topP: config.topP ?? LLM_DEFAULTS.topP,
      topK: config.topK ?? LLM_DEFAULTS.topK,
    };
  }

  /**
   * Initialize the LLM engine and load model
   */
  async initialize(): Promise<void> {
    try {
      if (this.model) {
        console.log('Model already loaded');
        return;
      }

      this.isLoading = true;
      console.log(`Loading model from: ${this.config.modelPath}`);

      const llama = await getLlama();
      this.model = await llama.loadModel({
        modelPath: this.config.modelPath,
        gpuLayers: this.config.gpuLayers,
      });

      this.context = await this.model.createContext({
        maxTokens: this.config.contextSize,
        batchSize: this.config.batchSize,
      });

      this.session = new LlamaChatSession({
        contextSequence: this.context.getSequence(),
      });

      this.isLoading = false;
      console.log('LLM engine initialized successfully');
    } catch (error) {
      this.isLoading = false;
      console.error('Failed to initialize LLM engine:', error);
      throw new Error(`Failed to initialize LLM engine: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate code based on prompt
   */
  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    if (!this.session) {
      throw new Error('LLM engine not initialized. Call initialize() first.');
    }

    if (this.isLoading) {
      throw new Error('Model is still loading. Please wait.');
    }

    this.isCancelled = false;
    const startTime = Date.now();

    try {
      const systemPrompt = request.systemPrompt || SYSTEM_PROMPTS.codeGeneration;
      const temperature = request.temperature ?? this.config.temperature;
      const maxTokens = request.maxTokens ?? LLM_DEFAULTS.maxTokens;

      const fullPrompt = `${systemPrompt}\n\nUser: ${request.prompt}`;

      let generatedCode = '';
      let tokenCount = 0;

      // Generate with streaming
      const response = await this.session.prompt(fullPrompt, {
        temperature,
        maxTokens,
        topP: this.config.topP,
        topK: this.config.topK,
      });

      generatedCode = response;

      // Estimate token count (rough approximation)
      tokenCount = Math.ceil(generatedCode.length / 4);

      const generationTime = Date.now() - startTime;

      // Extract code blocks if wrapped in markdown
      const codeMatch = generatedCode.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
      const code = codeMatch ? codeMatch[1] : generatedCode;

      return {
        code,
        explanation: `Generated ${code.split('\n').length} lines of code in ${generationTime}ms`,
        tokens: tokenCount,
        generationTime,
      };
    } catch (error) {
      if (this.isCancelled) {
        throw new Error('Generation cancelled by user');
      }
      console.error('Generation failed:', error);
      throw new Error(`Generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate code with streaming support
   */
  async *generateStream(request: GenerationRequest): AsyncGenerator<StreamMessage, void, unknown> {
    if (!this.session) {
      yield {
        type: 'error',
        error: 'LLM engine not initialized. Call initialize() first.',
      };
      return;
    }

    if (this.isLoading) {
      yield {
        type: 'error',
        error: 'Model is still loading. Please wait.',
      };
      return;
    }

    this.isCancelled = false;
    const startTime = Date.now();

    try {
      yield { type: 'start', metadata: { prompt: request.prompt } };

      const systemPrompt = request.systemPrompt || SYSTEM_PROMPTS.codeGeneration;
      const temperature = request.temperature ?? this.config.temperature;
      const maxTokens = request.maxTokens ?? LLM_DEFAULTS.maxTokens;

      const fullPrompt = `${systemPrompt}\n\nUser: ${request.prompt}`;

      let generatedCode = '';

      // Stream the response
      const response = await this.session.prompt(fullPrompt, {
        temperature,
        maxTokens,
        topP: this.config.topP,
        topK: this.config.topK,
      });

      generatedCode = response;

      // Yield chunks of the response
      const chunkSize = 50;
      for (let i = 0; i < generatedCode.length; i += chunkSize) {
        if (this.isCancelled) {
          yield { type: 'error', error: 'Generation cancelled by user' };
          return;
        }
        yield {
          type: 'chunk',
          data: generatedCode.substring(i, i + chunkSize),
        };
      }

      const generationTime = Date.now() - startTime;
      const tokenCount = Math.ceil(generatedCode.length / 4);

      yield {
        type: 'end',
        metadata: {
          tokens: tokenCount,
          generationTime,
          totalLength: generatedCode.length,
        },
      };
    } catch (error) {
      if (!this.isCancelled) {
        yield {
          type: 'error',
          error: `Generation failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }
  }

  /**
   * Chat with the model
   */
  async chat(message: string): Promise<string> {
    if (!this.session) {
      throw new Error('LLM engine not initialized. Call initialize() first.');
    }

    try {
      const response = await this.session.prompt(message);
      return response;
    } catch (error) {
      console.error('Chat failed:', error);
      throw new Error(`Chat failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Cancel ongoing generation
   */
  cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Unload model and free resources
   */
  async unload(): Promise<void> {
    try {
      if (this.context) {
        await this.context.dispose();
        this.context = null;
      }
      if (this.model) {
        await this.model.dispose();
        this.model = null;
      }
      this.session = null;
      console.log('LLM engine unloaded');
    } catch (error) {
      console.error('Error unloading LLM engine:', error);
    }
  }

  /**
   * Check if model is loaded
   */
  isModelLoaded(): boolean {
    return this.model !== null && this.context !== null && this.session !== null;
  }

  /**
   * Get current configuration
   */
  getConfig(): LLMEngineConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LLMEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Singleton instance
let engineInstance: LLMEngine | null = null;

export function getLLMEngine(config?: Partial<LLMEngineConfig>): LLMEngine {
  if (!engineInstance) {
    engineInstance = new LLMEngine(config);
  }
  return engineInstance;
}

export function resetLLMEngine(): void {
  engineInstance = null;
}
