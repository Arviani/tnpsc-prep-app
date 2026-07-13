interface ContentHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function ContentHeader({ title, description, action }: ContentHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-2 text-lg">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
