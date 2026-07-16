'use client'

import { Search, LogOut, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

export function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [userName, setUserName] = useState<string>('User')
  
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

  // Derive title from pathname, e.g. /subjects -> Subjects
  const getPageTitle = () => {
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length === 0) return 'Dashboard'
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  }

  return (
    <header className="flex h-12 items-center justify-between border-b border-[#E8E8E8] bg-white px-4 shrink-0 w-full z-30">
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white text-[10px] font-bold">T</div>
        <span className="font-semibold text-[14px] text-[#202020]">TNPSC Prep</span>
      </div>

      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative flex items-center justify-center">
          <Search className="absolute left-3 top-2 h-4 w-4 text-[#909090]" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-[#F9F9F9] pl-9 h-8 text-[13px] border-none rounded-md"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 min-w-[200px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-7 w-7 rounded-full p-0 overflow-hidden border border-[#E8E8E8]">
              <Avatar className="h-7 w-7 rounded-full">
                <AvatarFallback className="text-[11px] font-semibold text-[#6B6B6B]">{userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
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
