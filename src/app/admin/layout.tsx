import React from 'react'
import { redirect } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminHeader } from '@/components/admin/layout/AdminHeader'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await authService.getUser()

  if (!user || user.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
