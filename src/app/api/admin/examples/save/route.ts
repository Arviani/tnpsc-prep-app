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

    // Insert examples into DB as a single row in topic_contents
    const { data: exampleData, error: eError } = await supabase
      .from('topic_contents')
      .insert({
        subject_id: subjectId,
        topic_id: topicId,
        content_type: 'examples',
        content: examples, // This is the JSON array of examples
        status: 'published',
        created_by: user.id
      })
      .select()
      .single();
    
    if (eError) throw eError;

    return NextResponse.json({ success: true, count: examples.length });
  } catch (error: any) {
    console.error('Error saving examples:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save examples' },
      { status: 500 }
    );
  }
}
