export function ContentArea({ header, children }: { header?: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden w-full">
      {header && (
        <div className="bg-transparent px-6 py-4 border-b border-[#E8E8E8] shrink-0">
          {header}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </div>
  )
}
