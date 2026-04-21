import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';
import { EMOJI_MAP, EMOJI_PICKER } from '../constants';
import { Plus, X, ArrowRight } from 'lucide-react';

interface Props {
  onComplete: (tasks: Task[]) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [screen, setScreen] = useState<1 | 2>(1);
  const [anchorTasks, setAnchorTasks] = useState<Partial<Task>[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);

  useEffect(() => {
    if (screen === 1) {
      const timer = setTimeout(() => setScreen(2), 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const addTask = () => {
    setAnchorTasks([...anchorTasks, { id: Math.random().toString(), title: '', emoji: '✅', completed: false, type: 'anchor' }]);
  };

  const updateTask = (idx: number, updates: Partial<Task>) => {
    const newTasks = [...anchorTasks];
    newTasks[idx] = { ...newTasks[idx], ...updates };
    
    // Auto-emoji logic
    if (updates.title) {
      const words = updates.title.toLowerCase().split(' ');
      for (const word of words) {
        if (EMOJI_MAP[word]) {
          newTasks[idx].emoji = EMOJI_MAP[word];
          break;
        }
      }
    }
    
    setAnchorTasks(newTasks);
  };

  const removeTask = (idx: number) => {
    setAnchorTasks(anchorTasks.filter((_, i) => i !== idx));
  };

  if (screen === 1) {
    return (
      <div 
        className="fixed inset-0 flex flex-col items-center justify-center bg-[#FFF0F3] p-10 text-center space-y-6"
        onClick={() => setScreen(2)}
      >
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="floating-heart text-2xl" style={{ left: `${Math.random() * 100}%`, animationDelay: `${i * 0.5}s` }}>💖</div>
        ))}
        <div className="pulse-emoji text-[80px]">🌸</div>
        <h1 className="text-4xl font-serif font-bold text-[#2C1810]">Hey Tanha! 🌸</h1>
        <p className="text-lg font-accent italic text-[#8B6F6F]">This app is made just for you,<br/>with love 💖</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF0F3] p-6 pb-32 overflow-y-auto no-scrollbar">
      <div className="max-w-md mx-auto space-y-8">
        <header className="text-center space-y-2 py-8">
          <h2 className="text-3xl font-serif font-bold text-[#2C1810]">Tanha, what do you do every day? 🗓️</h2>
          <p className="text-sm font-accent italic text-[#8B6F6F]">Add your daily habits — they will show up every morning automatically 💕</p>
        </header>

        <div className="space-y-4">
          {anchorTasks.map((task, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={task.id} 
              className="glass-card p-4 flex items-center gap-3 relative"
            >
              <button 
                onClick={() => setShowEmojiPicker(idx)}
                className="text-3xl w-10 h-10 flex items-center justify-center bg-white/50 rounded-lg"
              >
                {task.emoji}
              </button>
              
              <input 
                type="text" 
                value={task.title}
                onChange={(e) => updateTask(idx, { title: e.target.value })}
                placeholder="Habit name..."
                className="flex-1 bg-transparent border-none focus:ring-0 font-nunito font-semibold text-[#2C1810] placeholder:text-[#8B6F6F]/40"
              />

              <input 
                type="time" 
                value={task.time}
                onChange={(e) => updateTask(idx, { time: e.target.value })}
                className="text-xs text-[#8B6F6F] bg-transparent border-none focus:ring-0 w-20"
              />

              <button onClick={() => removeTask(idx)} className="text-[#8B6F6F]/40 hover:text-[#C2185B]">
                <X size={18} />
              </button>

              <AnimatePresence>
                {showEmojiPicker === idx && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-16 left-0 right-0 z-50 glass-card p-3 grid grid-cols-6 gap-2"
                  >
                    {EMOJI_PICKER.map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => { updateTask(idx, { emoji }); setShowEmojiPicker(null); }}
                        className="text-2xl hover:bg-white rounded-lg p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          
          <button 
            onClick={addTask}
            className="w-full h-16 border-2 border-dashed border-[#B76E79]/40 rounded-[20px] flex items-center justify-center text-[#B76E79] hover:bg-white/20 transition-all gap-2"
          >
            <Plus size={20} />
            <span className="font-bold uppercase tracking-widest text-[10px]">Add habit</span>
          </button>
        </div>

        <button 
          onClick={() => onComplete(anchorTasks as Task[])}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[80%] max-w-[320px] bg-[#B76E79] text-white py-5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-[#C2185B] transition-all"
        >
          <span>Let us go, Tanha! 💖</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
