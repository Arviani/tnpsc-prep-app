'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles, Command, ArrowRight, CornerDownLeft, CheckCircle2, ListTodo, Inbox, Settings } from 'lucide-react';
import { useGlobalAIStore } from '@/hooks/useGlobalAIStore';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const toggleChat = useGlobalAIStore((state) => state.isOpen ? state.closeChat : state.openChat);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'o' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleChat();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggleChat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div 
        className="w-full max-w-2xl bg-background dark:bg-[#191919] border border-border dark:border-[#2C2C2C] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <div className="flex items-center px-4 py-3 border-b border-border dark:border-[#2C2C2C]">
          <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 text-base"
            placeholder="Search, run a command, or ask a question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            className="flex items-center gap-1.5 bg-background dark:bg-[#2C2C2C] border border-border dark:border-[#333333] hover:bg-accent text-foreground px-3 py-1.5 rounded-full text-xs font-medium ml-2 transition-colors"
            onClick={toggleChat}
          >
            Ask AI <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-border dark:border-[#2C2C2C] overflow-x-auto scrollbar-none">
          <button className="text-foreground text-sm font-medium border-b-2 border-foreground pb-1 pt-1 whitespace-nowrap">All</button>
          <button className="text-muted-foreground hover:text-foreground text-sm pb-1 pt-1 whitespace-nowrap flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center text-[10px]">C</span> ClickUp
          </button>
          <button className="text-muted-foreground hover:text-foreground text-sm pb-1 pt-1 whitespace-nowrap flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-[10px]">G</span> GitHub
          </button>
          <button className="text-muted-foreground hover:text-foreground text-sm pb-1 pt-1 whitespace-nowrap flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[10px]">J</span> Jira
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border dark:border-[#2C2C2C] overflow-x-auto scrollbar-none">
          <button className="flex items-center gap-1.5 px-2.5 py-1 bg-background dark:bg-[#141414] hover:bg-accent rounded-full text-xs text-muted-foreground border border-border dark:border-[#333333]">
            <CheckCircle2 className="w-3 h-3" /> Tasks
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 bg-background dark:bg-[#141414] hover:bg-accent rounded-full text-xs text-muted-foreground border border-border dark:border-[#333333]">
            <FileTextIcon className="w-3 h-3" /> Docs
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 bg-background dark:bg-[#141414] hover:bg-accent rounded-full text-xs text-muted-foreground border border-border dark:border-[#333333]">
            <Sparkles className="w-3 h-3 text-pink-500" /> Agents
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border">
          <div className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Results</div>
          
          <div className="flex items-center justify-between px-3 py-2.5 hover:bg-accent rounded-lg cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border border-border dark:border-[#333333] flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
              </div>
              <span className="text-foreground text-sm">Update Changes made in Admin web to apply on Tab & Mobile screens</span>
            </div>
            <div className="hidden group-hover:flex items-center gap-2">
              <button 
                className="flex items-center gap-1.5 bg-background dark:bg-[#2C2C2C] border border-border dark:border-[#333333] hover:bg-accent transition-colors text-foreground px-2 py-1 rounded-full text-xs font-medium"
                onClick={(e) => { e.stopPropagation(); toggleChat(); }}
              >
                Ask AI <Sparkles className="w-3 h-3 text-indigo-500" />
              </button>
              <div className="w-6 h-6 bg-background dark:bg-[#2C2C2C] border border-border dark:border-[#333333] rounded flex items-center justify-center text-muted-foreground"><CornerDownLeft className="w-3 h-3" /></div>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 hover:bg-accent rounded-lg cursor-pointer group">
            <div className="flex items-center gap-3">
              <ListTodo className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground text-sm">Aravinth's List</span>
              <span className="text-muted-foreground text-xs">2w ago</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 hover:bg-accent rounded-lg cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border border-border dark:border-[#333333] flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
              </div>
              <span className="text-foreground text-sm">Import people from one request to a new one (EDGE-655)</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 hover:bg-accent rounded-lg cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border border-border dark:border-[#333333] flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-foreground text-sm">EDGE Facelift - Phone designs</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border dark:border-[#2C2C2C] bg-muted/30">
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-accent px-1.5 py-0.5 rounded border border-border dark:border-[#333333] text-foreground font-sans">↑</kbd>
              <kbd className="bg-accent px-1.5 py-0.5 rounded border border-border dark:border-[#333333] text-foreground font-sans">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-accent px-1.5 py-0.5 rounded border border-border dark:border-[#333333] text-foreground font-sans">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-accent px-1.5 py-0.5 rounded border border-border dark:border-[#333333] text-foreground font-sans">Esc</kbd>
              Close
            </span>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
        </div>
      </div>
      
      {/* Background click handler */}
      <div className="absolute inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
    </div>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
