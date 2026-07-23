import React from 'react';

interface StudyLayoutProps {
  hero: React.ReactNode;
  sidebar: React.ReactNode;
  content: React.ReactNode;
}

export function StudyLayout({ hero, sidebar, content }: StudyLayoutProps) {
  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-24">
      {/* Top Hero Section */}
      <div className="w-full">
        {hero}
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8 relative w-full">
        {/* Left Sidebar (Sticky on Desktop, Collapsible Drawer on Mobile could be added here later) */}
        <div className="w-full lg:w-1/4 xl:w-[300px] shrink-0 lg:sticky lg:top-[24px] lg:max-h-[calc(100vh-120px)] hidden lg:block overflow-y-auto custom-scrollbar">
          {sidebar}
        </div>

        {/* Right Content */}
        <div className="flex-1 w-full lg:w-3/4 min-w-0">
          {content}
        </div>
      </div>
    </div>
  );
}
