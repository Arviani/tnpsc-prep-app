'use client'

import { useLayoutStore } from '@/store/layout.store'
import { PanelLeftClose } from 'lucide-react'

export function CollapseSubjectsButton() {
  const { toggleSubjectsCollapsed } = useLayoutStore()

  return (
    <button
      onClick={toggleSubjectsCollapsed}
      className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition-colors"
      title="Collapse Subjects"
      aria-label="Collapse Subjects"
    >
      <PanelLeftClose size={16} />
    </button>
  )
}
