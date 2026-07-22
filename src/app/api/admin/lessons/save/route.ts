import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    // 1. Verify user is authenticated
    const supabaseServer = await createClient()
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Bypass strict role check for local testing/development:
    // const role = user.user_metadata?.role
    // if (role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    // }

    // 2. Validate request payload
    const body = await request.json()
    const { subjectId, topicId, title, content } = body

    if (!subjectId || !topicId || !title || !content) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
    }

    // 3. Initialize Service Role Client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.')
      return NextResponse.json(
        { error: 'Server configuration error: Missing service role key' }, 
        { status: 500 }
      )
    }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey)

    // 4. Fetch existing lesson for this chapter to prevent duplicates
    const { data: existingLesson, error: fetchError } = await supabaseAdmin
      .from('lessons')
      .select('id')
      .eq('topic_id', topicId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing lesson:', fetchError)
      return NextResponse.json({ error: `Database error: ${fetchError.message}` }, { status: 500 })
    }

    if (existingLesson) {
      return NextResponse.json({ error: 'A lesson already exists for this topic' }, { status: 400 })
    }

    // 5. Insert new lesson
    const { data: insertedData, error: dbError } = await supabaseAdmin
      .from('lessons')
      .insert({
        subject_id: subjectId,
        topic_id: topicId,
        title: title,
        content: content,
        content_type: 'study_material',
        status: 'published',
        created_by: user.id
      })
      .select()

    if (dbError) {
      console.error('Error inserting lesson:', dbError)
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      data: insertedData 
    })

  } catch (error: any) {
    console.error('Admin Lesson Save Error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
