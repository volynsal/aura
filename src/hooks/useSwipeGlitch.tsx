import { useEffect, useRef } from 'react';

export const useSwipeGlitch = () => {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isGlitching = useRef<boolean>(false);

  const triggerGlitch = () => {
    if (isGlitching.current) return;
    
    isGlitching.current = true;
    document.body.classList.add('glitch-active');
    
    setTimeout(() => {
      document.body.classList.remove('glitch-active');
      isGlitching.current = false;
    }, 400);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    
    // Check if it's a horizontal swipe (more horizontal than vertical movement)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      triggerGlitch();
    }
    
    touchStartX.current = 0;
    touchStartY.current = 0;
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return { triggerGlitch };
};