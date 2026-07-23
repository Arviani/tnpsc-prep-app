'use client'

import { Search, LogOut, User, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useWorkspace } from '@/contexts/WorkspaceContext'
import { ChevronDown, Shield, GraduationCap } from 'lucide-react'
import { useGlobalAIStore } from '@/hooks/useGlobalAIStore'

export function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState<string>('User')
  const { workspace, setWorkspace, userRole } = useWorkspace()
  
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name)
      } else if (user?.email) {
        setUserName(user.email.split('@')[0])
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex h-[42px] items-center justify-between bg-background px-4 shrink-0 w-full z-30">
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="flex items-center gap-2 pr-3 border-r border-border">
          <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white text-[10px] font-bold">T</div>
          <span className="font-semibold text-[14px] text-foreground">TNPSC Prep</span>
        </div>
        
        {/* Workspace Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-transparent hover:border-border bg-transparent hover:bg-secondary transition-all rounded-md gap-1 items-center justify-center">
            {workspace === 'student' ? (
              <><GraduationCap className="w-3.5 h-3.5 mr-1" /> Student</>
            ) : (
              <><Shield className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Admin</>
            )}
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem 
              onClick={() => setWorkspace('student')}
              className={workspace === 'student' ? 'bg-accent text-accent-foreground font-medium' : ''}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Student View
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setWorkspace('admin')}
              className={workspace === 'admin' ? 'bg-accent text-accent-foreground font-medium' : ''}
            >
              <Shield className="w-4 h-4 mr-2 text-indigo-500" />
              Admin View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="hidden md:block w-[300px]">
        <div className="relative flex items-center w-full h-[28px] bg-background border border-transparent rounded-full pl-[7px] pr-1 gap-1 shadow-[0_0_1px_0_rgba(0,0,0,0.27),0_1px_2px_0_rgba(0,0,0,0.05)] transition-all hover:shadow-md hover:border-border focus-within:shadow-md focus-within:border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="relative flex-1 h-full flex items-center">
            <input
              type="search"
              placeholder="Search"
              className="absolute inset-0 w-full h-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[14px] font-medium tracking-[-0.15px] placeholder:text-muted-foreground text-foreground peer"
            />
            {/* Custom Placeholder with different styling for K */}
            <div className="pointer-events-none flex items-center gap-1 peer-focus:hidden peer-valid:hidden h-full">
              <span className="text-muted-foreground text-[14px] font-medium tracking-[-0.15px]">Search</span>
              <span className="text-muted-foreground/70 text-[12px] font-medium">⌘ K</span>
            </div>
          </div>
          <button 
            onClick={() => useGlobalAIStore.getState().openChat()}
            className="ai-chip-animated flex items-center justify-center gap-1 pl-2 pr-1 rounded-full text-[12px] font-medium text-muted-foreground hover:text-foreground h-[20px] w-[90px] shrink-0 border border-border"
          >
            <span className="relative z-10 flex items-center gap-1">
              AI Chats
              <Sparkles className="h-3 w-3 text-purple-500 fill-purple-400" />
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 min-w-[200px]">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-7 w-7 rounded-full p-0 overflow-hidden border border-border hover:bg-accent hover:text-accent-foreground outline-none">
            <Avatar className="h-7 w-7 rounded-full">
              <AvatarFallback className="text-[11px] font-semibold text-muted-foreground">{userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
