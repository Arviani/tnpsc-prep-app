-- Supabase Migration: Create import_history table

CREATE TABLE IF NOT EXISTS public.import_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    file_type TEXT DEFAULT 'UNKNOWN',
    questions_imported INTEGER DEFAULT 0,
    duplicates_skipped INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    duration_sec INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'processing')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- Allow admins to read (assuming you'll add proper admin RLS later)
CREATE POLICY "Allow authenticated users to read import history"
ON public.import_history FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert (assuming your server action will handle this)
CREATE POLICY "Allow authenticated users to insert import history"
ON public.import_history FOR INSERT
TO authenticated
WITH CHECK (true);
