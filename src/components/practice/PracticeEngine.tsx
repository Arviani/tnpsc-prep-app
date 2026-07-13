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
    <div className="max-w-7xl mx-auto py-6 px-4 md:px-8 h-[calc(100vh)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-card border p-4 rounded-xl mb-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 -ml-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-bold text-lg hidden md:block truncate max-w-sm">
            {chapterTitle || 'Practice Mode'}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={submitTest} disabled={isTestSubmitted} variant="default" className="font-bold">
            {isTestSubmitted ? 'Submitting...' : 'Finish Practice'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-1 min-h-0">

        {/* Main Question Area */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-4 h-full">

          {/* Question Container */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-[0_4px_10px_rgba(13,21,48,0.05)] flex flex-col min-h-0 flex-1">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="w-full flex-1 min-h-0 overflow-y-auto pr-4 -mr-4 custom-scrollbar">
              {/* Evaluation Feedback */}
              {isSubmitted && (
                <div className={cn(
                  "p-4 mb-6 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 fade-in duration-300",
                  isCorrect ? "bg-success/10 border-success/30 text-success" : "bg-destructive/10 border-destructive/30 text-destructive"
                )}>
                  {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  <span className="text-lg font-bold">{isCorrect ? "Correct!" : "Incorrect"}</span>
                </div>
              )}

              <QuestionCard body={currentQuestion.body} />

              <div className="flex flex-col gap-3 pb-6 mt-6">
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
                <div className="pb-6">
                  <ExplanationCard body={explanation.body} />
                </div>
              )}
            </div>
          </div>

          {/* Practice Footer Actions */}
          <div className="flex justify-between items-center bg-card border p-4 rounded-xl shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
              >
                Skip
              </Button>
            </div>

            <Button
              variant="default"
              onClick={isSubmitted ? handleNext : handleSubmit}
              disabled={!isSubmitted && !selectedOptionId}
              className="font-bold"
            >
              {isSubmitted ? 'Next Question' : 'Submit Answer'}
            </Button>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="w-full lg:w-80 shrink-0 bg-card border rounded-xl p-5 flex flex-col h-full min-h-0">
          <div className="mb-4 shrink-0">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-1">Question Palette</h3>
            <div className="flex gap-2">
              <p className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md inline-block">
                Answered: {answeredCount} / {questions.length}
              </p>
              <p className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-md inline-block">
                Checked: {submittedCount} / {questions.length}
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-1 -m-1 custom-scrollbar">
            <div className="grid grid-cols-5 gap-2 pb-4">
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
                    className={`h-10 rounded-md text-sm font-bold transition-colors border ${isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''
                      } ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="pt-4 mt-2 border-t flex flex-col gap-2 text-xs font-medium shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-sm"></div> Answered (Not Checked)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-sm"></div> Correct
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-sm"></div> Incorrect
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted border rounded-sm"></div> Unanswered
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
