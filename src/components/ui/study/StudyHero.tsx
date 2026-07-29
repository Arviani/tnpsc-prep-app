import React from 'react';
import { BookOpen, Clock, Target, Signal, ChevronRight, BarChart, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface StudyHeroProps {
  topicName: string;
  subjectName: string;
  difficulty?: string;
  readingTime?: string;
  expectedQuestions?: string;
  progress?: number;
  isTamil?: boolean;
  onToggleTamil?: (checked: boolean) => void;
  isTranslating?: boolean;
}

export function StudyHero({
  topicName,
  subjectName,
  difficulty = 'Beginner to Advanced',
  readingTime = '18 min',
  expectedQuestions = '3–6 Questions',
  progress = 0,
  isTamil = false,
  onToggleTamil,
  isTranslating = false,
}: StudyHeroProps) {
  return (
    <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-800 text-white relative">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
        <BookOpen className="w-64 h-64" />
      </div>

      <div className="relative z-10 px-6 py-8 md:p-10 flex flex-col gap-6">
        {/* Title and Metadata Row */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white m-0">
            {topicName}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50 text-sm font-medium text-slate-300">
              <Clock className="w-4 h-4 text-blue-400" />
              {readingTime} read
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50 text-sm font-medium text-slate-300">
              <Target className="w-4 h-4 text-amber-400" />
              {expectedQuestions}
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/50 shadow-sm ml-1 md:ml-3">
              <span className={`text-xs font-bold transition-colors ${!isTamil ? 'text-indigo-400' : 'text-slate-400'}`}>EN</span>
              <Switch 
                checked={isTamil} 
                onCheckedChange={onToggleTamil}
                disabled={isTranslating}
                className="data-[state=unchecked]:bg-slate-400 data-unchecked:bg-slate-400"
              />
              <span className={`text-xs font-bold transition-colors ${isTamil ? 'text-indigo-400' : 'text-slate-400'}`}>TA</span>
              {isTranslating && <Loader2 className="w-3 h-3 animate-spin text-slate-400 ml-1" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
