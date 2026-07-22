import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ExamplesClient from './ExamplesClient'

interface ExamplesPageProps {
  params: Promise<{
    subjectId: string;
    topicId: string;
  }>
}

export default async function ExamplesPage({ params }: ExamplesPageProps) {
  const { subjectId, topicId } = await params;
  const supabase = await createClient();

  // 1. Fetch Subject
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('id', subjectId)
    .single();

  if (subjectError || !subject) {
    notFound();
  }

  // 2. Fetch Topic (Chapter) ensuring it belongs to the subject
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('id, title, subject_id')
    .eq('id', topicId)
    .single();

  if (chapterError || !chapter || chapter.subject_id !== subjectId) {
    notFound();
  }

  // 3. Fetch Examples for this specific chapter
  const { data: examples, error: examplesError } = await supabase
    .from('examples')
    .select('*')
    .eq('chapter_id', topicId)
    .order('order_index', { ascending: true });

  if (examplesError) {
    console.error('Error fetching examples:', examplesError);
  }

  return (
    <ExamplesClient 
      subject={{ id: subject.id, name: subject.name }}
      chapter={{ id: chapter.id, title: chapter.title }}
      examples={examples || []}
    />
  );
}
