import { subjectService } from '@/services/subject.service'
import { chapterService } from '@/services/chapter.service'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContentHeader } from '@/components/common/ContentHeader'
import { ContentArea } from '@/components/common/ContentArea'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default async function ChaptersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  let subject = null
  try {
    subject = await subjectService.getSubject(id)
  } catch (error) {
    // handled below
  }

  if (!subject) {
    notFound()
  }

  let chapters: any[] = []
  try {
    chapters = await chapterService.getChaptersBySubject(id)
  } catch (error) {
    // handled in UI or gracefully degrades
  }

  // Example placeholder logic for progress
  const progressPercent = 35

  const SubjectAction = (
    <Button className="font-semibold px-6">
      Continue Studying
    </Button>
  )

  return (
    <ContentArea 
      header={
        <ContentHeader 
          title={subject.name} 
          description={subject.description || "Master the concepts for this subject."} 
          action={SubjectAction} 
        />
      }
    >
      <div className="mb-10 max-w-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-foreground">Course Progress</span>
          <span className="text-sm font-semibold text-primary">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <h2 className="text-[15px] font-bold text-foreground">Available Chapters</h2>
        <span className="text-[12px] font-medium text-muted-foreground">{chapters?.length || 0} chapters</span>
      </div>

      {!chapters || chapters.length === 0 ? (
        <EmptyState title="No chapters found" description="Chapters for this subject will appear here." />
      ) : (
        <div className="flex flex-col gap-2 mt-2">
          {chapters.map((chapter, index) => {
            // Placeholder data for design
            const questionCount = Math.floor(Math.random() * 50) + 20
            const estimatedMins = Math.floor(Math.random() * 60) + 30
            const chapterProgress = Math.floor(Math.random() * 100)

            return (
              <div key={chapter.id} className="p-3.5 border border-border rounded-md bg-card shadow-sm hover:border-border-strong transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-[11px] font-bold text-muted-foreground bg-surface-muted px-1.5 py-0.5 rounded">
                        Chapter {index + 1}
                      </span>
                      <h3 className="font-semibold text-foreground text-[14px]">{chapter.title}</h3>
                    </div>
                    {chapter.description && (
                      <p className="text-[13px] text-muted-foreground mt-0.5 mb-2 line-clamp-1">
                        {chapter.description}
                      </p>
                    )}
                    <div className="flex gap-3 text-[12px] font-medium text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {questionCount} Questions
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ~{estimatedMins} mins
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center min-w-[120px] gap-2">
                    <div className="w-full text-right">
                      <span className="text-[11px] font-semibold text-muted-foreground mb-1 block">{chapterProgress}% Completed</span>
                      <Progress value={chapterProgress} className="h-1.5" />
                    </div>
                    <Link href={`/practice/${chapter.id}`} className="w-full">
                      <Button variant="secondary" className="w-full font-semibold h-7 text-[12px]">
                        {chapterProgress === 0 ? 'Start' : 'Resume'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ContentArea>
  )
}
