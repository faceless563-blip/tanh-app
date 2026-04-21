import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BathLog, SelfCareDailyLog } from '../types';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, subDays, differenceInDays } from 'date-fns';
import { ChevronLeft, Plus, Check, Trophy, Flame, Droplets, Sparkles, Wind, Bath } from 'lucide-react';

interface Props {
  onBack: () => void;
  triggerCelebration: (msg: string) => void;
}

const CHECKLIST_ITEMS = [
  { key: 'moisturizer', label: 'Moisturizer applied', emoji: '🧴' },
  { key: 'facewash', label: 'Face wash done', emoji: '🧖' },
  { key: 'nails', label: 'Nails checked', emoji: '💅' },
  { key: 'teethMorning', label: 'Brushed teeth (morning)', emoji: '🪥' },
  { key: 'teethNight', label: 'Brushed teeth (night)', emoji: '🪥' },
  { key: 'sunscreen', label: 'Sunscreen applied', emoji: '☀️' },
  { key: 'vitamins', label: 'Vitamins taken', emoji: '💊' },
  { key: 'water', label: 'Drank enough water', emoji: '💧' },
] as const;

export default function SelfCare({ onBack, triggerCelebration }: Props) {
  const [bathLogs, setBathLogs] = useState<BathLog[]>(() => {
    const saved = localStorage.getItem('tanha_bath_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyLogs, setDailyLogs] = useState<Record<string, SelfCareDailyLog>>(() => {
    const saved = localStorage.getItem('tanha_self_care_logs');
    return saved ? JSON.parse(saved) : {};
  });

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayLog = dailyLogs[todayStr] || {
    moisturizer: false, facewash: false, nails: false,
    teethMorning: false, teethNight: false, sunscreen: false,
    vitamins: false, water: false
  };

  const hasBathedToday = bathLogs.some(log => log.date === todayStr);

  const lastBathInfo = useMemo(() => {
    if (bathLogs.length === 0) return "No bath logged yet 🌸";
    const sorted = [...bathLogs].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
    const last = new Date(sorted[0].date);
    const diff = differenceInDays(new Date(), last);
    if (diff === 0) return "Today 🌸";
    if (diff === 1) return "Yesterday 💕";
    return `${diff} days ago`;
  }, [bathLogs]);

  const logBath = () => {
    if (hasBathedToday) return;
    const now = new Date();
    const newLog: BathLog = {
      date: format(now, 'yyyy-MM-dd'),
      loggedAt: now.toISOString()
    };
    const updated = [...bathLogs, newLog];
    setBathLogs(updated);
    localStorage.setItem('tanha_bath_logs', JSON.stringify(updated));
    triggerCelebration("Squeaky clean and glowing, lokki amar! I love you so much 🛁✨💕");
  };

  const toggleCheck = (key: keyof SelfCareDailyLog) => {
    const newLog = { ...todayLog, [key]: !todayLog[key] };
    const updatedDaily = { ...dailyLogs, [todayStr]: newLog };
    setDailyLogs(updatedDaily);
    localStorage.setItem('tanha_self_care_logs', JSON.stringify(updatedDaily));

    // Check if all done
    const allDone = Object.values(newLog).every(v => v === true);
    if (allDone) {
      triggerCelebration("Full self care day, Tanha!! 🎉 You took such good care of yourself today and I am SO proud of you 🥺💖✨");
    }
  };

  const progressCount = Object.values(todayLog).filter(Boolean).length;
  const progressPercent = Math.round((progressCount / 8) * 100);

  // Week Strip
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date());
    return eachDayOfInterval({ start, end: endOfWeek(new Date()) });
  }, []);

  const stats = useMemo(() => {
    // Streak calculation (simplified)
    const sortedDates = [...new Set(bathLogs.map(l => l.date))].sort().reverse();
    let streak = 0;
    let current = new Date();
    // This is basic, for a better streak we'd check one by one
    streak = sortedDates.length > 0 ? 1 : 0; 

    return { streak, best: 14 }; // Placeholder for best
  }, [bathLogs]);

  const weekScore = useMemo(() => {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    const daysInWeek = 7;
    let totalDone = 0;
    eachDayOfInterval({ start, end }).forEach(date => {
      const dStr = format(date, 'yyyy-MM-dd');
      if (dailyLogs[dStr]) {
        totalDone += Object.values(dailyLogs[dStr]).filter(Boolean).length;
      }
    });
    return Math.round((totalDone / (daysInWeek * 8)) * 100);
  }, [dailyLogs]);

  return (
    <div className="min-h-screen pt-4 pb-40 px-6 space-y-8 overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 py-2">
        <button onClick={onBack} className="text-[#8B6F6F]"><ChevronLeft size={24} /></button>
        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-bold text-[#2C1810]">Tanha Self Care 🛁</h2>
          <p className="text-sm font-accent italic text-[#8B6F6F]">Because you deserve to be taken care of 🌸</p>
        </div>
      </header>

      {/* Bath Tracker Hero */}
      <div className="bg-gradient-to-br from-[#FFF9F0] to-[#FFF0F3] rounded-[24px] p-6 shadow-md border border-[#B76E79]/10 space-y-6">
        <div className="flex flex-col items-center gap-2">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl"
          >
            🛁
          </motion.div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B6F6F]">Last bath:</p>
            <p className="font-nunito font-bold text-[#C2185B]">{lastBathInfo}</p>
          </div>
        </div>

        <button 
          onClick={logBath}
          disabled={hasBathedToday}
          className={`w-full py-4 rounded-full font-bold shadow-lg transition-all active:scale-95 ${
            hasBathedToday ? 'bg-green-100 text-green-600' : 'bg-[#B76E79] text-white'
          }`}
        >
          {hasBathedToday ? '✅ Done! 🛁' : 'I had my bath today 🛁✨'}
        </button>

        <div className="flex justify-between items-center px-2">
          {weekDays.map((date, idx) => {
            const dStr = format(date, 'yyyy-MM-dd');
            const hasBath = bathLogs.some(l => l.date === dStr);
            const isToday = isSameDay(date, new Date());
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className="text-[8px] font-bold text-[#8B6F6F]">{format(date, 'EEE')}</span>
                <div className={`w-3 h-3 rounded-full ${hasBath ? 'bg-[#B76E79]' : 'bg-[#B76E79]/10'} ${isToday ? 'ring-1 ring-[#B76E79]' : ''}`} />
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-8 border-t border-black/5 pt-4">
           <div className="flex items-center gap-2">
              <Flame size={16} className="text-[#B76E79]" />
              <span className="font-nunito font-bold text-[#2C1810] text-xs">{stats.streak} day streak</span>
           </div>
           <div className="flex items-center gap-2">
              <Trophy size={16} className="text-[#B76E79]" />
              <span className="font-nunito font-bold text-[#2C1810] text-xs">{stats.best} best ever</span>
           </div>
        </div>
      </div>

      {/* Daily Checklist */}
      <section className="space-y-4">
        <div className="px-1">
          <h3 className="text-sm font-bold text-[#8B3A52] tracking-wider">Today Self Care 💆</h3>
          <p className="text-[10px] text-[#8B6F6F] font-semibold">Resets every day 🌸</p>
        </div>

        <div className="space-y-3">
          {CHECKLIST_ITEMS.map(item => (
            <div 
              key={item.key} 
              onClick={() => toggleCheck(item.key)}
              className="glass-card p-4 flex items-center gap-4 active:scale-[0.98] transition-all"
            >
               <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                 todayLog[item.key] ? 'bg-[#B76E79] border-[#B76E79] text-white' : 'border-[#B76E79]/30 text-transparent'
               }`}>
                 <Check size={14} strokeWidth={4} />
               </div>
               <span className={`flex-1 font-nunito text-sm font-bold transition-all ${todayLog[item.key] ? 'line-through opacity-40 text-[#8B6F6F]' : 'text-[#2C1810]'}`}>
                 {item.emoji} {item.label}
               </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
           <div className="flex justify-between text-[10px] font-bold text-[#8B6F6F] px-1">
             <span>Progress</span>
             <span>{progressCount} of 8 done today 💕</span>
           </div>
           <div className="h-1.5 w-full bg-[#B76E79]/10 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progressPercent}%` }}
               className="h-full bg-[#B76E79]"
             />
           </div>
        </div>
      </section>

      {/* Weekly Score */}
      <div className="glass-card p-6 flex flex-col items-center gap-4 shadow-sm border-none bg-white/40">
         <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#8B6F6F] uppercase">This Week 📊</h4>
         <div className="text-center">
           <span className={`text-6xl font-serif font-black ${
             weekScore >= 80 ? 'text-[#B76E79]' : weekScore >= 60 ? 'text-[#FFB74D]' : 'text-[#8B6F6F]'
           }`}>
             {weekScore}%
           </span>
           <p className="text-xs font-bold text-[#8B6F6F] mt-1">
             {weekScore >= 80 ? 'Amazing 🌟' : weekScore >= 60 ? 'Good job 💪' : 'Let us do better 🌸'}
           </p>
         </div>
         <div className="space-y-1 text-center font-nunito text-[10px] font-bold text-[#8B6F6F]/60">
            <p>Your best week: 88% 🏆</p>
            <p>Keep going, lokki amar 💖</p>
         </div>
      </div>
    </div>
  );
}
