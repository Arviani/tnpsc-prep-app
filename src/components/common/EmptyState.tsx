import { FolderSearch } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed bg-muted/20">
      <div className="mb-4 text-muted-foreground">
        {icon || <FolderSearch size={48} strokeWidth={1.5} />}
      </div>
      <h3 className="text-xl font-semibold mb-1 text-foreground">{title}</h3>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}
