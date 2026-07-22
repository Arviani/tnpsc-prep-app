import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { subjectId, topicId, examples } = await request.json();

    if (!subjectId || !topicId || !examples || !Array.isArray(examples)) {
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

    // Insert examples into DB
    const insertedExamples = [];
    for (let i = 0; i < examples.length; i++) {
      const ex = examples[i];
      const { data: exampleData, error: eError } = await supabase
        .from('examples')
        .insert({
          chapter_id: topicId,
          question_text: ex.question_text,
          step_by_step_solution: ex.step_by_step_solution,
          explanation: ex.explanation,
          order_index: i
        })
        .select()
        .single();
      
      if (eError) throw eError;
      insertedExamples.push(exampleData);
    }

    return NextResponse.json({ success: true, count: insertedExamples.length });
  } catch (error: any) {
    console.error('Error saving examples:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save examples' },
      { status: 500 }
    );
  }
}
