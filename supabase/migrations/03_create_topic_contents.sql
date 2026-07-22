-- SQL script to create unified topic_contents table

CREATE TABLE IF NOT EXISTS public.topic_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- 'study', 'examples', 'practice', 'quiz', 'revision', 'flashcards'
    title TEXT,
    content JSONB NOT NULL, -- Flexible structure for different content types
    status TEXT DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    published_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(topic_id, content_type)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.topic_contents ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Public read access for published content
CREATE POLICY "Public read access for published topic contents"
    ON public.topic_contents FOR SELECT USING (status = 'published');

-- 2. Admin read access for all content
CREATE POLICY "Admin read access for all topic contents"
    ON public.topic_contents FOR SELECT USING (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

-- 3. Admin insert access
CREATE POLICY "Admin insert access for topic contents"
    ON public.topic_contents FOR INSERT WITH CHECK (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

-- 4. Admin update access
CREATE POLICY "Admin update access for topic contents"
    ON public.topic_contents FOR UPDATE USING (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

-- 5. Admin delete access
CREATE POLICY "Admin delete access for topic contents"
    ON public.topic_contents FOR DELETE USING (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
