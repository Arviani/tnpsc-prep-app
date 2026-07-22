import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { GlobalAIChat } from '@/components/ai/GlobalAIChat'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Global Topbar */}
      <Topbar />
      
      {/* Main Layout Below Topbar */}
      <div className="flex flex-1 overflow-hidden w-full h-full bg-white px-[6px] pb-[6px] pt-0 gap-[6px]">
        {/* Navigation Rail */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex flex-1 w-full h-full bg-white border border-[#E8E8E8] rounded-lg overflow-hidden shadow-sm relative">
          {children}
        </div>
        
        {/* Global AI Chat Sidebar */}
        <GlobalAIChat />
      </div>
    </div>
  )
}
