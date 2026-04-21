import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface Props {
  message: string;
  onDismiss: () => void;
}

export default function CelebrationPopup({ message, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[85%] max-w-[360px] z-[200]"
    >
      <div className="bg-gradient-to-br from-[#FFE4E1] to-[#FFB6C1] p-6 rounded-[24px] shadow-2xl relative overflow-hidden text-center space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="floating-heart text-lg" style={{ left: `${Math.random() * 100}%`, animationDelay: `${i * 0.3}s` }}>💖</div>
        ))}
        <p className="font-accent italic text-lg text-[#2C1810] leading-tight">
          {message}
        </p>
        <button 
          onClick={onDismiss}
          className="text-[#C2185B] font-bold text-sm tracking-widest uppercase hover:opacity-70"
        >
          💖 Yay!
        </button>
      </div>
    </motion.div>
  );
}
