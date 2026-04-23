import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MessageCircleHeart, Music, Star, Sparkles, MapPin } from 'lucide-react';
import { differenceInDays, startOfDay } from 'date-fns';

interface Props {
  onBack: () => void;
}

// Fixed milestones for the journey
const JOURNEY_MILESTONES = [
  { day: 100, message: "Day 100: The countdown begins. 100 days to prepare for the day the world got its brightest star. 🌟", type: 'voice' },
  { day: 90, message: "Day 90: I'm looking at our photos today and realizing how lucky I am. 90 days until we celebrate YOU. ❤️", type: 'text' },
  { day: 80, message: "Day 80: Remember that rainy day we spent just talking? I can't wait for more moments like that. 🌸", type: 'voice' },
  { day: 70, message: "Day 70: You are my heart’s anchor, Tanha. Stay beautiful, amar jaan. ✨", type: 'text' },
  { day: 60, message: "Day 60: Two months to go! The surprises are piling up... 🎁", type: 'voice' },
  { day: 0, message: "HAPPY BIRTHDAY TANHA! You are my everything! 👑🎂💖", type: 'voice' }
];

const FallingPetal = ({ delay }: { delay: number }) => {
  const left = useMemo(() => Math.random() * 100, []);
  const duration = useMemo(() => 8 + Math.random() * 7, []);
  const size = useMemo(() => 8 + Math.random() * 12, []);

  return (
    <motion.div
      initial={{ top: -20, left: `${left}%`, opacity: 0, rotate: 0 }}
      animate={{ 
        top: '110%', 
        left: `${left + (Math.random() * 20 - 10)}%`, 
        opacity: [0, 0.7, 0.7, 0],
        rotate: 360 
      }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        delay,
        ease: "linear"
      }}
      className="absolute pointer-events-none z-0"
    >
      <div 
        className="bg-rose-200/40 rounded-full blur-[1px]"
        style={{ width: size, height: size, borderRadius: '60% 40% 70% 30% / 50%' }}
      />
    </motion.div>
  );
};

export default function BirthdayJourney({ onBack }: Props) {
  const birthday = new Date('2026-07-31');
  const today = startOfDay(new Date());
  
  // PASSIVE GROWTH LOGIC: Total 100 days countdown
  // If today is Apr 23, Jul 31 is roughly 99 days away.
  const daysLeft = differenceInDays(birthday, today);
  const totalDays = 100;
  const journeyDay = totalDays - daysLeft; 
  const growth = Math.min(100, Math.max(0, (journeyDay / totalDays) * 100));

  const unlockedNotes = JOURNEY_MILESTONES.filter(n => (totalDays - n.day) <= journeyDay);

  const [petals, setPetals] = useState<number[]>([]);
  useEffect(() => {
    setPetals([...Array(15)].map((_, i) => i * 0.8));
  }, []);

  return (
    <div className="fixed inset-0 z-[70] bg-gradient-to-b from-[#FFF0F3] via-[#FFE4EC] to-[#F8E8FF] overflow-y-auto no-scrollbar pb-32">
      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {petals.map((delay, i) => (
          <FallingPetal key={i} delay={delay} />
        ))}
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-white/40 to-transparent" />
      </div>

      <div className="relative z-10 px-6">
        <header className="flex items-center justify-between py-6">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md text-[#8B6F6F] shadow-sm active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-serif font-bold text-[#B76E79]">Cinematic Journey</h2>
            <p className="text-[10px] font-bold text-[#8B6F6F] uppercase tracking-widest">July 31st • 2026</p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* The Cinematic Tree Section */}
        <section className="mt-4 mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[400px] flex flex-col items-center justify-end p-8 bg-white/20 backdrop-blur-[2px] rounded-[40px] border border-white/40 shadow-2xl overflow-hidden"
          >
            {/* Soft Sun Glow */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-200/20 blur-[60px] rounded-full pointer-events-none" />

            {/* Path Visualization */}
            <svg className="absolute bottom-10 w-full px-12 opacity-30" viewBox="0 0 100 20">
              <path 
                d="M 10 10 Q 50 0, 90 10" 
                fill="transparent" 
                stroke="#B76E79" 
                strokeWidth="0.5" 
                strokeDasharray="2,2" 
              />
              <motion.circle 
                cx={10 + (growth * 0.8)} 
                cy={10 - (Math.sin((growth / 100) * Math.PI) * 5)} 
                r="1.5" 
                fill="#C2185B" 
              />
            </svg>

            {/* The Tree */}
            <div className="relative w-full h-full flex items-end justify-center mb-4">
               {/* Main Trunk */}
               <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${30 + (growth * 0.6)}%` }}
                className="w-6 bg-gradient-to-b from-[#5D4037] to-[#3E2723] rounded-t-full relative shadow-lg animate-tree-glow"
              >
                {/* Branches */}
                {growth > 15 && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} 
                    className="absolute -left-16 bottom-1/2 w-20 h-2 bg-[#5D4037] rotate-[35deg] origin-right rounded-full shadow-sm"
                  />
                )}
                {growth > 35 && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} 
                    className="absolute -right-16 bottom-2/3 w-24 h-2 bg-[#5D4037] rotate-[-35deg] origin-left rounded-full shadow-sm"
                  />
                )}
                {growth > 55 && (
                   <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} 
                    className="absolute -left-12 bottom-[80%] w-16 h-2 bg-[#5D4037] rotate-[15deg] origin-right rounded-full shadow-sm"
                  />
                )}

                {/* Flowers/Blooms */}
                {[...Array(Math.floor(growth / 2))].map((_, i) => {
                  const angle = (i * 137.5) % 360;
                  const dist = 30 + (Math.sqrt(i) * 18);
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.02, type: "spring" }}
                      className="absolute w-5 h-5 bg-gradient-to-tr from-rose-200 to-rose-400 rounded-full blur-[0.5px]"
                      style={{
                        left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * dist}px)`,
                        bottom: `calc(100% + ${Math.sin(angle * Math.PI / 180) * dist}px)`,
                        boxShadow: '0 4px 8px rgba(183,110,121,0.2)'
                      }}
                    />
                  );
                })}
              </motion.div>
            </div>

            {/* Growth Stats Info */}
            <div className="absolute bottom-6 flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 text-[10px] font-bold text-[#C2185B] uppercase tracking-widest">
              <Sparkles size={12} /> Journey Level: {Math.floor(growth)}% Blooms
            </div>
          </motion.div>
        </section>

        {/* Cinematic Progress Bar */}
        <section className="glass-card p-6 mb-12 bg-white/60">
           <div className="flex justify-between items-center mb-3">
             <span className="text-[10px] font-black text-[#B76E79] uppercase tracking-[0.2em]">Our Path to July 31st</span>
             <span className="text-xs font-bold text-[#C2185B]">{daysLeft} Days to go</span>
           </div>
           <div className="h-1.5 w-full bg-[#B76E79]/10 rounded-full relative overflow-hidden">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${growth}%` }}
              className="h-full bg-gradient-to-r from-[#B76E79] via-[#C2185B] to-[#B76E79] animate-shimmer"
              style={{ backgroundSize: '200% 100%' }}
             />
           </div>
        </section>

        {/* Love Notes Section */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black tracking-[0.3em] text-[#8B6F6F] uppercase px-1 flex items-center gap-2">
            <MessageCircleHeart size={14} className="text-[#C2185B]" /> The Journey Chronicle
          </h3>
          
          <div className="space-y-6 relative">
            {/* Timeline Line */}
            <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-[#B76E79]/10" />

            <AnimatePresence>
              {unlockedNotes.map((note, idx) => (
                <motion.div
                  key={note.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0 border border-[#B76E79]/10 z-10">
                    <MapPin size={20} className={note.day === 0 ? "text-[#FFD700]" : "text-[#B76E79]"} />
                  </div>
                  <div className="flex-1 glass-card p-6 bg-white/70 backdrop-blur-xl border border-white relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                      {note.type === 'voice' ? <Music size={16} className="text-[#C2185B]" /> : <Star size={16} className="text-[#B76E79]" />}
                    </div>
                    
                    <span className="text-[9px] font-black text-[#C2185B] uppercase tracking-[0.2em] block mb-2">
                      {note.day === 0 ? "👑 The Grand Finale" : `${note.day} Days Countdown`}
                    </span>
                    
                    <p className="text-lg font-serif italic text-[#2C1810] leading-relaxed mb-4">
                      "{note.message}"
                    </p>
                    
                    <div className="flex justify-end pt-2 border-t border-[#B76E79]/5">
                      <span className="text-[10px] font-bold text-[#B76E79] uppercase tracking-widest">
                        ~ Your Husband 💖
                      </span>
                    </div>
                  </div>
                </motion.div>
              )).reverse()}
            </AnimatePresence>
          </div>
        </section>

        <section className="py-20 text-center space-y-6">
          <div className="w-12 h-0.5 bg-[#B76E79]/20 mx-auto rounded-full" />
          <p className="text-xs text-[#8B6F6F] italic leading-relaxed">
            "Like this tree, my love for you grows effortlessly every single day.<br/>
            Wait for the day it reaches 100% bloom, Tanha. ✨"
          </p>
        </section>
      </div>
    </div>
  );
}
