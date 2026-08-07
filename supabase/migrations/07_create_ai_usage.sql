-- Create ai_usage table to track free-tier model usage
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    model TEXT NOT NULL,
    provider TEXT NOT NULL,
    request_type TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    estimated_cost NUMERIC(10, 6) DEFAULT 0.00,
    status TEXT NOT NULL,
    response_time INTEGER NOT NULL, -- in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS ai_usage_created_at_idx ON public.ai_usage(created_at);
CREATE INDEX IF NOT EXISTS ai_usage_user_id_idx ON public.ai_usage(user_id);
CREATE INDEX IF NOT EXISTS ai_usage_model_idx ON public.ai_usage(model);

-- Enable RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own usage
CREATE POLICY "Users can view their own AI usage"
ON public.ai_usage FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only service role can insert usage logs (done securely from backend)
CREATE POLICY "Service role can insert AI usage"
ON public.ai_usage FOR INSERT
TO service_role
WITH CHECK (true);
