import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutState {
  isSubjectsCollapsed: boolean
  toggleSubjectsCollapsed: () => void
  setSubjectsCollapsed: (collapsed: boolean) => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isSubjectsCollapsed: false,
      toggleSubjectsCollapsed: () => 
        set((state) => ({ isSubjectsCollapsed: !state.isSubjectsCollapsed })),
      setSubjectsCollapsed: (collapsed) => 
        set({ isSubjectsCollapsed: collapsed }),
    }),
    {
      name: 'tnpsc_layout_settings',
    }
  )
)
