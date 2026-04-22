import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';
import { EMOJI_MAP, EMOJI_PICKER } from '../constants';
import { ChevronLeft, Plus, X, Edit2 } from 'lucide-react';

interface Props {
  anchorTasks: Task[];
  onUpdateAnchors: (tasks: Task[]) => void;
  onBack: () => void;
  onRestartTour: () => void;
}

export default function Settings({ anchorTasks, onUpdateAnchors, onBack, onRestartTour }: Props) {
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const removeAnchor = (id: string) => {
    onUpdateAnchors(anchorTasks.filter(t => t.id !== id));
  };

  const handleSaveEdit = () => {
    if (!editingTask || !editingTask.title) return;
    
    if (editingTask.id) {
      onUpdateAnchors(anchorTasks.map(t => t.id === editingTask.id ? { ...t, ...editingTask } as Task : t));
    } else {
      onUpdateAnchors([...anchorTasks, { ...editingTask, id: Math.random().toString(), type: 'anchor', completed: false } as Task]);
    }
    setEditingTask(null);
  };

  const handleNameChange = (title: string) => {
    setEditingTask(prev => {
      if (!prev) return null;
      const next = { ...prev, title };
      const words = title.toLowerCase().split(' ');
      for (const word of words) {
        if (EMOJI_MAP[word]) {
          next.emoji = EMOJI_MAP[word];
          break;
        }
      }
      return next;
    });
  };

  return (
    <div className="space-y-8 px-5">
      <header className="flex items-center gap-4 py-4">
        <button onClick={onBack} className="text-[#8B6F6F] hover:text-[#B76E79] transition-colors"><ChevronLeft size={24} /></button>
        <h2 className="text-2xl font-serif font-bold">Settings</h2>
      </header>

      <section className="space-y-4">
        <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#634A4A] uppercase px-1">Manage Anchor Tasks</h3>
        <div className="space-y-3">
          {anchorTasks.map(task => (
            <div key={task.id} className="glass-card p-4 flex items-center gap-4">
              <span className="text-2xl">{task.emoji}</span>
              <div className="flex-1">
                <p className="font-nunito font-bold text-[#2C1810]">{task.title}</p>
                {task.time && <span className="text-[10px] font-bold text-[#634A4A] uppercase tracking-widest">{task.time}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingTask(task)} className="text-[#8B6F6F] hover:text-[#B76E79] transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => removeAnchor(task.id)} className="text-[#8B6F6F] hover:text-[#B76E79] transition-colors hover:text-red-500"><X size={16} /></button>
              </div>
            </div>
          ))}
          <button 
            onClick={() => setEditingTask({ title: '', emoji: '✅', time: '' })}
            className="w-full py-4 border-2 border-dashed border-[#B76E79]/30 rounded-2xl text-[#B76E79] font-bold flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add Habit
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#8B6F6F] uppercase px-1">App Settings</h3>
        <div className="space-y-3">
           <button 
             onClick={onRestartTour}
             className="w-full glass-card p-5 text-left font-bold text-[#B76E79] flex items-center justify-between"
           >
             Take App Tour Again 🌸
             <ChevronLeft size={18} className="rotate-180 opacity-40" />
           </button>
        </div>
      </section>

      <section className="glass-card p-8 text-center space-y-4 relative overflow-hidden">
         <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [-100, 100], opacity: [0, 0.4, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
                className="absolute text-xl"
                style={{ left: `${20 * i}%`, top: '-10%' }}
              >
                💖
              </motion.div>
            ))}
         </div>
         <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#B76E79]">About This App 💖</h3>
         <p className="font-accent italic text-[#2C1810] leading-relaxed">
            "Made with 💖 by your husband. Every feature, every message, every line of code — all for you, Tanha 🌸"
         </p>
         <div className="text-3xl animate-pulse pt-2">💖</div>
      </section>

      <section className="py-10 text-[10px] uppercase tracking-[0.3em] font-black text-center text-[#8B6F6F]/30 pb-32">
         Tanha Chatterjee • v4.0.0 Final
      </section>

      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-sm p-6 space-y-6">
               <h4 className="text-xl font-bold font-serif text-center">Edit Habit</h4>
               <div className="flex items-center gap-4">
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-4xl w-14 h-14 bg-white rounded-xl shadow-sm">
                    {editingTask.emoji}
                  </button>
                  <input 
                    type="text" value={editingTask.title} onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Habit name..." className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold font-nunito"
                  />
               </div>
               
               {showEmojiPicker && (
                 <div className="grid grid-cols-6 gap-2 bg-white/50 p-3 rounded-xl">
                   {EMOJI_PICKER.map(e => <button key={e} onClick={() => { setEditingTask({...editingTask, emoji: e}); setShowEmojiPicker(false); }} className="text-xl">{e}</button>)}
                 </div>
               )}

               <div className="space-y-3">
                 <input type="time" value={editingTask.time} onChange={(e) => setEditingTask({...editingTask, time: e.target.value})} className="w-full p-4 rounded-xl border border-rose-100" />
                 <div className="flex gap-3 pt-4">
                   <button onClick={() => setEditingTask(null)} className="flex-1 py-4 font-bold text-[#8B6F6F]">Cancel</button>
                   <button onClick={handleSaveEdit} className="flex-2 bg-[#B76E79] text-white py-4 rounded-xl font-bold shadow-lg">Save</button>
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
