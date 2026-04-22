import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SleepLog, SleepSettings, DayInfo } from '../types';
import { format, parseISO, differenceInMinutes, startOfYesterday, startOfDay, subDays, addMinutes, isAfter, isBefore } from 'date-fns';
import { Moon, Sun, Star, ChevronLeft, Clock, Info, Settings as SettingsIcon, Plus, X, BarChart2, Zap, Smile, Coffee, Smartphone, Brain, Heart, AlertCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
  dayInfo: DayInfo;
  cyclePhase?: string;
}

const FEELING_CHIPS = [
  { id: 'tired', label: 'Still tired', icon: '😴' },
  { id: 'refreshed', label: 'Refreshed', icon: '😊' },
  { id: 'headache', label: 'Headache', icon: '🤕' },
  { id: 'happy', label: 'Happy', icon: '🥰' },
  { id: 'irritable', label: 'Irritable', icon: '😤' },
  { id: 'energetic', label: 'Energetic', icon: '⚡' },
  { id: 'nauseous', label: 'Nauseous', icon: '🤢' },
  { id: 'anxious', label: 'Anxious', icon: '😰' }
];

const DISRUPTOR_CHIPS = [
  { id: 'phone', label: 'Too much phone', icon: '📱' },
  { id: 'caffeine', label: 'Caffeine late', icon: '☕' },
  { id: 'stressed', label: 'Stressed', icon: '😰' },
  { id: 'overthinking', label: 'Overthinking', icon: '💭' },
  { id: 'pain', label: 'Pain/cramps', icon: '😣' },
  { id: 'fine', label: 'Slept fine', icon: '🌙' },
  { id: 'noisy', label: 'Noisy', icon: '🔊' },
  { id: 'temp', label: 'Temperature', icon: '🌡️' }
];

export default function SleepTracker({ onBack, dayInfo, cyclePhase }: Props) {
  const [logs, setLogs] = useState<SleepLog[]>(() => {
    const saved = localStorage.getItem('tanha_sleep_logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [settings, setSettings] = useState<SleepSettings>(() => {
    const saved = localStorage.getItem('tanha_sleep_settings');
    return saved ? JSON.parse(saved) : { targetBedtime: '23:00', targetWakeTime: '07:00' };
  });

  const [tempBedtime, setTempBedtime] = useState<string | null>(() => {
    return localStorage.getItem('tanha_sleep_bedtime_temp');
  });

  const [showLogSheet, setShowLogSheet] = useState(false);
  const [showQuickRating, setShowQuickRating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Form State
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formBedtime, setFormBedtime] = useState(format(addMinutes(startOfDay(subDays(new Date(), 1)), 23 * 60), "yyyy-MM-dd'T'HH:mm"));
  const [formWakeTime, setFormWakeTime] = useState(format(addMinutes(startOfDay(new Date()), 7 * 60), "yyyy-MM-dd'T'HH:mm"));
  const [formQuality, setFormQuality] = useState(3);
  const [formFeelings, setFormFeelings] = useState<string[]>([]);
  const [formDisruptors, setFormDisruptors] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('tanha_sleep_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('tanha_sleep_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (tempBedtime) localStorage.setItem('tanha_sleep_bedtime_temp', tempBedtime);
    else localStorage.removeItem('tanha_sleep_bedtime_temp');
  }, [tempBedtime]);

  const lastNightLog = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return logs.find(l => l.date === today);
  }, [logs]);

  const duration = lastNightLog ? lastNightLog.durationMinutes : 0;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  const getDurationColor = (mins: number) => {
    if (mins >= 420 && mins <= 540) return '#81C784'; // 7-9h
    if (mins >= 300 && mins < 420) return '#FFD54F'; // 5-7h
    if (mins < 300) return '#EF9A9A'; // <5h
    return '#CE93D8'; // >9h
  };

  const getDurationMessage = (mins: number) => {
    if (mins < 300) return { msg: "You did not get enough rest 😢 Please try to sleep earlier tonight 💕", color: 'white' };
    if (mins < 420) return { msg: "A little short on sleep, lokki 🌙 Try to get to bed earlier tonight 💤", color: 'white' };
    if (mins <= 540) return { msg: "Perfect sleep, Tanha! 🌟 You are going to have an amazing day 💕", color: 'white' };
    return { msg: "So well rested! 😴✨ You took such good care of yourself 💖", color: 'white' };
  };

  const handleGoToSleep = () => {
    const now = new Date().toISOString();
    setTempBedtime(now);
    alert("Sleep well, lokki amar 🌙\nI love you 💖");
  };

  const handleWakeUp = () => {
    if (tempBedtime) {
      const bedtime = parseISO(tempBedtime);
      const wakeTime = new Date();
      setFormBedtime(format(bedtime, "yyyy-MM-dd'T'HH:mm"));
      setFormWakeTime(format(wakeTime, "yyyy-MM-dd'T'HH:mm"));
      setShowQuickRating(true);
    } else {
      setShowLogSheet(true);
    }
  };

  const saveLog = () => {
    const bedtime = parseISO(formBedtime);
    const wakeTime = parseISO(formWakeTime);
    const diff = differenceInMinutes(wakeTime, bedtime);
    
    const newLog: SleepLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: format(wakeTime, 'yyyy-MM-dd'),
      bedtime: formBedtime,
      wakeTime: formWakeTime,
      durationMinutes: diff,
      qualityRating: formQuality,
      wakingFeelings: formFeelings,
      sleepDisruptors: formDisruptors,
      notes: formNotes,
      cyclePhase: cyclePhase || 'Unknown'
    };

    setLogs(prev => [newLog, ...prev.filter(l => l.date !== newLog.date)]);
    setTempBedtime(null);
    setShowLogSheet(false);
    setShowQuickRating(false);
    // Reset form
    setFormFeelings([]);
    setFormDisruptors([]);
    setFormNotes('');
  };

  // Stats Logic
  const weeklyStats = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd')).reverse();
    const weekLogs = last7Days.map(date => logs.find(l => l.date === date));
    const avgMins = weekLogs.filter(Boolean).reduce((acc, curr) => acc + (curr?.durationMinutes || 0), 0) / (weekLogs.filter(Boolean).length || 1);
    const avgScore = weekLogs.filter(Boolean).reduce((acc, curr) => acc + (curr?.qualityRating || 0), 0) / (weekLogs.filter(Boolean).length || 1);
    
    return {
      days: last7Days,
      nightLogs: weekLogs,
      avgMins,
      avgScore
    };
  }, [logs]);

  const monthAvgMins = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const monthly = logs.filter(l => isAfter(parseISO(l.date), thirtyDaysAgo));
    if (monthly.length === 0) return 0;
    return monthly.reduce((acc, curr) => acc + curr.durationMinutes, 0) / monthly.length;
  }, [logs]);

  const sleepScore = useMemo(() => {
    if (logs.length === 0) return 0;
    const last7 = logs.slice(0, 7);
    const durationScore = last7.reduce((acc, l) => {
      const ideal = 480; // 8h
      const dev = Math.abs(l.durationMinutes - ideal);
      return acc + Math.max(0, 100 - (dev / 2));
    }, 0) / last7.length;
    const qualityScore = (last7.reduce((acc, l) => acc + l.qualityRating, 0) / last7.length) * 20;
    return Math.round((durationScore + qualityScore) / 2);
  }, [logs]);

  return (
    <div className="min-h-screen bg-[#FDFAF7] pb-32">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 border-b border-[#B76E79]/5 sticky top-0 bg-[#FDFAF7]/80 backdrop-blur-md z-30">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-[#B76E79]/10 transition-colors">
          <ChevronLeft size={24} className="text-[#B76E79]" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#B76E79]">Tanha Sleep Space 🌙</h1>
          <p className="text-[10px] font-bold text-[#8B6F6F] uppercase tracking-widest">Rest is not lazy — it is essential 💕</p>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* Last Night Summary Card */}
        <section>
          <div className="bg-gradient-to-br from-[#1A0A1E] to-[#3D1A4A] rounded-[24px] p-6 shadow-xl relative overflow-hidden text-white min-h-[180px] flex flex-col justify-center">
            {/* Stars background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute animate-pulse"
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: `${Math.random() * 100}%`,
                    width: '2px', height: '2px', background: 'white', borderRadius: '50%'
                  }}
                />
              ))}
            </div>

            {!lastNightLog ? (
              <div className="relative z-10 text-center space-y-4">
                <p className="font-serif text-xl">No sleep logged yet 🌙</p>
                <p className="text-sm opacity-80">How did you sleep last night, Tanha? 💕</p>
                <button 
                  onClick={() => setShowLogSheet(true)}
                  className="bg-[#B76E79] text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-all"
                >
                  Log Sleep
                </button>
              </div>
            ) : (
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                   <h2 className="text-4xl font-serif font-bold">{hours}h {minutes}m 🌙</h2>
                   <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < lastNightLog.qualityRating ? "fill-[#B76E79] text-[#B76E79]" : "text-white/20"} />
                      ))}
                   </div>
                </div>
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">
                  Slept at {format(parseISO(lastNightLog.bedtime), 'h:mm a')} • Woke at {format(parseISO(lastNightLog.wakeTime), 'h:mm a')}
                </p>
                <div className="pt-2 border-t border-white/10 mt-2">
                   <p className="text-sm leading-relaxed italic opacity-90">
                     {getDurationMessage(lastNightLog.durationMinutes).msg}
                   </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quick Buttons */}
        <section className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleGoToSleep}
            disabled={!!tempBedtime}
            className={`flex flex-col items-center justify-center p-4 rounded-[24px] gap-2 transition-all active:scale-95 ${tempBedtime ? 'bg-[#3D1A4A]/50 opacity-60' : 'bg-[#3D1A4A] shadow-lg'}`}
          >
            <Moon size={24} className="text-white" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-white/60 block uppercase">Going to sleep</span>
              <span className="text-xs font-bold text-white">Now 🌙</span>
            </div>
          </button>
          <button 
            onClick={handleWakeUp}
            className="flex flex-col items-center justify-center p-4 rounded-[24px] gap-2 bg-gradient-to-br from-[#FFD54F] to-[#FFA000] shadow-lg transition-all active:scale-95"
          >
            <Sun size={24} className="text-white" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-white/60 block uppercase">Good morning!</span>
              <span className="text-xs font-bold text-white">Just woke up ☀️</span>
            </div>
          </button>
        </section>

        {/* Main Log Button */}
        <button 
          onClick={() => setShowLogSheet(true)}
          className="w-full bg-[#B76E79] py-5 rounded-[24px] text-white font-bold shadow-xl shadow-[#B76E79]/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Plus size={20} /> Log Last Night 🌙
        </button>

        {/* Weekly Chart */}
        <section className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#B76E79] flex items-center gap-2">
              <BarChart2 size={14} /> Last 7 Nights 📊
            </h3>
            <span className="text-[10px] font-bold text-[#8B6F6F]">Average: {Math.floor(weeklyStats.avgMins / 60)}h {Math.round(weeklyStats.avgMins % 60)}m</span>
          </div>

          <div className="h-40 flex items-end justify-between px-2 pt-4 relative">
             {/* Ideal Line (8h) */}
             <div className="absolute top-[20%] left-0 right-0 border-t border-dashed border-[#8B6F6F]/20" />
             <div className="absolute top-[20%] right-[-10px] text-[8px] font-bold text-[#8B6F6F]/40">8h</div>

             {weeklyStats.nightLogs.map((log, i) => {
               const height = log ? Math.min(100, (log.durationMinutes / 600) * 100) : 0;
               const isToday = i === 6;
               return (
                 <div key={i} className="flex flex-col items-center gap-2 w-full">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      className={`w-6 rounded-t-lg relative transition-colors ${isToday ? 'border-2 border-[#B76E79] border-b-0' : ''}`}
                      style={{ backgroundColor: log ? getDurationColor(log.durationMinutes) : '#F1F1F1' }}
                    >
                      {log && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#8B6F6F]">{Math.floor(log.durationMinutes / 60)}h</div>}
                    </motion.div>
                    <span className="text-[10px] font-bold text-[#8B6F6F] uppercase">{weeklyStats.days[i].split('-')[2]}</span>
                 </div>
               );
             })}
          </div>
          <p className="text-[10px] font-bold text-center text-[#8B6F6F]/60">Your average this week: {Math.floor(weeklyStats.avgMins / 60)}h {Math.round(weeklyStats.avgMins % 60)}m 🌙</p>
        </section>

        {/* Stats Scroll Row */}
        <section className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
           <div className="glass-card p-4 min-w-[140px] flex flex-col items-center gap-2 bg-gradient-to-br from-white to-[#B76E79]/5">
              <BarChart2 size={16} className="text-[#B76E79]" />
              <div className="text-center">
                 <p className="text-lg font-serif font-bold text-[#2C1810]">{Math.floor(monthAvgMins / 60)}h {Math.round(monthAvgMins % 60)}m</p>
                 <p className="text-[9px] font-bold text-[#8B6F6F] uppercase">Month Avg</p>
              </div>
           </div>
           <div className="glass-card p-4 min-w-[140px] flex flex-col items-center gap-2 bg-gradient-to-br from-white to-[#FFD54F]/5">
              <Star size={16} className="text-[#FFD54F]" />
              <div className="text-center">
                 <p className="text-lg font-serif font-bold text-[#2C1810]">{weeklyStats.avgScore.toFixed(1)}</p>
                 <p className="text-[9px] font-bold text-[#8B6F6F] uppercase">Avg Quality</p>
              </div>
           </div>
           <div className="glass-card p-4 min-w-[140px] flex flex-col items-center gap-2 bg-gradient-to-br from-white to-[#F06292]/5">
              <Zap size={16} className="text-[#F06292]" />
              <div className="text-center">
                 <p className="text-lg font-serif font-bold text-[#2C1810]">5</p>
                 <p className="text-[9px] font-bold text-[#8B6F6F] uppercase">Best Streak</p>
              </div>
           </div>
           <div className="glass-card p-4 min-w-[140px] flex flex-col items-center gap-2 bg-gradient-to-br from-white to-blue-50">
              <Smile size={16} className="text-blue-400" />
              <div className="text-center">
                 <p className="text-lg font-serif font-bold text-[#2C1810]">Refreshed</p>
                 <p className="text-[9px] font-bold text-[#8B6F6F] uppercase">Common Mood</p>
              </div>
           </div>
        </section>

        {/* Sleep Score Card */}
        <section className="glass-card p-8 flex flex-col items-center justify-center space-y-4">
           <p className="text-xs font-black uppercase tracking-widest text-[#B76E79]">Your Sleep Score This Week</p>
           <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="80" cy="80" r="75" fill="transparent" stroke="#B76E7910" strokeWidth="10" />
                 <circle 
                   cx="80" cy="80" r="75" fill="transparent" 
                   stroke={sleepScore >= 90 ? "#B76E79" : sleepScore >= 75 ? "#81C784" : sleepScore >= 60 ? "#FFB74D" : "#EF9A9A"} 
                   strokeWidth="10" 
                   strokeDasharray={471} strokeDashoffset={471 - (sleepScore / 100) * 471} 
                   strokeLinecap="round" className="transition-all duration-1000" 
                 />
              </svg>
              <div className="text-center">
                 <p className="text-6xl font-serif font-bold text-[#2C1810]">{sleepScore}</p>
                 <p className="text-sm font-bold text-[#8B6F6F]">/100</p>
              </div>
           </div>
           <div className="text-center">
              <p className="text-xl font-serif font-bold" style={{ color: sleepScore >= 90 ? "#B76E79" : sleepScore >= 75 ? "#81C784" : sleepScore >= 60 ? "#FFB74D" : "#EF9A9A" }}>
                {sleepScore >= 90 ? "Sleep Queen 👑💕" : sleepScore >= 75 ? "Resting Well 🌸" : sleepScore >= 60 ? "Room to Improve 💪" : "Let us prioritize rest 🥺"}
              </p>
           </div>
        </section>

        {/* Cycle Connection Card */}
        {cyclePhase && (
          <section className="bg-gradient-to-r from-[#FFF0F3] to-[#FFE4EC] p-6 rounded-[24px] space-y-3 relative overflow-hidden">
             <div className="absolute right-[-20px] top-[-20px] opacity-10">
                <Heart size={120} className="fill-[#B76E79]" />
             </div>
             <h3 className="text-xs font-black uppercase tracking-widest text-[#C2185B] flex items-center gap-2">
                <Smile size={14} /> Sleep & Your Cycle 🌙
             </h3>
             <p className="text-sm font-accent italic leading-relaxed text-[#2C1810] relative z-10">
               {cyclePhase === 'Menstrual' && "You may feel extra tired this week 💕 Rest more than usual — your body needs it during your period 🌸"}
               {cyclePhase === 'Follicular' && "Energy is rising! You should sleep well this week ✨ Enjoy it!"}
               {cyclePhase === 'Ovulation' && "Peak energy phase 🌟 You might find it harder to wind down. Try a calming routine before bed 🌙"}
               {cyclePhase === 'Luteal' && "Sleep may be disrupted this week 💕 Progesterone changes are normal. Try magnesium before bed 🌿 Be gentle with yourself, Tanha 🥺"}
               {!['Menstrual', 'Follicular', 'Ovulation', 'Luteal'].includes(cyclePhase) && "Your body's rest needs change through the month. Keep tracking to see your personal patterns 🌙"}
             </p>
          </section>
        )}

        {/* Settings Footer */}
        <section className="glass-card p-6 space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#8B6F6F] flex items-center gap-2">
                <SettingsIcon size={14} /> Sleep Settings ⚙️
              </h3>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-[#8B6F6F] uppercase">Target Bedtime</label>
                 <input 
                   type="time" 
                   value={settings.targetBedtime}
                   onChange={e => setSettings(s => ({ ...s, targetBedtime: e.target.value }))}
                   className="w-full bg-[#FDFAF7] border-none rounded-xl p-3 text-sm font-bold text-[#B76E79]"
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-bold text-[#8B6F6F] uppercase">Target Wake Time</label>
                 <input 
                   type="time" 
                   value={settings.targetWakeTime}
                   onChange={e => setSettings(s => ({ ...s, targetWakeTime: e.target.value }))}
                   className="w-full bg-[#FDFAF7] border-none rounded-xl p-3 text-sm font-bold text-[#B76E79]"
                 />
              </div>
           </div>
        </section>
      </div>

      {/* Log Sheet */}
      <AnimatePresence>
        {(showLogSheet || showQuickRating) && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowLogSheet(false); setShowQuickRating(false); }} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-[480px] bg-white rounded-t-[32px] p-8 space-y-6 shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh]">
              <div className="w-12 h-1.5 bg-[#8B6F6F]/20 rounded-full mx-auto" />
              
              {showQuickRating ? (
                <div className="space-y-8 py-4">
                  <div className="text-center space-y-2">
                    <h4 className="text-2xl font-serif font-bold text-[#2C1810]">Good morning, Tanha! ☀️</h4>
                    <p className="text-sm font-accent italic text-[#8B6F6F]">How well did you sleep? 🌙</p>
                  </div>
                  
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setFormQuality(star)} className="focus:outline-none transition-transform active:scale-110">
                        <Star size={48} className={star <= formQuality ? "fill-[#B76E79] text-[#B76E79]" : "text-[#B76E79]/20"} />
                      </button>
                    ))}
                  </div>

                  <button onClick={saveLog} className="w-full bg-[#B76E79] text-white py-4 rounded-2xl font-bold shadow-xl">Done 💕</button>
                </div>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-xl font-serif font-bold text-[#B76E79]">Log Sleep 🌙</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#8B6F6F] uppercase">When did you sleep? 🌙</label>
                      <input 
                        type="datetime-local" 
                        value={formBedtime} 
                        onChange={e => setFormBedtime(e.target.value)}
                        className="w-full bg-[#FDFAF7] border-none rounded-xl p-3 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#8B6F6F] uppercase">When did you wake up? ☀️</label>
                      <input 
                        type="datetime-local" 
                        value={formWakeTime} 
                        onChange={e => setFormWakeTime(e.target.value)}
                        className="w-full bg-[#FDFAF7] border-none rounded-xl p-3 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {(() => {
                    const diff = differenceInMinutes(parseISO(formWakeTime), parseISO(formBedtime));
                    return (
                       <div className="p-3 rounded-xl text-center font-bold text-xs" style={{ backgroundColor: `${getDurationColor(diff)}15`, color: getDurationColor(diff) }}>
                         That is {Math.floor(diff / 60)}h {diff % 60}m of sleep 🌙
                       </div>
                    );
                  })()}

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#8B6F6F] uppercase">How well did you sleep? 🌸</label>
                    <div className="flex justify-between items-center bg-[#FDFAF7] p-4 rounded-xl">
                       <span className="text-xl">{['😩', '😔', '😐', '😊', '😄'][formQuality - 1]}</span>
                       <div className="flex gap-2">
                         {[1, 2, 3, 4, 5].map(s => (
                           <button key={s} onClick={() => setFormQuality(s)}><Star size={20} className={s <= formQuality ? "fill-[#B76E79] text-[#B76E79]" : "text-[#B76E79]/20"} /></button>
                         ))}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#8B6F6F] uppercase">Waking feeling 🌸</label>
                    <div className="flex flex-wrap gap-2">
                       {FEELING_CHIPS.map(chip => (
                         <button 
                            key={chip.id}
                            onClick={() => setFormFeelings(prev => prev.includes(chip.id) ? prev.filter(f => f !== chip.id) : [...prev, chip.id])}
                            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${formFeelings.includes(chip.id) ? 'bg-[#B76E79] text-white' : 'bg-[#FDFAF7] text-[#8B6F6F]'}`}
                         >
                           <span>{chip.icon}</span> {chip.label}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#8B6F6F] uppercase">Disruptors 🌙</label>
                    <div className="flex flex-wrap gap-2">
                       {DISRUPTOR_CHIPS.map(chip => (
                         <button 
                            key={chip.id}
                            onClick={() => setFormDisruptors(prev => prev.includes(chip.id) ? prev.filter(d => d !== chip.id) : [...prev, chip.id])}
                            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${formDisruptors.includes(chip.id) ? 'bg-[#B76E79] text-white' : 'bg-[#FDFAF7] text-[#8B6F6F]'}`}
                         >
                           <span>{chip.icon}</span> {chip.label}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#8B6F6F] uppercase">Anything else? 🌙</label>
                    <textarea 
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                      placeholder="Dreams? Thoughts? 🌸"
                      className="w-full bg-[#FDFAF7] border-none rounded-xl p-4 text-sm font-nunito h-24 no-scrollbar"
                    />
                  </div>

                  <button onClick={saveLog} className="w-full bg-[#B76E79] text-white py-5 rounded-2xl font-bold shadow-xl shadow-[#B76E79]/20">Log Sleep 🌙💕</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Empty State Overlay if needed, but we handle it in cards */}
      {logs.length === 0 && !showLogSheet && (
        <div className="fixed inset-0 z-10 flex flex-col items-center justify-center p-12 text-center space-y-6 pointer-events-none bg-white">
           <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-8xl">🌙</motion.div>
           <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-[#B76E79]">No sleep logged yet, Tanha 🌙</h2>
              <p className="font-accent italic text-[#8B6F6F]">
                 Start tracking and discover your sleep patterns 💕<br/>
                 Good sleep is the best self care 🌸
              </p>
           </div>
           <button 
             onClick={() => setShowLogSheet(true)}
             className="bg-[#B76E79] text-white px-8 py-4 rounded-2xl font-bold shadow-xl pointer-events-auto active:scale-95"
           >
             Log Last Night 🌙
           </button>
        </div>
      )}
    </div>
  );
}
