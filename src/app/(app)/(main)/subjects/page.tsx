import { subjectService } from '@/services/subject.service'
import { ContentHeader } from '@/components/common/ContentHeader'
import { ContentArea } from '@/components/common/ContentArea'
import { EmptyState } from '@/components/common/EmptyState'
import Link from 'next/link'

export default async function SubjectsPage() {
  let subjects: any[] = []
  
  try {
    subjects = await subjectService.getSubjects()
    // Ensure "Current Affairs" is always the first card
    subjects.sort((a, b) => {
      if (a.name.toLowerCase() === 'current affairs') return -1;
      if (b.name.toLowerCase() === 'current affairs') return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    return (
      <ContentArea>
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          Failed to load subjects. Please try again later.
        </div>
      </ContentArea>
    )
  }

  if (!subjects || subjects.length === 0) {
    return (
      <ContentArea 
        header={<ContentHeader title="Subjects" description="Select a subject from the sidebar to begin." />}
      >
        <EmptyState title="No subjects found" />
      </ContentArea>
    )
  }

  return (
    <ContentArea 
      header={<ContentHeader title="Subjects Overview" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {subjects.map((subject) => {
          const isCurrentAffairs = subject.name.toLowerCase() === 'current affairs'
          const href = isCurrentAffairs ? '/subjects/current-affairs' : `/subjects/${subject.id}`
          
          return (
            <Link key={subject.id} href={href}>
              <div className="p-4 border border-border rounded-[10px] bg-card text-card-foreground hover:bg-accent/50 transition-all cursor-pointer h-full">
                <h3 className="text-[14px] font-semibold">{subject.name}</h3>
                {subject.description && (
                  <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{subject.description}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </ContentArea>
  )
}