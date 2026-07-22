'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Subject } from '@/types/subject'
import { BookOpen } from 'lucide-react'

// Mock progress data for visual demonstration
const MOCK_PROGRESS: Record<string, number> = {
  'History': 72,
  'Reasoning': 35,
  'Polity': 0,
  'Geography': 15,
}

export function SecondarySidebarNav({ subjects }: { subjects: Subject[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
      {subjects?.map((subject) => {
        const isActive = pathname.startsWith(`/subjects/${subject.id}`)
        const progress = MOCK_PROGRESS[subject.name] || 0

        return (
          <Link
            key={subject.id}
            href={`/subjects/${subject.id}`}
            className={cn(
              "group flex items-center justify-between px-3 py-2.5 text-sm transition-all duration-200 rounded-xl",
              isActive 
                ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-100" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
            )}
          >
            <div className="flex items-center gap-3">
              <BookOpen className={cn(
                "w-4 h-4 transition-colors",
                isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              <span>{subject.name}</span>
            </div>
            {progress > 0 && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                isActive 
                  ? "bg-indigo-100 text-indigo-700" 
                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              )}>
                {progress}%
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
