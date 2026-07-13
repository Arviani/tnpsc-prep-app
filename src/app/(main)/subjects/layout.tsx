import { subjectService } from '@/services/subject.service'
import { SecondarySidebar } from '@/components/common/SecondarySidebar'
import { ContentArea } from '@/components/common/ContentArea'
import Link from 'next/link'
import { SecondarySidebarNav } from '@/components/common/SecondarySidebarNav'

export default async function SubjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let subjects: any[] = []
  try {
    subjects = await subjectService.getSubjects()
  } catch (error) {
    // silently fail, layout handles empty subjects
  }

  return (
    <>
      <SecondarySidebar>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Subjects</h2>
        </div>
        <SecondarySidebarNav subjects={subjects || []} />
      </SecondarySidebar>
      <ContentArea>
        {children}
      </ContentArea>
    </>
  )
}
