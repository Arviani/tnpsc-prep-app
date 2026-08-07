'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ChevronRight, AlertCircle, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  question_text: string
  options: string[]
  correct_answer: string
  explanation: string
}

export function DailyQuiz({ questions }: { questions: Question[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [answers, setAnswers] = useState<Record<string, { selected: string, isCorrect: boolean }>>({})

  if (!questions || questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="pt-12 pb-12 text-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500 opacity-50" />
          <p>No questions available for this quiz yet.</p>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1

  const handleSelectOption = (option: string) => {
    if (isSubmitted) return
    setSelectedAnswer(option)
  }

  const handleSubmit = () => {
    if (!selectedAnswer) return
    
    const isCorrect = selectedAnswer === currentQuestion.correct_answer
    if (isCorrect) setScore(s => s + 1)
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: { selected: selectedAnswer, isCorrect }
    }))
    
    setIsSubmitted(true)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      setIsFinished(true)
    } else {
      setCurrentIndex(c => c + 1)
      setSelectedAnswer(null)
      setIsSubmitted(false)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsSubmitted(false)
    setScore(0)
    setIsFinished(false)
    setAnswers({})
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100)
    
    return (
      <Card className="max-w-2xl mx-auto border-indigo-100 shadow-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-black">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-8 flex flex-col items-center">
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-slate-800" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" 
                className={percentage >= 70 ? "text-emerald-500" : percentage >= 40 ? "text-amber-500" : "text-rose-500"}
                strokeDasharray={`${(percentage / 100) * 283} 283`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black">{percentage}%</span>
              <span className="text-sm font-medium text-muted-foreground">{score} / {questions.length}</span>
            </div>
          </div>
          
          <p className="text-lg font-medium text-center text-foreground mb-8">
            {percentage >= 80 ? 'Excellent work! You are well prepared.' : 
             percentage >= 50 ? 'Good job! Review the explanations to improve.' : 
             'Keep practicing! Daily revision will help.'}
          </p>

          <Button onClick={handleRestart} size="lg" className="gap-2">
            <RefreshCcw className="w-4 h-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/30 pb-4 border-b">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            Question {currentIndex + 1} <span className="text-muted-foreground font-normal text-sm">of {questions.length}</span>
          </CardTitle>
        </div>
        <div className="text-sm font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
          Score: {score}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <h3 className="text-xl font-medium leading-relaxed text-foreground mb-8">
          {currentQuestion.question_text}
        </h3>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === option
            const isCorrectAnswer = currentQuestion.correct_answer === option
            
            let optionStyles = "border-border bg-card hover:border-indigo-300 hover:bg-indigo-50/50"
            
            if (isSubmitted) {
              if (isCorrectAnswer) {
                optionStyles = "border-emerald-500 bg-emerald-50/80 text-emerald-900"
              } else if (isSelected && !isCorrectAnswer) {
                optionStyles = "border-rose-500 bg-rose-50/80 text-rose-900 opacity-70"
              } else {
                optionStyles = "border-border bg-card opacity-50"
              }
            } else if (isSelected) {
              optionStyles = "border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-sm"
            }

            return (
              <button
                key={idx}
                disabled={isSubmitted}
                onClick={() => handleSelectOption(option)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                  optionStyles
                )}
              >
                <span className="font-medium">{option}</span>
                {isSubmitted && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {isSubmitted && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-rose-600" />}
              </button>
            )
          })}
        </div>

        {isSubmitted && (
          <div className="mt-8 p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
            <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full mr-2"></span>
              Explanation
            </h4>
            <p className="text-sm leading-relaxed text-indigo-950/80">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/10 border-t pt-4 flex justify-between">
        <Button variant="ghost" disabled={currentIndex === 0 || isSubmitted} onClick={() => {
          setCurrentIndex(c => c - 1)
          setSelectedAnswer(null)
          setIsSubmitted(false)
        }}>
          Previous
        </Button>
        
        {!isSubmitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedAnswer}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-2">
            {isLastQuestion ? 'View Results' : 'Next Question'} <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
