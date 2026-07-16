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
        <div className="flex items-center h-12 px-4 border-b border-[#E8E8E8] shrink-0">
          <h2 className="font-semibold text-[11px] text-[#909090] uppercase tracking-wider">Subjects</h2>
        </div>
        <SecondarySidebarNav subjects={subjects || []} />
      </SecondarySidebar>
      <div className="flex-1 flex flex-col w-full h-full bg-transparent overflow-hidden">
        {children}
      </div>
    </>
  )
}
