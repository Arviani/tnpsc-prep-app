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
  CircleAlert,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCcw,
  CheckSquare,
  FilePlus,
  Pencil,
  Trash2,
  Check,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
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
    setModelStatus,
    sessions,
    currentSessionId,
    loadSession,
    deleteSession,
    renameSession,
    createNewSession
  } = useGlobalAIStore();
  
  const { usages, incrementUsage, resetSession } = useModelUsageStore();
  
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [lastDiagnostics, setLastDiagnostics] = useState<any>(null);
  
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    // Reset session messages on mount
    resetSession();

    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInputValue(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputValue(''); // Clear previous input when starting new recording
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start speech recognition", e);
      }
    }
  };

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

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
    <div className="w-[450px] h-full flex flex-col bg-white dark:bg-[#191919] border border-border dark:border-[#2C2C2C] rounded-xl shrink-0 ml-[2px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-transparent">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 px-3 rounded-lg text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors outline-none">
            {currentSessionId ? sessions.find(s => s.id === currentSessionId)?.title || 'New Chat' : 'New Chat'} 
            <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 p-2">
            <DropdownMenuItem 
              onClick={() => createNewSession()}
              className="cursor-pointer font-medium flex items-center mb-1 bg-accent/50 text-foreground"
            >
              <Plus className="w-4 h-4 mr-2" /> Start New Chat
            </DropdownMenuItem>
            
            {sessions.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuLabel className="text-xs font-semibold px-2 py-1.5 text-muted-foreground">Previous Chats</DropdownMenuLabel>
                <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
                  {sessions.sort((a, b) => b.updatedAt - a.updatedAt).map(session => (
                    <div 
                      key={session.id} 
                      className={cn(
                        "flex items-center justify-between group px-2 py-2 rounded-md cursor-pointer hover:bg-accent/50 text-sm",
                        currentSessionId === session.id && "bg-accent/80 font-medium text-foreground"
                      )}
                      onClick={() => {
                        if (editingSessionId !== session.id) {
                          loadSession(session.id);
                        }
                      }}
                    >
                      {editingSessionId === session.id ? (
                        <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                          <Input 
                            value={editTitle} 
                            onChange={e => setEditTitle(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                renameSession(session.id, editTitle);
                                setEditingSessionId(null);
                              } else if (e.key === 'Escape') {
                                setEditingSessionId(null);
                              }
                            }}
                            autoFocus
                            className="h-6 text-xs px-1.5 flex-1"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 shrink-0" 
                            onClick={() => {
                              renameSession(session.id, editTitle);
                              setEditingSessionId(null);
                            }}
                          >
                            <Check className="w-3 h-3 text-green-500" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col overflow-hidden max-w-[70%]">
                            <span className="truncate text-foreground/90">{session.title}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <div className="hidden group-hover:flex items-center gap-0.5 opacity-70">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 hover:text-indigo-500 hover:bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTitle(session.title);
                                setEditingSessionId(session.id);
                              }}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 hover:text-red-500 hover:bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
              <div key={idx} className={cn("flex flex-col gap-1 w-full", msg.role === 'user' ? "items-end" : "items-start")}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-md flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Brain</span>
                  </div>
                )}
                <div className={cn(
                  "px-4 py-3 rounded-2xl max-w-[90%] text-[14px] leading-relaxed relative",
                  msg.role === 'user' 
                    ? "bg-slate-100 dark:bg-[#2C2C2C] text-foreground rounded-tr-sm" 
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
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2 opacity-50">
                      <Cpu className="w-3 h-3" />
                      {models.find((m: any) => m.id === msg.modelId)?.displayName || msg.modelId}
                    </div>
                  )}
                </div>

                {/* Action Icons */}
                <div className={cn("flex items-center gap-1 mt-1 text-muted-foreground", msg.role === 'user' ? "mr-1" : "ml-1")}>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-accent hover:text-foreground" onClick={() => handleCopy(msg.content)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  {msg.role === 'assistant' && (
                    <>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-accent hover:text-foreground">
                        <RefreshCcw className="w-3.5 h-3.5" />
                      </Button>
                    </>
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
        <div className="border border-border dark:border-[#333333] bg-background dark:bg-[#141414] rounded-3xl p-1.5 pl-3 flex items-end gap-2">
          
          <textarea 
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim() && !isListening) {
                  handleSend(inputValue);
                } else if (!inputValue.trim()) {
                  toggleListening();
                }
              }
            }}
            rows={1}
            placeholder="Tell AI what to do next..."
            className="flex-1 border-0 bg-transparent shadow-none focus:outline-none focus:ring-0 py-2.5 text-[14px] placeholder:text-muted-foreground/60 resize-none min-h-[40px] max-h-[120px] overflow-y-auto w-full leading-relaxed"
            style={{ height: '40px' }}
          />
          
          {/* Action Bar Right */}
          <div className="flex items-center shrink-0 px-1 pb-1">
            <Button 
              size="icon" 
              variant="ghost"
              className={cn(
                "w-8 h-8 rounded-full transition-all",
                inputValue.trim() && !isListening
                  ? "bg-foreground text-background hover:opacity-90" 
                  : isListening 
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
              onClick={() => {
                if (inputValue.trim() && !isListening) {
                  handleSend(inputValue);
                } else {
                  toggleListening();
                }
              }}
            >
              {inputValue.trim() && !isListening ? (
                <Send className="w-4 h-4" />
              ) : (
                <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
              )}
            </Button>
          </div>
        </div>

        {/* Usage Bar & Model Dropdown */}
        <div className="flex items-center justify-between gap-4 px-2 pt-2 border-t border-border/50">
          {currentModel ? (
            <div className="flex items-center gap-2 flex-1 text-[10px] text-muted-foreground font-medium">
              <span>Daily Usage</span>
              <div className="h-1.5 flex-1 max-w-[60px] bg-background/50 rounded-full overflow-hidden border border-border/20">
                <div 
                  className="h-full bg-indigo-400 rounded-full" 
                  style={{ width: `${Math.min(100, ((usages[currentModel.id]?.todayMessages || 0) / 100) * 100)}%` }} 
                />
              </div>
              <span>{Math.min(100, Math.round(((usages[currentModel.id]?.todayMessages || 0) / 100) * 100))}%</span>
            </div>
          ) : <div className="flex-1" />}

          <DropdownMenu>
            <DropdownMenuTrigger className="h-6 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-background/50 outline-none flex items-center transition-colors">
              <span className="mr-1.5 text-[10px]">{currentModel ? getStatusDisplay(currentModel.id, currentModel.isEnabled).icon : '🟢'}</span>
              {currentModel ? (currentModel.displayName.includes(' ') ? currentModel.displayName.split(' ')[0] : currentModel.displayName) : 'Max'} 
              <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
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
      </div>
    </div>
  );
}
