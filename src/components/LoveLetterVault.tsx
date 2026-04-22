import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LOVE_LETTERS } from '../constants';
import { LoveLetter } from '../types';
import { X, Heart, Star, Mail, ChevronRight, BookOpen } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Props {
  onBack: () => void;
}

export default function LoveLetterVault({ onBack }: Props) {
  const [isOpening, setIsOpening] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);
  const [lastReadDates, setLastReadDates] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('tanha_letter_last_read');
    return saved ? JSON.parse(saved) : {};
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('tanha_letter_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [hasOpenedBefore, setHasOpenedBefore] = useState(() => {
    return localStorage.getItem('tanha_vault_discovered') === 'true';
  });

  useEffect(() => {
    if (isOpening) {
      const timer = setTimeout(() => {
        setIsOpening(false);
        if (!hasOpenedBefore) {
          setHasOpenedBefore(true);
          localStorage.setItem('tanha_vault_discovered', 'true');
        }
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpening, hasOpenedBefore]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavs = favorites.includes(id) 
      ? favorites.filter(f => f !== id) 
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('tanha_letter_favorites', JSON.stringify(newFavs));
  };

  const openLetter = (letter: LoveLetter) => {
    setSelectedLetter(letter);
    const newDates = { ...lastReadDates, [letter.id]: new Date().toISOString() };
    setLastReadDates(newDates);
    localStorage.setItem('tanha_letter_last_read', JSON.stringify(newDates));
  };

  const sortedLetters = [...LOVE_LETTERS].sort((a, b) => {
    const aFav = favorites.includes(a.id) ? 1 : 0;
    const bFav = favorites.includes(b.id) ? 1 : 0;
    return bFav - aFav;
  });

  if (isOpening) {
    return (
      <motion.div 
        initial={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] bg-[#1A0A0F] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Soft gold particles */}
        <div className="absolute inset-0 overflow-hidden">
           {[...Array(30)].map((_, i) => (
             <motion.div
               key={i}
               animate={{ 
                 y: [1000, -200],
                 x: Math.random() * 400 - 200,
                 opacity: [0, 0.6, 0]
               }}
               transition={{ 
                 duration: Math.random() * 5 + 5, 
                 repeat: Infinity, 
                 delay: i * 0.2 
               }}
               className="absolute w-1 h-1 bg-[#FFD54F] rounded-full blur-[1px]"
               style={{ left: `${Math.random() * 100}%`, top: '100%' }}
             />
           ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-12 text-center p-8">
           {!hasOpenedBefore ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 max-w-xs"
              >
                 <p className="text-xl font-serif text-[#FFD54F]/80 italic">He left these here for you 🥺</p>
                 <p className="text-sm font-accent text-white/60 leading-relaxed italic">
                    For every moment you might need them.<br/>
                    For every version of you.
                 </p>
                 <p className="text-lg font-serif text-[#FFD54F]">You are so loved, Tanha 💌</p>
              </motion.div>
           ) : (
              <div className="space-y-4">
                 <motion.h2 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   transition={{ staggerChildren: 0.1 }}
                   className="text-4xl font-serif font-bold italic text-[#FFD54F]"
                 >
                   {"Letters For You, Tanha 💌".split("").map((char, i) => (
                     <motion.span 
                       key={i} 
                       initial={{ opacity: 0 }} 
                       animate={{ opacity: 1 }} 
                       transition={{ delay: 0.5 + (i * 0.05) }}
                     >
                       {char}
                     </motion.span>
                   ))}
                 </motion.h2>
                 <motion.p 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   transition={{ delay: 2 }}
                   className="text-sm font-accent italic text-white/70"
                 >
                   "Written for every version of you 🌸"
                 </motion.p>
              </div>
           )}

           <motion.div 
             initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
             animate={{ scale: 1, rotate: 0, opacity: 1 }}
             transition={{ delay: 1, duration: 1.5, type: 'spring' }}
             className="relative w-64 h-48"
           >
              {/* 3D Envelope Animation Sketch */}
              <div className="absolute inset-0 bg-[#FFFEF7] rounded-lg shadow-2xl border-2 border-[#B76E79]/20 flex items-center justify-center overflow-hidden">
                 <motion.div 
                   animate={{ scale: [1, 1.05, 1] }} 
                   transition={{ duration: 3, repeat: Infinity }}
                   className="text-6xl"
                 >
                    💌
                 </motion.div>
                 {/* Rose Petal Rain from Envelope */}
                 <div className="absolute inset-0 pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          y: [50, 200],
                          x: (Math.random() - 0.5) * 100,
                          rotate: 360,
                          opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                        className="absolute text-xl"
                      >
                         🌸
                      </motion.div>
                    ))}
                 </div>
              </div>
           </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A0A1E] text-white overflow-hidden flex flex-col relative pb-32">
      {/* Dark romantic bg with soft shimmer */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(183,110,121,0.2),transparent_70%)]" />
      </div>

      <header className="px-6 pt-12 pb-6 flex items-center justify-between relative z-10">
         <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold italic text-[#FFD54F]">Your Secret Vault 💌</h1>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Written just for you by your husband</p>
         </div>
         <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X size={24} />
         </button>
      </header>

      <div className="flex-1 px-6 space-y-6 overflow-y-auto no-scrollbar relative z-10 pt-4 pb-20">
         {sortedLetters.map((letter, idx) => {
           const lastReadAt = lastReadDates[letter.id];
           const daysAgo = lastReadAt ? differenceInDays(new Date(), new Date(lastReadAt)) : null;
           const isFav = favorites.includes(letter.id);

           return (
             <motion.div
               key={letter.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: idx * 0.1 }}
               onClick={() => openLetter(letter)}
               className="relative card-container cursor-pointer active:scale-[0.98] transition-transform"
             >
               <div className="bg-[#FFFEF7] rounded-[24px] p-6 shadow-2xl relative overflow-hidden flex items-center gap-4 border border-[#FFD54F]/20">
                  {/* Left accent dot */}
                  <div className="w-1.5 h-12 rounded-full absolute left-0 top-1/2 -translate-y-1/2" style={{ backgroundColor: letter.accent }} />
                  
                  <div className="w-14 h-14 bg-[#B76E79]/5 rounded-2xl flex items-center justify-center shrink-0">
                     <Mail size={24} style={{ color: letter.accent }} />
                  </div>

                  <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-serif font-bold text-[#2C1810] truncate">{letter.title}</h3>
                        <button onClick={(e) => toggleFavorite(letter.id, e)} className="p-2 -mr-2">
                           <Star size={18} className={isFav ? "fill-[#FFD54F] text-[#FFD54F]" : "text-[#B76E79]/20"} />
                        </button>
                     </div>
                     <p className="text-sm font-accent italic text-[#8B6F6F] truncate">"{letter.firstLine}"</p>
                     <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-bold text-[#B76E79] uppercase tracking-wider">
                           {!lastReadAt ? "Unread 🌸" : daysAgo === 0 ? "Last read today 💖" : `Last read ${daysAgo}d ago`}
                        </span>
                     </div>
                  </div>
               </div>
             </motion.div>
           );
         })}
      </div>

      {/* Letter Detail View */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2100] bg-[#1A0A1E] flex flex-col pt-12 items-center overflow-y-auto no-scrollbar"
          >
             <div className="absolute inset-0 bg-[#000]/40" onClick={() => setSelectedLetter(null)} />
             
             <motion.div 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="w-[90%] max-w-[400px] bg-[#FFFEF7] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden my-auto border border-[#B76E79]/10"
             >
                <div className="absolute top-0 right-0 p-6 flex gap-4">
                   <button onClick={(e) => toggleFavorite(selectedLetter.id, e as any)}>
                      <Star size={24} className={favorites.includes(selectedLetter.id) ? "fill-[#FFD54F] text-[#FFD54F]" : "text-[#B76E79]/20"} />
                   </button>
                </div>

                {/* Hand-written feel texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
                   <div className="w-full h-full bg-[repeating-linear-gradient(transparent,transparent_31px,#B76E79_31px,#B76E79_32px)]" />
                </div>

                <div className="relative space-y-8 py-4">
                   <h2 className="text-2xl font-serif font-bold text-[#B76E79]">{selectedLetter.title}</h2>
                   <div className="space-y-4">
                      {selectedLetter.content.split('\n\n').map((para, i) => (
                        <p key={i} className="text-lg font-accent italic leading-[1.9] text-[#2C1810]">
                           {para}
                        </p>
                      ))}
                   </div>
                   <div className="pt-6 border-t border-[#B76E79]/10">
                      <p className="text-xl font-serif text-[#B76E79] italic font-bold">Forever yours, Always 🥺💌</p>
                   </div>
                </div>
             </motion.div>

             <button 
               onClick={() => setSelectedLetter(null)}
               className="mt-8 mb-12 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold flex items-center gap-2 relative z-10 backdrop-blur-md"
             >
                <Mail size={18} /> Close Letter
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
