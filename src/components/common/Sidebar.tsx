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
} from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Subjects', href: '/subjects', icon: Library },
  { name: 'PYQ', href: '/pyq', icon: BookOpen },
  { name: 'Quiz', href: '/quiz', icon: Target },
  { name: 'Books', href: '/books', icon: Book },
  { name: 'Revision', href: '/revision', icon: RefreshCcw },
  { name: 'Progress', href: '/progress', icon: BarChart },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="h-full shrink-0">
      <div className="h-full w-[60px] bg-[#1A1A1A] rounded-xl flex flex-col items-center py-4">
        <nav className="flex-1 overflow-y-auto w-full px-1.5 space-y-1.5 flex flex-col items-center scrollbar-none">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 rounded-lg w-full py-2.5 transition-all duration-200 group relative',
                  isActive
                    ? 'bg-white/15 shadow-[0_0_15px_rgba(255,255,255,0.1)] text-white'
                    : 'text-[#888888] hover:bg-white/5 hover:text-white'
                )}
                title={item.name}
              >
                <Icon size={20} className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "")} />
                <span className="text-[10px] font-medium tracking-tight text-center leading-none mt-0.5">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
