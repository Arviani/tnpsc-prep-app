import { useRef, useCallback, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TopicContext } from '@/lib/ai/context';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  answer: string;
}

export function useAI(context?: TopicContext) {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);

  // Derive a cache key if context is provided
  const cacheKey = context ? ['ai', context.subject, context.topic, context.currentTab] : null;

  // Load chat history from React Query cache when context changes
  useEffect(() => {
    if (cacheKey) {
      const cachedMessages = queryClient.getQueryData<ChatMessage[]>(cacheKey);
      if (cachedMessages) {
        setMessages(cachedMessages);
      } else {
        setMessages([]);
      }
    }
  }, [context?.subject, context?.topic, context?.currentTab]);

  const mutation = useMutation({
    mutationFn: async ({ prompt, overrideMessages }: { prompt: string, overrideMessages?: ChatMessage[] }) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setCurrentPrompt(prompt);

      // Create a temporary messages array to send to the server
      const newMessages: ChatMessage[] = overrideMessages || [...messages, { role: 'user', content: prompt }];
      
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            messages: newMessages,
            context: context 
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Too many requests. Please slow down and try again.');
          }
          if (response.status === 500) {
            throw new Error('Our AI is currently taking a break. Please try again shortly.');
          }
          throw new Error('Failed to connect to the AI Assistant.');
        }

        const data = await response.json();
        
        if (!data || !data.answer) {
          throw new Error('Received an empty response from the AI.');
        }

        const finalMessages: ChatMessage[] = [...newMessages, { role: 'assistant', content: data.answer }];
        return {
          answer: data.answer,
          newMessages: finalMessages
        };
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      }
    },
    onMutate: ({ prompt, overrideMessages }) => {
      // Optimistically add user message to state
      const newMessages = overrideMessages || [...messages, { role: 'user', content: prompt } as ChatMessage];
      setMessages(newMessages);
    },
    onSuccess: (data) => {
      setMessages(data.newMessages);
      if (cacheKey) {
        queryClient.setQueryData(cacheKey, data.newMessages);
      }
    },
    onSettled: () => {
      abortControllerRef.current = null;
    }
  });

  const askAI = useCallback((prompt: string) => {
    mutation.mutate({ prompt });
  }, [mutation]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    mutation.reset();
    setMessages([]);
    setCurrentPrompt(null);
    if (cacheKey) {
      queryClient.setQueryData(cacheKey, []);
    }
  }, [mutation, cacheKey, queryClient]);

  const clearHistory = useCallback(() => {
    reset();
  }, [reset]);

  return {
    askAI,
    messages,
    // Keep `answer` for backward compatibility in components that haven't been fully refactored
    answer: messages.length > 0 && messages[messages.length - 1].role === 'assistant' 
      ? messages[messages.length - 1].content 
      : null,
    isLoading: mutation.isPending,
    isError: mutation.isError && mutation.error?.message !== 'Request cancelled',
    error: mutation.error?.message !== 'Request cancelled' ? mutation.error : null,
    reset,
    clearHistory,
    retry: () => {
      if (currentPrompt) {
        // Retry with the previous messages (excluding the failed user prompt which will be re-added)
        const previousMessages = messages.slice(0, -1);
        mutation.mutate({ prompt: currentPrompt, overrideMessages: [...previousMessages, { role: 'user', content: currentPrompt }] });
      }
    },
  };
}
