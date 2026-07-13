'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface PracticeFooterProps {
  isSubmitted: boolean
  hasSelection: boolean
  isLastQuestion: boolean
  onSubmit: () => void
  onNext: () => void
}

export function PracticeFooter({
  isSubmitted,
  hasSelection,
  isLastQuestion,
  onSubmit,
  onNext,
}: PracticeFooterProps) {
  return (
    <div className="flex justify-end items-center mt-8">
      {!isSubmitted ? (
        <Button 
          className="font-bold px-10" 
          disabled={!hasSelection}
          onClick={onSubmit}
        >
          Submit
        </Button>
      ) : (
        <Button 
          className="font-bold px-10" 
          onClick={onNext}
        >
          {isLastQuestion ? 'Finish Practice' : 'Next Question'}
          {!isLastQuestion && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      )}
    </div>
  )
}
