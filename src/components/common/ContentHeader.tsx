interface ContentHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function ContentHeader({ title, description, action }: ContentHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-[16px] font-semibold tracking-tight text-[#202020]">{title}</h1>
        {description && <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  )
}
