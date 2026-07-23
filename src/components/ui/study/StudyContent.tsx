import React, { useMemo } from 'react';
import { ContentSection } from './ContentSection';
import { TableOfContents } from './TableOfContents';
import { StudyLayout } from './StudyLayout';
import { StudyHero } from './StudyHero';
import { BookOpen } from 'lucide-react';

interface StudyContentProps {
  content: string;
  topicTitle: string;
  subjectTitle: string;
}

export function StudyContent({ content, topicTitle, subjectTitle }: StudyContentProps) {
  // Parse markdown into sections based on H2 (##)
  const { sections, headings } = useMemo(() => {
    // We split by lines to correctly identify ## headings at the start of a line
    const lines = content.split('\n');
    const parsedSections: { id: string; title: string; content: string }[] = [];
    const parsedHeadings: { id: string; text: string; level: number }[] = [];
    
    let currentSectionTitle = 'Overview'; // Default if no initial heading
    let currentSectionId = 'overview';
    let currentSectionLines: string[] = [];

    // Helper to slugify
    const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match markdown heading `## Title` OR HTML heading `<h2...>Title</h2>`
      const mdMatch = line.match(/^(#{1,3})\s+(.+)$/);
      const htmlMatch = line.match(/<h([1-3])[^>]*>(.*?)<\/h\1>/i);
      
      if (mdMatch || htmlMatch) {
        const level = mdMatch ? mdMatch[1].length : parseInt(htmlMatch![1], 10);
        let text = mdMatch ? mdMatch[2].replace(/\*/g, '').trim() : htmlMatch![2].replace(/<[^>]+>/g, '').trim();
        const id = slugify(text);

        // Record heading for TOC
        parsedHeadings.push({ id, text, level });

        if (level === 1 || level === 2) {
          // Save previous section if it has content
          if (currentSectionLines.join('\n').trim() !== '') {
            parsedSections.push({
              id: currentSectionId,
              title: currentSectionTitle,
              content: currentSectionLines.join('\n')
            });
          }
          
          // Start new section
          currentSectionTitle = text;
          currentSectionId = id;
          currentSectionLines = [`## ${text}`]; // Keep the heading in the content so the renderer can render the H2, or we strip it and let ContentSection render the title.
          // Wait, the user said: "Every section should have Title, Optional Icon, Divider, Content".
          // If ContentSection renders the title, we shouldn't pass the raw H2 to the markdown renderer, or we just let ReactMarkdown render it normally.
          // Let's strip the H1/H2 line from the markdown content so we can render it manually in ContentSection.
          currentSectionLines = []; 
        } else {
          // If it's an H3, just add it to current section content
          currentSectionLines.push(line);
        }
      } else {
        currentSectionLines.push(line);
      }
    }

    // Push the final section
    if (currentSectionLines.join('\n').trim() !== '') {
      parsedSections.push({
        id: currentSectionId,
        title: currentSectionTitle,
        content: currentSectionLines.join('\n')
      });
    }

    return { sections: parsedSections, headings: parsedHeadings };
  }, [content]);

  return (
    <StudyLayout
      hero={
        <StudyHero 
          topicName={topicTitle}
          subjectName={subjectTitle}
          progress={42} // Mocked for now
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
