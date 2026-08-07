'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Globe, Lightbulb, Check, ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createBrowserClient } from '@supabase/ssr'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'
import { useAIUsageStore } from '@/hooks/useAIUsageStore'

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
  const [scraping, setScraping] = useState(false)
  const [lang, setLang] = useState<'en' | 'ta'>('en')
  const [translatingList, setTranslatingList] = useState(false)
  const [translatingDetail, setTranslatingDetail] = useState(false)
  const [translations, setTranslations] = useState<Record<string, { headline: string, summary: string }>>({})
  const [detailedTranslations, setDetailedTranslations] = useState<Record<string, { key_facts: string[], revision_notes: string }>>({})
  const { showUsageToast } = useAIUsageStore()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Normalize date to YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0]
  const [dateStr, setDateStr] = useState(todayStr)
  
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
      } else {
        setArticles([])
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

  // Translate List
  useEffect(() => {
    if (lang === 'ta' && articles.length > 0) {
      const untranslatedArticles = articles.filter(a => !translations[a.id]);
      if (untranslatedArticles.length > 0 && !translatingList) {
        setTranslatingList(true);
        const texts = untranslatedArticles.flatMap(a => [a.headline, a.summary]);
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts, targetLanguage: 'Tamil' })
        })
        .then(res => res.json())
        .then(data => {
          if (data.translatedTexts && data.translatedTexts.length === texts.length) {
            const newT = { ...translations };
            untranslatedArticles.forEach((a, i) => {
              newT[a.id] = {
                headline: data.translatedTexts[i * 2],
                summary: data.translatedTexts[i * 2 + 1]
              };
            });
            setTranslations(newT);
            
            // Estimate tokens used (rough heuristic)
            const estimatedTokens = Math.ceil(texts.join(' ').length / 4) * 2;
            showUsageToast(estimatedTokens);
          }
        })
        .finally(() => setTranslatingList(false));
      }
    }
  }, [lang, articles, translations]);

  // Translate Detail
  useEffect(() => {
    if (lang === 'ta' && selectedArticleId) {
      const article = articles.find(a => a.id === selectedArticleId);
      if (article && !detailedTranslations[article.id] && !translatingDetail) {
        setTranslatingDetail(true);
        const factsCount = article.key_facts?.length || 0;
        const texts = [...(article.key_facts || []), article.revision_notes || ''];
        
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts, targetLanguage: 'Tamil' })
        })
        .then(res => res.json())
        .then(data => {
          if (data.translatedTexts && data.translatedTexts.length === texts.length) {
            setDetailedTranslations(prev => ({
              ...prev,
              [article.id]: {
                key_facts: data.translatedTexts.slice(0, factsCount),
                revision_notes: data.translatedTexts[factsCount] || ''
              }
            }));
            
            const estimatedTokens = Math.ceil(texts.join(' ').length / 4) * 2;
            showUsageToast(estimatedTokens);
          }
        })
        .finally(() => setTranslatingDetail(false));
      }
    }
  }, [lang, selectedArticleId, articles, detailedTranslations]);

  const selectedArticle = articles.find(a => a.id === selectedArticleId)

  // Determine prev/next dates
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

  const formatShortDate = (dateObj: Date) => {
    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
  }

  // Generate 7 days ending on the currently selected date (or around it)
  // According to the mockup: "SAT 1", "SUN 2"... "FRI 7 (today)"
  const generateWeekDays = () => {
    const days = []
    // Let's generate 7 days leading up to the selected date
    for (let i = 6; i >= 0; i--) {
      const d = new Date(currentDate)
      d.setDate(d.getDate() - i)
      days.push(d)
    }
    return days
  }
  const weekDays = generateWeekDays()

  const getCategoryColor = (category: string) => {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('tamil')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }

  // Custom Calendar State
  const [calendarViewDate, setCalendarViewDate] = useState(new Date(dateStr))
  
  const getCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Previous month days to fill first week
    for (let i = 0; i < firstDay.getDay(); i++) {
      const d = new Date(year, month, -i)
      days.unshift({ date: d, currentMonth: false })
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true })
    }
    
    // Next month days to fill last week
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), currentMonth: false })
    }
    
    return days
  }

  const calendarDays = getCalendarDays(calendarViewDate.getFullYear(), calendarViewDate.getMonth())

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative w-full">
      
      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-8 py-8">
          
          {/* Top Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight">This week</h1>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-full text-xs font-semibold gap-1.5 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                onClick={handleScrape}
                disabled={scraping}
              >
                {scraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                {scraping ? 'Scraping...' : 'Scrape News'}
              </Button>
              <div className="flex items-center bg-accent rounded-full p-1 relative">
                <button 
                  onClick={() => setLang('en')}
                  className={cn("px-4 py-1.5 rounded-full text-xs transition-colors", lang === 'en' ? "font-bold bg-indigo-600 text-white" : "font-semibold text-muted-foreground hover:text-foreground")}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLang('ta')}
                  className={cn("px-4 py-1.5 rounded-full text-xs transition-colors", lang === 'ta' ? "font-bold bg-indigo-600 text-white" : "font-semibold text-muted-foreground hover:text-foreground")}
                >
                  தமிழ்
                </button>
                {translatingList && lang === 'ta' && (
                  <Loader2 className="absolute -right-6 top-2 w-4 h-4 text-indigo-500 animate-spin" />
                )}
              </div>
            </div>
          </div>

          {/* 7-Day Calendar Strip */}
          <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-4 scrollbar-none">
            {weekDays.map((dateObj, idx) => {
              const isSelected = dateObj.toISOString().split('T')[0] === dateStr
              const isToday = dateObj.toISOString().split('T')[0] === todayStr
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
              const dayNum = dateObj.getDate()
              
              // Mock logic for status
              let statusText = "read"
              if (isToday) statusText = "today"
              if (dateObj > new Date()) statusText = ""

              return (
                <button
                  key={idx}
                  onClick={() => setDateStr(dateObj.toISOString().split('T')[0])}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[80px] h-[90px] rounded-[16px] border transition-all flex-1 max-w-[120px]",
                    isSelected 
                      ? "bg-foreground text-background border-foreground shadow-lg" 
                      : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:shadow-sm"
                  )}
                >
                  <span className={cn("text-[10px] font-bold tracking-wider mb-1 opacity-70")}>{dayName}</span>
                  <span className={cn("text-2xl font-bold leading-none mb-1", isSelected ? "text-background" : "text-foreground")}>{dayNum}</span>
                  <span className={cn("text-[10px] font-medium opacity-70")}>{statusText}</span>
                </button>
              )
            })}
          </div>

          {/* List Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <h2 className="text-2xl font-bold">
              {mounted ? currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Loading date...'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/60 text-muted-foreground" onClick={handlePrevDay}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/60 text-muted-foreground" onClick={handleNextDay}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="h-9 rounded-full border-border/60 text-muted-foreground px-4 text-sm font-medium" onClick={() => setDateStr(todayStr)}>
                  Today
                </Button>
              </div>
              <DropdownMenu onOpenChange={(open) => { if(open) setCalendarViewDate(new Date(dateStr)) }}>
                <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 rounded-full border-border/60 font-medium text-sm gap-2 px-4 transition-colors">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  {mounted ? `${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}${currentDate.getDate() > 3 && currentDate.getDate() < 21 ? 'th' : ['st', 'nd', 'rd'][currentDate.getDate() % 10 - 1] || 'th'}, ${currentDate.getFullYear()}` : 'Select Date'}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[340px] p-6 rounded-[20px] shadow-xl border-border/60 bg-background">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4 px-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.preventDefault(); setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1)) }}>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="font-semibold text-[15px]">
                      {calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.preventDefault(); setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1)) }}>
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  {/* Day Names */}
                  <div className="mb-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="text-xs font-medium text-muted-foreground text-center">{day}</div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '8px', columnGap: '4px' }}>
                    {calendarDays.map((dayObj, i) => {
                      const isSelected = dayObj.date.toISOString().split('T')[0] === dateStr
                      const isToday = dayObj.date.toISOString().split('T')[0] === todayStr
                      
                      return (
                        <div key={i} className="flex items-center justify-center aspect-square">
                          <button
                            onClick={() => setDateStr(dayObj.date.toISOString().split('T')[0])}
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-[15px] transition-colors",
                              isSelected 
                                ? "bg-indigo-600 text-white font-semibold" 
                                : isToday
                                  ? "bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-900/30 dark:text-indigo-400"
                                  : dayObj.currentMonth
                                    ? "text-foreground hover:bg-accent font-medium"
                                    : "text-muted-foreground/40 hover:text-foreground hover:bg-accent"
                            )}
                          >
                            {dayObj.date.getDate()}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Article List */}
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
               <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
               <p>Loading news...</p>
             </div>
          ) : articles.length > 0 ? (
            <div className="flex flex-col">
              {articles.map((article, idx) => (
                <div 
                  key={article.id} 
                  className={cn(
                    "group flex items-start gap-4 py-6 border-b border-border/60 transition-colors cursor-pointer hover:bg-accent/30 rounded-xl px-2 -mx-2",
                    selectedArticleId === article.id && "bg-accent/50"
                  )}
                  onClick={() => setSelectedArticleId(article.id)}
                >
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase",
                        getCategoryColor(article.category)
                      )}>
                        {article.category || 'News'}
                      </span>
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-accent text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        {article.provider}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-indigo-600 transition-colors">
                      {lang === 'ta' && translations[article.id] ? translations[article.id].headline : article.headline}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {lang === 'ta' && translations[article.id] ? translations[article.id].summary : article.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-accent/30 rounded-2xl border border-dashed border-border mt-4">
              <p>No current affairs found for this date.</p>
              <Button variant="outline" className="mt-4" onClick={() => setDateStr(todayStr)}>Back to Today</Button>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Side Panel (Like AI Chat) */}
      <div 
        className={cn(
          "absolute top-0 right-0 h-full w-full max-w-[450px] bg-background border-l border-border shadow-[-10px_0_15px_-10px_#0000000f] transition-transform duration-300 ease-in-out z-40 flex flex-col",
          selectedArticle ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selectedArticle && (
          <>
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-background z-10 shrink-0">
              <div className="flex items-center gap-2">
                 <span className={cn(
                    "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase",
                    getCategoryColor(selectedArticle.category)
                  )}>
                    {selectedArticle.category || 'News'}
                  </span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent" onClick={() => setSelectedArticleId(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Panel Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin custom-scrollbar relative">
               <h1 className="text-2xl font-bold text-foreground leading-snug mb-4">
                 {lang === 'ta' && translations[selectedArticle.id] ? translations[selectedArticle.id].headline : selectedArticle.headline}
               </h1>
               
               <p className="text-muted-foreground text-[15px] leading-relaxed mb-8">
                 {lang === 'ta' && translations[selectedArticle.id] ? translations[selectedArticle.id].summary : selectedArticle.summary}
               </p>

               <div className="space-y-8">
                 <div>
                   <div className="flex items-center gap-2 mb-4 text-[11px] font-bold tracking-widest text-emerald-600 uppercase">
                     <Lightbulb className="w-4 h-4" /> {lang === 'ta' ? 'முக்கிய குறிப்புகள்' : 'Key specifics'}
                     {translatingDetail && lang === 'ta' && <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />}
                   </div>
                   <ul className="space-y-4">
                     {(lang === 'ta' && detailedTranslations[selectedArticle.id]?.key_facts ? detailedTranslations[selectedArticle.id].key_facts : (selectedArticle.key_facts || [])).map((fact, idx) => (
                       <li key={idx} className="flex items-start gap-3 text-[14px] text-foreground leading-relaxed">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                         {fact}
                       </li>
                     ))}
                   </ul>
                 </div>

                 <div>
                   <h3 className="text-lg font-bold text-foreground mb-2 border-b border-border pb-2">{lang === 'ta' ? 'தேர்வு கண்ணோட்டம்' : 'Exam lens'}</h3>
                   <p className="text-muted-foreground leading-relaxed text-[14px] pt-2">
                     {lang === 'ta' && detailedTranslations[selectedArticle.id]?.revision_notes ? detailedTranslations[selectedArticle.id].revision_notes : selectedArticle.revision_notes}
                   </p>
                 </div>
               </div>

               <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
                 <a href={selectedArticle.source_url} target="_blank" rel="noreferrer" className="text-xs font-medium text-indigo-600 hover:underline">
                   View original source
                 </a>
                 <span className="text-[10px] font-medium bg-accent px-2 py-1 rounded text-muted-foreground">
                   {selectedArticle.provider}
                 </span>
               </div>
            </div>
            
            {/* Bottom Action Bar */}
            <div className="p-4 border-t border-border bg-background flex items-center justify-between shrink-0">
               <Button variant="outline" className="rounded-full gap-2 text-muted-foreground">
                 <Check className="w-4 h-4" /> Mark as read
               </Button>
               <Button variant="secondary" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-sm shadow-indigo-500/20">
                 Take Daily Quiz
               </Button>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
