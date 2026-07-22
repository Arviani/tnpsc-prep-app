-- SQL script to create examples and practice_questions tables

CREATE TABLE IF NOT EXISTS public.examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    step_by_step_solution TEXT NOT NULL,
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.practice_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INTEGER,
    explanation TEXT,
    difficulty TEXT DEFAULT 'medium',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;

-- Examples Policies
CREATE POLICY "Public read access for examples"
    ON public.examples FOR SELECT USING (true);

CREATE POLICY "Admin insert access for examples"
    ON public.examples FOR INSERT WITH CHECK (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

CREATE POLICY "Admin update access for examples"
    ON public.examples FOR UPDATE USING (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

CREATE POLICY "Admin delete access for examples"
    ON public.examples FOR DELETE USING (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

-- Practice Questions Policies
CREATE POLICY "Public read access for practice_questions"
    ON public.practice_questions FOR SELECT USING (true);

CREATE POLICY "Admin insert access for practice_questions"
    ON public.practice_questions FOR INSERT WITH CHECK (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

CREATE POLICY "Admin update access for practice_questions"
    ON public.practice_questions FOR UPDATE USING (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

CREATE POLICY "Admin delete access for practice_questions"
    ON public.practice_questions FOR DELETE USING (
        (SELECT (auth.jwt() ->> 'role')) = 'admin' OR 
        (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'admin'
    );

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
