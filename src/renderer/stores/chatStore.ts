/**
 * Chat Store - Zustand state management for chat
 */

import { create } from 'zustand';
import { ChatMessage } from '@shared/types';

interface ChatState {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  currentModel: string;
  error: string | null;

  // Actions
  addMessage: (message: ChatMessage) => void;
  removeMessage: (id: string) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setLoading: (loading: boolean) => void;
  setCurrentModel: (model: string) => void;
  setError: (error: string | null) => void;
  clearHistory: () => void;
  getMessages: () => ChatMessage[];
  getLastMessage: () => ChatMessage | undefined;
}

const initialState = {
  messages: [],
  isLoading: false,
  currentModel: 'codellama-7b-instruct.Q4_K_M.gguf',
  error: null,
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  removeMessage: (id: string) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    }));
  },

  updateMessage: (id: string, updates: Partial<ChatMessage>) => {
    set((state) => ({
      messages: state.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
    }));
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setCurrentModel: (model: string) => set({ currentModel: model }),

  setError: (error: string | null) => set({ error }),

  clearHistory: () => set({ messages: [], error: null }),

  getMessages: () => get().messages,

  getLastMessage: () => {
    const messages = get().messages;
    return messages.length > 0 ? messages[messages.length - 1] : undefined;
  },
}));
