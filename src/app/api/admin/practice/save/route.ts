import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { subjectId, topicId, subjectName, topicTitle, questions } = await request.json();

    if (!subjectId || !topicId || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Auth Check
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Insert practice questions into DB as a single row in topic_contents
    const { data: practiceData, error: pError } = await supabase
      .from('topic_contents')
      .insert({
        subject_id: subjectId,
        topic_id: topicId,
        content_type: 'practice',
        content: questions, // JSON array of questions
        status: 'published',
        created_by: user.id
      })
      .select()
      .single();
    
    if (pError) throw pError;

    return NextResponse.json({ success: true, count: questions.length });
  } catch (error: any) {
    console.error('Error saving practice questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save practice questions' },
      { status: 500 }
    );
  }
}
