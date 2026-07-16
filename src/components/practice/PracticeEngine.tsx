'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePractice } from '@/hooks/usePractice'

import { QuestionCard } from './QuestionCard'
import { OptionCard } from './OptionCard'
import { ExplanationCard } from './ExplanationCard'
import { Question } from '@/types/question'

interface PracticeEngineProps {
  chapterId?: string | null
  subjectId?: string | null
  paperId?: string | null
  type?: 'practice' | 'pyq_practice' | 'pyq_exam'
  chapterTitle?: string
  questions: Question[]
}

export function PracticeEngine({ chapterId, subjectId, paperId, type, chapterTitle, questions }: PracticeEngineProps) {
  const router = useRouter()

  const {
    currentIndex,
    currentQuestion,
    sortedOptions,
    selectedOptionId,
    isSubmitted,
    answers,
    submitted,
    isTestSubmitted,
    handleSelectOption,
    handleSubmit,
    handleNext,
    handlePrevious,
    goToQuestion,
    submitTest
  } = usePractice({ chapterId, subjectId, paperId, type, questions })

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-card border border-border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.10)]">
        <p className="text-muted-foreground font-medium text-lg">No questions available.</p>
        <Button variant="outline" className="mt-4 font-bold" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  // Extract single explanation safely
  const explanation = Array.isArray(currentQuestion.explanations)
    ? currentQuestion.explanations[0]
    : currentQuestion.explanations

  // Evaluation state
  const selectedOption = sortedOptions.find(o => o.id === selectedOptionId)
  const isCorrect = selectedOption?.is_correct || false

  const answeredCount = Object.keys(answers).length
  const submittedCount = Object.keys(submitted).length

  return (
    <div className="w-full h-full flex flex-col bg-background p-3 md:p-4 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between bg-card border border-border p-3 rounded-md shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-7 w-7 -ml-1">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-semibold text-[14px] hidden md:block truncate max-w-sm">
            {chapterTitle || 'Practice Mode'}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={submitTest} disabled={isTestSubmitted} variant="default" className="font-semibold h-7 text-[12px] px-3">
            {isTestSubmitted ? 'Submitting...' : 'Finish Practice'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-stretch flex-1 min-h-0">
        
        {/* Main Question Area */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-3 h-full">
          
          {/* Question Container */}
          <div className="bg-card border border-border rounded-md p-4 shadow-sm flex flex-col min-h-0 flex-1">
            <div className="flex items-center justify-between mb-4 shrink-0 border-b border-border-subtle pb-3">
              <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="w-full flex-1 min-h-0 overflow-y-auto pr-3 -mr-3 custom-scrollbar">
              {/* Evaluation Feedback */}
              {isSubmitted && (
                <div className={cn(
                  "p-3 mb-4 rounded-md border flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-300",
                  isCorrect ? "bg-success/10 border-success/30 text-success" : "bg-destructive/10 border-destructive/30 text-destructive"
                )}>
                  {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  <span className="text-[14px] font-bold">{isCorrect ? "Correct!" : "Incorrect"}</span>
                </div>
              )}

              <QuestionCard body={currentQuestion.body} />

              <div className="flex flex-col gap-2 pb-4 mt-5">
                {sortedOptions.map((option) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    isSelected={selectedOptionId === option.id}
                    isSubmitted={isSubmitted}
                    onSelect={handleSelectOption}
                  />
                ))}
              </div>

              {isSubmitted && explanation && (
                <div className="pb-4">
                  <ExplanationCard body={explanation.body} />
                </div>
              )}
            </div>
          </div>

          {/* Practice Footer Actions */}
          <div className="flex justify-between items-center bg-card border border-border p-3 rounded-md shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 h-8 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="h-8 text-xs"
              >
                Skip
              </Button>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={isSubmitted ? handleNext : handleSubmit}
              disabled={!isSubmitted && !selectedOptionId}
              className="font-semibold h-8 text-[12px] px-4"
            >
              {isSubmitted ? 'Next Question' : 'Submit Answer'}
            </Button>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0 bg-card border border-border rounded-md p-4 flex flex-col h-full min-h-0 shadow-sm">
          <div className="mb-3 shrink-0 border-b border-border-subtle pb-3">
            <h3 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Question Palette</h3>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Answered:</span>
                <span className="font-bold text-primary">{answeredCount} / {questions.length}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Checked:</span>
                <span className="font-bold text-success">{submittedCount} / {questions.length}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-5 gap-1.5 pb-2">
              {questions.map((q, idx) => {
                const isChecked = !!submitted[idx]
                const isAnswered = !!answers[idx]
                const isCurrent = idx === currentIndex

                let bgClass = 'bg-muted text-muted-foreground hover:bg-muted/80 border-transparent'
                if (isChecked) {
                  // Determine if it was correct or wrong
                  const selectedId = answers[idx]
                  const correctId = q.options.find(o => o.is_correct)?.id
                  if (selectedId === correctId) {
                    bgClass = 'bg-success text-success-foreground border-success'
                  } else {
                    bgClass = 'bg-destructive text-destructive-foreground border-destructive'
                  }
                } else if (isAnswered) {
                  bgClass = 'bg-primary text-primary-foreground border-primary'
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`h-9 w-full flex items-center justify-center rounded-sm text-xs font-medium transition-colors border ${isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''
                      } ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border-subtle flex flex-col gap-1.5 text-[11px] font-medium shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-primary rounded-[2px]"></div> Answered (Not Checked)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-success rounded-[2px]"></div> Correct
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-destructive rounded-[2px]"></div> Incorrect
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-muted border border-border-strong rounded-[2px]"></div> Unanswered
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
