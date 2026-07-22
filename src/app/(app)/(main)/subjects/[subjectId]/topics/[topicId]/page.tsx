import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { chapterService } from '@/services/chapter.service'
import { subjectService } from '@/services/subject.service'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlayCircle, Target, BookOpen, BrainCircuit, FileText, CheckCircle2, Zap, Library, BookMarked, PenTool, Clock, AlertCircle } from 'lucide-react'

export default async function TopicOverviewPage({
  params
}: {
  params: Promise<{ subjectId: string, topicId: string }>
}) {
  const { subjectId, topicId } = await params

  let topic = null
  let overview = null

  try {
    const chapters = await chapterService.getChaptersBySubject(subjectId)
    topic = chapters.find(c => c.id === topicId) || null

    if (topic) {
      const supabase = await createClient()
      const { data } = await supabase
        .from('lessons')
        .select('content')
        .eq('topic_id', topic.id)
        .eq('content_type', 'overview')
        .single()
      
      if (data) {
        overview = data.content
      }
    }
  } catch (error) {}

  if (!topic) notFound()

  // Placeholder metrics
  const completionPercent = 15
  const studyMins = 45
  const practiceQuestions = 120
  const pyqQuestions = 45

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HERO SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row relative">
        {/* Left Content */}
        <div className="p-8 md:w-2/3 space-y-5">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide">
            <Zap className="w-3.5 h-3.5" /> Core Topic
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{topic.title}</h1>
            {overview ? (
              <p className="text-slate-500 text-base leading-relaxed">
                {overview}
              </p>
            ) : (
              <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 mt-4">
                <AlertCircle className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium">No overview available.</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Learning Objectives</h4>
            <ul className="space-y-2">
              {["Understand core principles and terminology.", "Apply shortcuts to solve practice questions.", "Analyze previous year questions (PYQs) patterns."].map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Stats Panel */}
        <div className="bg-slate-50 p-8 md:w-1/3 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center text-sm font-bold mb-2">
                <span className="text-slate-700">Topic Mastery</span>
                <span className="text-indigo-600">{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} className="h-2.5 bg-slate-200 [&>div]:bg-indigo-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Est. Time</div>
                <div className="text-xl font-bold text-slate-900">{studyMins}m</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1"><Target className="w-3.5 h-3.5"/> Difficulty</div>
                <div className="text-xl font-bold text-amber-600">Medium</div>
              </div>
            </div>
            
            <Link href={`/subjects/${subjectId}/topics/${topicId}/study`} className="block pt-2">
              <Button className="w-full rounded-xl h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:-translate-y-0.5">
                Start Studying Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Learning Path</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Link href={`/subjects/${subjectId}/topics/${topicId}/study`} className="group">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all duration-300 h-full flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookMarked className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Study Material</h3>
              <p className="text-sm text-slate-500 mb-4">Read theory, concepts, and AI-explained examples.</p>
              <div className="mt-auto text-indigo-600 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                Begin Reading →
              </div>
            </div>
          </Link>

          <Link href={`/subjects/${subjectId}/topics/${topicId}/practice`} className="group">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all duration-300 h-full flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Practice Questions</h3>
              <p className="text-sm text-slate-500 mb-4">Solve {practiceQuestions} questions with AI feedback on wrong answers.</p>
              <div className="mt-auto text-blue-600 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                Start Practice →
              </div>
            </div>
          </Link>

          <Link href={`/subjects/${subjectId}/topics/${topicId}/quiz`} className="group">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-purple-300 hover:shadow-md transition-all duration-300 h-full flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Topic Quiz</h3>
              <p className="text-sm text-slate-500 mb-4">Test your mastery with a timed mock test.</p>
              <div className="mt-auto text-purple-600 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                Take Quiz →
              </div>
            </div>
          </Link>

          <Link href={`/subjects/${subjectId}/topics/${topicId}/revision`} className="group">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-amber-300 hover:shadow-md transition-all duration-300 h-full flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">AI Revision</h3>
              <p className="text-sm text-slate-500 mb-4">Generate bullet notes, summaries, and exam tips.</p>
              <div className="mt-auto text-amber-600 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                Start Revision →
              </div>
            </div>
          </Link>

          <div className="group opacity-70 cursor-not-allowed">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Locked</div>
              <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center mb-4">
                <Library className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Flashcards</h3>
              <p className="text-sm text-slate-500 mb-4">Quick memory recall cards.</p>
              <div className="mt-auto text-slate-400 font-semibold text-sm">
                Unlock via Practice
              </div>
            </div>
          </div>

          <div className="group opacity-70 cursor-not-allowed">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Locked</div>
              <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center mb-4">
                <PlayCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Previous Year Qs</h3>
              <p className="text-sm text-slate-500 mb-4">{pyqQuestions} questions from past TNPSC exams.</p>
              <div className="mt-auto text-slate-400 font-semibold text-sm">
                Unlock via Quiz
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

