import { Topbar } from './Topbar'

export function ContentArea({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden w-full bg-background">
      <Topbar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
