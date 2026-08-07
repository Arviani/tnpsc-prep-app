'use client'

import React from 'react'
import { ContentArea } from '@/components/common/ContentArea'
import { ContentHeader } from '@/components/common/ContentHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function NewsSettingsPage() {
  return (
    <ContentArea 
      header={
        <ContentHeader 
          title="Current Affairs Settings" 
          description="Manage News Providers, RSS Feeds, and AI processing limits." 
        />
      }
    >
      <div className="grid gap-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>NewsAPI Provider</CardTitle>
            <CardDescription>Configure API keys and categories for NewsAPI.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Managed via NEWSAPI_KEY environment variable.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Google News RSS</CardTitle>
            <CardDescription>Configure feed URLs.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground">Managed via GOOGLE_NEWS_RSS_URLS environment variable.</p>
          </CardContent>
        </Card>
      </div>
    </ContentArea>
  )
}
