'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  UploadCloud, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  BookMarked,
  History,
  Settings,
  LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Import PDFs', href: '/admin/import', icon: UploadCloud },
  { name: 'Questions', href: '/admin/questions', icon: HelpCircle },
  { name: 'Subjects', href: '/admin/subjects', icon: BookOpen },
  { name: 'Chapters', href: '/admin/chapters', icon: Layers },
  { name: 'Books', href: '/admin/books', icon: BookMarked },
  { name: 'Import History', href: '/admin/import-history', icon: History },
]

export function AdminSidebar() {
  const pathname = usePathname()
  
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
        <span className="text-xl font-bold tracking-tight">TNPSC CMS</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="flex flex-1 flex-col space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border space-y-2">
        <Link href="/admin/settings" className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors">
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Link>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-destructive rounded-md hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
