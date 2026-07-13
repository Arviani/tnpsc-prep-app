export default function ChaptersLoading() {
  return (
    <>
      <div className="h-9 bg-muted rounded w-1/3 mb-2 animate-pulse"></div>
      <div className="h-5 bg-muted rounded w-1/2 mb-8 animate-pulse"></div>
      
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-xl bg-card animate-pulse h-20">
            <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </>
  )
}
