import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PracticeEngine } from '@/components/practice/PracticeEngine'
import { Question } from '@/types/question'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function PYQPracticePage({ params }: { params: Promise<{ paperId: string }> }) {
  const { paperId } = await params
  const supabase = await createClient()

  // 1. Fetch Paper
  const { data: paper, error: paperError } = await supabase
    .from('pyq_papers')
    .select('*')
    .eq('id', paperId)
    .single()

  if (paperError || !paper) {
    return notFound()
  }

  // 2. Fetch Mapped Questions
  const { data: mappings, error: mapError } = await supabase
    .from('pyq_paper_questions')
    .select('question_id, display_order')
    .eq('paper_id', paperId)
    .order('display_order', { ascending: true })

  if (mapError || !mappings || mappings.length === 0) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-4">No questions found</h2>
        <p className="text-muted-foreground mb-6">This paper does not have any questions mapped to it.</p>
        <Link href={`/pyq/${paperId}`} className="text-primary hover:underline">Go Back</Link>
      </div>
    )
  }

  const questionIds = mappings.map(m => m.question_id)

  // 3. Fetch Full Questions with Options and Explanations
  const { data: questionsData, error: qError } = await supabase
    .from('questions')
    .select(`
      id,
      body,
      marks,
      is_pyq,
      options ( id, body, label, is_correct ),
      explanations ( id, body )
    `)
    .in('id', questionIds)

  if (qError || !questionsData) {
    return <div className="p-8 text-destructive text-center">Failed to load questions.</div>
  }

  // 4. Sort questions to match mapping order
  const questionsMap = new Map(questionsData.map(q => [q.id, q]))
  const sortedQuestions = mappings
    .map(m => questionsMap.get(m.question_id))
    .filter(Boolean) as Question[]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/20 w-full">
      <PracticeEngine 
        paperId={paperId}
        type="pyq_practice"
        chapterTitle={`${paper.exam} ${paper.year} - Practice`}
        questions={sortedQuestions} 
      />
    </div>
  )
}
