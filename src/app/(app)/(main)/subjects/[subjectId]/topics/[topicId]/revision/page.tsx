import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RevisionClient from './RevisionClient'

interface RevisionPageProps {
  params: Promise<{
    subjectId: string;
    topicId: string;
  }>
}

export default async function RevisionPage({ params }: RevisionPageProps) {
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

  // 3. Check if revision notes exist in lessons table
  const { data: revisionData, error: revisionError } = await supabase
    .from('lessons')
    .select('id')
    .eq('topic_id', topicId)
    .eq('content_type', 'revision')
    .limit(1)
    .maybeSingle();

  if (revisionError && revisionError.code !== 'PGRST116') {
    console.error('Error fetching revision notes:', revisionError);
  }

  const hasRevisionNotes = !!revisionData;

  return (
    <RevisionClient 
      topicTitle={chapter.title}
      hasRevisionNotes={hasRevisionNotes}
    />
  );
}
