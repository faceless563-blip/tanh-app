import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CycleSettings, CycleLog } from '../types';
import { 
  format, addDays, differenceInDays, parseISO, 
  isSameDay, startOfMonth, endOfMonth, eachDayOfInterval,
  isAfter, isBefore, subDays, startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Settings, Plus, Droplets, Smile, Thermometer, Check, Calendar } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const FLOW_OPTIONS = [
  { label: 'None', value: 'none', color: '#fce4ec' },
  { label: 'Spotting', value: 'spotting', color: '#f8bbd0' },
  { label: 'Light', value: 'light', color: '#f06292' },
  { label: 'Medium', value: 'medium', color: '#ec407a' },
  { label: 'Heavy', value: 'heavy', color: '#d81b60' },
  { label: 'Very Heavy', value: 'very_heavy', color: '#c2185b' }
];

const MOODS = [
  '😊 Happy', '😢 Sad', '😰 Anxious', '😤 Irritable', '🧘 Calm', '🥰 Romantic',
  '😴 Tired', '⚡ Energetic', '😭 Emotional', '💪 Confident', '🫃 Bloated', 
  '😣 Cramps', '🤕 Headache', '🤢 Nauseous'
];

const SYMPTOMS = [
  'Cramps', 'Bloating', 'Headache', 'Breast tenderness', 'Fatigue', 'Acne',
  'Food cravings', 'Insomnia', 'Lower back pain', 'Nausea', 'Dizziness', 'Spotting'
];

export default function CycleTracker({ onBack }: Props) {
  const [initialized, setInitialized] = useState(() => localStorage.getItem('tanha_tracker_initialized') === 'true');
  const [settings, setSettings] = useState<CycleSettings | null>(() => {
    const saved = localStorage.getItem('tanha_cycle_settings');
    return saved ? JSON.parse(saved) : null;
  });
  const [logs, setLogs] = useState<CycleLog[]>(() => {
    const saved = localStorage.getItem('tanha_cycle_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [showSetup, setShowSetup] = useState(false);
  const [showLogging, setShowLogging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Setup Form State
  const [setupData, setSetupData] = useState({
    lastPeriodStart: format(new Date(), 'yyyy-MM-dd'),
    cycleLength: 28,
    periodDuration: 5
  });

  // Log Form State
  const [logData, setLogData] = useState<CycleLog>({
    date: format(new Date(), 'yyyy-MM-dd'),
    flow: 'none',
    moods: [],
    symptoms: [],
    waterLiters: 1.5,
    notes: ''
  });

  const saveSettings = (newSettings: CycleSettings) => {
    setSettings(newSettings);
    localStorage.setItem('tanha_cycle_settings', JSON.stringify(newSettings));
    localStorage.setItem('tanha_tracker_initialized', 'true');
    setInitialized(true);
    setShowSetup(false);
  };

  const saveLog = () => {
    const updated = [...logs.filter(l => l.date !== logData.date), logData];
    setLogs(updated);
    localStorage.setItem('tanha_cycle_logs', JSON.stringify(updated));
    setShowLogging(false);
  };

  const cycleInfo = useMemo(() => {
    if (!settings) return null;
    const today = startOfDay(new Date());
    const lastStart = startOfDay(parseISO(settings.lastPeriodStart));
    
    // Find the current cycle start (most recent period start)
    // Actually, simple calculation for Phase 2:
    const diff = differenceInDays(today, lastStart);
    const dayInCycle = (diff % settings.cycleLength) + 1;
    
    const nextPeriodDate = addDays(lastStart, settings.cycleLength * (Math.floor(diff / settings.cycleLength) + 1));
    const daysUntilNext = differenceInDays(nextPeriodDate, today);

    // Phases
    let phase = 'Luteal';
    let emoji = '🌙';
    if (dayInCycle <= settings.periodDuration) { phase = 'Menstrual'; emoji = '🔴'; }
    else if (dayInCycle <= 13) { phase = 'Follicular'; emoji = '🌱'; }
    else if (dayInCycle <= 16) { phase = 'Ovulation'; emoji = '✨'; }

    return { dayInCycle, phase, emoji, daysUntilNext, nextPeriodDate };
  }, [settings]);

  if (!initialized) {
    return (
      <div className="min-h-screen pt-20 pb-32 px-10 flex flex-col items-center justify-center text-center space-y-8">
        <button onClick={onBack} className="absolute top-6 left-6 text-[#8B6F6F]"><ChevronLeft /></button>
        <div className="pulse-emoji text-[100px]">🌸</div>
        <div className="space-y-3">
          <h2 className="text-3xl font-serif font-bold text-[#2C1810]">Let us start tracking your cycle, Tanha 🌸</h2>
          <p className="text-lg font-accent italic text-[#8B6F6F]">The more you log, the smarter your predictions get 💕</p>
        </div>
        <button 
          onClick={() => setShowSetup(true)}
          className="w-full max-w-[280px] bg-[#B76E79] text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#C2185B] transition-all"
        >
          Start Tracking 🌸
        </button>

        <AnimatePresence>
          {showSetup && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/30" onClick={() => setShowSetup(false)} />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-[480px] bg-[#FDFAF7] rounded-t-[32px] p-8 space-y-8 shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh]">
                <div className="w-12 h-1.5 bg-[#8B6F6F]/20 rounded-full mx-auto" />
                <div className="text-center space-y-1">
                  <h3 className="text-2xl font-serif font-bold">Let us get started, Tanha 🌸</h3>
                  <p className="text-sm font-accent italic text-[#8B6F6F]">Just a few things to begin 💕</p>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-[#2C1810] block">When did your last period start? 🩸</label>
                  <input 
                    type="date" 
                    max={format(new Date(), 'yyyy-MM-dd')}
                    value={setupData.lastPeriodStart}
                    onChange={(e) => setSetupData({...setupData, lastPeriodStart: e.target.value})}
                    className="w-full bg-white p-4 rounded-2xl border border-[rgba(183,110,121,0.1)] text-[#2C1810]"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-[#2C1810] block">Regular cycle length? (days) 🗓️</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({length: 15}, (_, i) => 21 + i).map(num => (
                      <button 
                        key={num} 
                        onClick={() => setSetupData({...setupData, cycleLength: num})}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${setupData.cycleLength === num ? 'bg-[#B76E79] text-white shadow-md' : 'bg-white text-[#8B6F6F]'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-[#2C1810] block">Period duration? (days) 🩸</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({length: 9}, (_, i) => 2 + i).map(num => (
                      <button 
                        key={num} 
                        onClick={() => setSetupData({...setupData, periodDuration: num})}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${setupData.periodDuration === num ? 'bg-[#B76E79] text-white shadow-md' : 'bg-white text-[#8B6F6F]'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => saveSettings(setupData)}
                  className="w-full bg-[#B76E79] text-white py-5 rounded-full font-bold shadow-xl"
                >
                  Start my tracker 💕
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4 pb-40 px-6 space-y-8 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between py-2">
        <button onClick={onBack} className="text-[#8B6F6F]"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-serif font-bold text-[#2C1810]">My Cycle 🌸</h2>
        <button onClick={() => setShowSettings(true)} className="text-[#8B6F6F]"><Settings size={20} /></button>
      </header>

      {/* Cycle Wheel */}
      <div className="flex justify-center py-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              {/* Menstrual */}
              <circle cx="128" cy="128" r="110" fill="none" stroke="#C2185B" strokeWidth="12" strokeDasharray="691" strokeDashoffset={691 - (5 / 28) * 691} strokeLinecap="round" opacity="0.2" />
              {/* Simplified segments for Phase 2 visual */}
              <circle cx="128" cy="128" r="110" fill="none" stroke="currentColor" strokeWidth="12" className="text-[#B76E79]/20" />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
               <span className="text-4xl font-serif font-bold text-[#2C1810]">Day {cycleInfo?.dayInCycle}</span>
               <span className="text-xs text-[#8B6F6F]">of your cycle</span>
               <div className="pt-2 flex items-center gap-1">
                  <span className="text-lg">{cycleInfo?.emoji}</span>
                  <span className="text-sm font-bold text-[#B76E79] uppercase tracking-widest">{cycleInfo?.phase}</span>
               </div>
            </div>

            {/* Glowing Dot */}
            <motion.div 
              animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }} 
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute w-4 h-4 bg-[#B76E79] rounded-full border-2 border-white shadow-[0_0_15px_#B76E79]"
              style={{ 
                top: `${50 - 43 * Math.cos(((cycleInfo?.dayInCycle || 1) / (settings?.cycleLength || 28)) * 2 * Math.PI)}%`,
                left: `${50 + 43 * Math.sin(((cycleInfo?.dayInCycle || 1) / (settings?.cycleLength || 28)) * 2 * Math.PI)}%`
              }}
            />
        </div>
      </div>

      {/* Status Card */}
      <div className={`glass-card p-6 flex items-center gap-4 ${cycleInfo?.phase === 'Menstrual' ? 'bg-[#FCE4EC]' : cycleInfo?.phase === 'Ovulation' ? 'bg-[#FFFDE7]' : ''}`}>
         <div className="text-4xl">{cycleInfo?.emoji}</div>
         <div>
            <h3 className="text-lg font-serif font-bold">{cycleInfo?.phase === 'Menstrual' ? 'The flow has arrived' : cycleInfo?.phase === 'Ovulation' ? 'You are at your peak!' : `Day ${cycleInfo?.dayInCycle} of your path`}</h3>
            <p className="text-sm font-accent italic text-[#8B6F6F]">{cycleInfo?.daysUntilNext} days until next period 🩸</p>
         </div>
      </div>

      {/* Predictions Row */}
      <div className="grid grid-cols-3 gap-3">
         <div className="glass-card p-3 text-center space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#8B6F6F]">Next Period</span>
            <p className="text-xs font-bold text-[#C2185B]">{format(cycleInfo?.nextPeriodDate || new Date(), 'MMM d')}</p>
         </div>
         <div className="glass-card p-3 text-center space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#8B6F6F]">Ovulation</span>
            <p className="text-xs font-bold text-[#FFAB91]">{format(addDays(parseISO(settings?.lastPeriodStart!), 14), 'MMM d')}</p>
         </div>
         <div className="glass-card p-3 text-center space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#8B6F6F]">PMS Zone</span>
            <p className="text-xs font-bold text-[#CE93D8]">{format(subDays(cycleInfo?.nextPeriodDate!, 7), 'MMM d')}</p>
         </div>
      </div>

      <button 
        onClick={() => setShowLogging(true)}
        className="w-full bg-[#B76E79] text-white py-5 rounded-full font-bold shadow-xl flex items-center justify-center gap-2"
      >
        <Droplets size={18} />
        Log Today 🌸
      </button>

      {/* Mini Phase Guide (One shown based on phase) */}
      <div className="glass-card p-6 bg-white/40 border-dashed border-2 border-[#B76E79]/20 italic text-sm text-[#8B6F6F] leading-relaxed">
         {cycleInfo?.phase === 'Menstrual' && "Tanha, your body is resetting. It's okay to slow down. Warm soups and soft music are your best friends today 🍵💕"}
         {cycleInfo?.phase === 'Follicular' && "Estrogen is rising! You'll feel more energetic soon. This is your glow-up phase — try something new today ✨🌸"}
         {cycleInfo?.phase === 'Ovulation' && "You are at your peak radiance! Confidence is high. It's the perfect day for important plans or a date night 😍💕"}
         {cycleInfo?.phase === 'Luteal' && "Be extra gentle with yourself now. PMS might visit. You deserve all the kindness and extra chocolate 🍫🥺"}
      </div>

      {/* Calendar Area */}
      <div className="glass-card p-4 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h4 className="font-serif font-bold text-[#2C1810]">{format(currentMonth, 'MMMM yyyy')}</h4>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(subDays(currentMonth, 30))}><ChevronLeft size={18} /></button>
              <button onClick={() => setCurrentMonth(addDays(currentMonth, 30))}><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-[10px] font-bold text-[#8B6F6F] opacity-50">{d}</span>)}
            {eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }).map((date, i) => {
              const log = logs.find(l => l.date === format(date, 'yyyy-MM-dd'));
              const isToday = isSameDay(date, new Date());
              return (
                <div key={i} className={`h-8 flex flex-col items-center justify-center relative rounded-full ${isToday ? 'border border-[#B76E79]' : ''}`}>
                  <span className="text-[10px] font-nunito">{format(date, 'd')}</span>
                  {log && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#C2185B]" />}
                </div>
              );
            })}
          </div>
      </div>

      {/* From Him Section */}
      <section className="space-y-4 py-4">
        <h3 className="text-xl font-serif font-bold italic text-[#B76E79] flex items-center gap-2">
          From Him 💌
        </h3>
        <div className="glass-card p-6 bg-[#FFF0F3] border-none shadow-inner italic text-[#2C1810]/70 leading-relaxed font-accent">
           {cycleInfo?.phase === 'Menstrual' && "Tanha, I know these days are hard. You do not have to be strong right now. Let me take care of you if I can. I love you through every single day 🥺❤️"}
           {cycleInfo?.phase === 'Follicular' && "Look at you coming back to yourself! I love watching you light up again. You are genuinely the most radiant person I know, lokki amar 💫"}
           {cycleInfo?.phase === 'Ovulation' && "You are absolutely glowing and I notice everything. The most beautiful woman in every room, always. I love you 😍💕"}
           {cycleInfo?.phase === 'Luteal' && "Hey. If you are feeling sensitive today — that is okay. Your feelings are always valid. I love the version of you that is struggling just as much as every other version. Be gentle with yourself 💖"}
        </div>
      </section>

      {/* Logging Sheet */}
      <AnimatePresence>
        {showLogging && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowLogging(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-[480px] bg-white rounded-t-[32px] p-8 space-y-6 shadow-2xl overflow-y-auto no-scrollbar max-h-[85vh]">
              <div className="w-12 h-1.5 bg-[#8B6F6F]/20 rounded-full mx-auto" />
              <h4 className="text-xl font-serif font-bold text-center">How are you today, Tanha? 🌸</h4>
              
              <div className="space-y-4">
                <label className="text-sm font-bold opacity-60">Mood Today 💕</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(m => (
                    <button 
                      key={m}
                      onClick={() => setLogData(p => ({...p, moods: p.moods.includes(m) ? p.moods.filter(x => x !== m) : [...p.moods, m]}))}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${logData.moods.includes(m) ? 'bg-[#B76E79] text-white border-[#B76E79]' : 'bg-transparent border-[#B76E79]/20 text-[#B76E79]'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold opacity-60">Any Symptoms? 🌸</label>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS.map(s => (
                    <button 
                      key={s}
                      onClick={() => setLogData(p => ({...p, symptoms: p.symptoms.includes(s) ? p.symptoms.filter(x => x !== s) : [...p.symptoms, s]}))}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${logData.symptoms.includes(s) ? 'bg-[#B76E79] text-white border-[#B76E79]' : 'bg-transparent border-[#B76E79]/20 text-[#B76E79]'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                 <label className="text-sm font-bold opacity-60 flex justify-between">
                    <span>Water intake? 💧</span>
                    <span className="text-[#B76E79]">{logData.waterLiters}L</span>
                 </label>
                 <input 
                  type="range" min="0" max="4" step="0.5" value={logData.waterLiters}
                  onChange={(e) => setLogData({...logData, waterLiters: parseFloat(e.target.value)})}
                  className="w-full accent-[#B76E79]"
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-sm font-bold opacity-60">Notes 🌸</label>
                 <textarea 
                    value={logData.notes} onChange={(e) => setLogData({...logData, notes: e.target.value})}
                    placeholder="Tell me everything..."
                    className="w-full bg-[#FDFAF7] p-4 rounded-xl border border-[rgba(183,110,121,0.1)] text-sm font-accent italic min-h-[100px]"
                 />
              </div>

              <button 
                onClick={saveLog}
                className="w-full bg-[#B76E79] text-white py-5 rounded-full font-bold shadow-xl"
              >
                Log Today 💕
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card w-full max-w-sm p-8 space-y-6">
               <h4 className="text-xl font-serif font-bold text-center">Tracker Settings</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8B6F6F]">Cycle Length</span>
                    <input type="number" value={settings?.cycleLength} onChange={(e) => setSettings({...settings!, cycleLength: parseInt(e.target.value)})} className="w-16 p-2 bg-white rounded-lg border text-center" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8B6F6F]">Period Length</span>
                    <input type="number" value={settings?.periodDuration} onChange={(e) => setSettings({...settings!, periodDuration: parseInt(e.target.value)})} className="w-16 p-2 bg-white rounded-lg border text-center" />
                  </div>
               </div>
               <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowSettings(false)} className="flex-1 py-3 text-sm font-bold text-[#8B6F6F]">Close</button>
                  <button 
                    onClick={() => {
                       localStorage.removeItem('tanha_tracker_initialized');
                       window.location.reload();
                    }} 
                    className="flex-1 py-3 text-sm font-bold text-red-500"
                  >
                    Reset Data
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
