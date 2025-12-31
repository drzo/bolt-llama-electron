/**
 * Project Store - Zustand state management for projects
 */

import { create } from 'zustand';
import { FileInfo, ProjectMetadata } from '@shared/types';

interface ProjectState {
  // State
  projectName: string;
  projectPath: string;
  projectMetadata: ProjectMetadata | null;
  files: Map<string, string>;
  currentFile: string | null;
  isDirty: boolean;
  isLoading: boolean;

  // Actions
  setProjectName: (name: string) => void;
  setProjectPath: (path: string) => void;
  setProjectMetadata: (metadata: ProjectMetadata) => void;
  setCurrentFile: (filePath: string) => void;
  addFile: (path: string, content: string) => void;
  updateFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  setFiles: (files: Map<string, string>) => void;
  getFile: (path: string) => string | undefined;
  setDirty: (dirty: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  projectName: '',
  projectPath: '',
  projectMetadata: null,
  files: new Map<string, string>(),
  currentFile: null,
  isDirty: false,
  isLoading: false,
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  ...initialState,

  setProjectName: (name: string) => set({ projectName: name }),

  setProjectPath: (path: string) => set({ projectPath: path }),

  setProjectMetadata: (metadata: ProjectMetadata) => set({ projectMetadata: metadata }),

  setCurrentFile: (filePath: string) => set({ currentFile: filePath }),

  addFile: (path: string, content: string) => {
    const files = new Map(get().files);
    files.set(path, content);
    set({ files, isDirty: true });
  },

  updateFile: (path: string, content: string) => {
    const files = new Map(get().files);
    files.set(path, content);
    set({ files, isDirty: true });
  },

  deleteFile: (path: string) => {
    const files = new Map(get().files);
    files.delete(path);
    set({ files, isDirty: true });
  },

  setFiles: (files: Map<string, string>) => set({ files }),

  getFile: (path: string) => get().files.get(path),

  setDirty: (dirty: boolean) => set({ isDirty: dirty }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  reset: () => set(initialState),
}));
