import { useState, useEffect } from 'react';

export function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const calculateProgress = () => {
      const windowScrollTop = window.scrollY || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (documentHeight === 0) {
        setProgress(0);
      } else {
        const scrolled = (windowScrollTop / documentHeight) * 100;
        setProgress(Math.min(100, Math.max(0, scrolled)));
      }
    };

    const handleScroll = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(calculateProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation
    calculateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return progress;
}
