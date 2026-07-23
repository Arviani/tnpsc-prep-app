import React from 'react';
import { BookOpen, Clock, Target, Signal, ChevronRight, BarChart } from 'lucide-react';
import Link from 'next/link';

interface StudyHeroProps {
  topicName: string;
  subjectName: string;
  difficulty?: string;
  readingTime?: string;
  expectedQuestions?: string;
  progress?: number;
}

export function StudyHero({
  topicName,
  subjectName,
  difficulty = 'Beginner to Advanced',
  readingTime = '18 min',
  expectedQuestions = '3–6 Questions',
  progress = 0,
}: StudyHeroProps) {
  return (
    <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-800 text-white relative">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
        <BookOpen className="w-64 h-64" />
      </div>

      <div className="relative z-10 px-6 py-8 md:p-10 flex flex-col gap-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-400">
          <Link href="/subjects" className="hover:text-indigo-400 transition-colors">Subjects</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-300">{subjectName}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{topicName}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
          {topicName}
        </h1>

        {/* Badges/Metadata Row */}
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50 text-sm font-medium text-slate-300">
            <Signal className="w-4 h-4 text-emerald-400" />
            {difficulty}
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50 text-sm font-medium text-slate-300">
            <Clock className="w-4 h-4 text-blue-400" />
            {readingTime} read
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50 text-sm font-medium text-slate-300">
            <Target className="w-4 h-4 text-amber-400" />
            {expectedQuestions}
          </div>
        </div>

        {/* Progress Bar Area */}
        <div className="mt-4 pt-6 border-t border-slate-800 flex items-center justify-between gap-6 max-w-2xl">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">Completion Progress</span>
              <span className="text-sm font-bold text-indigo-400">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-slate-800 rounded-xl border border-slate-700">
            <BarChart className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
