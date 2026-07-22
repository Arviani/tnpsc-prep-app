import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QuizClient from './QuizClient'

interface QuizPageProps {
  params: Promise<{
    subjectId: string;
    topicId: string;
  }>
}

export default async function QuizPage({ params }: QuizPageProps) {
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

  // 2. Fetch Topic
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('id, title, subject_id')
    .eq('id', topicId)
    .single();

  if (chapterError || !chapter || chapter.subject_id !== subjectId) {
    notFound();
  }

  // 3. Check if quiz questions exist
  const { count, error: questionsError } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('chapter_id', topicId)
    .eq('exam_type', 'quiz');

  if (questionsError) {
    console.error('Error checking quiz questions:', questionsError);
  }

  const hasQuestions = count ? count > 0 : false;

  return (
    <QuizClient 
      topicTitle={chapter.title}
      hasQuestions={hasQuestions}
    />
  );
}
