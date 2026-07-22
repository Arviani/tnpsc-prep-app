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

  // 3. Fetch Examples for this specific chapter from topic_contents
  const { data: examplesData, error: examplesError } = await supabase
    .from('topic_contents')
    .select('content')
    .eq('topic_id', topicId)
    .eq('content_type', 'examples')
    .single();

  if (examplesError && examplesError.code !== 'PGRST116') {
    console.error('Error fetching examples:', examplesError);
  }

  // Extract the JSON array from content, default to empty array
  const examples = examplesData?.content as any[] || [];

  return (
    <ExamplesClient 
      subject={{ id: subject.id, name: subject.name }}
      chapter={{ id: chapter.id, title: chapter.title }}
      examples={examples || []}
    />
  );
}
