import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImportantDate } from '../types';
import { format, parseISO, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, startOfDay, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Heart, Cake, Stethoscope, Star, FileText } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const CATEGORIES = [
  { value: 'anniversary', icon: Heart, label: 'Anniversary', color: '#C2185B' },
  { value: 'birthday', icon: Cake, label: 'Birthday', color: '#FFD54F' },
  { value: 'appointment', icon: Stethoscope, label: 'Appointment', color: '#81C784' },
  { value: 'milestone', icon: Star, label: 'Milestone', color: '#CE93D8' },
  { value: 'other', icon: FileText, label: 'Other', color: '#B76E79' }
];

export default function ImportantDates({ onBack }: Props) {
  const [dates, setDates] = useState<ImportantDate[]>(() => {
    const saved = localStorage.getItem('tanha_important_dates');
    if (saved) return JSON.parse(saved);
    
    // Pre-loaded placeholders
    return [
      { id: '1', title: 'Our Special Day 💑', category: 'anniversary', date: null, notes: '', repeat: 'yearly', createdAt: new Date().toISOString(), needsDate: true },
      { id: '2', title: 'Tanha Birthday 🎂', category: 'birthday', date: null, notes: '', repeat: 'yearly', createdAt: new Date().toISOString(), needsDate: true }
    ];
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDate, setEditingDate] = useState<Partial<ImportantDate> | null>(null);

  const saveDate = (dateData: Partial<ImportantDate>) => {
    if (!dateData.title || !dateData.date) return;
    
    let updated: ImportantDate[];
    if (dateData.id) {
      updated = dates.map(d => d.id === dateData.id ? { ...d, ...dateData } as ImportantDate : d);
    } else {
      updated = [...dates, { ...dateData, id: Math.random().toString(), createdAt: new Date().toISOString() } as ImportantDate];
    }
    
    setDates(updated);
    localStorage.setItem('tanha_important_dates', JSON.stringify(updated));
    setShowAddForm(false);
    setEditingDate(null);
  };

  const deleteDate = (id: string) => {
    const updated = dates.filter(d => d.id !== id);
    setDates(updated);
    localStorage.setItem('tanha_important_dates', JSON.stringify(updated));
  };

  const upcomingDates = useMemo(() => {
    const today = startOfDay(new Date());
    return dates.filter(d => d.date).map(d => {
      const date = parseISO(d.date!);
      let nextOccurence = date;
      if (d.repeat === 'yearly') {
        nextOccurence = new Date(today.getFullYear(), date.getMonth(), date.getDate());
        if (isAfter(today, nextOccurence)) nextOccurence = addDays(nextOccurence, 365);
      }
      return { ...d, nextOccurence, daysAway: differenceInDays(nextOccurence, today) };
    }).filter(d => d.daysAway >= 0 && d.daysAway <= 30)
      .sort((a, b) => a.daysAway - b.daysAway);
  }, [dates]);

  return (
    <div className="min-h-screen pt-4 pb-40 px-6 space-y-8 overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 py-2">
        <button onClick={onBack} className="text-[#8B6F6F]"><ChevronLeft size={24} /></button>
        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-bold text-[#2C1810]">Tanha Special Dates 💖</h2>
          <p className="text-sm font-accent italic text-[#8B6F6F]">Never forget what matters most 🌸</p>
        </div>
      </header>

      {/* Upcoming Section */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold tracking-widest text-[#8B6F6F]/60 uppercase px-1">Upcoming next 30 days</h3>
        <div className="space-y-3">
          {upcomingDates.length === 0 ? (
            <div className="glass-card p-8 text-center space-y-2">
               <p className="font-accent italic text-[#8B6F6F]">No upcoming dates 🌸<br/>Add your important dates below 💕</p>
            </div>
          ) : (
            upcomingDates.map(d => (
              <motion.div 
                key={d.id} layout
                onContextMenu={(e) => { e.preventDefault(); setEditingDate(d); setShowAddForm(true); }}
                className="glass-card p-4 flex items-center gap-4 border-l-[4px]"
                style={{ borderLeftColor: CATEGORIES.find(c => c.value === d.category)?.color }}
              >
                <div className="text-2xl">{CATEGORIES.find(c => c.value === d.category)?.value === 'anniversary' ? '💖' : CATEGORIES.find(c => c.value === d.category)?.value === 'birthday' ? '🎂' : '📝'}</div>
                <div className="flex-1 min-w-0">
                   <p className="font-nunito font-bold truncate text-[#2C1810]">{d.title}</p>
                   <p className="text-[10px] text-[#8B6F6F] font-semibold">{format(d.nextOccurence, 'EEEE, MMMM d')}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${d.daysAway === 0 ? 'bg-[#C2185B] text-white animate-pulse' : 'bg-[#B76E79]/10 text-[#B76E79]'}`}>
                  {d.daysAway === 0 ? 'Today! 🎉' : d.daysAway === 1 ? 'Tomorrow 💕' : `In ${d.daysAway} days 🗓️`}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Calendar Area */}
      <div className="glass-card p-4 space-y-4 shadow-md bg-white/50">
          <div className="flex justify-between items-center px-2">
            <h4 className="font-serif font-bold text-[#2C1810]">{format(currentMonth, 'MMMM yyyy')}</h4>
            <div className="flex gap-4">
              <button onClick={() => setCurrentMonth(subDays(currentMonth, 30))}><ChevronLeft size={18} className="text-[#B76E79]" /></button>
              <button onClick={() => setCurrentMonth(addDays(currentMonth, 30))}><ChevronRight size={18} className="text-[#B76E79]" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-[10px] font-bold text-[#8B6F6F] opacity-50">{d}</span>)}
            {eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }).map((date, i) => {
              const dayEvents = dates.filter(d => d.date && isSameDay(parseISO(d.date), date));
              const isToday = isSameDay(date, new Date());
              return (
                <div key={i} className={`h-10 flex flex-col items-center justify-center relative rounded-xl transition-all ${isToday ? 'bg-[#B76E79]/10 ring-1 ring-[#B76E79]/30' : 'hover:bg-[#B76E79]/5'}`}>
                  <span className="text-[11px] font-nunito font-semibold">{format(date, 'd')}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.map((e, idx) => (
                      <div key={idx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORIES.find(c => c.value === e.category)?.color }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
      </div>

      <button 
        onClick={() => { setEditingDate({ title: '', category: 'other', date: format(new Date(), 'yyyy-MM-dd'), repeat: 'none', notes: '' }); setShowAddForm(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#B76E79] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50"
      >
        <Plus size={32} />
      </button>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 shadow-inner" onClick={() => setShowAddForm(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-[480px] bg-white rounded-t-[32px] p-8 space-y-6 shadow-2xl overflow-y-auto no-scrollbar max-h-[85vh]">
              <div className="w-12 h-1.5 bg-[#8B6F6F]/20 rounded-full mx-auto" />
              <h4 className="text-xl font-serif font-bold text-center">Save a special date 💖</h4>
              
              <div className="space-y-4">
                 <label className="text-xs font-bold uppercase tracking-widest text-[#8B6F6F]">What is this date? 🌸</label>
                 <input 
                    autoFocus
                    type="text" 
                    placeholder="e.g. Our Anniversary 💑"
                    value={editingDate?.title}
                    onChange={(e) => setEditingDate({...editingDate!, title: e.target.value})}
                    className="w-full bg-[#FDFAF7] p-5 rounded-2xl border border-[rgba(183,110,121,0.1)] font-nunito font-bold text-lg"
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-xs font-bold uppercase tracking-widest text-[#8B6F6F]">When? 🗓️</label>
                 <input 
                    type="date" 
                    value={editingDate?.date || format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setEditingDate({...editingDate!, date: e.target.value})}
                    className="w-full bg-[#FDFAF7] p-5 rounded-2xl border border-[rgba(183,110,121,0.1)] text-[#2C1810]"
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-xs font-bold uppercase tracking-widest text-[#8B6F6F]">Category 💖</label>
                 <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat.value} 
                        onClick={() => setEditingDate({...editingDate!, category: cat.value as any})}
                        className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border transition-all ${editingDate?.category === cat.value ? 'bg-[#B76E79] text-white border-[#B76E79]' : 'bg-transparent border-[#B76E79]/20 text-[#8B6F6F]'}`}
                      >
                         <cat.icon size={14} />
                         {cat.label}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-xs font-bold uppercase tracking-widest text-[#8B6F6F]">Repeats? ✨</label>
                 <select 
                    value={editingDate?.repeat} 
                    onChange={(e) => setEditingDate({...editingDate!, repeat: e.target.value as any})}
                    className="w-full bg-[#FDFAF7] p-4 rounded-xl border border-[rgba(183,110,121,0.1)]"
                 >
                    <option value="none">Does not repeat</option>
                    <option value="yearly">Every Year</option>
                    <option value="monthly">Every Month</option>
                    <option value="weekly">Every Week</option>
                 </select>
              </div>

              <div className="flex gap-4 pt-4">
                 {editingDate?.id && (
                   <button 
                     onClick={() => { deleteDate(editingDate.id!); setShowAddForm(false); }}
                     className="flex-1 py-4 font-bold text-red-500 hover:bg-red-50 rounded-2xl"
                   >
                     Delete
                   </button>
                 )}
                 <button 
                    onClick={() => saveDate(editingDate!)}
                    className="flex-[2] bg-[#B76E79] text-white py-5 rounded-2xl font-bold shadow-xl"
                 >
                    Save Date 💖
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
