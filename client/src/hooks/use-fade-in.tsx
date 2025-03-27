import { useEffect, useRef, useState } from 'react';

export const useFadeIn = () => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      // In case there are multiple elements being observed
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once the element is visible, no need to observe it anymore
          if (domRef.current) observer.unobserve(domRef.current);
        }
      });
    }, { threshold: 0.15 }); // Trigger when at least 15% of the element is visible
    
    if (domRef.current) {
      observer.observe(domRef.current);
    }
    
    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);
  
  return { domRef, isVisible };
};