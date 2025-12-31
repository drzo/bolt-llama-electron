/**
 * Preload Script - Exposes secure IPC API to renderer process
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc-channels';
import { GenerationRequest, GenerationResponse, ChatMessage } from '@shared/types';

/**
 * Secure API exposed to renderer process
 */
const api = {
  // LLM API
  llm: {
    generate: (request: GenerationRequest): Promise<GenerationResponse> =>
      ipcRenderer.invoke(IPC_CHANNELS.LLM_GENERATE, request),

    loadModel: (modelPath: string): Promise<{ success: boolean; message: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.LLM_LOAD_MODEL, modelPath),

    getModels: (): Promise<string[]> => ipcRenderer.invoke(IPC_CHANNELS.LLM_GET_MODELS),

    cancel: (): void => ipcRenderer.send(IPC_CHANNELS.LLM_CANCEL),

    onResponse: (callback: (response: GenerationResponse) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, response: GenerationResponse) => callback(response);
      ipcRenderer.on(IPC_CHANNELS.LLM_RESPONSE, listener);
      return () => ipcRenderer.off(IPC_CHANNELS.LLM_RESPONSE, listener);
    },

    onStreamStart: (callback: () => void): (() => void) => {
      const listener = (_event: IpcRendererEvent) => callback();
      ipcRenderer.on(IPC_CHANNELS.LLM_STREAM_START, listener);
      return () => ipcRenderer.off(IPC_CHANNELS.LLM_STREAM_START, listener);
    },

    onStreamChunk: (callback: (chunk: string) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, chunk: string) => callback(chunk);
      ipcRenderer.on(IPC_CHANNELS.LLM_STREAM_CHUNK, listener);
      return () => ipcRenderer.off(IPC_CHANNELS.LLM_STREAM_CHUNK, listener);
    },

    onStreamEnd: (callback: (metadata: Record<string, unknown>) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, metadata: Record<string, unknown>) => callback(metadata);
      ipcRenderer.on(IPC_CHANNELS.LLM_STREAM_END, listener);
      return () => ipcRenderer.off(IPC_CHANNELS.LLM_STREAM_END, listener);
    },

    onStreamError: (callback: (error: string) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, error: string) => callback(error);
      ipcRenderer.on(IPC_CHANNELS.LLM_STREAM_ERROR, listener);
      return () => ipcRenderer.off(IPC_CHANNELS.LLM_STREAM_ERROR, listener);
    },
  },

  // File API
  file: {
    read: (filePath: string): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, filePath),

    write: (filePath: string, content: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_WRITE, { path: filePath, content }),

    delete: (filePath: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_DELETE, filePath),

    create: (filePath: string, content?: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_CREATE, { path: filePath, content }),

    list: (dirPath: string, recursive?: boolean): Promise<any[]> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_LIST, { path: dirPath, recursive }),

    watch: (filePath: string): void => ipcRenderer.send(IPC_CHANNELS.FILE_WATCH, filePath),

    unwatch: (filePath: string): void => ipcRenderer.send(IPC_CHANNELS.FILE_UNWATCH, filePath),

    onUpdated: (callback: (data: { path: string; event: string; filename: string }) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, data: { path: string; event: string; filename: string }) =>
        callback(data);
      ipcRenderer.on(IPC_CHANNELS.FILE_UPDATED, listener);
      return () => ipcRenderer.off(IPC_CHANNELS.FILE_UPDATED, listener);
    },
  },

  // Project API
  project: {
    create: (name: string, template?: string): Promise<any> =>
      ipcRenderer.invoke(IPC_CHANNELS.PROJECT_CREATE, { name, template }),

    list: (): Promise<any[]> => ipcRenderer.invoke(IPC_CHANNELS.PROJECT_LIST),

    delete: (projectPath: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.PROJECT_DELETE, projectPath),

    export: (projectPath: string, exportPath: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.PROJECT_EXPORT, { projectPath, exportPath }),
  },

  // Chat API
  chat: {
    addMessage: (message: string): Promise<{ success: boolean; response?: string; error?: string }> =>
      ipcRenderer.invoke(IPC_CHANNELS.CHAT_ADD_MESSAGE, { message }),

    getHistory: (): Promise<ChatMessage[]> => ipcRenderer.invoke(IPC_CHANNELS.CHAT_GET_HISTORY),

    clearHistory: (): Promise<{ success: boolean }> => ipcRenderer.invoke(IPC_CHANNELS.CHAT_CLEAR_HISTORY),
  },

  // App API
  app: {
    getVersion: (): string => {
      // This will be set by the main process
      return '1.0.0';
    },

    onNotification: (callback: (data: { title: string; message: string; type: string }) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, data: { title: string; message: string; type: string }) =>
        callback(data);
      ipcRenderer.on(IPC_CHANNELS.APP_NOTIFICATION, listener);
      return () => ipcRenderer.off(IPC_CHANNELS.APP_NOTIFICATION, listener);
    },

    onProgress: (callback: (data: { current: number; total: number; message: string }) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, data: { current: number; total: number; message: string }) =>
        callback(data);
      ipcRenderer.on(IPC_CHANNELS.APP_PROGRESS, listener);
      return () => ipcRenderer.off(IPC_CHANNELS.APP_PROGRESS, listener);
    },

    onError: (callback: (error: string) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, error: string) => callback(error);
      ipcRenderer.on(IPC_CHANNELS.APP_ERROR, listener);
      return () => ipcRenderer.off(IPC_CHANNELS.APP_ERROR, listener);
    },
  },
};

// Expose API to renderer process
contextBridge.exposeInMainWorld('electronAPI', api);

// Type declaration for TypeScript
declare global {
  interface Window {
    electronAPI: typeof api;
  }
}
