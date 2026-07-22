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

    // Role check (assume admin for now or check user metadata)
    
    // Insert questions into DB
    const insertedQuestions = [];
    for (const q of questions) {
      const { data: questionData, error: qError } = await supabase
        .from('questions')
        .insert({
          subject_id: subjectId,
          chapter_id: topicId,
          topic: topicTitle,
          body: q.body,
          is_pyq: false,
          exam_type: 'practice'
        })
        .select()
        .single();
      
      if (qError) throw qError;

      const optionsToInsert = q.options.map((opt: any) => ({
        question_id: questionData.id,
        body: opt.body,
        label: 'opt', // Just a dummy label if required
        is_correct: opt.is_correct
      }));

      const { error: oError } = await supabase
        .from('options')
        .insert(optionsToInsert);

      if (oError) throw oError;

      insertedQuestions.push(questionData);
    }

    return NextResponse.json({ success: true, count: insertedQuestions.length });
  } catch (error: any) {
    console.error('Error saving practice questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save practice questions' },
      { status: 500 }
    );
  }
}
