import React, { useState, useRef, useEffect } from 'react';
import { AIAssistantCard } from './AIAssistantCard';
import { AIActionButton } from './AIActionButton';
import { AILoading } from './AILoading';
import { AIError } from './AIError';
import { Send, Trash2, StopCircle, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopicContext } from '@/lib/ai/context';
import { useAI } from '@/hooks/useAI';
import { LessonRenderer } from '@/components/ui/LessonRenderer';

interface ActionButton {
  label: string;
  icon: LucideIcon;
  prompt: string; // The text that will be sent when clicked
}

interface AIChatPanelProps {
  context: TopicContext;
  actions: ActionButton[];
}

export function AIChatPanel({ context, actions }: AIChatPanelProps) {
  const { askAI, messages, isLoading, isError, error, reset, clearHistory, retry } = useAI(context);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return;
    askAI(text.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(inputValue);
    }
  };

  return (
    <AIAssistantCard title="Need Help?" className="flex-1 flex flex-col overflow-hidden">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground mb-1">Select a quick action or ask a question.</p>
            <div className="flex flex-wrap gap-2">
              {actions.map((action, idx) => (
                <AIActionButton 
                  key={idx}
                  label={action.label} 
                  icon={action.icon}
                  onClick={() => handleSend(action.prompt)}
                  disabled={isLoading}
                />
              ))}
            </div>
            <div className="flex items-center justify-center h-[100px] mt-4 border border-dashed border-purple-200 rounded-lg bg-purple-50/20 text-xs text-purple-400">
              Start a conversation about {context.topic}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'self-end bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2' 
                    : 'self-start bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="w-full">
                    <LessonRenderer content={msg.content} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="self-start max-w-[85%] bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <AILoading message="Thinking..." />
              </div>
            )}
            {isError && error && (
              <div className="self-start w-full">
                <AIError error={error} onRetry={retry} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-purple-100 flex flex-col gap-2">
        {messages.length > 0 && (
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Chat History</span>
            <button 
              onClick={clearHistory}
              className="text-xs flex items-center text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3 h-3 mr-1" /> Clear
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 relative">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this topic..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full pl-4 pr-10 py-2.5 text-sm outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />
          {isLoading ? (
            <button 
              onClick={reset}
              className="absolute right-2 p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-colors"
              title="Stop Generation"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim()}
              className="absolute right-2 p-1.5 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-slate-300 disabled:text-slate-100 rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </AIAssistantCard>
  );
}
