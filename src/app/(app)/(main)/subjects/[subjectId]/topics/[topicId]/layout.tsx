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
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link href="/subjects" className="hover:text-foreground transition-colors">Subjects</Link>
      <span>/</span>
      <Link href={`/subjects/${subject.id}`} className="hover:text-foreground transition-colors">{subject.name}</Link>
      <span>/</span>
      <span className="text-foreground font-medium">{topic.title}</span>
    </div>
  )

  return (
    <ContentArea>
      <div className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-border shadow-sm mb-4">
        {breadcrumbs}
        <ContentHeader 
          title={topic.title} 
          description="Master this topic with guided study, examples, and practice." 
        />
        <TopicTabs subjectId={subject.id} topicId={topic.id} />
      </div>
      <div className="pt-2 pb-8 h-full">
        {children}
      </div>
    </ContentArea>
  )
}
