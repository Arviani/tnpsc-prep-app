'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Subject } from '@/types/subject'
import { BookOpen, Newspaper } from 'lucide-react'

export function SecondarySidebarNav({ subjects }: { subjects: Subject[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
      <Link
        href={`/subjects/current-affairs`}
        className={cn(
          "group flex items-center justify-between px-3 py-2.5 text-sm transition-all duration-200 rounded-xl mb-2",
          pathname.startsWith(`/subjects/current-affairs`)
            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-500/20" 
            : "text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
        )}
      >
        <div className="flex items-center gap-3">
          <Newspaper className={cn(
            "w-4 h-4 transition-colors",
            pathname.startsWith(`/subjects/current-affairs`) ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground group-hover:text-foreground"
          )} />
          <span>Current Affairs</span>
        </div>
      </Link>

      {subjects?.map((subject) => {
        const isActive = pathname.startsWith(`/subjects/${subject.id}`)

        return (
          <Link
            key={subject.id}
            href={`/subjects/${subject.id}`}
            className={cn(
              "group flex items-center justify-between px-3 py-2.5 text-sm transition-all duration-200 rounded-xl",
              isActive 
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-500/20" 
                : "text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
            )}
          >
            <div className="flex items-center gap-3">
              <BookOpen className={cn(
                "w-4 h-4 transition-colors",
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <span>{subject.name}</span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
