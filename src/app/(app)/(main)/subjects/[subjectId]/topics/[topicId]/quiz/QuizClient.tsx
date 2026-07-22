"use client"

import React, { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { buildQuizPrompt, QuizAction, QuizData } from '@/lib/ai/prompts/quiz';
import { TopicContext } from '@/lib/ai/context';
import { AIChatPanel } from '@/components/ai/AIChatPanel';
import { AIError } from '@/components/ai/AIError';
import { Trophy, Clock, Target, Calendar, BarChart2, Zap, RotateCcw, ArrowRight, AlertTriangle } from 'lucide-react';
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

  const { askAI, answer, isLoading, isError, error, retry } = useAI(context);
  const [activeAction, setActiveAction] = useState<QuizAction | null>(null);

  if (!hasQuestions) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12 h-[calc(100vh-220px)] min-h-[500px]">
        <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-border rounded-xl bg-slate-50/50 p-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
            <AlertTriangle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No quiz available.</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            There is no quiz available for this topic right now. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  const MOCK_QUIZ_DATA: QuizData = {
    score: 6,
    totalQuestions: 10,
    timeSpentSeconds: 420,
    accuracyPercentage: 60,
    correctTopics: ["Town Planning", "Geographical Extent"],
    incorrectTopics: ["Trade & Commerce", "Religious Practices", "Decline of IVC"]
  };

  const handleAIAction = (action: QuizAction) => {
    setActiveAction(action);
    const prompt = buildQuizPrompt(context, MOCK_QUIZ_DATA, action);
    askAI(prompt);
  };

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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-slate-900"></div>
        
        <div className="relative pt-16 px-8 pb-8 flex flex-col items-center">
          
          {/* Circular Score */}
          <div className="relative w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white mb-6">
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
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Out of {MOCK_QUIZ_DATA.totalQuestions}</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">{feedbackText}</h2>
          <p className="text-slate-500 mb-8 max-w-md text-center">You have completed the quiz on <strong>{topicTitle}</strong>. Review your performance metrics below.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
              <Target className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-500 mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-slate-900">{MOCK_QUIZ_DATA.accuracyPercentage}%</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-500 mb-1">Time Taken</div>
              <div className="text-2xl font-bold text-slate-900">{Math.floor(MOCK_QUIZ_DATA.timeSpentSeconds / 60)}m {MOCK_QUIZ_DATA.timeSpentSeconds % 60}s</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
              <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-500 mb-1">XP Earned</div>
              <div className="text-2xl font-bold text-slate-900">+450</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 flex flex-col justify-center gap-2">
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

      {/* AI Quiz Analysis */}
      <div className="scroll-m-20">
        <AIChatPanel 
          context={context}
          actions={[
            { label: 'My Strengths', icon: Trophy, prompt: buildQuizPrompt(context, MOCK_QUIZ_DATA, 'strengths') },
            { label: 'Weak Areas', icon: Target, prompt: buildQuizPrompt(context, MOCK_QUIZ_DATA, 'weak_areas') },
            { label: 'Speed Analysis', icon: Clock, prompt: buildQuizPrompt(context, MOCK_QUIZ_DATA, 'speed') },
            { label: 'Topic Breakdown', icon: BarChart2, prompt: buildQuizPrompt(context, MOCK_QUIZ_DATA, 'topic_analysis') },
            { label: '7-Day Study Plan', icon: Calendar, prompt: buildQuizPrompt(context, MOCK_QUIZ_DATA, 'study_plan') },
          ]}
        />
      </div>
    </div>
  );
}
