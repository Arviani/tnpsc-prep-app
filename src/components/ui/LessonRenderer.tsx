import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Lightbulb, AlertTriangle, Info, Calculator, FileText, HelpCircle } from 'lucide-react';

interface LessonRendererProps {
  content: string;
}

export function LessonRenderer({ content }: LessonRendererProps) {
  return (
    <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-3xl font-extrabold text-slate-900 mt-10 mb-6 pb-2 border-b border-slate-200" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-6 space-y-2 marker:text-indigo-500" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 marker:text-indigo-500 marker:font-semibold" {...props} />,
          li: ({ node, ...props }) => <li className="pl-2" {...props} />,
          a: ({ node, ...props }) => <a className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200 underline-offset-4" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-10 border-slate-200 border-t-2" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="bg-slate-50 font-semibold text-slate-700 p-4 border-b border-slate-200" {...props} />,
          td: ({ node, ...props }) => <td className="p-4 border-b border-slate-100 last:border-b-0 align-top" {...props} />,
          blockquote: ({ node, children, ...props }) => {
            const rawText = React.Children.toArray(children).join('').trim();
            
            // Check for our custom UI prefixes
            if (rawText.startsWith('💡 **TIP:**') || rawText.startsWith('💡 TIP:')) {
              const content = rawText.replace(/^💡\s*(?:\*\*TIP:\*\*|TIP:)\s*/, '');
              return (
                <div className="my-6 bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
                  <div className="bg-amber-100 p-2 rounded-lg text-amber-600 shrink-0 mt-0.5">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 mb-1 text-base">Expert Tip</h4>
                    <div className="text-amber-800 text-sm leading-relaxed">{content}</div>
                  </div>
                </div>
              );
            }

            if (rawText.startsWith('⚠️ **WARNING:**') || rawText.startsWith('⚠️ WARNING:')) {
              const content = rawText.replace(/^⚠️\s*(?:\*\*WARNING:\*\*|WARNING:)\s*/, '');
              return (
                <div className="my-6 bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
                  <div className="bg-red-100 p-2 rounded-lg text-red-600 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-red-900 mb-1 text-base">Common Trap</h4>
                    <div className="text-red-800 text-sm leading-relaxed">{content}</div>
                  </div>
                </div>
              );
            }

            if (rawText.startsWith('ℹ️ **INFO:**') || rawText.startsWith('ℹ️ INFO:')) {
              const content = rawText.replace(/^ℹ️\s*(?:\*\*INFO:\*\*|INFO:)\s*/, '');
              return (
                <div className="my-6 bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0 mt-0.5">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900 mb-1 text-base">Important Note</h4>
                    <div className="text-blue-800 text-sm leading-relaxed">{content}</div>
                  </div>
                </div>
              );
            }

            if (rawText.startsWith('📐 **FORMULA:**') || rawText.startsWith('📐 FORMULA:')) {
              const content = rawText.replace(/^📐\s*(?:\*\*FORMULA:\*\*|FORMULA:)\s*/, '');
              return (
                <div className="my-6 bg-slate-900 rounded-xl p-6 shadow-md border border-slate-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Calculator className="w-24 h-24 text-white" />
                  </div>
                  <div className="relative z-10 text-center">
                    <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase mb-3 block">Key Formula</span>
                    <div className="text-xl md:text-2xl font-mono text-white tracking-wide">{content}</div>
                  </div>
                </div>
              );
            }

            if (rawText.startsWith('📝 **EXAMPLE:**') || rawText.startsWith('📝 EXAMPLE:')) {
              // Examples usually contain multiple lines, we need to parse them.
              // Since children are passed as elements, getting rawText loses formatting.
              // Let's render the original children but style the blockquote as a card.
              return (
                <div className="my-8 bg-white border border-indigo-100 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                  <div className="bg-indigo-50/50 border-b border-indigo-100 px-6 py-4 flex items-center gap-3">
                    <div className="bg-indigo-100 p-1.5 rounded text-indigo-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-indigo-900 m-0">Worked Example</h4>
                  </div>
                  <div className="p-6 space-y-4 text-slate-700 example-content">
                    {children}
                  </div>
                </div>
              );
            }

            if (rawText.startsWith('❓ **QUESTION:**') || rawText.startsWith('❓ QUESTION:')) {
              const content = rawText.replace(/^❓\s*(?:\*\*QUESTION:\*\*|QUESTION:)\s*/, '');
              return (
                <div className="my-4 bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl p-5 flex items-start gap-4">
                  <div className="text-indigo-500 shrink-0 mt-0.5">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 font-medium text-slate-800">
                    {content}
                  </div>
                </div>
              );
            }

            // Default blockquote
            return (
              <blockquote className="my-6 border-l-4 border-slate-300 pl-4 italic text-slate-600" {...props}>
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
