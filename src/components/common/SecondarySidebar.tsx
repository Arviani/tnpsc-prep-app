import { cn } from '@/lib/utils'

interface SecondarySidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SecondarySidebar({ children, className, ...props }: SecondarySidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-64 border-r bg-muted/10 h-screen sticky top-0 shrink-0 overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}
