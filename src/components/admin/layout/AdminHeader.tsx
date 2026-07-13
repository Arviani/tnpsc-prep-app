'use client'

import React from 'react'
import { Search, Bell, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { usePathname } from 'next/navigation'

export function AdminHeader() {
  const pathname = usePathname()
  
  // Quick breadcrumb logic
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname.includes('/admin/import-history')) return 'Import History'
    if (pathname.includes('/admin/import')) return 'Import PDF'
    if (pathname.includes('/admin/questions')) return 'Manage Questions'
    if (pathname.includes('/admin/subjects')) return 'Manage Subjects'
    if (pathname.includes('/admin/chapters')) return 'Manage Chapters'
    if (pathname.includes('/admin/books')) return 'Manage Books'
    return 'Admin CMS'
  }

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search CMS..."
            className="w-full bg-muted/50 pl-9 border-none focus-visible:ring-1"
          />
        </div>
        
        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
        </button>
        
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
