import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DiaryEntry } from '../types';
import { format, parseISO, isSameDay } from 'date-fns';
import { ChevronLeft, Plus, Search, Star, Lock, Heart, Edit3, Trash2, Camera, X, Check, Save } from 'lucide-react';

interface Props {
  onBack: () => void;
  triggerCelebration: (msg: string) => void;
}

const PROMPTS = [
  "What made you smile today, Tanha? 🌸",
  "What are you grateful for right now? 💕",
  "How are you really feeling today? 🥺",
  "What has been on your mind lately? 🌙",
  "Describe today in 3 words 💬",
  "What do you wish someone knew? 💌",
  "What made today different? ✨",
  "Write about someone you love 💖",
  "What are you looking forward to? 🌟",
  "What would you tell yourself 1 year ago? 🕊️",
  "What are you proud of lately? 💪",
  "If today was a color, what would it be? 🎨",
];

const ENTRY_TYPES = [
  { id: 'normal', label: '📝 Normal', prefill: '' },
  { id: 'gratitude', label: '🙏 Gratitude', prefill: 'Today I am grateful for: ' },
  { id: 'dear_diary', label: '💌 Dear Diary', prefill: 'Dear Diary,\n' },
  { id: 'dream', label: '🌙 Dream', prefill: '' },
  { id: 'letter', label: '💕 Letter to Him', prefill: 'Hey baby, 💌\n' },
  { id: 'rant', label: '😤 Rant', prefill: '' },
];

const MOODS = ['😊', '😢', '😰', '😤', '🧘', '🥰', '😴', '⚡', '😭', '💪', '🥺', '😌', '🤩', '😔'];

export default function Diary({ onBack, triggerCelebration }: Props) {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem('tanha_diary_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<DiaryEntry> | null>(null);
  const [pin, setPin] = useState<string | null>(localStorage.getItem('tanha_diary_pin'));
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [lockedTarget, setLockedTarget] = useState<string | null>(null);

  const saveEntries = (updated: DiaryEntry[]) => {
    setEntries(updated);
    localStorage.setItem('tanha_diary_entries', JSON.stringify(updated));
  };

  const handleSave = () => {
    if (!editingEntry?.body?.trim()) {
      alert("Write something first, Tanha 🌸");
      return;
    }

    const wordCount = editingEntry.body.trim().split(/\s+/).length;
    const now = new Date().toISOString();
    
    let updated: DiaryEntry[];
    if (editingEntry.id) {
      updated = entries.map(e => e.id === editingEntry.id ? { ...e, ...editingEntry, wordCount, updatedAt: now } as DiaryEntry : e);
    } else {
      const newEntry: DiaryEntry = {
        ...editingEntry as DiaryEntry,
        id: Math.random().toString(),
        date: format(new Date(), 'yyyy-MM-dd'),
        writtenAt: now,
        updatedAt: now,
        wordCount,
        isLocked: editingEntry.isLocked || false,
        isFavorite: editingEntry.isFavorite || false,
        tags: editingEntry.tags || [],
        photoBase64s: editingEntry.photoBase64s || [],
      };
      updated = [newEntry, ...entries];
      
      if (newEntry.type === 'letter') {
        // This logic would normally open Wish Box, but we keep it inside Diary for now
      }
    }

    saveEntries(updated);
    setShowEditor(false);
    setEditingEntry(null);
    triggerCelebration("Entry saved 💕 Your thoughts are safe here 🌸");
  };

  const deleteEntry = (id: string) => {
    if (confirm("Delete this memory forever? 🥺")) {
      saveEntries(entries.filter(e => e.id !== id));
    }
  };

  const filteredEntries = useMemo(() => {
    let base = entries;
    if (search) {
      base = base.filter(e => 
        e.title?.toLowerCase().includes(search.toLowerCase()) || 
        e.body.toLowerCase().includes(search.toLowerCase())
      );
    }
    return base;
  }, [entries, search]);

  const dailyPromptIndex = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) % PROMPTS.length;
  }, []);

  const openEntry = (entry: DiaryEntry) => {
    if (entry.isLocked) {
      if (!pin) {
         setIsSettingPin(true);
         return;
      }
      setLockedTarget(entry.id);
      return;
    }
    setEditingEntry(entry);
    setShowEditor(true);
  };

  const handlePinSubmit = () => {
    if (isSettingPin) {
      if (pinInput.length === 4) {
        localStorage.setItem('tanha_diary_pin', pinInput);
        setPin(pinInput);
        setIsSettingPin(false);
        setPinInput('');
      }
      return;
    }
    if (pinInput === pin) {
      const entry = entries.find(e => e.id === lockedTarget);
      if (entry) {
        setEditingEntry(entry);
        setShowEditor(true);
      }
      setLockedTarget(null);
      setPinInput('');
    } else {
      alert("Hmm, try again 🌸");
      setPinInput('');
    }
  };

  return (
    <div className="min-h-screen pt-4 pb-40 px-6 space-y-6 overflow-y-auto no-scrollbar">
      <header className="flex items-center gap-4 py-2">
        <button onClick={onBack} className="text-[#8B6F6F]"><ChevronLeft size={24} /></button>
        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-bold text-[#2C1810]">Tanha Diary 📖</h2>
          <p className="text-sm font-accent italic text-[#8B6F6F]">Your thoughts, your world 🌸</p>
        </div>
      </header>

      {/* Daily Prompt */}
      <div className="glass-card p-6 bg-gradient-to-br from-[#FFF0F3] to-[#FEF9E7] border-none shadow-sm space-y-4">
         <p className="text-xs font-bold text-[#B76E79] uppercase tracking-widest">Today's Reflection</p>
         <h3 className="text-xl font-serif font-bold text-[#2C1810]">"{PROMPTS[dailyPromptIndex]}"</h3>
         <button 
           onClick={() => {
             setEditingEntry({ body: '', type: 'normal', mood: '😊', tags: [], photoBase64s: [] });
             setShowEditor(true);
           }}
           className="w-full bg-[#B76E79] text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"
         >
           Write Today Entry ✍️
         </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F6F]/40" size={18} />
        <input 
          type="text" 
          placeholder="Search your diary... 🔍"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/60 pl-12 pr-4 py-4 rounded-2xl border border-white/50 focus:ring-2 focus:ring-[#B76E79]/20 font-nunito font-semibold"
        />
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.map(entry => {
          const moodColor = entry.mood === '😊' ? '#FFD54F' : entry.mood === '😢' ? '#90CAF9' : entry.mood === '🥰' ? '#F48FB1' : '#B76E79';
          return (
            <motion.div 
              key={entry.id} layout
              onClick={() => openEntry(entry)}
              className="glass-card p-5 border-l-[4px] relative group active:scale-[0.98] transition-all"
              style={{ borderLeftColor: moodColor }}
            >
               <div className="flex justify-between items-start mb-2">
                  <div className="space-y-0.5">
                    <p className="font-serif font-bold text-[#2C1810]">{format(parseISO(entry.date), 'EEEE, MMMM d 🌸')}</p>
                    <div className="flex gap-2">
                       <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#B76E79]/10 text-[#B76E79] rounded-md">{ENTRY_TYPES.find(t => t.id === entry.type)?.label}</span>
                       <span className="text-[9px] text-[#8B6F6F] font-bold">{entry.wordCount} words 📝</span>
                    </div>
                  </div>
                  <span className="text-2xl">{entry.mood}</span>
               </div>
               
               <div className={`relative ${entry.isLocked ? 'blur-sm select-none' : ''}`}>
                 <p className="text-sm font-nunito italic text-[#8B6F6F] line-clamp-2">
                   {entry.body}
                 </p>
               </div>

               {entry.isLocked && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Lock size={20} className="text-[#8B6F6F]/40" />
                 </div>
               )}

               <div className="absolute top-2 right-2 flex gap-2">
                  {entry.isFavorite && <Star size={12} className="fill-[#FFD54F] text-[#FFD54F]" />}
               </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mood Heatmap - Year in Pixels */}
      <div className="glass-card p-6 border-none shadow-sm space-y-6">
        <div className="flex items-center justify-between">
           <p className="text-xs font-black uppercase tracking-widest text-[#B76E79]">Mood Pixel Tapestry 🎨</p>
           <span className="text-[10px] font-bold text-[#8B6F6F]">{format(new Date(), 'yyyy')}</span>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 31 }).map((_, i) => {
            const dateStr = format(new Date(new Date().getFullYear(), new Date().getMonth(), i + 1), 'yyyy-MM-dd');
            const entry = entries.find(e => e.date === dateStr);
            const moodMap: Record<string, string> = {
              '😊': '#FFD54F', '😢': '#90CAF9', '😰': '#9E9E9E', '😤': '#EF5350', 
              '🧘': '#81C784', '🥰': '#F48FB1', '😴': '#9C7BB5', '😭': '#5C6BC0', 
              '🥺': '#FFAB91', '😌': '#BDBDBD'
            };
            const color = entry?.mood ? (moodMap[entry.mood] || '#B76E79') : '#F1F1F1';

            return (
              <div 
                key={i} 
                className="aspect-square rounded-sm border border-black/5"
                title={entry ? `Day ${i+1}: ${entry.mood}` : `Day ${i+1}`}
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
        
        <div className="flex flex-wrap gap-3">
          {MOODS.slice(0, 6).map(m => (
            <div key={m} className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-sm" 
                style={{ backgroundColor: (m === '😊' ? '#FFD54F' : m === '😢' ? '#90CAF9' : m === '🥰' ? '#F48FB1' : '#B76E79') }} 
              />
              <span className="text-[10px] font-bold text-[#8B6F6F]">{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="fixed inset-0 z-[300] bg-[#FFFEF7] flex flex-col pt-12"
          >
             <header className="px-6 flex items-center justify-between pb-4 border-b border-[#B76E79]/5">
                <button onClick={() => setShowEditor(false)}><X size={24} className="text-[#8B6F6F]" /></button>
                <div className="text-center">
                   <p className="font-serif font-bold text-[#2C1810]">{format(new Date(), 'MMMM d, yyyy')}</p>
                   <p className="text-[10px] font-bold text-[#8B6F6F] uppercase">Written at {format(new Date(), 'h:mm a')}</p>
                </div>
                <button onClick={handleSave} className="font-bold text-[#B76E79] flex items-center gap-1">
                   Save 💕
                </button>
             </header>

             <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                   {ENTRY_TYPES.map(type => (
                     <button 
                       key={type.id}
                       onClick={() => setEditingEntry({...editingEntry!, type: type.id as any, body: editingEntry?.body || type.prefill})}
                       className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${editingEntry?.type === type.id ? 'bg-[#B76E79] text-white' : 'bg-[#FDFAF7] text-[#8B6F6F]'}`}
                     >
                       {type.label}
                     </button>
                   ))}
                </div>

                <div className="space-y-4">
                   <div className="flex flex-wrap gap-2">
                      {MOODS.map(m => (
                        <button 
                          key={m}
                          onClick={() => setEditingEntry({...editingEntry!, mood: m})}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${editingEntry?.mood === m ? 'bg-[#B76E79]/10 ring-2 ring-[#B76E79]' : 'bg-[#FDFAF7]'}`}
                        >
                          {m}
                        </button>
                      ))}
                   </div>
                </div>

                <textarea 
                  autoFocus
                  placeholder={PROMPTS[dailyPromptIndex]}
                  value={editingEntry?.body || ''}
                  onChange={(e) => setEditingEntry({...editingEntry!, body: e.target.value})}
                  className="w-full bg-transparent border-none focus:ring-0 font-playfair text-lg text-[#2C1810] leading-relaxed resize-none min-h-[400px]"
                />

                <div className="flex items-center justify-between pt-4 border-t border-black/5">
                   <div className="flex gap-4">
                     <button className="text-[#8B6F6F]/60 flex items-center gap-1 text-[10px] uppercase font-black"><Camera size={16} /> Add Photo</button>
                     <button 
                       onClick={() => setEditingEntry({...editingEntry!, isLocked: !editingEntry?.isLocked})}
                       className={`flex items-center gap-1 text-[10px] uppercase font-black ${editingEntry?.isLocked ? 'text-[#B76E79]' : 'text-[#8B6F6F]/60'}`}
                     >
                       <Lock size={16} /> {editingEntry?.isLocked ? 'Locked 🔒' : 'Lock 🔓'}
                     </button>
                   </div>
                   <span className="text-[10px] font-bold text-[#8B6F6F]">{editingEntry?.body?.trim().split(/\s+/).filter(Boolean).length || 0} words 📝</span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pin Modals */}
      <AnimatePresence>
        {(isSettingPin || lockedTarget) && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-6">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-10 w-full max-w-sm text-center space-y-6">
                <Lock size={48} className="mx-auto text-[#B76E79]" />
                <h3 className="text-xl font-serif font-bold italic">{isSettingPin ? "Set a PIN for locked entries, Tanha 🔒" : "Your secrets are safe 🔒"}</h3>
                <input 
                  type="password" 
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="----"
                  className="w-full bg-[#FDFAF7] p-5 rounded-2xl text-center text-3xl font-black tracking-[1em] border border-[#B76E79]/20"
                />
                <button 
                  onClick={handlePinSubmit}
                  className="w-full bg-[#B76E79] text-white py-4 rounded-xl font-bold"
                >
                  {isSettingPin ? "Set PIN 💕" : "Unlock 🌸"}
                </button>
                <button onClick={() => { setIsSettingPin(false); setLockedTarget(null); setPinInput(''); }} className="text-[#8B6F6F] text-xs font-bold">Cancel</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
