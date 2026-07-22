'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

export type WorkspaceType = 'student' | 'admin'

interface WorkspaceContextType {
  workspace: WorkspaceType
  setWorkspace: (ws: WorkspaceType) => void
  userRole: string | null
  isLoading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspaceState] = useState<WorkspaceType>('student')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true

    async function initWorkspace() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (mounted) {
          const role = user?.user_metadata?.role || 'student'
          setUserRole(role)
          
          // 1. Try to read from localStorage first to persist across shared routes (like /subjects)
          const stored = localStorage.getItem('tnpsc_workspace') as WorkspaceType | null
          
          if (stored) {
            setWorkspaceState(stored)
          } 
          // 2. Fallback to route-based inference if no stored value
          else if (pathname.startsWith('/admin')) {
            setWorkspaceState('admin')
            localStorage.setItem('tnpsc_workspace', 'admin')
          } else {
            setWorkspaceState('student')
            localStorage.setItem('tnpsc_workspace', 'student')
          }
        }
      } catch (error) {
        console.error("Error initializing workspace", error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    initWorkspace()

    return () => { mounted = false }
  }, [pathname, router])

  const setWorkspace = (ws: WorkspaceType) => {
    setWorkspaceState(ws)
    localStorage.setItem('tnpsc_workspace', ws)
    
    if (ws === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace, userRole, isLoading }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
