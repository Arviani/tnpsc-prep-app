import { ContentArea } from '@/components/common/ContentArea'
import { ContentHeader } from '@/components/common/ContentHeader'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function CurrentAffairsPage() {
  const supabase = await createClient()

  // Fetch published current affairs
  const { data: affairs } = await supabase
    .from('current_affairs')
    .select('*')
    .eq('status', 'published')
    .order('published_date', { ascending: false })

  return (
    <ContentArea 
      header={
        <ContentHeader 
          title="Daily Current Affairs" 
          description="Read today's news and attempt the daily quiz to stay prepared for TNPSC." 
        />
      }
    >
      <div className="grid gap-6">
        {affairs?.length ? (
          affairs.map((affair) => (
            <Card key={affair.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                  <div className="flex gap-2 items-center flex-wrap">
                    <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                      {affair.category}
                    </Badge>
                    {affair.tnpsc_subject && (
                      <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                        {affair.tnpsc_subject}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground font-medium">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(affair.published_date).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </div>
                </div>
                <CardTitle className="text-xl md:text-2xl leading-tight">
                  {affair.headline}
                </CardTitle>
                <CardDescription className="text-base text-foreground/80 mt-2">
                  {affair.summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-3 flex items-center">
                      <span className="w-1.5 h-4 bg-indigo-500 rounded-full mr-2"></span>
                      Key Facts
                    </h4>
                    <ul className="space-y-2">
                      {affair.key_facts?.map((fact: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start">
                          <span className="text-indigo-500 mr-2">•</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-6">
                    {affair.revision_notes && (
                      <div>
                        <h4 className="text-sm font-bold text-foreground mb-3 flex items-center">
                          <span className="w-1.5 h-4 bg-amber-500 rounded-full mr-2"></span>
                          Revision Notes
                        </h4>
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-900">
                          {affair.revision_notes}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {affair.important_dates?.map((d: any, i: number) => (
                        <div key={i} className="text-xs bg-slate-100 border px-2 py-1 rounded-md">
                          <strong className="text-slate-700">{d.date}:</strong> <span className="text-slate-600">{d.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-4 border-t">
                  <a 
                    href={affair.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-indigo-600 flex items-center transition-colors"
                  >
                    Read original source ({affair.provider}) <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  
                  <Link 
                    href={`/current-affairs/quiz?id=${affair.id}`}
                    className="mt-4 sm:mt-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-sm transition-colors"
                  >
                    Attempt Quiz for this Topic
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
            <h3 className="text-lg font-semibold text-foreground">No Current Affairs Published</h3>
            <p className="text-muted-foreground text-sm mt-1">Check back later for today's news.</p>
          </div>
        )}
      </div>
    </ContentArea>
  )
}
