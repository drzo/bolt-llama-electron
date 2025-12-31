/**
 * IPC Handlers - Manages communication between main and renderer processes
 */

import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc-channels';
import { GenerationRequest, GenerationResponse, FileOperation, FileOperationResult } from '@shared/types';
import { LLMEngine, getLLMEngine } from './llm-engine';
import { FileManager, getFileManager } from './file-manager';
import path from 'path';

export class IPCHandler {
  private llmEngine: LLMEngine;
  private fileManager: FileManager;
  private mainWindow: BrowserWindow | null = null;

  constructor(mainWindow: BrowserWindow | null = null) {
    this.mainWindow = mainWindow;
    this.llmEngine = getLLMEngine();
    this.fileManager = getFileManager();
    this.setupHandlers();
  }

  /**
   * Setup all IPC handlers
   */
  private setupHandlers(): void {
    // LLM Handlers
    ipcMain.handle(IPC_CHANNELS.LLM_GENERATE, this.handleLLMGenerate.bind(this));
    ipcMain.handle(IPC_CHANNELS.LLM_LOAD_MODEL, this.handleLoadModel.bind(this));
    ipcMain.handle(IPC_CHANNELS.LLM_GET_MODELS, this.handleGetModels.bind(this));
    ipcMain.on(IPC_CHANNELS.LLM_CANCEL, this.handleCancelGeneration.bind(this));

    // File Handlers
    ipcMain.handle(IPC_CHANNELS.FILE_READ, this.handleFileRead.bind(this));
    ipcMain.handle(IPC_CHANNELS.FILE_WRITE, this.handleFileWrite.bind(this));
    ipcMain.handle(IPC_CHANNELS.FILE_DELETE, this.handleFileDelete.bind(this));
    ipcMain.handle(IPC_CHANNELS.FILE_CREATE, this.handleFileCreate.bind(this));
    ipcMain.handle(IPC_CHANNELS.FILE_LIST, this.handleFileList.bind(this));
    ipcMain.on(IPC_CHANNELS.FILE_WATCH, this.handleFileWatch.bind(this));
    ipcMain.on(IPC_CHANNELS.FILE_UNWATCH, this.handleFileUnwatch.bind(this));

    // Project Handlers
    ipcMain.handle(IPC_CHANNELS.PROJECT_CREATE, this.handleProjectCreate.bind(this));
    ipcMain.handle(IPC_CHANNELS.PROJECT_LIST, this.handleProjectList.bind(this));
    ipcMain.handle(IPC_CHANNELS.PROJECT_DELETE, this.handleProjectDelete.bind(this));
    ipcMain.handle(IPC_CHANNELS.PROJECT_EXPORT, this.handleProjectExport.bind(this));

    // Chat Handlers
    ipcMain.handle(IPC_CHANNELS.CHAT_ADD_MESSAGE, this.handleChatAddMessage.bind(this));
    ipcMain.handle(IPC_CHANNELS.CHAT_GET_HISTORY, this.handleChatGetHistory.bind(this));
    ipcMain.handle(IPC_CHANNELS.CHAT_CLEAR_HISTORY, this.handleChatClearHistory.bind(this));

    console.log('IPC handlers registered');
  }

  // ==================== LLM Handlers ====================

  private async handleLLMGenerate(
    _event: any,
    request: GenerationRequest,
  ): Promise<GenerationResponse> {
    try {
      if (!this.llmEngine.isModelLoaded()) {
        throw new Error('Model not loaded. Please load a model first.');
      }

      return await this.llmEngine.generate(request);
    } catch (error) {
      console.error('LLM generation error:', error);
      throw error;
    }
  }

  private async handleLoadModel(_event: any, modelPath: string): Promise<{ success: boolean; message: string }> {
    try {
      this.llmEngine.updateConfig({ modelPath });
      await this.llmEngine.initialize();
      return { success: true, message: 'Model loaded successfully' };
    } catch (error) {
      console.error('Model loading error:', error);
      return {
        success: false,
        message: `Failed to load model: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private async handleGetModels(): Promise<string[]> {
    // Return list of available models (placeholder)
    return [
      'codellama-7b-instruct.Q4_K_M.gguf',
      'mistral-7b-instruct-v0.2.Q4_K_M.gguf',
      'llama-2-13b-chat.Q4_K_M.gguf',
    ];
  }

  private handleCancelGeneration(): void {
    this.llmEngine.cancel();
  }

  // ==================== File Handlers ====================

  private async handleFileRead(_event: any, filePath: string): Promise<string> {
    try {
      return await this.fileManager.readFile(filePath);
    } catch (error) {
      console.error('File read error:', error);
      throw error;
    }
  }

  private async handleFileWrite(
    _event: any,
    data: { path: string; content: string },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.fileManager.writeFile(data.path, data.content);
      return { success: true };
    } catch (error) {
      console.error('File write error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handleFileDelete(_event: any, filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.fileManager.deleteFile(filePath);
      return { success: true };
    } catch (error) {
      console.error('File delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handleFileCreate(
    _event: any,
    data: { path: string; content?: string },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.fileManager.writeFile(data.path, data.content || '');
      return { success: true };
    } catch (error) {
      console.error('File create error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handleFileList(
    _event: any,
    data: { path: string; recursive?: boolean },
  ): Promise<any[]> {
    try {
      return await this.fileManager.listFiles(data.path, data.recursive);
    } catch (error) {
      console.error('File list error:', error);
      throw error;
    }
  }

  private handleFileWatch(_event: any, filePath: string): void {
    this.fileManager.watchFile(filePath, (event, filename) => {
      if (this.mainWindow) {
        this.mainWindow.webContents.send(IPC_CHANNELS.FILE_UPDATED, {
          path: filePath,
          event,
          filename,
        });
      }
    });
  }

  private handleFileUnwatch(_event: any, filePath: string): void {
    this.fileManager.unwatchFile(filePath);
  }

  // ==================== Project Handlers ====================

  private async handleProjectCreate(
    _event: any,
    data: { name: string; template?: string },
  ): Promise<any> {
    try {
      const result = await this.fileManager.createProject(data.name, data.template);
      return {
        success: true,
        projectPath: result.projectPath,
        files: result.files,
      };
    } catch (error) {
      console.error('Project creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handleProjectList(): Promise<any[]> {
    try {
      return await this.fileManager.listProjects();
    } catch (error) {
      console.error('Project list error:', error);
      return [];
    }
  }

  private async handleProjectDelete(_event: any, projectPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.fileManager.deleteProject(projectPath);
      return { success: true };
    } catch (error) {
      console.error('Project delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handleProjectExport(
    _event: any,
    data: { projectPath: string; exportPath: string },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.fileManager.exportProject(data.projectPath, data.exportPath);
      return { success: true };
    } catch (error) {
      console.error('Project export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ==================== Chat Handlers ====================

  private async handleChatAddMessage(
    _event: any,
    data: { message: string },
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      const response = await this.llmEngine.chat(data.message);
      return { success: true, response };
    } catch (error) {
      console.error('Chat error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async handleChatGetHistory(): Promise<any[]> {
    // Placeholder - would load from file
    return [];
  }

  private async handleChatClearHistory(): Promise<{ success: boolean }> {
    // Placeholder - would clear history file
    return { success: true };
  }

  /**
   * Set main window reference
   */
  setMainWindow(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.fileManager.unwatchAll();
    await this.llmEngine.unload();
  }
}
