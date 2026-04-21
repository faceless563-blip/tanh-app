import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, DayInfo, HairCareLog, ImportantDate, BathLog, SelfCareDailyLog, WatchItem, Medicine, DoseLog } from '../types';
import { getDayOfYear } from '../utils/helpers';
import { LOVE_NOTES, EMOJI_MAP, EMOJI_PICKER } from '../constants';
import { Plus, X, Heart, Settings, Check, Bell, Calendar as CalendarIcon, Pill, Play, Activity } from 'lucide-react';
import { differenceInDays, parseISO, startOfDay, addDays, isAfter, format } from 'date-fns';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onAddTask: (task: Task) => void;
  dayInfo: DayInfo;
  setView: (v: any) => void;
}

export default function Home({ tasks, onToggle, onAddTask, dayInfo, setView }: Props) {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', emoji: '✅', time: '' });
  const [error, setError] = useState('');

  const [nudges, setNudges] = useState<{ id: string, text: string, type: 'hair' | 'date' | 'selfcare', icon: string }[]>([]);

  useEffect(() => {
    // Generate nudges
    const newNudges: any[] = [];
    const now = new Date();
    const hour = now.getHours();
    const todayStr = format(now, 'yyyy-MM-dd');

    // Hair Care Nudges
    if (hour >= 10) {
      const hairLogs: HairCareLog[] = JSON.parse(localStorage.getItem('tanha_hair_care_logs') || '[]');
      const sortedShampoo = hairLogs.filter(l => l.type === 'shampoo').sort((a,b) => b.loggedAt.localeCompare(a.loggedAt));
      const sortedOil = hairLogs.filter(l => l.type === 'oil').sort((a,b) => b.loggedAt.localeCompare(a.loggedAt));

      const daysSinceShampoo = sortedShampoo[0] ? differenceInDays(now, new Date(sortedShampoo[0].loggedAt)) : 99;
      const daysSinceOil = sortedOil[0] ? differenceInDays(now, new Date(sortedOil[0].loggedAt)) : 99;

      if (daysSinceOil >= 3) newNudges.push({ id: 'hair-oil', text: "Tanha, your hair might need some oil today 🫙🌸", type: 'hair', icon: '🫙' });
      if (daysSinceShampoo >= 4) newNudges.push({ id: 'hair-shampoo', text: "Hair wash day, lokki? 🧴💕", type: 'hair', icon: '🧴' });
    }

    // Date Nudges
    const dates: ImportantDate[] = JSON.parse(localStorage.getItem('tanha_important_dates') || '[]');
    const todayObj = startOfDay(now);
    dates.filter(d => d.date).forEach(d => {
      const date = parseISO(d.date!);
      let nextOccurence = date;
      if (d.repeat === 'yearly') {
        nextOccurence = new Date(todayObj.getFullYear(), date.getMonth(), date.getDate());
        if (isAfter(todayObj, nextOccurence)) nextOccurence = addDays(nextOccurence, 365);
      }
      const diff = differenceInDays(nextOccurence, todayObj);
      if (diff >= 0 && diff <= 7) {
        newNudges.push({ 
          id: `date-${d.id}`, 
          text: diff === 0 ? `${d.title} is Today! 🎉` : `${d.title} in ${diff} days 💖`, 
          type: 'date', 
          icon: d.category === 'birthday' ? '🎂' : d.category === 'anniversary' ? '💖' : '📅' 
        });
      }
    });

    // Self Care Nudges
    const bathLogs: BathLog[] = JSON.parse(localStorage.getItem('tanha_bath_logs') || '[]');
    const selfCareLogs: Record<string, SelfCareDailyLog> = JSON.parse(localStorage.getItem('tanha_self_care_logs') || '{}');
    const bathedToday = bathLogs.some(l => l.date === todayStr);

    if (hour >= 18 && !bathedToday) {
       newNudges.push({ id: 'sc-bath', text: "Tanha, bath time? 🛁🌸 You will feel so much better 💕", type: 'selfcare', icon: '🛁' });
    }

    const todaySC = selfCareLogs[todayStr];
    if (hour >= 20 && todaySC) {
       const doneCount = Object.values(todaySC).filter(Boolean).length;
       if (doneCount < 4) {
          newNudges.push({ id: 'sc-check', text: "Do not forget to take care of yourself today, lokki 💆🌸", type: 'selfcare', icon: '🧖' });
       }
    }

    setNudges(newNudges);
  }, []);

  const nowWatching = useMemo(() => {
    const watchItems: WatchItem[] = JSON.parse(localStorage.getItem('tanha_watch_items') || '[]');
    return watchItems.find(i => i.status === 'watching');
  }, []);

  const medDoses = useMemo(() => {
    const doses: DoseLog[] = JSON.parse(localStorage.getItem('tanha_dose_logs') || '[]');
    const today = format(new Date(), 'yyyy-MM-dd');
    const dayDoses = doses.filter(d => d.date === today);
    const next = dayDoses.find(d => d.status === 'pending');
    return {
       total: dayDoses.length,
       taken: dayDoses.filter(d => d.status === 'taken').length,
       next
    };
  }, []);

  const removeNudge = (id: string) => setNudges(prev => prev.filter(n => n.id !== id));

  useEffect(() => {
    const handleOpenSheet = () => setShowAddSheet(true);
    window.addEventListener('open-add-task', handleOpenSheet);
    return () => window.removeEventListener('open-add-task', handleOpenSheet);
  }, []);

  const charCode = getDayOfYear();
  const quoteIndex = charCode % LOVE_NOTES.length;
  const quote = LOVE_NOTES[quoteIndex];

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleNameChange = (val: string) => {
    setNewTask(prev => {
      const next = { ...prev, title: val };
      const words = val.toLowerCase().split(' ');
      for (const word of words) {
        if (EMOJI_MAP[word]) {
          next.emoji = EMOJI_MAP[word];
          break;
        }
      }
      return next;
    });
    if (error) setError('');
  };

  const saveTask = () => {
    if (!newTask.title.trim()) {
      setError('Give it a name first! 🌸');
      return;
    }
    onAddTask({
      id: Math.random().toString(),
      title: newTask.title,
      emoji: newTask.emoji,
      time: newTask.time,
      completed: false,
      type: 'today'
    });
    setNewTask({ title: '', emoji: '✅', time: '' });
    setShowAddSheet(false);
  };

  const anchorTasks = tasks.filter(t => t.type === 'anchor');
  const todayTasks = tasks.filter(t => t.type === 'today');

  return (
    <div className="space-y-8 px-6 pb-20">
      <header className="py-4 flex justify-between items-start">
        <div className="space-y-1">
          <h1 
            className="text-4xl font-serif font-bold italic drop-shadow-sm"
            style={{ color: dayInfo.isDark ? '#FFFFFF' : '#2C1810' }}
          >
            {dayInfo.greeting}
          </h1>
          <p className="text-sm font-semibold opacity-70" style={{ color: dayInfo.isDark ? 'rgba(255,255,255,0.85)' : '#8B6F6F' }}>
            {dayInfo.dateStr}
          </p>
          <p className="text-xs font-accent italic opacity-60" style={{ color: dayInfo.isDark ? 'rgba(255,255,255,0.85)' : '#8B6F6F' }}>
            Today's vibe: {dayInfo.vibe}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-[#B76E79] font-bold">
            <span>🔥</span>
            <span>7</span>
          </div>
          <button className="text-[#8B6F6F]/40"><Settings size={20} /></button>
        </div>
      </header>

      <section className="flex gap-4 h-44">
        <div className="flex-[1.2] glass-card p-5 flex flex-col justify-between">
           <span className="text-[10px] font-bold tracking-[0.15em] text-[#B76E79] uppercase">💗 Daily Love Note</span>
           <p className="text-sm font-accent italic leading-relaxed text-[#2C1810] line-clamp-4">
             "{quote}"
           </p>
           <span className="text-[9px] font-bold text-[#B76E79] tracking-widest uppercase">Just for you, Tanha 🌸</span>
        </div>
        <div className="flex-1 bg-gradient-to-br from-[#B76E79] to-[#D4A5A5] rounded-[24px] p-5 flex flex-col items-center justify-center text-white shadow-lg space-y-2">
           <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="32" cy="32" r="30" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                 <circle cx="32" cy="32" r="30" fill="transparent" stroke="white" strokeWidth="4" 
                   strokeDasharray={188.4} strokeDashoffset={188.4 - (progress / 100) * 188.4} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <Heart size={20} className="fill-white" />
           </div>
           <span className="text-4xl font-serif font-bold">{progress}%</span>
           <span className="text-[9px] font-bold tracking-widest uppercase opacity-80">Today's Progress</span>
           <span className="text-[10px] opacity-70">{completedCount} Tasks Done ✨</span>
        </div>
      </section>

      {/* Nudges Section */}
      <AnimatePresence>
        {nudges.length > 0 && (
          <div className="space-y-3">
            {nudges.map(nudge => (
              <motion.div 
                key={nudge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card p-4 flex items-center gap-4 relative overflow-hidden ${nudge.type === 'date' ? 'bg-gradient-to-r from-[#FFF0F3] to-[#FFE4EC] border-none' : 'bg-white/60'}`}
              >
                <span className="text-2xl">{nudge.icon}</span>
                <p className={`flex-1 font-nunito font-bold text-xs ${nudge.type === 'date' ? 'text-[#C2185B]' : 'text-[#8B6F6F]'}`}>
                  {nudge.text}
                </p>
                <button 
                  onClick={() => removeNudge(nudge.id)}
                  className="p-1 rounded-full hover:bg-black/5 opacity-40 shrink-0"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <div className="space-y-4">
           <h3 className="text-xs font-bold tracking-[0.15em] text-[#8B3A52] uppercase px-1">🔒 Anchor Tasks</h3>
           <div className="space-y-3">
              {anchorTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={onToggle} />
              ))}
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-xs font-bold tracking-[0.15em] text-[#8B3A52] uppercase px-1">📋 Today's Tasks</h3>
           <div className="space-y-3">
              {todayTasks.length === 0 ? (
                <div className="text-center py-10 space-y-2 opacity-40">
                  <span className="text-4xl">🌸</span>
                  <p className="font-accent italic text-[#8B6F6F]">Nothing added yet 🌸<br/>Tap + to add something for today 💕</p>
                </div>
              ) : (
                todayTasks.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={onToggle} />
                ))
              )}
           </div>
        </div>
      </div>

      {/* Phase 3 Widgets */}
      <div className="grid grid-cols-2 gap-4">
        {nowWatching && (
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('watch')}
            className="glass-card p-4 space-y-3 relative overflow-hidden bg-gradient-to-br from-white to-[#B76E79]/5"
          >
             <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[#B76E79]">
                <Play size={10} /> Now Watching
             </div>
             <p className="font-nunito font-bold text-xs truncate text-[#2C1810]">{nowWatching.title}</p>
             <div className="h-1 w-full bg-[#B76E79]/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#B76E79]" style={{ width: '40%' }} />
             </div>
             <span className="text-[8px] font-bold text-[#8B6F6F] block">S{nowWatching.currentSeason || 1} • Ep {nowWatching.currentEpisode || 0}</span>
          </motion.div>
        )}

        {medDoses.total > 0 && (
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('medicines')}
            className="glass-card p-4 space-y-3 relative overflow-hidden bg-gradient-to-br from-white to-[#F48FB1]/5"
          >
             <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[#C2185B]">
                <Pill size={10} /> Medicines
             </div>
             <p className="font-nunito font-bold text-xs text-[#2C1810]">
               {medDoses.taken === medDoses.total ? 'All Taken! ✨' : `Next: ${medDoses.next?.scheduledTime || '--:--'}`}
             </p>
             <div className="h-1 w-full bg-[#C2185B]/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#C2185B]" style={{ width: `${(medDoses.taken / medDoses.total) * 100}%` }} />
             </div>
             <span className="text-[8px] font-bold text-[#8B6F6F] block">{medDoses.taken}/{medDoses.total} doses done</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showAddSheet && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30" onClick={() => setShowAddSheet(false)} 
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-[480px] bg-white rounded-t-[32px] p-8 space-y-6 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-[#8B6F6F]/20 rounded-full mx-auto" />
              <h4 className="text-xl font-serif font-bold text-center">What do you need to do today, Tanha? 🌸</h4>
              
              <div className="flex items-center gap-4 bg-[#FDFAF7] p-5 rounded-2xl border border-[rgba(183,110,121,0.1)]">
                 <button className="text-4xl w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm">
                   {newTask.emoji}
                 </button>
                 <input 
                    autoFocus
                    type="text" 
                    value={newTask.title}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Task name..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-nunito font-semibold placeholder:text-[#8B6F6F]/20"
                 />
              </div>

              {error && <p className="text-xs text-[#C2185B] text-center font-bold">{error}</p>}

              <div className="space-y-4">
                 <input 
                    type="time" 
                    value={newTask.time}
                    onChange={(e) => setNewTask(p => ({...p, time: e.target.value}))}
                    className="w-full bg-[#FDFAF7] p-4 rounded-xl border border-[rgba(183,110,121,0.1)] text-[#8B6F6F]"
                 />
                 <button 
                   onClick={saveTask}
                   className="w-full bg-[#B76E79] text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-[#C2185B] transition-all"
                 >
                   Add Task 💕
                 </button>
                 <button 
                   onClick={() => setShowAddSheet(false)}
                   className="w-full text-[#8B6F6F] py-2 text-sm font-bold opacity-60"
                 >
                   Maybe later
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskItem({ task, onToggle }: { task: Task, onToggle: (id: string) => void }) {
  return (
    <motion.div 
      layout
      className={`glass-card p-4 flex items-center gap-4 border-l-[4px] border-[#B76E79] transition-all ${task.completed ? 'bg-white/40' : ''}`}
    >
       <span className="text-2xl">{task.emoji}</span>
       <div className="flex-1 min-w-0">
          <p className={`font-nunito font-bold truncate ${task.completed ? 'line-through text-[#8B6F6F] opacity-50' : 'text-[#2C1810]'}`}>
            {task.title}
          </p>
          {task.time && <span className="text-[10px] font-bold text-[#8B6F6F]/60 uppercase tracking-widest">{task.time}</span>}
       </div>
       <button 
         onClick={() => onToggle(task.id)}
         className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center shrink-0 ${
           task.completed ? 'bg-[#B76E79] border-[#B76E79] text-white' : 'border-[#B76E79]/30'
         }`}
       >
         {task.completed && <Check size={14} strokeWidth={3} />}
       </button>
    </motion.div>
  );
}
