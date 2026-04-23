import React from 'react';
import { motion } from 'motion/react';
import { View } from '../types';

interface Props {
  setView: (v: View) => void;
}

const MENU_ITEMS = [
  { id: 'birthday-journey', label: 'B-Day Journey', emoji: '🎂', color: '#FFF0F3', path: 'birthday-journey' },
  { id: 'cycle', label: 'My Cycle', emoji: '🌸', color: '#F48FB1', path: 'cycle' },
  { id: 'hair', label: 'Hair Care', emoji: '💆', color: '#FFAB91', path: 'hair' },
  { id: 'dates', label: 'Important Dates', emoji: '📅', color: '#CE93D8', path: 'dates' },
  { id: 'shopping', label: 'Shopping List', emoji: '🛒', color: '#FFD54F', path: 'shopping' },
  { id: 'self-care', label: 'Self Care', emoji: '🛁', color: '#F06292', path: 'self-care' },
  { id: 'watch', label: 'Watch World', emoji: '🎬', color: '#C2185B', path: 'watch' },
  { id: 'diary', label: 'My Diary', emoji: '📖', color: '#B76E79', path: 'diary' },
  { id: 'medicines', label: 'Medicines', emoji: '💊', color: '#F48FB1', path: 'medicines' },
  { id: 'sleep', label: 'Sleep Tracker', emoji: '🌙', color: '#9C7BB5', path: 'sleep' },
  { id: 'vault', label: '', emoji: '💌', color: '#B76E79', path: 'vault' },
];

export default function More({ setView }: Props) {
  return (
    <div 
      className="fixed inset-0 z-[60] overflow-y-auto no-scrollbar bg-[#FDFAF7]" 
      style={{ background: 'linear-gradient(135deg, #FFF0F3 0%, #FFE4EC 50%, #F8E8FF 100%)' }}
    >
      <div className="max-w-[480px] mx-auto min-h-screen px-4 pt-10 pb-32 flex flex-col">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-[#B76E79] tracking-tight">Explore More 🌸</h2>
          <div className="w-12 h-1 bg-[#B76E79]/20 mx-auto mt-2 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {MENU_ITEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, ease: "easeOut" }}
            >
              <motion.button
                onClick={() => item.path && setView(item.path as View)}
                whileTap={{ scale: 0.95 }}
                className="w-full aspect-[1/1.1] relative bg-white/95 rounded-3xl border border-[#B76E79]/10 shadow-[0_8px_20px_-10px_rgba(183,110,121,0.2)] flex flex-col items-center justify-center gap-3 transition-all active:shadow-inner"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transform transition-transform group-active:scale-110"
                  style={{ background: item.color }}
                >
                  <span className="drop-shadow-sm">{item.emoji}</span>
                </div>
                <span className="font-nunito font-bold text-[13px] text-[#2C1810]">
                  {item.label}
                </span>
                
                {/* Subtle shine overlay */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 skew-y-12 transform -translate-y-full" />
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>
        
        <p className="mt-12 text-center text-[10px] uppercase font-black tracking-[0.2em] text-[#B76E79]/50">
          Curated for Tanha 💖
        </p>
      </div>
    </div>
  );
}
