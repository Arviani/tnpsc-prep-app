"use client"

import React, { useMemo, useState } from 'react';
import { ContentSection } from './ContentSection';
import { TableOfContents } from './TableOfContents';
import { StudyLayout } from './StudyLayout';
import { StudyHero } from './StudyHero';
import { BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StudyContentProps {
  content: string;
  initialTamilContent?: string;
  topicTitle: string;
  subjectTitle: string;
}

export function StudyContent({ content: initialContent, initialTamilContent, topicTitle, subjectTitle }: StudyContentProps) {
  const [isTamil, setIsTamil] = useState(false);
  const [tamilContent, setTamilContent] = useState(initialTamilContent || '');
  const [isTranslating, setIsTranslating] = useState(false);

  const displayContent = isTamil && tamilContent ? tamilContent : initialContent;
  const isShowLoading = isTranslating && !tamilContent; // Show loading skeleton or similar if needed

  const handleToggleTamil = async (checked: boolean) => {
    setIsTamil(checked);
    if (checked && !tamilContent && initialContent) {
      if (initialTamilContent) {
        setTamilContent(initialTamilContent);
        return;
      }
      
      setIsTranslating(true);
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: `Translate the following TNPSC study material to Tamil. Ensure all formatting (markdown, bold, headers) is preserved exactly. Do not add any conversational text or explanation. Only output the translated markdown.\n\n${initialContent}` }],
            stream: true,
          })
        });

        if (!response.ok || !response.body) throw new Error('Failed to translate');
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
          setTamilContent(result);
        }

        const inputTokens = parseInt(response.headers.get('x-input-tokens') || '0', 10);
        const modelUsed = response.headers.get('x-model-used') || 'Gemma 2 9B';
        // Estimate output tokens based on chars (approx 4 chars per token)
        const outputTokens = Math.ceil(result.length / 4);
        const totalTokens = inputTokens + outputTokens || 2000;
        const creditsUsed = Math.max(1, Math.ceil(totalTokens / 500));
        const balance = 1450 - creditsUsed; // Mock balance calculation for now
        
        toast.success(`Translation done. Used: ${creditsUsed} credits | Balance: ${balance} | Model: ${modelUsed}`);
      } catch (e) {
        toast.error('Translation failed. Please try again.');
        setIsTamil(false);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const { sections, headings } = useMemo(() => {
    const parsedSections: { id: string; title: string; content: string }[] = [];
    const parsedHeadings: { id: string; text: string; level: number }[] = [];
    const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const content = displayContent;

    // Match both Markdown headings (must be at start of a line or string) and HTML headings
    const headingRegex = /(?:(?:^|\n)(#{1,4})\s+(.+)|<h([1-4])[^>]*>(.*?)<\/h\3>)/gi;
    const matches = Array.from(content.matchAll(headingRegex));

    if (matches.length === 0) {
      // No headings found, whole content is one section
      parsedSections.push({
        id: 'overview',
        title: 'Overview',
        content: content.trim()
      });
    } else {
      // Check if there is content before the first heading
      const firstHeadingIndex = matches[0].index !== undefined ? matches[0].index : 0;
      const initialContent = content.substring(0, firstHeadingIndex).trim();
      if (initialContent) {
        parsedSections.push({
          id: 'overview',
          title: 'Overview',
          content: initialContent
        });
      }

      let currentSectionTitle = '';
      let currentSectionId = '';
      let currentSectionStartIndex = 0;

      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const isMarkdown = !!match[1];
        const level = isMarkdown ? match[1].length : parseInt(match[3], 10);
        const text = isMarkdown ? match[2].replace(/\*/g, '').trim() : match[4].replace(/<[^>]+>/g, '').trim();
        const id = slugify(text);

        parsedHeadings.push({ id, text, level });

        if (level === 1 || level === 2) {
          // If we already have a section open, save it
          if (currentSectionTitle) {
            const sectionContent = content.substring(currentSectionStartIndex, match.index).trim();
            if (sectionContent) {
              parsedSections.push({
                id: currentSectionId,
                title: currentSectionTitle,
                content: sectionContent
              });
            }
          }

          // Start new section
          currentSectionTitle = text;
          currentSectionId = id;
          // Start content AFTER this heading
          currentSectionStartIndex = (match.index || 0) + match[0].length;
        }
      }

      // Push the final section
      if (currentSectionTitle) {
        const finalContent = content.substring(currentSectionStartIndex).trim();
        if (finalContent) {
          parsedSections.push({
            id: currentSectionId,
            title: currentSectionTitle,
            content: finalContent
          });
        }
      }
    }

    return { sections: parsedSections, headings: parsedHeadings };
  }, [displayContent]);

  return (
    <StudyLayout
      hero={
        <StudyHero 
          topicName={topicTitle}
          subjectName={subjectTitle}
          progress={42} // Mocked for now
          isTamil={isTamil}
          onToggleTamil={handleToggleTamil}
          isTranslating={isTranslating}
        />
      }
      sidebar={
        <div className="sticky top-6">
          <TableOfContents headings={headings} />
        </div>
      }
      content={
        <div className="flex flex-col gap-8">
          {sections.map((section, index) => (
            <ContentSection
              key={section.id}
              id={section.id}
              title={section.title}
              content={section.content}
              icon={index === 0 ? <BookOpen className="w-5 h-5 text-indigo-500" /> : undefined}
            />
          ))}
        </div>
      }
    />
  );
}
