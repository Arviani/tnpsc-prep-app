'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import {
  LayoutDashboard,
  Library,
  BookOpen,
  Target,
  Book,
  RefreshCcw,
  BarChart,
  Settings,
  UploadCloud,
  HelpCircle,
  Layers,
  BookMarked,
  History,
} from 'lucide-react'

type MenuItem = {
  name: string
  href: string
  icon: any
  exact?: boolean
}

const studentMenuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Subjects', href: '/subjects', icon: Library },
  { name: 'PYQ', href: '/pyq', icon: BookOpen },
  { name: 'Quiz', href: '/quiz', icon: Target },
  { name: 'Books', href: '/books', icon: Book },
  { name: 'Revision', href: '/revision', icon: RefreshCcw },
  { name: 'Progress', href: '/progress', icon: BarChart },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const adminMenuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Import', href: '/admin/import', icon: UploadCloud },
  { name: 'Questions', href: '/admin/questions', icon: HelpCircle },
  { name: 'Subjects', href: '/subjects', icon: BookOpen },
  { name: 'Books', href: '/admin/books', icon: BookMarked },
  { name: 'History', href: '/admin/import-history', icon: History },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { workspace } = useWorkspace()

  const menuItems = workspace === 'admin' ? adminMenuItems : studentMenuItems

  return (
    <aside className="h-full shrink-0">
      <div className="h-full w-[60px] bg-sidebar rounded-lg flex flex-col items-center py-4">
        <nav className="flex-1 overflow-y-auto w-full px-1.5 space-y-1.5 flex flex-col items-center scrollbar-none">
          {menuItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href) && item.href !== '/admin'
            
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 rounded-lg w-full py-2.5 transition-all duration-200 group relative',
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                )}
                title={item.name}
              >
                <Icon size={20} className={cn("transition-transform group-hover:scale-110", isActive ? "text-indigo-400" : "")} />
                <span className="text-[10px] font-medium tracking-tight text-center leading-none mt-0.5 truncate w-full px-0.5" style={{ fontSize: item.name.length > 7 ? '9px' : '10px' }}>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
