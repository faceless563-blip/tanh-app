import React from 'react';
import { motion } from 'motion/react';

interface Props {
  onDismiss: () => void;
}

export default function WelcomePopup({ onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card w-full max-w-[360px] max-h-[70vh] overflow-y-auto no-scrollbar relative p-8 text-center space-y-6"
        style={{ background: 'linear-gradient(to bottom, #FFF0F3, #FFE4EC)' }}
      >
        {[1, 2, 3].map(i => (
          <div key={i} className="floating-heart text-2xl" style={{ left: `${Math.random() * 100}%`, top: '50%', animationDelay: `${i * 0.4}s` }}>💖</div>
        ))}
        
        <div className="text-6xl animate-bounce">💌</div>
        
        <h2 className="text-3xl font-serif font-bold text-[#C2185B] leading-tight">
          Your app is ready, Tanha! 🥺
        </h2>
        
        <p className="font-accent italic text-[#2C1810] text-lg leading-relaxed">
          "Someone who loves you very much made this just for you 🥺💌 Now go be the amazing person you already are 💖"
        </p>

        <button 
          onClick={onDismiss}
          className="w-full bg-[#B76E79] text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-[#C2185B] transition-all"
        >
          Aww, thank you! 🥰
        </button>
      </motion.div>
    </div>
  );
}
