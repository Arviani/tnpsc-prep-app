'use client'

import { cn } from '@/lib/utils'
import { useLayoutStore } from '@/store/layout.store'

interface SecondarySidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SecondarySidebar({ children, className, ...props }: SecondarySidebarProps) {
  const { isSubjectsCollapsed } = useLayoutStore()

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-background h-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
        isSubjectsCollapsed ? "w-0 border-r-0" : "w-[280px]",
        className
      )}
      {...props}
    >
      <div className="w-[280px] flex flex-col h-full shrink-0">
        {children}
      </div>
    </aside>
  )
}
