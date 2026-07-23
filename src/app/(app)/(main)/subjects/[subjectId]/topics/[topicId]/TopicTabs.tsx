"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Hash, List, Kanban, Calendar, View, LayoutDashboard, BookOpen, Target, ClipboardList, History, RotateCcw, BarChart2 } from 'lucide-react'

interface TopicTabsProps {
  subjectId: string
  topicId: string
}

export function TopicTabs({ subjectId, topicId }: TopicTabsProps) {
  const pathname = usePathname()
  const basePath = `/subjects/${subjectId}/topics/${topicId}`

  const tabs = [
    { label: 'Overview', href: basePath, icon: LayoutDashboard },
    { label: 'Study', href: `${basePath}/study`, icon: BookOpen },
    { label: 'Examples', href: `${basePath}/examples`, icon: List },
    { label: 'Practice', href: `${basePath}/practice`, icon: Target },
    { label: 'Topic Quiz', href: `${basePath}/quiz`, icon: ClipboardList },
    { label: 'PYQs', href: `${basePath}/pyqs`, icon: History },
    { label: 'Revision', href: `${basePath}/revision`, icon: RotateCcw },
    { label: 'Performance', href: `${basePath}/performance`, icon: BarChart2 },
  ]

  return (
    <div className="flex items-center gap-6 mt-2 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        // If href is exactly basePath, only match if pathname is exactly basePath
        // Otherwise, match if pathname starts with href
        const isActive = tab.href === basePath 
          ? pathname === basePath
          : pathname.startsWith(tab.href)
        
        const Icon = tab.icon

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 pb-1.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2",
              isActive 
                ? "border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground")} />
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
