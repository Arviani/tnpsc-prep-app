import { NextResponse } from 'next/server';
import { NewsService } from '@/lib/news/service';

export async function GET(request: Request) {
  // Add simple authentication to prevent unauthorized triggers
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In development or if not set, allow for now, or you can strictly enforce it
    if (process.env.NODE_ENV === 'production') {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const url = new URL(request.url);
    const providersParam = url.searchParams.get('providers');
    const enabledProviders = providersParam ? providersParam.split(',') : undefined;

    const result = await NewsService.runDailyIngestion(enabledProviders);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('News Ingestion Cron Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
