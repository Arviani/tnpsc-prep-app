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
    <ContentArea>
      <ContentHeader 
        title={`Welcome back, ${userName}`} 
        description="Here is an overview of your study progress." 
      />

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="p-6 border border-border rounded-xl bg-card shadow-[0_1px_3px_rgba(0,0,0,0.10)] flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">{card.title}</h3>
                  <p className="text-2xl font-bold mt-1 text-foreground tracking-tight font-heading">{card.value}</p>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">{card.description}</span>
                {card.action && (
                  <Button variant="secondary" size="sm" className="font-semibold text-xs h-8">
                    Start
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </ContentArea>
  )
}
