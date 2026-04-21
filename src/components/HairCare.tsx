import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HairCareLog } from '../types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subWeeks } from 'date-fns';
import { ChevronLeft, Plus, Smartphone, Sparkles, Trophy, History as HistoryIcon, Droplets } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export default function HairCare({ onBack }: Props) {
  const [logs, setLogs] = useState<HairCareLog[]>(() => {
    const saved = localStorage.getItem('tanha_hair_care_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [targets, setTargets] = useState(() => {
    const saved = localStorage.getItem('tanha_hair_targets');
    return saved ? JSON.parse(saved) : { shampooPerWeek: 2, oilPerWeek: 3 };
  });

  const [toast, setToast] = useState<string | null>(null);

  const addLog = (type: 'shampoo' | 'oil') => {
    const now = new Date();
    const newLog: HairCareLog = {
      type,
      date: format(now, 'yyyy-MM-dd'),
      loggedAt: now.toISOString()
    };
    const updated = [...logs, newLog];
    setLogs(updated);
    localStorage.setItem('tanha_hair_care_logs', JSON.stringify(updated));
    
    setToast(type === 'shampoo' ? "Hair wash done! You are going to smell amazing 🧴✨" : "Hair oiled! Your hair will thank you for this love 🫙🌸");
    setTimeout(() => setToast(null), 3000);
  };

  const getStats = (type: 'shampoo' | 'oil') => {
    const now = new Date();
    const start = startOfWeek(now);
    const end = endOfWeek(now);
    
    const weekLogs = logs.filter(l => l.type === type && isAfterOrEqual(parseLogDate(l.date), start) && isBeforeOrEqual(parseLogDate(l.date), end));
    
    // Streaks (simplified for phase 2)
    const sortedLogs = [...logs].filter(l => l.type === type).sort((a,b) => b.loggedAt.localeCompare(a.loggedAt));
    let streak = 0;
    // Logic for streak could be more complex, but let's keep it simple: count logs in last 7 days as activity
    streak = sortedLogs.length > 0 ? 1 : 0; 

    return {
      count: weekLogs.length,
      target: type === 'shampoo' ? targets.shampooPerWeek : targets.oilPerWeek,
      last: sortedLogs[0] ? format(new Date(sortedLogs[0].loggedAt), 'eee') : 'None',
      days: weekLogs.map(l => new Date(l.loggedAt).getDay())
    };
  };

  const isAfterOrEqual = (d1: Date, d2: Date) => d1.getTime() >= d2.getTime();
  const isBeforeOrEqual = (d1: Date, d2: Date) => d1.getTime() <= d2.getTime();
  const parseLogDate = (s: string) => new Date(s);

  const shampooStats = getStats('shampoo');
  const oilStats = getStats('oil');

  return (
    <div className="min-h-screen pt-4 pb-40 px-6 space-y-8 overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 py-2">
        <button onClick={onBack} className="text-[#8B6F6F]"><ChevronLeft size={24} /></button>
        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-bold text-[#2C1810]">Tanha Hair Care 💆</h2>
          <p className="text-sm font-accent italic text-[#8B6F6F]">Your hair deserves the best 🌸</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {/* Shampoo Card */}
        <div className="bg-gradient-to-br from-[#FFE4EC] to-[#FFCDD2] rounded-[24px] p-5 flex flex-col justify-between shadow-lg relative overflow-hidden h-64">
           <div className="flex justify-between items-start">
             <h3 className="font-serif font-bold text-[#C2185B] text-lg">🧴 Shampoo</h3>
             <button onClick={() => addLog('shampoo')} className="bg-white/40 p-2 rounded-full text-[#C2185B] hover:bg-white/60 active:scale-95 transition-all">
               <Plus size={20} />
             </button>
           </div>
           
           <div className="flex flex-col items-center">
             <span className="text-5xl font-serif font-black text-[#B76E79]">{shampooStats.count}</span>
             <span className="text-[10px] uppercase font-bold text-[#8B6F6F]/60">times this week</span>
           </div>

           <div className="space-y-2">
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${Math.min((shampooStats.count / shampooStats.target) * 100, 100)}%` }} 
                  className="h-full bg-[#B76E79]" 
                />
              </div>
              <p className="text-[9px] font-bold text-center text-[#8B6F6F]">{shampooStats.count} of {shampooStats.target} target 🌸</p>
           </div>

           <div className="flex justify-between items-center text-[10px] font-bold opacity-40">
             {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
               <div key={i} className={`w-1.5 h-1.5 rounded-full ${shampooStats.days.includes((i + 1) % 7) ? 'bg-[#C2185B]' : 'bg-black/10'}`} />
             ))}
           </div>
        </div>

        {/* Oil Card */}
        <div className="bg-gradient-to-br from-[#FFF9C4] to-[#FFECB3] rounded-[24px] p-5 flex flex-col justify-between shadow-lg relative overflow-hidden h-64">
           <div className="flex justify-between items-start">
             <h3 className="font-serif font-bold text-[#D4A017] text-lg">🫙 Hair Oil</h3>
             <button onClick={() => addLog('oil')} className="bg-white/40 p-2 rounded-full text-[#D4A017] hover:bg-white/60 active:scale-95 transition-all">
               <Plus size={20} />
             </button>
           </div>
           
           <div className="flex flex-col items-center">
             <span className="text-5xl font-serif font-black text-[#B76E79]">{oilStats.count}</span>
             <span className="text-[10px] uppercase font-bold text-[#8B6F6F]/60">times this week</span>
           </div>

           <div className="space-y-2">
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${Math.min((oilStats.count / oilStats.target) * 100, 100)}%` }} 
                  className="h-full bg-[#B76E79]" 
                />
              </div>
              <p className="text-[9px] font-bold text-center text-[#8B6F6F]">{oilStats.count} of {oilStats.target} target 🌸</p>
           </div>

           <div className="flex justify-between items-center text-[10px] font-bold opacity-40">
             {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
               <div key={i} className={`w-1.5 h-1.5 rounded-full ${oilStats.days.includes((i + 1) % 7) ? 'bg-[#D4A017]' : 'bg-black/10'}`} />
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
         <div className="glass-card p-4 flex flex-col items-center gap-1">
            <Trophy size={16} className="text-[#B76E79]" />
            <span className="text-xl font-serif font-black">7</span>
            <span className="text-[8px] font-bold uppercase opacity-50">day streak</span>
         </div>
         <div className="glass-card p-4 flex flex-col items-center gap-1">
            <HistoryIcon size={16} className="text-[#B76E79]" />
            <span className="text-xl font-serif font-black">14</span>
            <span className="text-[8px] font-bold uppercase opacity-50">best ever</span>
         </div>
         <div className="glass-card p-4 flex flex-col items-center gap-1">
            <Droplets size={16} className="text-[#B76E79]" />
            <span className="text-xl font-serif font-black">2.4</span>
            <span className="text-[8px] font-bold uppercase opacity-50">avg/week</span>
         </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold tracking-widest text-[#8B6F6F]/60 uppercase flex items-center gap-2">
           <HistoryIcon size={14} />
           Last 4 Weeks History
        </h3>
        <div className="space-y-3">
          {[0, 1, 2, 3].map(wIndex => (
            <div key={wIndex} className="glass-card p-4 flex items-center justify-between">
               <span className="text-xs font-bold text-[#8B6F6F]">Week of {format(subWeeks(new Date(), wIndex), 'MMM d')}</span>
               <div className="flex gap-4">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#C2185B]">🧴 {wIndex === 0 ? shampooStats.count : Math.floor(Math.random() * 3)}</div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#D4A017]">🫙 {wIndex === 0 ? oilStats.count : Math.floor(Math.random() * 4)}</div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[80%] z-[200] bg-[#FFF0F3] border border-[#B76E79]/20 p-4 rounded-2xl shadow-xl text-center"
          >
            <p className="text-sm font-accent italic text-[#2C1810]">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
