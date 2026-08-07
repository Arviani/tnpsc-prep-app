import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('ai_usage')
      .select('total_tokens, status, response_time')
      .gte('created_at', today.toISOString());

    if (error) {
      throw error;
    }

    const totalRequests = data.length;
    const successfulRequests = data.filter(d => d.status === 'success').length;
    const failedRequests = data.filter(d => d.status === 'error' || d.status === 'rate_limited').length;
    
    let totalTokensToday = 0;
    let totalResponseTime = 0;

    data.forEach(row => {
      totalTokensToday += (row.total_tokens || 0);
      totalResponseTime += (row.response_time || 0);
    });

    const averageResponseTime = successfulRequests > 0 ? Math.round(totalResponseTime / successfulRequests) : 0;
    
    // Fetch real usage from OpenRouter
    let orUsage = 0;
    let orLimit = 1; // avoid division by zero
    try {
      const orResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
      });
      if (orResponse.ok) {
        const orData = await (orResponse as any).json();
        if (orData.data) {
          orUsage = orData.data.usage || 0;
          orLimit = orData.data.limit || 50; // default 50 credit limit if undefined
        }
      }
    } catch (e) {
      console.error('Failed to fetch OpenRouter usage', e);
    }

    const tokenUsagePercentage = Math.min(100, Math.round((orUsage / orLimit) * 100));
    
    return NextResponse.json({
      success: true,
      stats: {
        totalRequests,
        successfulRequests,
        failedRequests,
        totalTokensToday,
        averageResponseTime,
        dailyTokenLimit: orLimit, // sending the credit limit
        tokenUsagePercentage,
        estimatedCost: orUsage // actual usage from openrouter
      }
    });

  } catch (error: any) {
    console.error('Failed to fetch AI usage:', error);
    return NextResponse.json({ error: 'Failed to fetch AI usage data' }, { status: 500 });
  }
}
