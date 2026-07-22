-- SQL script to create topic_content_versions table for Version History

CREATE TABLE IF NOT EXISTS public.topic_content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_content_id UUID NOT NULL REFERENCES public.topic_contents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(topic_content_id, version_number)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.topic_content_versions ENABLE ROW LEVEL SECURITY;

-- 1. Admin read access for all versions
CREATE POLICY "Admin read access for content versions"
    ON public.topic_content_versions FOR SELECT USING (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

-- 2. Admin insert access
CREATE POLICY "Admin insert access for content versions"
    ON public.topic_content_versions FOR INSERT WITH CHECK (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

-- Add updated_by to topic_contents if it doesn't exist
ALTER TABLE public.topic_contents ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
