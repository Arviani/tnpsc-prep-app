'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useGlobalAIStore, ChatMessage } from '@/hooks/useGlobalAIStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronDown, 
  Eraser, 
  PanelRightClose, 
  ChevronsRight, 
  Sparkles, 
  User, 
  Search,
  Plus,
  Mic,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';

export function GlobalAIChat() {
  const { 
    isOpen, 
    closeChat, 
    messages, 
    addMessage, 
    clearHistory, 
    context, 
    actions,
    currentPrompt,
    setCurrentPrompt
  } = useGlobalAIStore();
  
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle external prompts
  useEffect(() => {
    if (currentPrompt) {
      handleSend(currentPrompt);
      setCurrentPrompt(null);
    }
  }, [currentPrompt]);

  const mutation = useMutation({
    mutationFn: async (prompt: string) => {
      const newMessages = [...messages, { role: 'user', content: prompt } as ChatMessage];
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: newMessages,
          context: context 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to the AI Assistant.');
      }
      return response.json();
    },
    onMutate: (prompt) => {
      addMessage({ role: 'user', content: prompt });
      setInputValue('');
    },
    onSuccess: (data) => {
      if (data && data.answer) {
        addMessage({ role: 'assistant', content: data.answer });
      }
    }
  });

  const handleSend = (text: string) => {
    if (!text.trim() || mutation.isPending) return;
    mutation.mutate(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(inputValue);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-[400px] h-full flex flex-col bg-white border border-[#E8E8E8] rounded-lg shadow-sm shrink-0 ml-[2px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-transparent">
        <Button variant="secondary" className="h-8 px-3 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 text-slate-700">
          New Chat <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700" onClick={clearHistory}>
            <Eraser className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
            <PanelRightClose className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700" onClick={closeChat}>
            <ChevronsRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center mt-[-60px]">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-1">
              Brain<sup className="text-sm text-slate-400">2</sup>
            </h2>
            <div className="flex items-center gap-2 mt-2 mb-8">
              <span className="text-sm font-medium text-slate-500">Way smarter, wildly more capable</span>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {actions.length > 0 ? (
                actions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <Button 
                      key={idx}
                      variant="outline" 
                      className="rounded-full px-4 text-slate-600 border-slate-200 hover:bg-slate-50"
                      onClick={() => handleSend(action.prompt)}
                    >
                      <Icon className="w-4 h-4 mr-2 text-indigo-500" /> {action.label}
                    </Button>
                  )
                })
              ) : (
                <>
                  <Button variant="outline" className="rounded-full px-4 text-slate-600 border-slate-200 hover:bg-slate-50">
                    <User className="w-4 h-4 mr-2 text-pink-500" /> StandUp
                  </Button>
                  <Button variant="outline" className="rounded-full px-4 text-slate-600 border-slate-200 hover:bg-slate-50">
                    <Sparkles className="w-4 h-4 mr-2 text-blue-500" /> Super Agents
                  </Button>
                  <Button variant="outline" className="rounded-full px-4 text-slate-600 border-slate-200 hover:bg-slate-50">
                    <Search className="w-4 h-4 mr-2 text-indigo-500" /> Deep Search
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-md flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Brain</span>
                  </div>
                )}
                <div className={cn(
                  "px-4 py-3 rounded-2xl max-w-[90%] text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-slate-100 text-slate-800 rounded-tr-sm" 
                    : "bg-transparent text-slate-800 p-0"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {mutation.isPending && (
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-md flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Brain</span>
                </div>
                <div className="flex gap-1 items-center px-1 py-2">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 pt-0 flex flex-col gap-3 relative">
        {messages.length === 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <Button variant="outline" size="sm" className="h-7 rounded-full text-xs text-slate-600 border-slate-200">
              <Search className="w-3 h-3 mr-1" /> Find
            </Button>
            <Button variant="outline" size="sm" className="h-7 rounded-full text-xs text-slate-600 border-slate-200">
              <Sparkles className="w-3 h-3 mr-1" /> Research
            </Button>
            <Button variant="outline" size="sm" className="h-7 rounded-full text-xs text-slate-600 border-slate-200">
              <Plus className="w-3 h-3 mr-1" /> Create
            </Button>
          </div>
        )}
        
        <div className="bg-slate-100 rounded-2xl p-2 pb-3">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask, create, search, @ to mention"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-2 placeholder:text-slate-400"
          />
          <div className="flex items-center justify-between px-2 mt-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500">
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" className="h-6 px-2 rounded-full text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/50">
                <Sparkles className="w-3 h-3 mr-1" /> Skills
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="h-6 px-2 rounded-full text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/50">
                <Sparkles className="w-3 h-3 text-indigo-500 mr-1" /> Max <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-200/50">
                <Mic className="w-4 h-4" />
              </Button>
              {inputValue.trim() && (
                <Button 
                  size="icon" 
                  className="w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => handleSend(inputValue)}
                >
                  <Send className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
