'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useGlobalAIStore, ChatMessage } from '@/hooks/useGlobalAIStore';
import { useModelUsageStore } from '@/lib/ai/usageStore';
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
  Send,
  Cpu,
  Info,
  CircleAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

export function GlobalAIChat() {
  const { 
    isOpen, 
    closeChat, 
    messages, 
    addMessage, 
    updateLastMessage,
    clearHistory, 
    context, 
    actions,
    currentPrompt,
    setCurrentPrompt,
    selectedModelId,
    setSelectedModelId,
    modelStatuses,
    setModelStatus
  } = useGlobalAIStore();
  
  const { usages, incrementUsage, resetSession } = useModelUsageStore();
  
  const [inputValue, setInputValue] = useState('');
  const [isPending, setIsPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lastDiagnostics, setLastDiagnostics] = useState<any>(null);

  useEffect(() => {
    // Reset session messages on mount
    resetSession();
  }, []);

  // Fetch available models
  const { data: modelsData } = useQuery({
    queryKey: ['ai-models'],
    queryFn: async () => {
      const res = await fetch('/api/ai/models');
      return res.json();
    }
  });

  const models = modelsData?.models || [];
  const currentModel = models.find((m: any) => m.id === selectedModelId) || models[0];

  const getStatusDisplay = (modelId: string, isEnabled: boolean) => {
    if (!isEnabled) return { icon: '⚪', label: 'Disabled', color: 'text-muted-foreground', bgColor: 'bg-muted' };
    const status = modelStatuses[modelId] || 'available';
    switch (status) {
      case 'busy': return { icon: '🟡', label: 'Busy', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-500/10' };
      case 'rate-limited': return { icon: '🔴', label: 'Rate Limited', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10' };
      case 'available':
      default: return { icon: '🟢', label: 'Available', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10' };
    }
  };

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

  const handleSend = async (text: string) => {
    if (!text.trim() || isPending) return;
    
    setIsPending(true);
    setInputValue('');
    
    const newMessages = [...messages, { role: 'user', content: text } as ChatMessage];
    addMessage({ role: 'user', content: text });
    
    if (currentModel) {
      setModelStatus(currentModel.id, 'busy');
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: newMessages,
          context: context,
          modelId: selectedModelId,
          stream: true
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('API Error Response:', response.status, errText);
        let errorMsg = 'Failed to connect to the AI Assistant.';
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) errorMsg = parsed.error;
        } catch(e) {}
        throw new Error(errorMsg);
      }
      
      const fallbackOccurred = response.headers.get('x-fallback-occurred') === 'true';
      const fallbackReason = response.headers.get('x-fallback-reason') || '';
      const modelUsed = response.headers.get('x-model-used') || currentModel?.id || 'unknown';
      
      // Save diagnostics
      setLastDiagnostics({
        inputTokens: response.headers.get('x-input-tokens'),
        outputTokens: response.headers.get('x-output-tokens-requested'),
        retries: response.headers.get('x-retries'),
        modelUsed,
        fallbackOccurred
      });
      
      const msg: ChatMessage = { 
        role: 'assistant', 
        content: '',
        modelId: modelUsed 
      };

      if (fallbackOccurred && currentModel) {
        msg.wasFallback = true;
        msg.fallbackMessage = `${currentModel.id} ${fallbackReason}. Switched to ${modelUsed}.`;
        setModelStatus(currentModel.id, 'rate-limited');
        incrementUsage(currentModel.id, true);
        incrementUsage(modelUsed, false);
      } else {
        if (currentModel) {
          setModelStatus(currentModel.id, 'available');
          incrementUsage(currentModel.id, false);
        }
      }
      
      addMessage(msg);
      
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            updateLastMessage((prev) => ({
              ...prev,
              content: prev.content + chunk
            }));
          }
        }
      }
    } catch (error: any) {
        console.error(error);
        if (currentModel) {
          setModelStatus(currentModel.id, 'available');
        }
        addMessage({ 
          role: 'assistant', 
          content: `⚠️ **Error**: ${error.message || 'An unexpected error occurred. Please try again.'}`, 
          modelId: currentModel?.id || 'system'
        });
      } finally {
      setIsPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(inputValue);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-[400px] h-full flex flex-col bg-background border border-border rounded-lg shadow-sm shrink-0 ml-[2px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-transparent">
        <Button variant="secondary" className="h-8 px-3 rounded-lg text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground">
          New Chat <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={clearHistory}>
            <Eraser className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <PanelRightClose className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={closeChat}>
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
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-1">
              Brain<sup className="text-sm text-muted-foreground">2</sup>
            </h2>
            <div className="flex items-center gap-2 mt-2 mb-8">
              <span className="text-sm font-medium text-muted-foreground">Way smarter, wildly more capable</span>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {actions.length > 0 ? (
                actions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <Button 
                      key={idx}
                      variant="outline" 
                      className="rounded-full px-4 text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                      onClick={() => handleSend(action.prompt)}
                    >
                      <Icon className="w-4 h-4 mr-2 text-indigo-500" /> {action.label}
                    </Button>
                  )
                })
              ) : (
                <>
                  <Button variant="outline" className="rounded-full px-4 text-muted-foreground border-border hover:bg-accent hover:text-foreground">
                    <User className="w-4 h-4 mr-2 text-pink-500" /> StandUp
                  </Button>
                  <Button variant="outline" className="rounded-full px-4 text-muted-foreground border-border hover:bg-accent hover:text-foreground">
                    <Sparkles className="w-4 h-4 mr-2 text-blue-500" /> Super Agents
                  </Button>
                  <Button variant="outline" className="rounded-full px-4 text-muted-foreground border-border hover:bg-accent hover:text-foreground">
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
                    <span className="text-xs font-bold text-foreground">Brain</span>
                  </div>
                )}
                <div className={cn(
                  "px-4 py-3 rounded-2xl max-w-[90%] text-sm leading-relaxed relative",
                  msg.role === 'user' 
                    ? "bg-accent text-accent-foreground rounded-tr-sm" 
                    : "bg-transparent text-foreground p-0"
                )}>
                  {msg.wasFallback && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1.5 rounded-md mb-2 border border-amber-200">
                      <CircleAlert className="w-3.5 h-3.5" />
                      {msg.fallbackMessage}
                    </div>
                  )}
                  {msg.content}
                  
                  {msg.role === 'assistant' && msg.modelId && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                      <Cpu className="w-3 h-3" />
                      {models.find((m: any) => m.id === msg.modelId)?.displayName || msg.modelId}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isPending && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-md flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Brain</span>
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
      
      {/* Developer Diagnostics Panel */}
      {process.env.NODE_ENV === 'development' && lastDiagnostics && (
        <div className="mx-4 mb-3 p-3 rounded-lg bg-slate-900 dark:bg-black border border-slate-800 text-[10px] font-mono text-slate-300">
          <div className="flex justify-between items-center mb-1 text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-800 pb-1">
            <span>Dev Diagnostics</span>
            <Button variant="ghost" size="sm" className="h-4 px-1 text-slate-500 hover:text-slate-300" onClick={() => setLastDiagnostics(null)}>x</Button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            <div><span className="opacity-50">Model:</span> <span className="text-emerald-400">{lastDiagnostics.modelUsed}</span></div>
            <div><span className="opacity-50">Est. Input:</span> <span className="text-amber-300">{lastDiagnostics.inputTokens}</span> tok</div>
            <div><span className="opacity-50">Output Req:</span> <span className="text-amber-300">{lastDiagnostics.outputTokens}</span> tok</div>
            <div><span className="opacity-50">Retries:</span> <span className={lastDiagnostics.retries > 0 ? "text-rose-400" : ""}>{lastDiagnostics.retries}</span></div>
            <div><span className="opacity-50">Fallback:</span> <span className={lastDiagnostics.fallbackOccurred ? "text-rose-400" : "text-emerald-400"}>{lastDiagnostics.fallbackOccurred ? 'Yes' : 'No'}</span></div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 pt-0 flex flex-col gap-3 relative">
        <div className="bg-accent rounded-3xl p-3 flex flex-col gap-3">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-1 py-4 text-base placeholder:text-muted-foreground/70"
          />
          {/* Action Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 px-3 rounded-full text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-background/50 outline-none flex items-center transition-colors">
                  <span className="mr-1.5 text-[10px]">{currentModel ? getStatusDisplay(currentModel.id, currentModel.isEnabled).icon : '🟢'}</span>
                  {currentModel ? currentModel.displayName : 'Loading...'} 
                  <ChevronDown className="w-3.5 h-3.5 ml-1.5 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs font-semibold px-2 py-1.5">Select Model</DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                    {models.map((model: any) => {
                      const statusInfo = getStatusDisplay(model.id, model.isEnabled);
                      return (
                        <DropdownMenuItem 
                          key={model.id}
                          disabled={!model.isEnabled}
                          onClick={() => setSelectedModelId(model.id)}
                          className={cn("flex flex-col items-start py-2.5 px-3 rounded-xl cursor-pointer", selectedModelId === model.id && "bg-accent")}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="font-semibold text-sm">{model.displayName}</span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 border rounded-md flex items-center gap-1", statusInfo.bgColor, statusInfo.color, "border-current/20")}>
                              {statusInfo.icon} {statusInfo.label}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">{model.description}</div>
                          
                          {/* Capabilities Row */}
                          <div className="flex items-center flex-wrap gap-1.5 mb-2">
                            <span className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-mono">
                              {Math.round(model.contextLength / 1000)}k Context
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                              Streaming
                            </span>
                            {(model.id.toLowerCase().includes('reasoning') || model.id.toLowerCase().includes('think') || model.id.toLowerCase().includes('r1') || model.supportsReasoning) && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded">
                                Reasoning
                              </span>
                            )}
                          </div>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                size="icon" 
                variant="ghost"
                className={cn(
                  "w-8 h-8 rounded-full transition-all",
                  inputValue.trim() 
                    ? "bg-foreground text-background hover:opacity-90" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
                onClick={() => inputValue.trim() && handleSend(inputValue)}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Usage Bar */}
          {currentModel && (
            <div className="flex items-center justify-between gap-4 px-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-medium">
              <div className="flex items-center gap-2 flex-1">
                <span>Session Usage</span>
                <div className="h-1.5 flex-1 max-w-[60px] bg-background/50 rounded-full overflow-hidden border border-border/20">
                  <div 
                    className="h-full bg-indigo-400 rounded-full" 
                    style={{ width: `${Math.min(100, ((usages[currentModel.id]?.sessionMessages || 0) / 50) * 100)}%` }} 
                  />
                </div>
                <span>{Math.min(100, Math.round(((usages[currentModel.id]?.sessionMessages || 0) / 50) * 100))}%</span>
              </div>
              
              <div className="flex items-center gap-2 flex-1">
                <span>Weekly</span>
                <div className="h-1.5 flex-1 max-w-[60px] bg-background/50 rounded-full overflow-hidden border border-border/20">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${Math.min(100, ((usages[currentModel.id]?.weeklyMessages || 0) / 500) * 100)}%` }} 
                  />
                </div>
                <span>{Math.min(100, Math.round(((usages[currentModel.id]?.weeklyMessages || 0) / 500) * 100))}%</span>
              </div>
              <div className="text-[10px] text-muted-foreground/70 shrink-0">Resets in 8h 45m</div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
