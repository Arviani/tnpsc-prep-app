'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Subject } from '@/types/subject'

export function SecondarySidebarNav({ subjects }: { subjects: Subject[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 overflow-y-auto p-2 space-y-1">
      {subjects?.map((subject) => {
        const isActive = pathname === `/subjects/${subject.id}`
        return (
          <Link
            key={subject.id}
            href={`/subjects/${subject.id}`}
            className={cn(
              "block px-3 py-2 text-sm transition-colors",
              isActive 
                ? "bg-secondary text-primary font-bold" 
                : "text-muted-foreground hover:bg-secondary hover:text-primary font-medium"
            )}
          >
            {subject.name}
          </Link>
        )
      })}
    </nav>
  )
}
