'use client'

import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAIUsageStore } from '@/hooks/useAIUsageStore'
import { Activity, Shield, Coins, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export default function AIUsageDashboard() {
  const { stats, fetchUsage, isLoading } = useAIUsageStore()

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  if (isLoading && !stats) {
    return <div className="p-8 text-muted-foreground flex justify-center mt-20">Loading AI usage data...</div>
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Usage Dashboard</h1>
        <p className="text-muted-foreground mt-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          Strict Free-Tier Architecture Enforced
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-500">-${stats?.estimatedCost?.toFixed(4) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">OpenRouter API Usage</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Limit</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.dailyTokenLimit?.toFixed(2) || 0}</div>
            <p className="text-xs text-muted-foreground">Free Tier - No limit enforced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Requests</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successfulRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Responses delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageResponseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground">Across all free models</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OpenRouter API Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={stats?.tokenUsagePercentage || 0} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="text-red-600 dark:text-red-500">-${stats?.estimatedCost?.toFixed(4) || 0} used</span>
            <span>{stats?.dailyTokenLimit?.toFixed(2) || 0} limit</span>
          </div>
          {(stats?.tokenUsagePercentage || 0) > 80 && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 text-amber-600 rounded-md text-sm font-medium border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
              API usage is reaching the account limit.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
