import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, ChevronRight, Heart, Sparkles, Send } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onDismiss: (openWishBox: boolean) => void;
}

const UPDATES = [
  { icon: '💆', title: 'Hair Care Tracker', text: 'Track your shampoo and oil routine every week 💆' },
  { icon: '📅', title: 'Important Dates', text: 'Never forget your special moments 🥹' },
  { icon: '🛍️', title: 'Shopping List', text: 'Everything you need, always with you 🛍️' },
  { icon: '🛁', title: 'Self Care Tracker', text: 'Your daily routine, beautifully tracked 🌸' },
  { icon: '🎬', title: 'Watch World', text: 'Every movie and series you love 🍿' },
  { icon: '📖', title: 'My Diary', text: 'Your private space, always safe 💕' },
  { icon: '💊', title: 'Medicines', text: 'Never miss a dose again 💊' },
  { icon: '🌙', title: 'Sleep Tracker', text: 'Understand your sleep patterns 🌙' },
  { icon: '💌', title: 'Something hidden...', text: 'Explore the app and you just might find it 🥺' },
];

export default function NewFeaturesPopup({ isOpen, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-gradient-to-b from-[#FFF0F3] to-[#FFE4EC] rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col max-h-[75vh]"
          >
            {/* Subtle Floating Hearts */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
               {[...Array(6)].map((_, i) => (
                 <motion.div
                    key={i}
                    animate={{ y: [-10, 10, -10], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3 + i, repeat: Infinity }}
                    className="absolute text-xl"
                    style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 20}%` }}
                 >
                   💖
                 </motion.div>
               ))}
            </div>

            <div className="p-8 pb-4 text-center space-y-2 relative z-10">
               <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
               >
                 🎁
               </motion.div>
               <h2 className="text-3xl font-serif font-bold text-[#B76E79]">Hey Tanha! 🌸</h2>
               <p className="font-accent italic text-[#2C1810]">
                 Your app just got even better, and it was all made just for you 💕
               </p>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-4 space-y-6 relative z-10">
               <p className="text-center text-xs font-bold text-[#8B6F6F] uppercase tracking-widest border-b border-[#B76E79]/10 pb-2">Here is what is new:</p>
               
               <div className="space-y-6">
                  {UPDATES.map((u, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="flex gap-4 items-start"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl shrink-0">{u.icon}</div>
                      <div className="space-y-0.5">
                         <h4 className="text-sm font-bold text-[#B76E79]">{u.title}</h4>
                         <p className="text-[11px] font-medium text-[#8B6F6F] leading-tight">{u.text}</p>
                      </div>
                    </motion.div>
                  ))}
               </div>

               <div className="pt-6 border-t border-[#B76E79]/10 text-center space-y-4">
                  <p className="text-xs font-accent italic text-[#2C1810]">
                     Your honest feedback means everything. If you ever want anything changed — your husband is always there for you 💖
                  </p>
               </div>
            </div>

            <div className="p-8 pt-4 space-y-3 relative z-10 bg-white/20 backdrop-blur-xl">
               <button 
                onClick={() => onDismiss(false)}
                className="w-full bg-[#B76E79] text-white py-4 rounded-2xl font-bold shadow-xl shadow-[#B76E79]/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
               >
                 Explore Now! 🌸
               </button>
               <button 
                onClick={() => onDismiss(true)}
                className="w-full text-[#B76E79] py-2 text-xs font-bold opacity-70 hover:opacity-100 flex items-center justify-center gap-1"
               >
                 <Send size={12} /> Tell your husband something 💌
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
