import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ModelUsage {
  sessionMessages: number;
  todayMessages: number;
  weeklyMessages: number;
  fallbackCount: number;
  lastResetTime: number; // timestamp
}

interface ModelUsageState {
  usages: Record<string, ModelUsage>;
  incrementUsage: (modelId: string, wasFallback?: boolean) => void;
  resetIfNeeded: () => void;
  resetSession: () => void;
}

const getNextSundayMidnight = () => {
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
  if (now.getDay() === 0 && now.getHours() === 0 && now.getMinutes() === 0) {
    // If exactly sunday midnight, push to next sunday
    nextSunday.setDate(now.getDate() + 7);
  }
  nextSunday.setHours(0, 0, 0, 0);
  return nextSunday.getTime();
};

export const useModelUsageStore = create<ModelUsageState>()(
  persist(
    (set, get) => ({
      usages: {},

      incrementUsage: (modelId: string, wasFallback = false) => {
        get().resetIfNeeded();
        
        set((state) => {
          const prev = state.usages[modelId] || {
            sessionMessages: 0,
            todayMessages: 0,
            weeklyMessages: 0,
            fallbackCount: 0,
            lastResetTime: getNextSundayMidnight()
          };

          return {
            usages: {
              ...state.usages,
              [modelId]: {
                ...prev,
                sessionMessages: prev.sessionMessages + 1,
                todayMessages: prev.todayMessages + 1,
                weeklyMessages: prev.weeklyMessages + 1,
                fallbackCount: prev.fallbackCount + (wasFallback ? 1 : 0)
              }
            }
          };
        });
      },

      resetIfNeeded: () => {
        const now = Date.now();
        set((state) => {
          const newUsages = { ...state.usages };
          let changed = false;

          Object.keys(newUsages).forEach(modelId => {
            const usage = newUsages[modelId];
            if (now >= usage.lastResetTime) {
              newUsages[modelId] = {
                ...usage,
                weeklyMessages: 0,
                lastResetTime: getNextSundayMidnight()
              };
              changed = true;
            }
          });

          return changed ? { usages: newUsages } : {};
        });
      },

      resetSession: () => {
        set((state) => {
          const newUsages = { ...state.usages };
          Object.keys(newUsages).forEach(modelId => {
            newUsages[modelId] = {
              ...newUsages[modelId],
              sessionMessages: 0
            };
          });
          return { usages: newUsages };
        });
      }
    }),
    {
      name: 'tnpsc-ai-usage-storage',
    }
  )
);
