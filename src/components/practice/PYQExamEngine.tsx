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
    <div className="max-w-7xl mx-auto py-6 px-4 md:px-8 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-card border p-4 rounded-xl mb-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 -ml-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-bold text-lg hidden md:block truncate max-w-sm">{title}</h2>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 font-mono text-xl font-bold bg-muted px-4 py-2 rounded-lg text-primary">
             <Clock className="w-5 h-5" />
             {formatTime(timeLeft)}
           </div>
           <Button onClick={handleSubmitExam} disabled={isSubmitting} variant="destructive">
             {isSubmitting ? 'Submitting...' : 'Submit Exam'}
           </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-1 min-h-0">
        {/* Main Question Area */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-4 h-full">
          <div className="bg-card border rounded-xl p-6 md:p-8 flex flex-col min-h-0 flex-1">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            
            <div className="w-full flex-1 min-h-0 overflow-y-auto pr-4 -mr-4 custom-scrollbar">
              <div className="prose prose-slate max-w-none mb-8 whitespace-pre-wrap text-lg">
                {currentQuestion.body}
              </div>
              
              <div className="flex flex-col gap-3 pb-6">
                {sortedOptions.map((option) => (
                  <div 
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex gap-4 ${
                      answers[currentQuestion.id] === option.id 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-border bg-card hover:bg-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg font-bold text-sm ${
                      answers[currentQuestion.id] === option.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted-foreground/10 text-muted-foreground'
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-base font-medium leading-relaxed flex-1 mt-0.5">
                      {option.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-card border p-4 rounded-xl shrink-0">
             <div className="flex items-center gap-3">
               <Button 
                 variant="outline" 
                 onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                 disabled={currentIndex === 0}
                 className="flex items-center gap-2"
               >
                 <ChevronLeft className="w-4 h-4" /> Previous
               </Button>
               
               <Button 
                 variant="outline"
                 onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                 disabled={currentIndex === questions.length - 1}
               >
                 Skip
               </Button>
             </div>
             
             <Button 
               onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
               disabled={currentIndex === questions.length - 1}
               className="flex items-center gap-2"
             >
               Next <ChevronRight className="w-4 h-4" />
             </Button>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="w-full lg:w-80 shrink-0 bg-card border rounded-xl p-5 flex flex-col h-full min-h-0">
          <div className="mb-4 shrink-0">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-1">Question Palette</h3>
            <p className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md inline-block">
              Answered: {answeredCount} / {questions.length}
            </p>
          </div>
          
          <div className="flex-1 min-h-0 overflow-y-auto p-1 -m-1 custom-scrollbar">
            <div className="grid grid-cols-5 gap-2 pb-4">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id]
              const isCurrent = idx === currentIndex
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-md text-sm font-bold transition-colors border ${
                    isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''
                  } ${
                    isAnswered 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
            </div>
          </div>
          <div className="pt-4 mt-2 border-t flex gap-4 text-xs font-medium shrink-0">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-primary rounded-sm"></div> Answered
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
