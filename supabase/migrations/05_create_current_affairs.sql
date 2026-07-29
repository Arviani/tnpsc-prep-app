-- Migration to create current_affairs table

DROP TABLE IF EXISTS public.current_affairs CASCADE;

CREATE TABLE public.current_affairs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  title text NOT NULL,
  category text,
  source text,
  direct_fact text NOT NULL,
  key_specifics text[] DEFAULT '{}'::text[],
  exam_lens text,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.current_affairs ADD CONSTRAINT current_affairs_pkey PRIMARY KEY (id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_current_affairs_updated_at
  BEFORE UPDATE ON public.current_affairs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Set RLS policies
ALTER TABLE public.current_affairs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published current affairs
CREATE POLICY "Allow public read access to published current affairs" ON public.current_affairs
  FOR SELECT USING (status = 'published');

-- Allow authenticated admins to do everything
CREATE POLICY "Allow admins full access to current affairs" ON public.current_affairs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
