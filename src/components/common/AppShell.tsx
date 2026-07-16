import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Global Topbar */}
      <Topbar />
      
      {/* Main Layout Below Topbar */}
      <div className="flex flex-1 overflow-hidden w-full h-full bg-[#F9F9F9] p-3 gap-3">
        {/* Navigation Rail */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex flex-1 w-full h-full bg-white border border-[#E8E8E8] rounded-xl overflow-hidden shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
