const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const content = fs.readFileSync('../Source/reasoning-numeric-study.txt', 'utf8');
  
  // Find the topic 'Number Series' or 'Numeric Reasoning'
  const { data: topics, error: topicError } = await supabase.from('chapters').select('id, title, subject_id');
  console.log('Topics:', topics);
  
  const targetTopic = topics.find(t => t.title.toLowerCase().includes('number series'));
  if (!targetTopic) {
    console.error('Topic not found');
    return;
  }
  
  const { data: existing, error: existError } = await supabase
    .from('topic_contents')
    .select('id, version')
    .eq('topic_id', targetTopic.id)
    .eq('content_type', 'study')
    .single();
    
  if (existing) {
    await supabase.from('topic_contents').update({
      content: content,
      updated_at: new Date().toISOString()
    }).eq('id', existing.id);
    console.log('Updated existing content');
  } else {
    await supabase.from('topic_contents').insert({
      subject_id: targetTopic.subject_id,
      topic_id: targetTopic.id,
      content_type: 'study',
      title: targetTopic.title,
      content: content,
      status: 'published',
      version: 1,
      created_by: '00000000-0000-0000-0000-000000000000',
      updated_by: '00000000-0000-0000-0000-000000000000'
    });
    console.log('Inserted new content');
  }
}
main();
