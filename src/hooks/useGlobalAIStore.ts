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

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
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
  
  // Session History
  sessions: ChatSession[];
  currentSessionId: string | null;

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
  
  // Session Actions
  archiveCurrentSession: () => void;
  loadSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, newTitle: string) => void;
  createNewSession: () => void;
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
  sessions: [],
  currentSessionId: null,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set((state) => {
    // Optionally auto-archive on close
    const { messages, currentSessionId, sessions } = state;
    if (messages.length > 0) {
      const title = messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : '');
      let updatedSessions = [...sessions];
      
      if (currentSessionId) {
        updatedSessions = updatedSessions.map(s => 
          s.id === currentSessionId ? { ...s, messages, updatedAt: Date.now() } : s
        );
      } else {
        updatedSessions.push({
          id: Math.random().toString(36).substring(2, 9),
          title,
          messages,
          updatedAt: Date.now()
        });
      }
      return { isOpen: false, messages: [], currentSessionId: null, sessions: updatedSessions };
    }
    return { isOpen: false };
  }),
  setContext: (context) => set({ context }),
  setActions: (actions) => set({ actions }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => {
    const newMessages = [...state.messages, message];
    // Auto-update session if active
    if (state.currentSessionId) {
      const updatedSessions = state.sessions.map(s => 
        s.id === state.currentSessionId ? { ...s, messages: newMessages, updatedAt: Date.now() } : s
      );
      return { messages: newMessages, sessions: updatedSessions };
    }
    return { messages: newMessages };
  }),
  updateLastMessage: (updater) => set((state) => {
    if (state.messages.length === 0) return state;
    const lastIdx = state.messages.length - 1;
    const newMessages = [...state.messages];
    newMessages[lastIdx] = updater(newMessages[lastIdx]);
    
    // Auto-update session if active
    if (state.currentSessionId) {
      const updatedSessions = state.sessions.map(s => 
        s.id === state.currentSessionId ? { ...s, messages: newMessages, updatedAt: Date.now() } : s
      );
      return { messages: newMessages, sessions: updatedSessions };
    }
    return { messages: newMessages };
  }),
  clearHistory: () => set({ messages: [], currentSessionId: null }),
  setCurrentPrompt: (currentPrompt) => set({ currentPrompt }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
  setModelStatus: (modelId, status) => set((state) => ({
    modelStatuses: {
      ...state.modelStatuses,
      [modelId]: status
    }
  })),

  archiveCurrentSession: () => set((state) => {
    const { messages, currentSessionId, sessions } = state;
    if (messages.length === 0) return state;
    
    const title = messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : '');
    let updatedSessions = [...sessions];
    
    if (currentSessionId) {
      updatedSessions = updatedSessions.map(s => 
        s.id === currentSessionId ? { ...s, messages, updatedAt: Date.now() } : s
      );
    } else {
      updatedSessions.push({
        id: Math.random().toString(36).substring(2, 9),
        title,
        messages,
        updatedAt: Date.now()
      });
    }
    return { sessions: updatedSessions };
  }),
  loadSession: (id) => set((state) => {
    const session = state.sessions.find(s => s.id === id);
    if (session) {
      return { messages: session.messages, currentSessionId: id };
    }
    return state;
  }),
  deleteSession: (id) => set((state) => {
    const filtered = state.sessions.filter(s => s.id !== id);
    if (state.currentSessionId === id) {
      return { sessions: filtered, messages: [], currentSessionId: null };
    }
    return { sessions: filtered };
  }),
  renameSession: (id, newTitle) => set((state) => ({
    sessions: state.sessions.map(s => s.id === id ? { ...s, title: newTitle } : s)
  })),
  createNewSession: () => set((state) => {
    // If there's an ongoing unarchived chat, archive it first
    if (state.messages.length > 0 && !state.currentSessionId) {
      const title = state.messages[0].content.substring(0, 30) + (state.messages[0].content.length > 30 ? '...' : '');
      return {
        messages: [],
        currentSessionId: null,
        sessions: [
          ...state.sessions,
          {
            id: Math.random().toString(36).substring(2, 9),
            title,
            messages: state.messages,
            updatedAt: Date.now()
          }
        ]
      };
    }
    return { messages: [], currentSessionId: null };
  }),
}));
