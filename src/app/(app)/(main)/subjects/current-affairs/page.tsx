'use client'

import React, { useState, useEffect } from 'react'
import { ContentArea } from '@/components/common/ContentArea'
import { ContentHeader } from '@/components/common/ContentHeader'
import { Button } from '@/components/ui/button'
import { Sparkles, Share, Globe, Lightbulb, Check, ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createBrowserClient } from '@supabase/ssr'

interface Article {
  id: string
  headline: string
  category: string
  source_url: string
  provider: string
  summary: string
  key_facts: string[]
  revision_notes: string
  published_date: string
}

export default function CurrentAffairsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0])
  const [scraping, setScraping] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('current_affairs')
        .select('*')
        .gte('published_date', `${dateStr}T00:00:00.000Z`)
        .lte('published_date', `${dateStr}T23:59:59.999Z`)
        .eq('status', 'published')
      
      if (data && data.length > 0) {
        setArticles(data)
        setSelectedArticleId(data[0].id)
      } else {
        setArticles([])
        setSelectedArticleId(null)
      }
    } catch (error) {
      console.error('Failed to fetch current affairs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateStr, supabase])

  const selectedArticle = articles.find(a => a.id === selectedArticleId)

  // Determine prev/next dates for basic simulation
  const currentDate = new Date(dateStr)
  const handlePrevDay = () => {
    const prev = new Date(currentDate)
    prev.setDate(prev.getDate() - 1)
    setDateStr(prev.toISOString().split('T')[0])
  }
  const handleNextDay = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + 1)
    setDateStr(next.toISOString().split('T')[0])
  }

  const handleScrape = async () => {
    setScraping(true)
    try {
      const res = await fetch('/api/cron/news', { method: 'GET' })
      const json = await res.json()
      if (res.ok) {
        alert(`Successfully scraped ${json.processed} articles!`)
        await fetchData()
      } else {
        alert(`Error: ${json.error}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setScraping(false)
    }
  }

  const formatShortDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <ContentArea 
      header={
        <ContentHeader 
          title="Current Affairs" 
          description="AI-curated daily news for TNPSC preparation." 
        />
      }
    >
      <div className="flex flex-col h-[calc(100vh-140px)] -mt-4">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between py-4 border-b border-border mb-4">
          <div className="flex items-center gap-2">
            <Button variant="default" className="rounded-full h-8 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700">All dates</Button>
            <Button variant="outline" className="rounded-full h-8 px-4 text-xs font-semibold" onClick={() => setDateStr(new Date().toISOString().split('T')[0])}>
              Today
            </Button>
            <Button variant="outline" className="rounded-full h-8 px-4 text-xs font-semibold" onClick={handlePrevDay}>
              {formatShortDate(new Date(new Date().setDate(new Date(dateStr).getDate() - 1)).toISOString())}
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
              <Calendar className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="h-8 rounded-full text-xs font-semibold gap-1.5 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
              onClick={handleScrape}
              disabled={scraping}
            >
              {scraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              {scraping ? 'Scraping...' : 'Scrape News'}
            </Button>
            <Button variant="outline" className="h-8 rounded-full text-xs font-semibold gap-1.5 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Generate MCQs
            </Button>
            <Button variant="outline" className="h-8 rounded-full text-xs font-semibold gap-1.5 border-purple-200 bg-purple-50/50 hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Generate flashcards
            </Button>
            <Button variant="outline" className="h-8 rounded-full text-xs font-semibold gap-1.5">
              <Share className="w-3.5 h-3.5" /> Share
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
            <p>Loading news for {dateStr}...</p>
          </div>
        ) : articles.length > 0 ? (
          <div className="flex flex-1 overflow-hidden gap-8">
            {/* Sidebar List */}
            <div className="w-64 shrink-0 overflow-y-auto scrollbar-thin flex flex-col gap-1 pr-2">
              {articles.map(article => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticleId(article.id)}
                  className={cn(
                    "text-left px-3 py-3 rounded-lg text-sm transition-all",
                    selectedArticleId === article.id 
                      ? "bg-accent text-foreground font-semibold" 
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <p className="line-clamp-2 leading-tight">{article.headline}</p>
                </button>
              ))}
            </div>

            {/* Main Content Pane */}
            <div className="flex-1 overflow-y-auto scrollbar-thin pb-12 pr-4">
              {selectedArticle ? (
                <div className="max-w-3xl mx-auto flex flex-col gap-6">
                  {/* Header */}
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent text-[11px] font-semibold text-muted-foreground mb-4">
                      <Globe className="w-3.5 h-3.5" /> {selectedArticle.category}
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-snug mb-3">
                      {selectedArticle.headline}
                    </h1>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {selectedArticle.summary}
                    </p>
                  </div>

                  {/* Fact Box */}
                  <div className="border border-border rounded-xl p-6 bg-card shadow-sm mt-2">
                    <div className="flex items-center gap-2 mb-6 text-[10px] font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 w-fit px-2 py-1 rounded">
                      <Lightbulb className="w-3.5 h-3.5" /> Key Points
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Summary</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {selectedArticle.summary}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-3">Key specifics</h3>
                        <ul className="space-y-3">
                          {selectedArticle.key_facts?.map((fact, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              {fact}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Exam lens</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {selectedArticle.revision_notes}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end mt-8">
                      <span className="text-[10px] font-medium bg-accent/50 px-2.5 py-1 rounded text-muted-foreground">
                        Source - {selectedArticle.provider}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex justify-end mt-2">
                    <Button variant="outline" className="rounded-full gap-2 text-muted-foreground h-9">
                      <Check className="w-4 h-4" /> Mark as read
                    </Button>
                  </div>

                  {/* Footer Nav */}
                  <div className="flex items-center justify-between border-t border-border pt-6 mt-8">
                    <Button variant="ghost" className="text-muted-foreground gap-2 rounded-full h-8 text-xs font-semibold" onClick={handlePrevDay}>
                      <ChevronLeft className="w-4 h-4" /> Previous day
                    </Button>
                    <span className="text-xs text-muted-foreground font-medium">All dates</span>
                    <Button variant="secondary" className="bg-indigo-400 hover:bg-indigo-500 text-white gap-2 rounded-full h-8 px-4 text-xs font-semibold" onClick={handleNextDay}>
                      Next day <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select an article to read.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <p>No published current affairs found for {dateStr}. Check the admin panel.</p>
          </div>
        )}
      </div>
    </ContentArea>
  )
}
