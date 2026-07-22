"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TopicTabsProps {
  subjectId: string
  topicId: string
}

export function TopicTabs({ subjectId, topicId }: TopicTabsProps) {
  const pathname = usePathname()
  const basePath = `/subjects/${subjectId}/topics/${topicId}`

  const tabs = [
    { label: 'Overview', href: basePath },
    { label: 'Study', href: `${basePath}/study` },
    { label: 'Examples', href: `${basePath}/examples` },
    { label: 'Practice', href: `${basePath}/practice` },
    { label: 'Topic Quiz', href: `${basePath}/quiz` },
    { label: 'PYQs', href: `${basePath}/pyqs` },
    { label: 'Revision', href: `${basePath}/revision` },
    { label: 'Performance', href: `${basePath}/performance` },
  ]

  return (
    <div className="flex items-center gap-1 mt-6 overflow-x-auto no-scrollbar mb-2">
      {tabs.map((tab) => {
        // If href is exactly basePath, only match if pathname is exactly basePath
        // Otherwise, match if pathname starts with href
        const isActive = tab.href === basePath 
          ? pathname === basePath
          : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              "px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors rounded-full",
              isActive 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
