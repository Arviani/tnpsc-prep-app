import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PracticeClient from './PracticeClient'

interface PracticePageProps {
  params: Promise<{
    subjectId: string;
    topicId: string;
  }>
}

export default async function PracticePage({ params }: PracticePageProps) {
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

  // 3. Fetch Questions for this specific chapter (not pyq, just normal practice)
  const { data: questionsData, error: questionsError } = await supabase
    .from('questions')
    .select(`
      id, 
      body, 
      options (
        id,
        body,
        is_correct
      )
    `)
    .eq('chapter_id', topicId)
    .eq('is_pyq', false);

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
  }

  // Transform data format if needed
  const questions = questionsData?.map(q => ({
    id: q.id,
    body: q.body,
    options: q.options || []
  })) || [];

  return (
    <PracticeClient 
      subject={{ id: subject.id, name: subject.name }}
      chapter={{ id: chapter.id, title: chapter.title }}
      questions={questions}
    />
  );
}
