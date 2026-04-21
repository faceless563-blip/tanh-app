import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Plus, Gift, Trash2, Heart, Sparkles } from 'lucide-react';
import { Wish } from '../types';

interface Props {
  onBack: () => void;
}

export default function WishBox({ onBack }: Props) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newWish, setNewWish] = useState('');
  const [category, setCategory] = useState<Wish['category']>('feeling');

  useEffect(() => {
    const saved = localStorage.getItem('tanha_wishes');
    if (saved) setWishes(JSON.parse(saved));
  }, []);

  const saveWishes = (updated: Wish[]) => {
    setWishes(updated);
    localStorage.setItem('tanha_wishes', JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!newWish.trim()) return;
    const wish: Wish = {
      id: Date.now().toString(),
      content: newWish,
      category,
      date: new Date().toISOString(),
      isGranted: false,
    };
    saveWishes([wish, ...wishes]);
    setNewWish('');
    setIsAdding(false);
  };

  const toggleGrant = (id: string) => {
    saveWishes(wishes.map(w => w.id === id ? { ...w, isGranted: !w.isGranted } : w));
  };

  const deleteWish = (id: string) => {
    saveWishes(wishes.filter(w => w.id !== id));
  };

  return (
    <div className="min-h-screen bg-transparent pt-10 pb-32 px-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white/70 backdrop-blur-md rounded-full shadow-sm text-[#B76E79]">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-serif font-bold text-[#B76E79]">The Wish Box 🎁</h2>
          <p className="text-sm font-nunito font-bold text-[#8B6F6F]">Drop your dreams here, Tanha 🌸</p>
        </div>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-[#FFF0F3] to-[#FFE4EC] p-8 rounded-[40px] shadow-2xl border border-white/50 mb-8 relative overflow-hidden group h-64 flex flex-col items-center justify-center text-center"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20 rotate-12">
          <Sparkles size={120} className="text-[#B76E79]" />
        </div>
        
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative z-10"
        >
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
             <Gift size={64} className="text-[#B76E79]" />
          </div>
        </motion.div>

        <button 
          onClick={() => setIsAdding(true)}
          className="mt-6 px-8 py-3 bg-[#B76E79] text-white rounded-full font-nunito font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Drop a New Wish
        </button>
      </motion.div>

      <div className="space-y-4">
        {wishes.map((wish, idx) => (
          <motion.div
            key={wish.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-5 rounded-3xl backdrop-blur-md border border-white/40 shadow-sm flex items-center gap-4 ${wish.isGranted ? 'bg-green-50/50 grayscale-[0.3]' : 'bg-white/70'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${wish.isGranted ? 'bg-green-100' : 'bg-rose-100'}`}>
               {wish.isGranted ? '✨' : (wish.category === 'travel' ? '✈️' : wish.category === 'fashion' ? '👗' : '💖')}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-nunito font-bold leading-tight ${wish.isGranted ? 'line-through text-gray-500' : 'text-[#2C1810]'}`}>{wish.content}</p>
              <p className="text-[10px] text-[#8B6F6F] mt-1 uppercase font-black tracking-widest">{wish.category}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => toggleGrant(wish.id)}
                className={`p-2 rounded-full transition-colors ${wish.isGranted ? 'bg-green-500 text-white' : 'bg-white text-gray-400'}`}
              >
                <Heart size={16} fill={wish.isGranted ? "white" : "none"} />
              </button>
              <button onClick={() => deleteWish(wish.id)} className="p-2 rounded-full bg-rose-50 text-rose-300">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-6 bg-black/20 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FDFAF7] w-full max-w-sm rounded-[32px] p-8 shadow-2xl border border-white/50"
            >
              <h3 className="text-2xl font-serif font-bold text-[#B76E79] mb-4">What's your wish? 🌸</h3>
              
              <div className="space-y-4">
                <textarea
                  value={newWish}
                  onChange={(e) => setNewWish(e.target.value)}
                  placeholder="I wish for..."
                  className="w-full h-32 p-4 rounded-2xl bg-white border border-rose-100 font-nunito focus:outline-none focus:ring-2 focus:ring-[#B76E79]"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  {(['travel', 'fashion', 'feeling', 'other'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-[#B76E79] text-white shadow-md' : 'bg-white text-[#B76E79] border border-rose-100'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-2xl font-nunito font-bold">Cancel</button>
                  <button 
                    onClick={handleAdd}
                    className="flex-1 py-3 bg-[#B76E79] text-white rounded-2xl font-nunito font-black shadow-lg"
                  >
                    Drop It ✨
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
