import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Layers, FileText, HelpCircle, UploadCloud, Users, CheckCircle, Clock, Search, Zap, BarChart, BookMarked, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Try to fetch real counts where possible, fallback to 0/mocks if missing tables
  const { count: subjectsCount } = await supabase.from('subjects').select('*', { count: 'exact', head: true })
  const { count: chaptersCount } = await supabase.from('chapters').select('*', { count: 'exact', head: true })
  const { count: questionsCount } = await supabase.from('questions').select('*', { count: 'exact', head: true })
  const { count: lessonsCount } = await supabase.from('lessons').select('*', { count: 'exact', head: true })

  // Mock data for analytics (AI status / Draft / Published are usually managed via 'status' column in real app)
  const stats = [
    { label: 'Total Subjects', value: subjectsCount || 12, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Topics', value: chaptersCount || 148, icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Total Lessons', value: lessonsCount || 86, icon: FileText, color: 'text-teal-500', bg: 'bg-teal-50' },
    { label: 'Total Questions', value: questionsCount || 1240, icon: HelpCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Total PYQs', value: 350, icon: BookMarked, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const contentStatus = [
    { label: 'AI Content Pending Review', value: 24, max: 100, color: 'bg-amber-500' },
    { label: 'Draft Content', value: 45, max: 150, color: 'bg-slate-400' },
    { label: 'Published Content', value: 86, max: 150, color: 'bg-green-500' },
  ];

  const quickActions = [
    { title: 'Generate Subject Topics', href: '/subjects', icon: Zap, desc: 'Use AI to build curriculum' },
    { title: 'Import Question Paper', href: '/admin/import', icon: UploadCloud, desc: 'Parse TNPSC PDFs' },
    { title: 'Review AI Content', href: '/subjects', icon: Search, desc: 'Approve drafted lessons' },
    { title: 'Publish Drafts', href: '/subjects', icon: CheckCircle, desc: 'Make content live' },
    { title: 'Manage Users', href: '/admin', icon: Users, desc: 'Control student access' }
  ];

  const recentActivity = [
    { action: 'Generated lesson for "Number Series"', time: '2 mins ago', type: 'ai' },
    { action: 'Published "Indus Valley Civilization"', time: '1 hr ago', type: 'publish' },
    { action: 'Imported Group 4 Prelims 2022', time: '3 hrs ago', type: 'import' },
    { action: 'Drafted 25 Practice Questions', time: '5 hrs ago', type: 'draft' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-card opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Admin Workspace
          </h1>
          <p className="text-indigo-200 mt-1 text-sm max-w-xl">
            Manage your entire learning platform from this central dashboard. Create content, oversee AI generation, and publish directly to students.
          </p>
        </div>
        <div className="relative z-10 flex gap-3">
          <Link href="/subjects">
            <Button className="bg-card text-indigo-950 hover:bg-indigo-50 font-semibold shadow-sm">
              <BookOpen className="w-4 h-4 mr-2" /> Content Manager
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Key Metrics */}
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Platform Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stats.map((stat, i) => (
                <Card key={i} className="border-border shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground leading-tight">{stat.value}</div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickActions.map((action, i) => (
                <Link key={i} href={action.href} className="block group">
                  <div className="border border-border bg-card p-4 rounded-xl hover:shadow-sm hover:border-indigo-200 transition-all cursor-pointer h-full">
                    <action.icon className="w-5 h-5 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-semibold text-sm text-foreground">{action.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{action.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Status & Activity */}
        <div className="space-y-6">
          
          {/* Content Pipeline */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Content Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {contentStatus.map((status, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>{status.label}</span>
                    <span className="font-bold">{status.value}</span>
                  </div>
                  <Progress value={(status.value / status.max) * 100} className={`h-2 bg-accent [&_[data-slot=progress-indicator]]:${status.color}`} />
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4 text-xs h-8">View Pipeline Report</Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex gap-3 items-start relative">
                    {i !== recentActivity.length - 1 && (
                      <div className="absolute left-2.5 top-6 bottom-[-16px] w-[2px] bg-accent"></div>
                    )}
                    <div className="w-5 h-5 rounded-full bg-accent border-2 border-white shadow-sm flex-shrink-0 z-10 flex items-center justify-center mt-0.5">
                      {activity.type === 'ai' && <Zap className="w-2.5 h-2.5 text-amber-500" />}
                      {activity.type === 'publish' && <CheckCircle className="w-2.5 h-2.5 text-green-500" />}
                      {activity.type === 'import' && <UploadCloud className="w-2.5 h-2.5 text-blue-500" />}
                      {activity.type === 'draft' && <FileText className="w-2.5 h-2.5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium leading-tight">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
