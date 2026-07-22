-- SQL script to create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'study_material',
    status TEXT NOT NULL DEFAULT 'draft',
    created_by UUID,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Public read access for published lessons
CREATE POLICY "Public read access for published lessons"
    ON public.lessons FOR SELECT USING (status = 'published');

-- 2. Admin read access for all lessons
CREATE POLICY "Admin read access for all lessons"
    ON public.lessons FOR SELECT USING (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

-- 3. Admin insert access
CREATE POLICY "Admin insert access"
    ON public.lessons FOR INSERT WITH CHECK (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

-- 4. Admin update access
CREATE POLICY "Admin update access"
    ON public.lessons FOR UPDATE USING (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

-- 5. Admin delete access
CREATE POLICY "Admin delete access"
    ON public.lessons FOR DELETE USING (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );
