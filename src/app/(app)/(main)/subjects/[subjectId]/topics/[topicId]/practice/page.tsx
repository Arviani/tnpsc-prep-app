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

  // 3. Fetch Practice Questions for this specific chapter from topic_contents
  const { data: questionsData, error: questionsError } = await supabase
    .from('topic_contents')
    .select('content')
    .eq('topic_id', topicId)
    .eq('content_type', 'practice')
    .single();

  if (questionsError && questionsError.code !== 'PGRST116') {
    console.error('Error fetching questions:', questionsError);
  }

  // Extract the JSON array from content, default to empty array
  const questions = questionsData?.content as any[] || [];

  return (
    <PracticeClient 
      subject={{ id: subject.id, name: subject.name }}
      chapter={{ id: chapter.id, title: chapter.title }}
      questions={questions}
    />
  );
}
