import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { GlobalAIChat } from '@/components/ai/GlobalAIChat'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navbar */}
      <Topbar />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden w-full h-full bg-background px-[6px] pb-[6px] pt-0 gap-[6px]">
        {/* Workspace Sidebar */}
        <Sidebar />
        
        {/* Dynamic Content Panel */}
        <div className="flex flex-1 w-full h-full bg-background border border-border rounded-lg overflow-hidden shadow-sm relative">
          {children}
        </div>
        
        {/* Global AI Chat Sidebar */}
        <GlobalAIChat />
      </div>
    </div>
  )
}
