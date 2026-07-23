import { subjectService } from '@/services/subject.service'
import { chapterService } from '@/services/chapter.service'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContentArea } from '@/components/common/ContentArea'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Target, Clock, Zap, BookMarked, HelpCircle, FileText, BrainCircuit, Play, PenTool, LayoutList } from 'lucide-react'
import { GenerateTopicsDialog } from '@/components/subjects/GenerateTopicsDialog'
import { TopicActions } from '@/components/subjects/TopicActions'
import { AdminOnly } from '@/components/common/AdminOnly'

export default async function ChaptersPage({
  params,
}: {
  params: Promise<{ subjectId: string }>
}) {
  const { subjectId } = await params
  
  let subject = null
  try {
    subject = await subjectService.getSubject(subjectId)
  } catch (error) {}

  if (!subject) {
    notFound()
  }

  let chapters: any[] = []
  try {
    chapters = await chapterService.getChaptersBySubject(subjectId)
  } catch (error) {}

  // Mocks for visual design
  const progressPercent = 35
  const dailyGoalComplete = true

  return (
    <ContentArea>
      <div className="max-w-6xl mx-auto space-y-4 pb-12 pt-1">
        {/* HERO SECTION */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-card opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 grid md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-card/10 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                  <BookOpen className="w-3 h-3" /> Subject
                </div>
                <h1 className="text-2xl font-bold">{subject.name}</h1>
              </div>
              <p className="text-indigo-100 max-w-xl text-sm opacity-90 line-clamp-1">
                {subject.description || "Master the concepts for this subject with AI-guided study and targeted practice."}
              </p>
              
              <div className="pt-2 flex flex-col gap-1 max-w-md">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span>Course Progress</span>
                  <span className="font-bold">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-1.5 bg-black/20 [&>div]:bg-card" />
              </div>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-3 justify-center">
              <Button size="sm" className="bg-card text-indigo-900 hover:bg-indigo-50 font-bold rounded-lg shadow-sm transition-all h-9 px-4">
                Continue Learning <Play className="w-3.5 h-3.5 ml-1.5 fill-current" />
              </Button>
              
              <div className="flex items-center gap-3 text-xs text-indigo-100 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5">
                  <Target className={`w-3.5 h-3.5 ${dailyGoalComplete ? "text-green-400" : "text-white/50"}`} />
                  <span className="font-medium">{dailyGoalComplete ? "Daily Goal Met" : "1/3 Lessons"}</span>
                </div>
                <div className="w-px h-4 bg-card/20"></div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-300" />
                  <span className="font-medium">42h Est.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Topics", value: chapters.length || 12, icon: LayoutList, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Practice Qs", value: "1,240", icon: HelpCircle, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "PYQs Available", value: "350+", icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Study Time", value: "12h 45m", icon: Clock, color: "text-green-600", bg: "bg-green-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border-subtle px-4 py-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground leading-tight">{stat.value}</div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* TOPICS SECTION */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Learning Topics
            </h2>
          </div>

          {!chapters || chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/50">
              <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm border border-border-subtle">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-indigo-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">This subject has no topics</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Start building out your curriculum by generating a structured syllabus using AI based on TNPSC standards.
              </p>
              <AdminOnly fallback={<p className="text-sm text-muted-foreground italic">Please wait for an admin to publish content.</p>}>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="rounded-lg px-4 font-medium h-9">
                    Add Manually
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg px-4 font-medium h-9">
                    Import Topics
                  </Button>
                  <GenerateTopicsDialog subjectId={subjectId} subjectName={subject.name} />
                </div>
              </AdminOnly>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {chapters.map((chapter, index) => {
                const questionCount = Math.floor(Math.random() * 50) + 20
                const estimatedMins = Math.floor(Math.random() * 60) + 30
                const chapterProgress = Math.floor(Math.random() * 100)
                const isCompleted = chapterProgress === 100
                const mockStatus = index === 0 ? 'published' : index === 1 ? 'draft' : index === 2 ? 'review' : 'empty'

                return (
                  <div key={chapter.id} className="group bg-card border border-border p-3 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground bg-accent px-1.5 py-0.5 rounded text-center uppercase tracking-wide">
                            Topic {index + 1}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-1.5 py-0.5 rounded text-center uppercase tracking-wide">
                            Medium
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground line-clamp-1 leading-tight">{chapter.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {chapter.description || "Dive into the key concepts and fundamental principles of this topic."}
                        </p>
                      </div>
                      
                      <div className="shrink-0 text-center flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full border-[3px] flex items-center justify-center font-bold text-xs ${isCompleted ? 'border-green-500 text-green-600' : 'border-indigo-100 text-indigo-600'}`}>
                          {chapterProgress}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium mb-3 pt-2 border-t border-border-subtle">
                      <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {estimatedMins}m</div>
                      <div className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> {questionCount} Qs</div>
                      <div className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> 24 PYQs</div>
                    </div>

                    <TopicActions 
                      subjectId={subject.id} 
                      chapterId={chapter.id} 
                      chapterProgress={chapterProgress} 
                      status={mockStatus}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </ContentArea>
  )
}
