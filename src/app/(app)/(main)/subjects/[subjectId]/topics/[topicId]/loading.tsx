import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4 text-muted-foreground animate-in fade-in duration-500">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <p className="text-sm font-medium">Loading content...</p>
    </div>
  )
}
