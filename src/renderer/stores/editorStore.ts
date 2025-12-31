/**
 * Editor Store - Zustand state management for code editor
 */

import { create } from 'zustand';

interface EditorState {
  // State
  selectedFile: string | null;
  fontSize: number;
  theme: 'light' | 'dark';
  language: string;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
  autoSaveInterval: number;

  // Actions
  setSelectedFile: (file: string | null) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
  setWordWrap: (enabled: boolean) => void;
  setMinimap: (enabled: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
}

const initialState = {
  selectedFile: null,
  fontSize: 14,
  theme: 'dark' as const,
  language: 'javascript',
  wordWrap: true,
  minimap: true,
  autoSave: true,
  autoSaveInterval: 5000,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setSelectedFile: (file: string | null) => set({ selectedFile: file }),

  setFontSize: (size: number) => set({ fontSize: Math.max(10, Math.min(size, 32)) }),

  setTheme: (theme: 'light' | 'dark') => set({ theme }),

  setLanguage: (language: string) => set({ language }),

  setWordWrap: (enabled: boolean) => set({ wordWrap: enabled }),

  setMinimap: (enabled: boolean) => set({ minimap: enabled }),

  setAutoSave: (enabled: boolean) => set({ autoSave: enabled }),

  setAutoSaveInterval: (interval: number) => set({ autoSaveInterval: Math.max(1000, interval) }),
}));
