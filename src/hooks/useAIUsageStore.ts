import { create } from 'zustand';
import { toast } from 'sonner';

interface AIUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensToday: number;
  averageResponseTime: number;
  dailyTokenLimit: number;
  tokenUsagePercentage: number;
  estimatedCost: number;
}

interface AIUsageState {
  stats: AIUsageStats | null;
  isLoading: boolean;
  fetchUsage: () => Promise<void>;
}

export const useAIUsageStore = create<AIUsageState>((set) => ({
  stats: null,
  isLoading: false,
  fetchUsage: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/ai/usage');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          set({ stats: data.stats, isLoading: false });
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI usage:', error);
      set({ isLoading: false });
    }
  },
  showUsageToast: (consumedTokens: number) => {
    const state = useAIUsageStore.getState();
    const balance = state.stats ? state.stats.dailyTokenLimit - state.stats.totalTokensToday - consumedTokens : '...';
    
    toast.success('AI Usage Logged', {
      description: `Consumed: ${consumedTokens} tokens | Balance: ${balance} tokens (Free Tier)`,
      duration: 4000,
      position: 'bottom-right'
    });
    
    // Refresh the store softly
    state.fetchUsage();
  }
}));
