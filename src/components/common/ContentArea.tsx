export function ContentArea({ header, children }: { header?: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden w-full">
      {header && (
        <div className="bg-transparent px-3 h-12 flex items-center border-b border-border shrink-0">
          <div className="w-full">{header}</div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
