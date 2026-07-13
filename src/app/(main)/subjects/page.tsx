import { subjectService } from '@/services/subject.service'
import { ContentHeader } from '@/components/common/ContentHeader'
import { EmptyState } from '@/components/common/EmptyState'

export default async function SubjectsPage() {
  let subjects: any[] = []
  
  try {
    subjects = await subjectService.getSubjects()
  } catch (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        Failed to load subjects. Please try again later.
      </div>
    )
  }

  if (!subjects || subjects.length === 0) {
    return (
      <>
        <ContentHeader 
          title="Subjects" 
          description="Select a subject from the sidebar to begin." 
        />
        <EmptyState title="No subjects found" />
      </>
    )
  }

  return (
    <>
      <ContentHeader 
        title="Subjects Overview" 
        description="Select a subject from the sidebar to view its chapters." 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold">{subject.name}</h3>
            {subject.description && (
              <p className="text-sm text-muted-foreground mt-1">{subject.description}</p>
            )}
          </div>
        ))}
      </div>
    </>
  )
}