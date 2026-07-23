import { authService } from '@/services/auth.service'
import { ContentArea } from '@/components/common/ContentArea'
import { ContentHeader } from '@/components/common/ContentHeader'
import { Clock, Target, Activity, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const user = await authService.getUser()

  const userName = user?.full_name || user?.email?.split('@')[0] || 'Student'

  const dashboardCards = [
    {
      title: 'Continue Studying',
      description: 'Modern History - Chapter 4',
      icon: Clock,
      value: 'Resume',
      action: true
    },
    {
      title: 'Recent Activity',
      description: 'Last 7 days of practice',
      icon: Activity,
      value: '85% Accuracy',
      action: false
    },
    {
      title: 'Daily Quiz',
      description: 'Test your knowledge today',
      icon: Target,
      value: 'Pending',
      action: true
    },
    {
      title: 'Study Progress',
      description: 'Overall course completion',
      icon: CheckCircle2,
      value: '12%',
      action: false
    },
  ]

  return (
    <ContentArea 
      header={
        <ContentHeader 
          title={`Welcome back, ${userName}`} 
          description="Here is an overview of your study progress." 
        />
      }
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mt-2">
        {dashboardCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="p-3 border border-border rounded-md bg-card shadow-sm flex flex-col justify-between h-28 hover:border-border-strong transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1">{card.title}</h3>
                  <p className="text-lg font-bold mt-0.5 text-foreground tracking-tight">{card.value}</p>
                </div>
                <div className="p-1 bg-surface-muted rounded-md">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-muted-foreground">{card.description}</span>
                {card.action && (
                  <Button variant="secondary" size="xs" className="font-semibold h-6 px-2">
                    Start
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 border-t border-border pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Curriculum Analytics</h2>
          <span className="text-sm font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
            TNPSC Group IV Syllabus
          </span>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-5 border border-border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Total Lessons</h3>
            <p className="text-3xl font-black text-foreground">124</p>
            <div className="mt-3 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
              +12 this week
            </div>
          </div>
          
          <div className="p-5 border border-border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Syllabus Coverage</h3>
            <p className="text-3xl font-black text-foreground">96%</p>
            <div className="w-full bg-accent h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-600 w-[96%] h-full rounded-full"></div>
            </div>
          </div>
          
          <div className="p-5 border border-border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Topics Missing</h3>
            <p className="text-3xl font-black text-foreground">3</p>
            <div className="mt-3 flex gap-2">
              <span className="text-[10px] font-semibold text-muted-foreground bg-accent px-2 py-0.5 rounded">Compound Interest</span>
              <span className="text-[10px] font-semibold text-muted-foreground bg-accent px-2 py-0.5 rounded">+2 more</span>
            </div>
          </div>
          
          <div className="p-5 border border-amber-200 rounded-xl bg-amber-50 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-amber-700 mb-1">Needs Review</h3>
            <p className="text-3xl font-black text-amber-900">5</p>
            <div className="mt-3 text-xs font-medium text-amber-700">
              Lessons flagged as out-of-syllabus
            </div>
          </div>
        </div>
      </div>
    </ContentArea>
  )
}
