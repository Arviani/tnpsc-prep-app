-- SQL script to create lessons and examples tables for the new Subject Learning Flow

-- 1. Create lessons table (for the "Study" module)
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    estimated_minutes INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create examples table (for the "Solved Examples" module)
CREATE TABLE IF NOT EXISTS public.examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    approach_text TEXT,
    step_by_step_solution TEXT NOT NULL,
    final_answer TEXT,
    explanation TEXT,
    order_index INTEGER NOT NULL,
    difficulty TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create topic progress table (Optional but good for tracking completion)
CREATE TABLE IF NOT EXISTS public.topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    study_completed BOOLEAN DEFAULT FALSE,
    examples_completed BOOLEAN DEFAULT FALSE,
    practice_completed BOOLEAN DEFAULT FALSE,
    quiz_completed BOOLEAN DEFAULT FALSE,
    pyq_completed BOOLEAN DEFAULT FALSE,
    revision_completed BOOLEAN DEFAULT FALSE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, chapter_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Public read access for lessons"
    ON public.lessons FOR SELECT USING (true);

CREATE POLICY "Public read access for examples"
    ON public.examples FOR SELECT USING (true);

CREATE POLICY "Users can read own topic progress"
    ON public.topic_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topic progress"
    ON public.topic_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic progress"
    ON public.topic_progress FOR UPDATE USING (auth.uid() = user_id);
