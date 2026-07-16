import { cn } from '@/lib/utils'

interface SecondarySidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SecondarySidebar({ children, className, ...props }: SecondarySidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-[280px] border-r border-[#E8E8E8] bg-white h-full shrink-0 overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}
