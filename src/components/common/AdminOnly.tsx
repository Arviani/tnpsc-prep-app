"use client"

import React from 'react'
import { useWorkspace } from '@/contexts/WorkspaceContext'

interface AdminOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { workspace } = useWorkspace()
  
  if (workspace !== 'admin') {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
