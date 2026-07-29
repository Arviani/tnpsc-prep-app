import { useState, useEffect } from 'react';

export function useScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (ids.length === 0) {
      setActiveId('');
      return;
    }

    const handleScroll = (e?: Event) => {
      const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
      
      if (elements.length === 0) return;

      let currentActiveId = elements[0].id;
      
      // Attempt to find the actual scroll container from the event, or fallback to body
      const scrollContainer = e?.target instanceof HTMLElement ? e.target : document.documentElement;
      const scrollY = scrollContainer.scrollTop || window.scrollY;
      const innerHeight = scrollContainer.clientHeight || window.innerHeight;
      const scrollHeight = scrollContainer.scrollHeight || document.documentElement.scrollHeight;
      
      const isAtBottom = scrollY + innerHeight >= scrollHeight - 10;
      
      if (isAtBottom) {
        setActiveId(elements[elements.length - 1].id);
        return;
      }

      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        const rect = element.getBoundingClientRect();
        
        if (rect.top <= 150) {
          currentActiveId = element.id;
          break;
        }
      }

      setActiveId(currentActiveId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    
    // Initial check (give it a tiny delay to ensure DOM is ready and styled)
    setTimeout(() => handleScroll(), 100);

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [ids]);

  useEffect(() => {
    if (activeId && window.location.hash !== `#${activeId}`) {
      window.history.replaceState(null, '', `#${activeId}`);
    }
  }, [activeId]);

  return activeId;
}
