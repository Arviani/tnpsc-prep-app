'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ProgressHeaderProps {
  currentIndex: number
  totalQuestions: number
}

export function ProgressHeader({ currentIndex, totalQuestions }: ProgressHeaderProps) {
  const router = useRouter()
  const progressPercent = Math.round(((currentIndex) / totalQuestions) * 100)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <Button variant="ghost" className="text-muted-foreground font-semibold" onClick={() => router.back()}>
          Exit Practice
        </Button>
      </div>
      <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
        <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  )
}
