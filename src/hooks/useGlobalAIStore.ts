import { create } from 'zustand';
import { TopicContext } from '@/lib/ai/context';
import { LucideIcon } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ActionButton {
  label: string;
  icon: LucideIcon;
  prompt: string; // The text that will be sent when clicked
}

interface GlobalAIState {
  isOpen: boolean;
  context: TopicContext | null;
  actions: ActionButton[];
  messages: ChatMessage[];
  currentPrompt: string | null;
  isLoading: boolean;
  
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  setContext: (context: TopicContext) => void;
  setActions: (actions: ActionButton[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  clearHistory: () => void;
  setCurrentPrompt: (prompt: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useGlobalAIStore = create<GlobalAIState>((set) => ({
  isOpen: false,
  context: null,
  actions: [],
  messages: [],
  currentPrompt: null,
  isLoading: false,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setContext: (context) => set({ context }),
  setActions: (actions) => set({ actions }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearHistory: () => set({ messages: [] }),
  setCurrentPrompt: (currentPrompt) => set({ currentPrompt }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
