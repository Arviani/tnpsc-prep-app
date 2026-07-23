import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Callout } from './Callout';
import { ExampleCard } from './ExampleCard';
import { Calculator } from 'lucide-react';

interface RichMarkdownRendererProps {
  content: string;
}

export function RichMarkdownRenderer({ content }: RichMarkdownRendererProps) {
  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div className="prose prose-sm md:prose-base max-w-none text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, children, ...props }) => {
            const text = React.Children.toArray(children).join('').trim();
            return <h1 id={slugify(text)} className="text-3xl font-extrabold text-foreground mt-10 mb-6 pb-2 border-b border-border" {...props}>{children}</h1>;
          },
          h2: ({ node, children, ...props }) => {
            const text = React.Children.toArray(children).join('').trim();
            return <h2 id={slugify(text)} className="text-2xl font-bold text-foreground mt-8 mb-4" {...props}>{children}</h2>;
          },
          h3: ({ node, children, ...props }) => {
            const text = React.Children.toArray(children).join('').trim();
            return <h3 id={slugify(text)} className="text-xl font-semibold text-foreground mt-6 mb-3" {...props}>{children}</h3>;
          },
          h4: ({ node, children, ...props }) => {
            const text = React.Children.toArray(children).join('').trim();
            return <h4 id={slugify(text)} className="text-lg font-medium text-foreground mt-5 mb-2" {...props}>{children}</h4>;
          },
          p: ({ node, ...props }) => <p className="mb-5 leading-relaxed max-w-[75ch]" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-6 space-y-2 marker:text-indigo-500" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 marker:text-indigo-500 marker:font-semibold" {...props} />,
          li: ({ node, ...props }) => <li className="pl-2" {...props} />,
          a: ({ node, ...props }) => <a className="text-indigo-600 hover:text-indigo-800 font-medium underline decoration-indigo-200 underline-offset-4 transition-colors" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-10 border-border border-t-2" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-border shadow-sm">
              <table className="w-full text-left border-collapse bg-card" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="bg-secondary font-semibold text-foreground p-4 border-b border-border uppercase tracking-wider text-[13px]" {...props} />,
          td: ({ node, ...props }) => <td className="p-4 border-b border-border-subtle last:border-b-0 align-top text-muted-foreground" {...props} />,
          blockquote: ({ node, children, ...props }) => {
            const rawText = React.Children.toArray(children).join('').trim();
            
            // Check for our custom UI prefixes
            if (rawText.startsWith('💡 **TIP:**') || rawText.startsWith('💡 TIP:')) {
              const content = rawText.replace(/^💡\s*(?:\*\*TIP:\*\*|TIP:)\s*/, '');
              return <Callout type="tip">{content}</Callout>;
            }

            if (rawText.startsWith('⚠️ **WARNING:**') || rawText.startsWith('⚠️ WARNING:')) {
              const content = rawText.replace(/^⚠️\s*(?:\*\*WARNING:\*\*|WARNING:)\s*/, '');
              return <Callout type="warning">{content}</Callout>;
            }

            if (rawText.startsWith('ℹ️ **INFO:**') || rawText.startsWith('ℹ️ INFO:')) {
              const content = rawText.replace(/^ℹ️\s*(?:\*\*INFO:\*\*|INFO:)\s*/, '');
              return <Callout type="info">{content}</Callout>;
            }
            
            if (rawText.startsWith('⚡ **SHORTCUT:**') || rawText.startsWith('⚡ SHORTCUT:')) {
              const content = rawText.replace(/^⚡\s*(?:\*\*SHORTCUT:\*\*|SHORTCUT:)\s*/, '');
              return <Callout type="shortcut">{content}</Callout>;
            }

            if (rawText.startsWith('📐 **FORMULA:**') || rawText.startsWith('📐 FORMULA:')) {
              const content = rawText.replace(/^📐\s*(?:\*\*FORMULA:\*\*|FORMULA:)\s*/, '');
              return (
                <div className="my-8 bg-slate-900 rounded-2xl p-8 shadow-md border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Calculator className="w-32 h-32 text-white" />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-4 z-10">Key Formula</span>
                  <div className="text-xl md:text-3xl font-mono text-white tracking-wide z-10 text-center">{content}</div>
                </div>
              );
            }

            if (rawText.startsWith('📝 **EXAMPLE:**') || rawText.startsWith('📝 EXAMPLE:')) {
              return <ExampleCard>{children}</ExampleCard>;
            }

            // Default blockquote
            return (
              <blockquote className="my-8 border-l-4 border-indigo-200 bg-indigo-50/30 rounded-r-xl p-6 italic text-foreground" {...props}>
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
