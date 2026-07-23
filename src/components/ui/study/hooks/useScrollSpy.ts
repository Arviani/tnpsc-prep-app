import { useState, useEffect, useRef } from 'react';

export function useScrollSpy(
  ids: string[],
  options: IntersectionObserverInit = { rootMargin: '-20% 0px -55% 0px' }
) {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (ids.length === 0) {
      setActiveId('');
      return;
    }

    // Determine the active section
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      // Map to keep track of intersecting entries
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObserver, options);

    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    elements.forEach((el) => {
      if (observer.current) {
        observer.current.observe(el);
      }
    });

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [ids, options.rootMargin, options.threshold]);

  // Update hash when activeId changes, without jumping
  useEffect(() => {
    if (activeId && window.location.hash !== `#${activeId}`) {
      window.history.replaceState(null, '', `#${activeId}`);
    }
  }, [activeId]);

  return activeId;
}
