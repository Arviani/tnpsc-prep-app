'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, BookOpen, Trash2, Edit3, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ValidationReport, ValidationFlag } from '@/lib/curriculum/validator';

interface SyllabusValidationPanelProps {
  report: ValidationReport | null;
  onRemoveFlagged?: (sectionTitle: string) => void;
  onIgnoreFlag?: (sectionTitle: string) => void;
  onKeepAsOptional?: (sectionTitle: string) => void;
  onRevalidate?: () => void;
  className?: string;
}

export function SyllabusValidationPanel({
  report,
  onRemoveFlagged,
  onIgnoreFlag,
  onKeepAsOptional,
  onRevalidate,
  className
}: SyllabusValidationPanelProps) {
  if (!report) return null;

  const isAllGood = report.outOfSyllabusSections === 0 && report.reviewSections === 0;

  return (
    <div className={cn("bg-white border rounded-xl overflow-hidden mb-6 shadow-sm", 
      report.outOfSyllabusSections > 0 ? "border-red-200" : 
      report.reviewSections > 0 ? "border-amber-200" : "border-green-200", 
      className
    )}>
      <div className={cn("p-4 border-b flex items-center justify-between",
        report.outOfSyllabusSections > 0 ? "bg-red-50" : 
        report.reviewSections > 0 ? "bg-amber-50" : "bg-green-50"
      )}>
        <div className="flex items-center gap-3">
          <ShieldAlert className={cn("w-6 h-6", 
            report.outOfSyllabusSections > 0 ? "text-red-600" : 
            report.reviewSections > 0 ? "text-amber-600" : "text-green-600"
          )} />
          <div>
            <h3 className="font-bold text-slate-900 leading-tight">Syllabus Validation Report</h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Strict compliance check against official TNPSC Group IV Syllabus
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">{report.overallCoverageScore}%</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Coverage</div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <span className="font-medium text-slate-700">{report.matchingSections} Sections Match</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
            <AlertTriangle className={cn("w-5 h-5 shrink-0", report.reviewSections > 0 ? "text-amber-500" : "text-slate-300")} />
            <span className={cn("font-medium", report.reviewSections > 0 ? "text-amber-700" : "text-slate-500")}>
              {report.reviewSections} Need Review
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
            <XCircle className={cn("w-5 h-5 shrink-0", report.outOfSyllabusSections > 0 ? "text-red-500" : "text-slate-300")} />
            <span className={cn("font-medium", report.outOfSyllabusSections > 0 ? "text-red-700" : "text-slate-500")}>
              {report.outOfSyllabusSections} Outside Syllabus
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-500 block mb-1">Difficulty Level</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-semibold border border-blue-100">
              {report.difficulty}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block mb-1">Standard Compliance</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-medium border border-slate-200">
              <BookOpen className="w-4 h-4" /> {report.standardCompliance}
            </span>
          </div>
        </div>

        {report.flags.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              Actionable Flags 
              <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{report.flags.length}</span>
            </h4>
            
            {report.flags.map((flag, idx) => (
              <div key={idx} className={cn("p-4 rounded-xl border", 
                flag.status === 'OUT OF SYLLABUS' ? "bg-red-50/30 border-red-100" : "bg-amber-50/30 border-amber-100"
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                        flag.status === 'OUT OF SYLLABUS' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {flag.status}
                      </span>
                      <strong className="text-slate-800">{flag.sectionTitle}</strong>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-2">{flag.reason}</p>
                    
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
                      <span className="text-slate-400">Recommendation:</span>
                      <span className="text-slate-700">{flag.recommendation}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 shrink-0">
                    {onRemoveFlagged && (
                      <Button size="sm" variant="outline" onClick={() => onRemoveFlagged(flag.sectionTitle)} className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
                      </Button>
                    )}
                    {onKeepAsOptional && flag.status !== 'OUT OF SYLLABUS' && (
                      <Button size="sm" variant="outline" onClick={() => onKeepAsOptional(flag.sectionTitle)} className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                        <Save className="w-3.5 h-3.5 mr-1.5" /> Keep Optional
                      </Button>
                    )}
                    {onIgnoreFlag && (
                      <Button size="sm" variant="ghost" onClick={() => onIgnoreFlag(flag.sectionTitle)} className="h-8 text-slate-500 hover:text-slate-700">
                        Ignore
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAllGood && (
          <div className="bg-green-50/50 border border-green-100 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-bold text-green-800 text-lg">Perfectly Aligned!</h4>
            <p className="text-green-700/80 text-sm mt-1 max-w-sm mx-auto">
              This content strictly follows the TNPSC Group IV syllabus and is ready to be published.
            </p>
          </div>
        )}
      </div>
      
      {onRevalidate && (
        <div className="bg-slate-50 border-t p-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={onRevalidate}>
            Re-run Validation
          </Button>
        </div>
      )}
    </div>
  );
}
