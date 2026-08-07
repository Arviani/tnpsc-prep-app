-- Migration for Automated Current Affairs System

DROP TABLE IF EXISTS public.current_affair_questions CASCADE;
DROP TABLE IF EXISTS public.current_affair_keywords CASCADE;
DROP TABLE IF EXISTS public.current_affair_sources CASCADE;
DROP TABLE IF EXISTS public.current_affairs CASCADE;

CREATE TABLE public.current_affairs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  headline text NOT NULL,
  summary text NOT NULL,
  key_facts text[] DEFAULT '{}'::text[],
  revision_notes text,
  tnpsc_subject text,
  difficulty text,
  important_dates jsonb DEFAULT '[]'::jsonb,
  important_numbers jsonb DEFAULT '[]'::jsonb,
  category text,
  published_date date NOT NULL,
  source_url text,
  provider text,
  status text NOT NULL DEFAULT 'draft',
  ai_metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT current_affairs_pkey PRIMARY KEY (id)
);

CREATE TABLE public.current_affair_questions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  current_affair_id uuid NOT NULL REFERENCES public.current_affairs(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  explanation text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT current_affair_questions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.current_affair_keywords (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  current_affair_id uuid NOT NULL REFERENCES public.current_affairs(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  CONSTRAINT current_affair_keywords_pkey PRIMARY KEY (id)
);

CREATE TABLE public.current_affair_sources (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL, -- 'newsapi', 'rss'
  url text,
  is_active boolean DEFAULT true,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT current_affair_sources_pkey PRIMARY KEY (id)
);

-- Triggers for updated_at
CREATE TRIGGER handle_current_affairs_updated_at
  BEFORE UPDATE ON public.current_affairs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.current_affairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_affair_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_affair_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_affair_sources ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published current affairs
CREATE POLICY "Allow public read access to published current affairs" ON public.current_affairs
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow public read access to published current affair questions" ON public.current_affair_questions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.current_affairs
    WHERE current_affairs.id = current_affair_questions.current_affair_id
    AND current_affairs.status = 'published'
  ));

CREATE POLICY "Allow public read access to published current affair keywords" ON public.current_affair_keywords
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.current_affairs
    WHERE current_affairs.id = current_affair_keywords.current_affair_id
    AND current_affairs.status = 'published'
  ));

-- Admins full access
CREATE POLICY "Allow admins full access to current affairs" ON public.current_affairs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admins full access to current affair questions" ON public.current_affair_questions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admins full access to current affair keywords" ON public.current_affair_keywords
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admins full access to current affair sources" ON public.current_affair_sources
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
