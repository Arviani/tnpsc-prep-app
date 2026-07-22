import { ContentArea } from '@/components/common/ContentArea'
import { ContentHeader } from '@/components/common/ContentHeader'
import { chapterService } from '@/services/chapter.service'
import { subjectService } from '@/services/subject.service'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopicTabs } from './TopicTabs'

export default async function TopicLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: Promise<{ subjectId: string, topicId: string }>
}) {
  const { subjectId, topicId } = await params

  let subject = null
  let topic = null

  try {
    subject = await subjectService.getSubject(subjectId)
    const chapters = await chapterService.getChaptersBySubject(subjectId)
    topic = chapters.find(c => c.id === topicId) || null
  } catch (error) {
    // Handled below
  }

  if (!subject || !topic) {
    notFound()
  }

  const breadcrumbs = (
    <div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium">
      <Link href="/subjects" className="hover:text-slate-700 transition-colors">Subjects</Link>
      <span>/</span>
      <Link href={`/subjects/${subject.id}`} className="hover:text-slate-700 transition-colors">{subject.name}</Link>
      <span>/</span>
      <span className="text-slate-900 font-bold">{topic.title}</span>
    </div>
  )

  return (
    <ContentArea>
      <div className="flex flex-col shrink-0 sticky top-[-12px] z-20 bg-[#F9F9F9] -mx-3 -mt-3 pt-3 border-b border-slate-200 mb-6">
        <div className="px-5 mb-3 mt-1">
          {breadcrumbs}
        </div>
        
        <div className="px-5">
          <TopicTabs subjectId={subject.id} topicId={topic.id} />
        </div>
      </div>
      
      <div className="pt-3 pb-8 pr-2 pl-0">
        {children}
      </div>
    </ContentArea>
  )
}
