'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Question } from '@/types/question'
import { attemptService } from '@/services/attemptService'
import { ROUTES } from '@/constants/routes'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'

export function PYQExamEngine({ paperId, title, durationMinutes, questions }: { paperId: string, title: string, durationMinutes: number, questions: Question[] }) {
  const router = useRouter()
  
  const [startedAt] = useState(() => new Date().toISOString())
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({}) // questionId -> optionId
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = questions[currentIndex]
  const sortedOptions = currentQuestion ? [...currentQuestion.options].sort((a, b) => a.label.localeCompare(b.label)) : []

  const handleSubmitExam = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    
    // Calculate Score
    let correctCount = 0
    
    for (const q of questions) {
      const selectedId = answers[q.id]
      if (!selectedId) continue
      const isCorrect = q.options.find(o => o.id === selectedId)?.is_correct
      if (isCorrect) correctCount++
    }
    
    const endedAt = new Date().toISOString()
    const durationSec = Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000)

    try {
      await attemptService.saveSession({
        chapter_id: '',
        paper_id: paperId,
        type: 'pyq_exam',
        total_questions: questions.length,
        correct: correctCount,
        started_at: startedAt,
        ended_at: endedAt,
        duration_sec: durationSec
      })
    } catch (err) {
      console.error('Failed to save exam session', err)
    }

    router.push(`${ROUTES.RESULT}?correct=${correctCount}&total=${questions.length}&paperId=${paperId}&mode=exam`)
  }, [isSubmitting, answers, questions, startedAt, paperId, router])

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      setTimeout(() => {
        handleSubmitExam()
      }, 0)
      return
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, handleSubmitExam])

  const handleSelectOption = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }))
  }



  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const answeredCount = Object.keys(answers).length

  return (
    <div className="w-full h-full flex flex-col bg-background p-3 md:p-4 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between bg-card border border-border p-3 rounded-md shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-7 w-7 -ml-1">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-semibold text-[14px] hidden md:block truncate max-w-sm">{title}</h2>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 font-mono text-[14px] font-bold bg-surface-muted px-2.5 py-1 rounded text-primary">
             <Clock className="w-4 h-4" />
             {formatTime(timeLeft)}
           </div>
           <Button onClick={handleSubmitExam} disabled={isSubmitting} variant="destructive" className="font-semibold h-7 text-[12px] px-3">
             {isSubmitting ? 'Submitting...' : 'Submit Exam'}
           </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-stretch flex-1 min-h-0">
        {/* Main Question Area */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-3 h-full">
          <div className="bg-card border border-border rounded-md p-4 shadow-sm flex flex-col min-h-0 flex-1">
            <div className="flex items-center justify-between mb-4 shrink-0 border-b border-border-subtle pb-3">
              <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            
            <div className="w-full flex-1 min-h-0 overflow-y-auto pr-3 -mr-3 custom-scrollbar">
              <h2 className="text-[15px] font-semibold text-foreground mb-4 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.body}
              </h2>
              
              <div className="flex flex-col gap-2 pb-4 mt-5">
                {sortedOptions.map((option) => (
                  <div 
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`flex w-full items-start md:items-center gap-3 p-2.5 rounded-md border transition-all cursor-pointer ${
                      answers[currentQuestion.id] === option.id 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : 'border-border bg-card hover:bg-secondary hover:border-border-strong'
                    }`}
                  >
                    <div className="pt-0.5 md:pt-0 shrink-0">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                        answers[currentQuestion.id] === option.id
                          ? 'border-primary bg-primary'
                          : 'border-border-strong bg-background'
                      }`}>
                        {answers[currentQuestion.id] === option.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex gap-2 min-w-0">
                      <span className="font-semibold text-muted-foreground w-4 shrink-0 text-[14px]">{option.label}.</span>
                      <span className="font-medium text-foreground text-[14px] leading-snug break-words whitespace-pre-wrap">{option.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-card border border-border p-3 rounded-md shrink-0 shadow-sm">
             <div className="flex items-center gap-2">
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                 disabled={currentIndex === 0}
                 className="flex items-center gap-1.5 h-8 text-xs"
               >
                 <ChevronLeft className="w-3.5 h-3.5" /> Previous
               </Button>
               
               <Button 
                 variant="outline"
                 size="sm"
                 onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                 disabled={currentIndex === questions.length - 1}
                 className="h-8 text-xs"
               >
                 Skip
               </Button>
             </div>
             
             <Button 
               size="sm"
               onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
               disabled={currentIndex === questions.length - 1}
               className="flex items-center gap-1.5 font-semibold h-8 text-xs px-4"
             >
               Next <ChevronRight className="w-3.5 h-3.5" />
             </Button>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0 bg-card border border-border rounded-md p-4 flex flex-col h-full min-h-0 shadow-sm">
          <div className="mb-3 shrink-0 border-b border-border-subtle pb-3">
            <h3 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Question Palette</h3>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">Answered:</span>
              <span className="font-bold text-primary">{answeredCount} / {questions.length}</span>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-5 gap-1.5 pb-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id]
              const isCurrent = idx === currentIndex
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 w-full flex items-center justify-center rounded-sm text-xs font-medium transition-colors border ${
                    isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''
                  } ${
                    isAnswered 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 border-transparent'
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-border-subtle flex gap-4 text-[11px] font-medium shrink-0">
             <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 bg-primary rounded-[2px]"></div> Answered
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
