/**
 * IPC Client - Wrapper around Electron IPC for renderer process
 */

import { GenerationRequest, GenerationResponse, ChatMessage, ProjectMetadata } from '@shared/types';

export class IPCClient {
  /**
   * Generate code using LLM
   */
  static async generateCode(request: GenerationRequest): Promise<GenerationResponse> {
    return window.electronAPI.llm.generate(request);
  }

  /**
   * Load a model
   */
  static async loadModel(modelPath: string): Promise<{ success: boolean; message: string }> {
    return window.electronAPI.llm.loadModel(modelPath);
  }

  /**
   * Get available models
   */
  static async getModels(): Promise<string[]> {
    return window.electronAPI.llm.getModels();
  }

  /**
   * Cancel ongoing generation
   */
  static cancelGeneration(): void {
    window.electronAPI.llm.cancel();
  }

  /**
   * Subscribe to LLM response events
   */
  static onLLMResponse(callback: (response: GenerationResponse) => void): () => void {
    return window.electronAPI.llm.onResponse(callback);
  }

  /**
   * Subscribe to stream start events
   */
  static onStreamStart(callback: () => void): () => void {
    return window.electronAPI.llm.onStreamStart(callback);
  }

  /**
   * Subscribe to stream chunk events
   */
  static onStreamChunk(callback: (chunk: string) => void): () => void {
    return window.electronAPI.llm.onStreamChunk(callback);
  }

  /**
   * Subscribe to stream end events
   */
  static onStreamEnd(callback: (metadata: Record<string, unknown>) => void): () => void {
    return window.electronAPI.llm.onStreamEnd(callback);
  }

  /**
   * Subscribe to stream error events
   */
  static onStreamError(callback: (error: string) => void): () => void {
    return window.electronAPI.llm.onStreamError(callback);
  }

  // ==================== File Operations ====================

  /**
   * Read file content
   */
  static async readFile(filePath: string): Promise<string> {
    return window.electronAPI.file.read(filePath);
  }

  /**
   * Write file content
   */
  static async writeFile(filePath: string, content: string): Promise<{ success: boolean; error?: string }> {
    return window.electronAPI.file.write(filePath, content);
  }

  /**
   * Delete file
   */
  static async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    return window.electronAPI.file.delete(filePath);
  }

  /**
   * Create file
   */
  static async createFile(filePath: string, content?: string): Promise<{ success: boolean; error?: string }> {
    return window.electronAPI.file.create(filePath, content);
  }

  /**
   * List files in directory
   */
  static async listFiles(dirPath: string, recursive?: boolean): Promise<any[]> {
    return window.electronAPI.file.list(dirPath, recursive);
  }

  /**
   * Watch file for changes
   */
  static watchFile(filePath: string): void {
    window.electronAPI.file.watch(filePath);
  }

  /**
   * Stop watching file
   */
  static unwatchFile(filePath: string): void {
    window.electronAPI.file.unwatch(filePath);
  }

  /**
   * Subscribe to file update events
   */
  static onFileUpdated(
    callback: (data: { path: string; event: string; filename: string }) => void,
  ): () => void {
    return window.electronAPI.file.onUpdated(callback);
  }

  // ==================== Project Operations ====================

  /**
   * Create new project
   */
  static async createProject(name: string, template?: string): Promise<any> {
    return window.electronAPI.project.create(name, template);
  }

  /**
   * List all projects
   */
  static async listProjects(): Promise<ProjectMetadata[]> {
    return window.electronAPI.project.list();
  }

  /**
   * Delete project
   */
  static async deleteProject(projectPath: string): Promise<{ success: boolean; error?: string }> {
    return window.electronAPI.project.delete(projectPath);
  }

  /**
   * Export project
   */
  static async exportProject(projectPath: string, exportPath: string): Promise<{ success: boolean; error?: string }> {
    return window.electronAPI.project.export(projectPath, exportPath);
  }

  // ==================== Chat Operations ====================

  /**
   * Add message to chat
   */
  static async addChatMessage(message: string): Promise<{ success: boolean; response?: string; error?: string }> {
    return window.electronAPI.chat.addMessage(message);
  }

  /**
   * Get chat history
   */
  static async getChatHistory(): Promise<ChatMessage[]> {
    return window.electronAPI.chat.getHistory();
  }

  /**
   * Clear chat history
   */
  static async clearChatHistory(): Promise<{ success: boolean }> {
    return window.electronAPI.chat.clearHistory();
  }

  // ==================== App Operations ====================

  /**
   * Get app version
   */
  static getAppVersion(): string {
    return window.electronAPI.app.getVersion();
  }

  /**
   * Subscribe to notification events
   */
  static onNotification(
    callback: (data: { title: string; message: string; type: string }) => void,
  ): () => void {
    return window.electronAPI.app.onNotification(callback);
  }

  /**
   * Subscribe to progress events
   */
  static onProgress(
    callback: (data: { current: number; total: number; message: string }) => void,
  ): () => void {
    return window.electronAPI.app.onProgress(callback);
  }

  /**
   * Subscribe to error events
   */
  static onError(callback: (error: string) => void): () => void {
    return window.electronAPI.app.onError(callback);
  }
}
