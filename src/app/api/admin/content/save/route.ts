import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subjectId, topicId, contentType, title, content, status } = body;

    if (!subjectId || !topicId || !contentType || !content) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing service role key' }, 
        { status: 500 }
      );
    }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey);

    // Fetch existing content to determine if insert or update
    const { data: existingContent, error: fetchError } = await supabaseAdmin
      .from('topic_contents')
      .select('id, version')
      .eq('topic_id', topicId)
      .eq('content_type', contentType)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json({ error: `Database error: ${fetchError.message}` }, { status: 500 });
    }

    let topicContentId;
    let newVersion = 1;

    if (existingContent) {
      topicContentId = existingContent.id;
      newVersion = existingContent.version + 1;
      
      const { error: updateError } = await supabaseAdmin
        .from('topic_contents')
        .update({
          title,
          content,
          status: status || 'draft',
          version: newVersion,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
          ...(status === 'published' ? { published_at: new Date().toISOString() } : {})
        })
        .eq('id', topicContentId);

      if (updateError) {
        return NextResponse.json({ error: `Update error: ${updateError.message}` }, { status: 500 });
      }
    } else {
      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from('topic_contents')
        .insert({
          subject_id: subjectId,
          topic_id: topicId,
          content_type: contentType,
          title,
          content,
          status: status || 'draft',
          version: newVersion,
          created_by: user.id,
          updated_by: user.id,
          ...(status === 'published' ? { published_at: new Date().toISOString() } : {})
        })
        .select('id')
        .single();

      if (insertError) {
        return NextResponse.json({ error: `Insert error: ${insertError.message}` }, { status: 500 });
      }
      topicContentId = insertedData.id;
    }

    // Insert version history snapshot
    const { error: versionError } = await supabaseAdmin
      .from('topic_content_versions')
      .insert({
        topic_content_id: topicContentId,
        version_number: newVersion,
        content,
        title,
        created_by: user.id
      });

    if (versionError) {
      console.error('Warning: Failed to save version history snapshot:', versionError);
    }

    return NextResponse.json({ 
      success: true,
      data: {
        id: topicContentId,
        version: newVersion,
        status: status || 'draft'
      }
    });

  } catch (error: any) {
    console.error('Content Save Error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
