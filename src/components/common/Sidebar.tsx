'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Library,
  BookOpen,
  Target,
  Book,
  RefreshCcw,
  BarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Subjects', href: '/subjects', icon: Library },
  { name: 'Previous Year Questions', href: '/pyq', icon: BookOpen },
  { name: 'Daily Quiz', href: '/quiz', icon: Target },
  { name: 'School Books', href: '/books', icon: Book },
  { name: 'Revision', href: '/revision', icon: RefreshCcw },
  { name: 'Progress', href: '/progress', icon: BarChart },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'sticky top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r bg-background flex flex-col shrink-0',
        collapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      <div className="flex h-14 items-center justify-between px-4 border-b">
        {!collapsed && (
          <span className="text-lg font-semibold truncate">TNPSC Prep</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', collapsed && 'mx-auto')}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-secondary text-primary font-bold'
                  : 'text-muted-foreground hover:bg-secondary hover:text-primary',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
