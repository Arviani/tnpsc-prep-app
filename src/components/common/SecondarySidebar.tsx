import { cn } from '@/lib/utils'

interface SecondarySidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SecondarySidebar({ children, className, ...props }: SecondarySidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-[280px] border-r border-border bg-background h-full shrink-0 overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}
