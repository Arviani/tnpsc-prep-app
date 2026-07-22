import { chapterService } from '@/services/chapter.service'
import { questionService } from '@/services/question.service'
import { notFound } from 'next/navigation'
import { ContentArea } from '@/components/common/ContentArea'
import { PracticeEngine } from '@/components/practice/PracticeEngine'
import { Question } from '@/types/question'

export default async function PracticePage({
  params,
}: {
  params: Promise<{ chapterId: string }>
}) {
  const { chapterId } = await params

  let chapter = null
  try {
    chapter = await chapterService.getChapter(chapterId)
  } catch (error) {
    // handled below
  }

  if (!chapter) {
    notFound()
  }

  let questions: Question[] = []
  let questionsError = false
  
  try {
    questions = await questionService.getQuestionsByChapter(chapterId)
  } catch (error) {
    questionsError = true
  }

  if (questionsError) {
    return (
      <ContentArea>
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          Failed to load questions. Please try again later.
        </div>
      </ContentArea>
    )
  }

  return (
    <ContentArea>
      <PracticeEngine chapterId={chapterId} subjectId={chapter.subject_id} chapterTitle={chapter.title} questions={questions} />
    </ContentArea>
  )
}
