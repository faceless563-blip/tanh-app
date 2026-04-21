import React, { useEffect, useRef } from 'react';

export default function InteractionOverlay() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        // Use transform instead of state to avoid React re-renders
        glowRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Breathing Layer - using opacity only for performance */}
      <div className="absolute inset-0 animate-breathing bg-white/5 pointer-events-none z-0" />
      
      {/* Aura Glow - hardware accelerated */}
      <div 
        ref={glowRef}
        className="fixed left-0 top-0 w-[400px] h-[400px] pointer-events-none z-0 rounded-full"
        style={{ 
          background: 'radial-gradient(circle, rgba(183,110,121,0.08) 0%, rgba(183,110,121,0) 70%)',
          marginLeft: '-200px',
          marginTop: '-200px',
          willChange: 'transform'
        }} 
      />
    </>
  );
}
