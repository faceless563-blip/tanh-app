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
  { id: 'sleep', label: 'Sleep', emoji: '🌙', color: '#9C7BB5', comingSoon: true },
  { id: 'love', label: '', emoji: '💌', color: '#B76E79', comingSoon: true },
];

export default function More({ setView }: Props) {
  return (
    <div className="min-h-screen pt-10 pb-32 px-6" style={{ background: 'linear-gradient(to bottom, #FFF0F3, #FFE4EC, #F8E8FF)' }}>
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
          >
            <button
              disabled={item.comingSoon}
              onClick={() => item.path && setView(item.path as View)}
              className={`w-full aspect-[4/5] bg-white/90 rounded-[24px] shadow-sm flex flex-col items-center justify-center gap-4 transition-all active:scale-95 ${
                item.comingSoon ? 'opacity-60 grayscale-[0.3]' : 'hover:shadow-md'
              }`}
            >
              <div 
                className="w-14 h-14 rounded-[18px] flex items-center justify-center text-3xl shadow-inner"
                style={{ backgroundColor: item.color }}
              >
                {item.emoji}
              </div>
              <span className="font-nunito font-bold text-sm text-[#2C1810]">
                {item.label}
              </span>
              
              {item.comingSoon && (
                <div className="absolute inset-0 bg-white/10 rounded-[24px] flex items-center justify-center">
                  <span className="bg-[#B76E79] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-sm">
                    Coming Soon 💕
                  </span>
                </div>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
