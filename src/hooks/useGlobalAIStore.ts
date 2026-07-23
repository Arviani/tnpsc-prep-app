import { create } from 'zustand';
import { TopicContext } from '@/lib/ai/context';
import { LucideIcon } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  modelId?: string; // The ID of the model that generated this message
  wasFallback?: boolean; // True if this message was generated after an automatic fallback
  fallbackMessage?: string; // e.g., "Gemma has reached its rate limit. Switched automatically to Qwen 3."
}

export interface ActionButton {
  label: string;
  icon: LucideIcon;
  prompt: string;
}

interface GlobalAIState {
  isOpen: boolean;
  context: TopicContext | null;
  actions: ActionButton[];
  messages: ChatMessage[];
  currentPrompt: string | null;
  isLoading: boolean;
  selectedModelId: string | null; // The currently selected model
  modelStatuses: Record<string, 'available' | 'busy' | 'rate-limited' | 'disabled'>;
  
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  setContext: (context: TopicContext) => void;
  setActions: (actions: ActionButton[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (updater: (msg: ChatMessage) => ChatMessage) => void;
  clearHistory: () => void;
  setCurrentPrompt: (prompt: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedModelId: (modelId: string | null) => void;
  setModelStatus: (modelId: string, status: 'available' | 'busy' | 'rate-limited' | 'disabled') => void;
}

export const useGlobalAIStore = create<GlobalAIState>((set) => ({
  isOpen: false,
  context: null,
  actions: [],
  messages: [],
  currentPrompt: null,
  isLoading: false,
  selectedModelId: null,
  modelStatuses: {},

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setContext: (context) => set({ context }),
  setActions: (actions) => set({ actions }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (updater) => set((state) => {
    if (state.messages.length === 0) return state;
    const lastIdx = state.messages.length - 1;
    const newMessages = [...state.messages];
    newMessages[lastIdx] = updater(newMessages[lastIdx]);
    return { messages: newMessages };
  }),
  clearHistory: () => set({ messages: [] }),
  setCurrentPrompt: (currentPrompt) => set({ currentPrompt }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
  setModelStatus: (modelId, status) => set((state) => ({
    modelStatuses: {
      ...state.modelStatuses,
      [modelId]: status
    }
  })),
}));
