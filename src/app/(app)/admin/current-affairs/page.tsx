'use client'

import React, { useState, useEffect } from 'react'
import { ContentArea } from '@/components/common/ContentArea'
import { ContentHeader } from '@/components/common/ContentHeader'
import { Button } from '@/components/ui/button'
import { Loader2, Globe, CheckCircle2, RefreshCcw, Trash2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface CurrentAffair {
  id: string
  title: string
  category: string
  source: string
  date: string
  status: string
}

export default function AdminCurrentAffairsPage() {
  const [affairs, setAffairs] = useState<CurrentAffair[]>([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchAffairs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('current_affairs')
      .select('id, title, category, source, date, status')
      .order('created_at', { ascending: false })
    
    if (data) setAffairs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchAffairs()
  }, [])

  const handleScrape = async () => {
    setScraping(true)
    try {
      const res = await fetch('/api/admin/scrape-news', { method: 'POST' })
      const json = await res.json()
      if (res.ok) {
        alert(`Successfully scraped ${json.count} articles!`)
        fetchAffairs()
      } else {
        alert(`Error: ${json.error}`)
      }
    } catch (e) {
      alert('Failed to trigger scraper')
    } finally {
      setScraping(false)
    }
  }

  const handleApprove = async (id: string) => {
    await supabase.from('current_affairs').update({ status: 'published' }).eq('id', id)
    fetchAffairs()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      await supabase.from('current_affairs').delete().eq('id', id)
      fetchAffairs()
    }
  }

  return (
    <ContentArea 
      header={
        <ContentHeader 
          title="Manage Current Affairs" 
          description="Review, edit, and approve scraped AI news before publishing." 
        />
      }
    >
      <div className="flex justify-end mb-6">
        <Button onClick={handleScrape} disabled={scraping} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          {scraping ? 'Scraping & Summarizing...' : 'Scrape Today\'s News'}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-accent/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading current affairs...
                  </td>
                </tr>
              ) : affairs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No articles found. Run the scraper to get started.
                  </td>
                </tr>
              ) : (
                affairs.map((item) => (
                  <tr key={item.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground max-w-md truncate">
                      {item.title}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                        <Globe className="w-3 h-3" /> {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === 'published' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {item.status === 'draft' && (
                        <Button variant="ghost" size="sm" onClick={() => handleApprove(item.id)} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 mr-2">
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ContentArea>
  )
}
