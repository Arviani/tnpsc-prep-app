import { ContentArea } from '@/components/common/ContentArea'
import { ContentHeader } from '@/components/common/ContentHeader'
import { createClient } from '@/lib/supabase/server'
import { DailyQuiz } from '@/components/current-affairs/DailyQuiz'

interface PageProps {
  searchParams: {
    id?: string
  }
}

export default async function QuizPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  
  let query = supabase
    .from('current_affair_questions')
    .select('id, question_text, options, correct_answer, explanation, current_affairs!inner(status)')
    .eq('current_affairs.status', 'published')

  if (searchParams.id) {
    query = query.eq('current_affair_id', searchParams.id)
  }

  // Fetch up to 10 questions
  const { data: questions, error } = await query.limit(10)

  if (error) {
    console.error('Failed to load quiz questions:', error)
  }

  // Map out the nested data structure
  const formattedQuestions = questions?.map(q => ({
    id: q.id,
    question_text: q.question_text,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation
  })) || []

  return (
    <ContentArea 
      header={
        <ContentHeader 
          title="Daily Quiz" 
          description="Test your current affairs knowledge." 
        />
      }
    >
      <div className="py-6">
        <DailyQuiz questions={formattedQuestions} />
      </div>
    </ContentArea>
  )
}
