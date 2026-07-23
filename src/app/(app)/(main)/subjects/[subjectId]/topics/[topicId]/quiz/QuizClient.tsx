"use client"

import React, { useState, useEffect } from 'react';
import { useGlobalAIStore } from '@/hooks/useGlobalAIStore';
import { buildQuizPrompt, QuizAction, QuizData } from '@/lib/ai/prompts/quiz';
import { TopicContext } from '@/lib/ai/context';
import { AIError } from '@/components/ai/AIError';
import { Trophy, Clock, Target, Calendar, BarChart2, Zap, RotateCcw, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizClientProps {
  topicTitle: string;
  hasQuestions: boolean;
}

export default function QuizClient({ topicTitle, hasQuestions }: QuizClientProps) {
  const context: TopicContext = {
    subject: "Subject Name", // The quiz mock data doesn't pass subject name currently, we'd ideally pass it
    topic: topicTitle,
    currentTab: 'quiz',
    exam: 'TNPSC Group 4',
    language: 'English',
    difficulty: 'Beginner',
    userRole: 'student'
  };

  const [activeAction, setActiveAction] = useState<QuizAction | null>(null);

  const MOCK_QUIZ_DATA: QuizData = {
    score: 6,
    totalQuestions: 10,
    timeSpentSeconds: 420,
    accuracyPercentage: 60,
    correctTopics: ["Town Planning", "Geographical Extent"],
    incorrectTopics: ["Trade & Commerce", "Religious Practices", "Decline of IVC"]
  };

  useEffect(() => {
    const store = useGlobalAIStore.getState();
    store.setContext(context);
    store.setActions([
      { label: 'My Strengths', icon: Trophy, prompt: buildQuizPrompt(context, MOCK_QUIZ_DATA, 'strengths') },
      { label: 'Weak Areas', icon: Target, prompt: buildQuizPrompt(context, MOCK_QUIZ_DATA, 'weak_areas') },
      { label: 'Speed Analysis', icon: Clock, prompt: buildQuizPrompt(context, MOCK_QUIZ_DATA, 'speed') },
      { label: 'Topic Breakdown', icon: BarChart2, prompt: buildQuizPrompt(context, MOCK_QUIZ_DATA, 'topic_analysis') },
      { label: '7-Day Study Plan', icon: Calendar, prompt: buildQuizPrompt(context, MOCK_QUIZ_DATA, 'study_plan') },
    ]);
  }, [topicTitle]);

  if (!hasQuestions) {
    return (
      <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-12">
        <div className="flex-1 text-center border-2 border-dashed border-border rounded-xl bg-secondary/50 p-8">
          <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm border border-border-subtle">
            <AlertTriangle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No quiz available.</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            There is no quiz available for this topic right now. Please check back later.
          </p>
        </div>
      </div>
    );
  }


  const scorePercentage = (MOCK_QUIZ_DATA.score / MOCK_QUIZ_DATA.totalQuestions) * 100;
  
  // Determine color based on score
  let scoreColor = "text-red-500";
  let scoreBg = "stroke-red-500";
  let feedbackText = "Needs Improvement";
  
  if (scorePercentage >= 80) {
    scoreColor = "text-green-500";
    scoreBg = "stroke-green-500";
    feedbackText = "Excellent Work!";
  } else if (scorePercentage >= 60) {
    scoreColor = "text-amber-500";
    scoreBg = "stroke-amber-500";
    feedbackText = "Good Effort";
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Quiz Results Header */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-slate-900"></div>
        
        <div className="relative pt-16 px-8 pb-8 flex flex-col items-center">
          
          {/* Circular Score */}
          <div className="relative w-40 h-40 bg-card rounded-full flex items-center justify-center shadow-lg border-4 border-white mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="stroke-slate-100" strokeWidth="8" cx="50" cy="50" r="42" fill="transparent" />
              <circle 
                className={`${scoreBg} transition-all duration-1000 ease-out`} 
                strokeWidth="8" 
                strokeLinecap="round" 
                cx="50" cy="50" r="42" 
                fill="transparent" 
                strokeDasharray={`${(scorePercentage / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${scoreColor}`}>{MOCK_QUIZ_DATA.score}</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Out of {MOCK_QUIZ_DATA.totalQuestions}</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">{feedbackText}</h2>
          <p className="text-muted-foreground mb-8 max-w-md text-center">You have completed the quiz on <strong>{topicTitle}</strong>. Review your performance metrics below.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="bg-secondary rounded-2xl p-4 text-center border border-border-subtle">
              <Target className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-muted-foreground mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-foreground">{MOCK_QUIZ_DATA.accuracyPercentage}%</div>
            </div>
            <div className="bg-secondary rounded-2xl p-4 text-center border border-border-subtle">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-muted-foreground mb-1">Time Taken</div>
              <div className="text-2xl font-bold text-foreground">{Math.floor(MOCK_QUIZ_DATA.timeSpentSeconds / 60)}m {MOCK_QUIZ_DATA.timeSpentSeconds % 60}s</div>
            </div>
            <div className="bg-secondary rounded-2xl p-4 text-center border border-border-subtle">
              <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-muted-foreground mb-1">XP Earned</div>
              <div className="text-2xl font-bold text-foreground">+450</div>
            </div>
            <div className="bg-secondary rounded-2xl p-4 text-center border border-border-subtle flex flex-col justify-center gap-2">
              <Button variant="outline" className="w-full text-xs font-bold h-9">
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retake
              </Button>
              <Button className="w-full text-xs font-bold h-9 bg-slate-900">
                Next Topic <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-4">
        <Button variant="outline" onClick={() => useGlobalAIStore.getState().openChat()}>
          <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
          Open AI Assistant
        </Button>
      </div>
    </div>
  );
}
