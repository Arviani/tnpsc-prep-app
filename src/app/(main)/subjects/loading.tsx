import { ContentHeader } from '@/components/common/ContentHeader'

export default function SubjectsLoading() {
  return (
    <>
      <ContentHeader 
        title="Subjects Overview" 
        description="Select a subject from the sidebar to view its chapters." 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg bg-card animate-pulse h-24">
            <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </>
  )
}
