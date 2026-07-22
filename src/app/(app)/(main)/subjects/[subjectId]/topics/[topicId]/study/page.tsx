import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StudyClient from './StudyClient'

interface StudyPageProps {
  params: Promise<{
    subjectId: string;
    topicId: string;
  }>
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { subjectId, topicId } = await params;
  const supabase = await createClient();

  // 1. Fetch Subject
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('id', subjectId)
    .single();

  if (subjectError || !subject) {
    console.error('Error fetching subject:', subjectError);
    notFound();
  }

  // 2. Fetch Topic (Chapter) ensuring it belongs to the subject
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('id, title, subject_id')
    .eq('id', topicId)
    .single();

  if (chapterError || !chapter) {
    console.error('Error fetching chapter:', chapterError);
    notFound();
  }

  // Security Check: Ensure chapter belongs to the requested subject
  if (chapter.subject_id !== subjectId) {
    console.error(`Chapter ${topicId} does not belong to subject ${subjectId}`);
    notFound();
  }

  // 3. Fetch Lesson content for this specific chapter
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('id, content')
    .eq('topic_id', topicId)
    .eq('content_type', 'study_material')
    .limit(1)
    .single();

  // It's okay if lesson is missing (it will just be null), as AI can generate it
  if (lessonError && lessonError.code !== 'PGRST116') { // PGRST116 is the code for "no rows returned"
    console.error('Error fetching lesson:', lessonError);
  }

  return (
    <StudyClient 
      subject={{ id: subject.id, name: subject.name }}
      chapter={{ id: chapter.id, title: chapter.title }}
      lesson={lesson ? { content: lesson.content } : null}
    />
  );
}
