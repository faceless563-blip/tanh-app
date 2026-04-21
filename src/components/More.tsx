import React from 'react';
import { motion } from 'motion/react';
import { View } from '../types';

interface Props {
  setView: (v: View) => void;
}

const MENU_ITEMS = [
  { id: 'cycle', label: 'My Cycle', emoji: '🌸', color: '#F48FB1', path: 'cycle' },
  { id: 'hair', label: 'Hair Care', emoji: '💆', color: '#FFAB91', path: 'hair' },
  { id: 'dates', label: 'Important Dates', emoji: '📅', color: '#CE93D8', path: 'dates' },
  { id: 'shopping', label: 'Shopping List', emoji: '🛒', color: '#FFD54F', path: 'shopping' },
  { id: 'self-care', label: 'Self Care', emoji: '🛁', color: '#F06292', path: 'self-care' },
  { id: 'watch', label: 'Watch World', emoji: '🎬', color: '#C2185B', path: 'watch' },
  { id: 'diary', label: 'My Diary', emoji: '📖', color: '#B76E79', path: 'diary' },
  { id: 'medicines', label: 'Medicines', emoji: '💊', color: '#F48FB1', path: 'medicines' },
  { id: 'wish-box', label: 'Wish Box', emoji: '🎁', color: '#FFD54F', path: 'wish-box' },
  { id: 'sleep', label: 'Sleep', emoji: '🌙', color: '#9C7BB5', comingSoon: true },
  { id: 'love', label: '', emoji: '💌', color: '#B76E79', comingSoon: true },
];

export default function More({ setView }: Props) {
  return (
    <div className="min-h-screen pt-10 pb-32 px-6 animate-breathing" style={{ background: 'linear-gradient(to bottom, #FFF0F3, #FFE4EC, #F8E8FF)' }}>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-serif font-bold text-[#B76E79]">Explore More 🌸</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MENU_ITEMS.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative"
            style={{ perspective: 1000 }}
          >
            <motion.button
              disabled={item.comingSoon}
              onClick={() => item.path && setView(item.path as View)}
              whileHover={item.comingSoon ? {} : { 
                scale: 1.02, 
                rotateY: 5, 
                rotateX: -5,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
              whileTap={item.comingSoon ? {} : { scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`w-full aspect-[4/5] bg-white/70 backdrop-blur-md rounded-[32px] border border-white/40 shadow-sm flex flex-col items-center justify-center gap-4 transition-all ${
                item.comingSoon ? 'opacity-60 grayscale-[0.3]' : 'hover:shadow-2xl'
              }`}
            >
              <motion.div 
                animate={item.comingSoon ? {} : { y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: idx * 0.1 }}
                whileHover={item.comingSoon ? {} : { 
                  scale: 1.1,
                  boxShadow: `0 20px 40px -10px ${item.color}bb, inset 0 2px 4px rgba(255,255,255,0.6)`
                }}
                className="w-16 h-16 rounded-[24px] flex items-center justify-center text-3xl relative overflow-hidden group shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${item.color}ff, ${item.color}cc)`,
                  boxShadow: `0 10px 20px -8px ${item.color}88, inset 0 2px 4px rgba(255,255,255,0.5)`
                }}
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                <span className="drop-shadow-md z-10">{item.emoji}</span>
              </motion.div>
              <span className="font-nunito font-black text-[13px] tracking-tight text-[#2C1810]">
                {item.label}
              </span>
              
              {item.comingSoon && (
                <div className="absolute inset-0 bg-white/10 rounded-[24px] flex items-center justify-center">
                  <span className="bg-[#B76E79] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-sm">
                    Coming Soon 💕
                  </span>
                </div>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
