/**
 * Shared types and interfaces used across main and renderer processes
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokens?: number;
  generationTime?: number;
}

export interface FileInfo {
  path: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  size?: number;
  lastModified?: number;
}

export interface ProjectMetadata {
  name: string;
  description?: string;
  version: string;
  path: string;
  createdAt: number;
  updatedAt: number;
  template?: string;
  model?: string;
}

export interface GenerationRequest {
  prompt: string;
  context?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface GenerationResponse {
  code: string;
  explanation: string;
  tokens: number;
  generationTime: number;
  language?: string;
}

export interface FileOperation {
  operation: 'read' | 'write' | 'delete' | 'create' | 'list';
  path: string;
  content?: string;
  recursive?: boolean;
}

export interface FileOperationResult {
  success: boolean;
  data?: FileInfo | FileInfo[] | string;
  error?: string;
}

export interface ModelInfo {
  name: string;
  path: string;
  size: number;
  format: string;
  parameters?: string;
  quantization?: string;
  loaded: boolean;
}

export interface AppConfig {
  modelPath?: string;
  projectsPath?: string;
  theme?: 'light' | 'dark';
  autoSave?: boolean;
  autoSaveInterval?: number;
  defaultTemplate?: string;
}

export interface PreviewContext {
  html: string;
  css: string;
  javascript: string;
  assets?: Record<string, string>;
}

export interface CodeGenerationContext {
  projectName: string;
  projectType: string;
  existingFiles?: Record<string, string>;
  requirements?: string[];
  framework?: string;
  styling?: string;
}

export interface LLMEngineConfig {
  modelPath: string;
  gpuLayers?: number;
  contextSize?: number;
  batchSize?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface StreamMessage {
  type: 'start' | 'chunk' | 'end' | 'error';
  data?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}
