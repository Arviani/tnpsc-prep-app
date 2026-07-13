import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { attemptService } from '@/services/attemptService'
import { Question } from '@/types/question'
import { ROUTES } from '@/constants/routes'

interface UsePracticeProps {
  chapterId?: string | null
  subjectId?: string | null
  paperId?: string | null
  type?: 'practice' | 'pyq_practice' | 'pyq_exam'
  questions: Question[]
}

export function usePractice({ chapterId, subjectId, paperId, type = 'practice', questions }: UsePracticeProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [startedAt] = useState(() => new Date().toISOString())
  
  // Overall test submission status
  const [isTestSubmitted, setIsTestSubmitted] = useState(false)

  const currentQuestion = questions[currentIndex]
  const sortedOptions = currentQuestion ? [...currentQuestion.options].sort((a, b) => a.label.localeCompare(b.label)) : []

  const selectedOptionId = answers[currentIndex] || null
  const isSubmitted = submitted[currentIndex] || false

  const handleSelectOption = useCallback((optionId: string) => {
    if (isSubmitted || isTestSubmitted) return
    setAnswers(prev => ({ ...prev, [currentIndex]: optionId }))
  }, [currentIndex, isSubmitted, isTestSubmitted])

  const handleSubmit = useCallback(() => {
    if (!selectedOptionId || isSubmitted || isTestSubmitted) return
    const isCorrect = sortedOptions.find(o => o.id === selectedOptionId)?.is_correct
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1)
    }
    setSubmitted(prev => ({ ...prev, [currentIndex]: true }))
  }, [currentIndex, selectedOptionId, isSubmitted, isTestSubmitted, sortedOptions])

  const handleNext = useCallback(async () => {
    if (currentIndex >= questions.length - 1) {
      return
    }
    setCurrentIndex(prev => prev + 1)
  }, [currentIndex, questions.length])

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }, [])

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index)
    }
  }, [questions.length])

  const submitTest = useCallback(async () => {
    if (isTestSubmitted) return
    setIsTestSubmitted(true)
    
    const endedAt = new Date().toISOString()
    const durationSec = Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000)

    try {
      await attemptService.saveSession({
        chapter_id: chapterId || '',
        subject_id: subjectId,
        paper_id: paperId,
        type: type,
        total_questions: questions.length,
        correct: correctAnswers,
        started_at: startedAt,
        ended_at: endedAt,
        duration_sec: durationSec
      })
    } catch (err) {
      alert('Unable to save your results.')
    }

    if (paperId) {
      router.push(`${ROUTES.RESULT}?correct=${correctAnswers}&total=${questions.length}&paperId=${paperId}&mode=practice`)
    } else {
      router.push(`${ROUTES.RESULT}?correct=${correctAnswers}&total=${questions.length}&chapterId=${chapterId}`)
    }
  }, [isTestSubmitted, questions.length, router, correctAnswers, chapterId, subjectId, paperId, type, startedAt])

  // Keyboard Accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

      if (e.key === 'Enter') {
        e.preventDefault()
        if (!isSubmitted && selectedOptionId) {
          handleSubmit()
        }
      } else if (!isSubmitted && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault()
        if (sortedOptions.length === 0) return

        const currentIndexInOptions = sortedOptions.findIndex(o => o.id === selectedOptionId)
        
        if (e.key === 'ArrowDown') {
          const nextIndex = currentIndexInOptions < sortedOptions.length - 1 ? currentIndexInOptions + 1 : 0
          handleSelectOption(sortedOptions[nextIndex].id)
        } else if (e.key === 'ArrowUp') {
          const prevIndex = currentIndexInOptions > 0 ? currentIndexInOptions - 1 : sortedOptions.length - 1
          handleSelectOption(sortedOptions[prevIndex].id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitted, selectedOptionId, sortedOptions, handleSubmit, handleSelectOption])

  return {
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
  }
}
