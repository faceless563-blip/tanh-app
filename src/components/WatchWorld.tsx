import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WatchItem } from '../types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ChevronLeft, Plus, Search, Star, Bookmark, Play, Check, Trash2, Heart, Info, Clock, AlertCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
  triggerCelebration: (msg: string) => void;
}

const GENRES = [
  'Romance 💕', 'Thriller 😱', 'Comedy 😂', 'Drama 🎭', 'Horror 👻', 'Action 💥',
  'Sci-Fi 🚀', 'Fantasy 🧙', 'Animation 🎨', 'Documentary 🎙️', 'Mystery 🔍', 'Crime 🕵️',
  'Historical 📜', 'K-Drama 🇰🇷', 'C-Drama 🇨🇳', 'Bollywood 🎵', 'Hollywood 🌟', 'Turkish 🌙', 'Bengali 🌿'
];

const LANGUAGES = ['Bangla 🇧🇩', 'English 🇬🇧', 'Hindi 🇮🇳', 'Korean 🇰🇷', 'Turkish 🇹🇷', 'Chinese 🇨🇳', 'Other 🌍'];
const PLATFORMS = ['Netflix', 'YouTube', 'Disney+', 'Hoichoi', 'Chorki', 'Amazon Prime', 'Downloaded', 'Cinema 🎭', 'Other'];
const STATUSES = [
  { value: 'want', label: '🔖 Want to Watch' },
  { value: 'watching', label: '▶️ Currently Watching' },
  { value: 'finished', label: '✅ Finished' },
  { value: 'hold', label: '⏸️ On Hold' },
  { value: 'dropped', label: '❌ Dropped' },
  { value: 'unreleased', label: '🗓️ Not Released Yet' }
];

export default function WatchWorld({ onBack, triggerCelebration }: Props) {
  const [items, setItems] = useState<WatchItem[]>(() => {
    const saved = localStorage.getItem('tanha_watch_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'want' | 'watching' | 'finished' | 'favorites'>('watching');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<WatchItem>>({
    type: 'movie',
    status: 'want',
    genres: [],
    rating: 0,
    isFavorite: false
  });

  const saveItems = (updated: WatchItem[]) => {
    setItems(updated);
    localStorage.setItem('tanha_watch_items', JSON.stringify(updated));
  };

  const addItem = () => {
    if (!newItem.title || !newItem.type) return;
    const item: WatchItem = {
      ...newItem as WatchItem,
      id: Math.random().toString(),
      dateAdded: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveItems([...items, item]);
    setShowAddForm(false);
    setNewItem({ type: 'movie', status: 'want', genres: [], rating: 0, isFavorite: false });
  };

  const updateItem = (id: string, updates: Partial<WatchItem>) => {
    const updated = items.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item);
    saveItems(updated);
  };

  const deleteItem = (id: string) => {
    if (confirm("Delete this from your Watch World, Tanha? 🎬")) {
      saveItems(items.filter(i => i.id !== id));
    }
  };

  const filteredItems = useMemo(() => {
    let base = items;
    if (activeTab === 'favorites') {
      base = base.filter(i => i.isFavorite);
    } else {
      base = base.filter(i => i.status === activeTab);
    }
    if (search) {
      base = base.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
    }
    return base;
  }, [items, activeTab, search]);

  const stats = useMemo(() => {
    const finished = items.filter(i => i.status === 'finished');
    const ratings = finished.map(i => i.rating || 0).filter(r => r > 0);
    const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '0.0';
    return {
      movies: items.filter(i => i.type === 'movie' && i.status === 'finished').length,
      series: items.filter(i => i.type === 'series' && i.status === 'finished').length,
      avg,
      watchlist: items.filter(i => i.status === 'want').length
    };
  }, [items]);

  return (
    <div className="min-h-screen pt-4 pb-40 px-6 space-y-6 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-[#8B6F6F]"><ChevronLeft size={24} /></button>
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-[#2C1810]">Tanha Watch World 🎬</h2>
            <p className="text-sm font-accent italic text-[#8B6F6F]">Every story you have lived through 🍿</p>
          </div>
        </div>
        <button onClick={() => setShowAddForm(true)} className="text-[#B76E79]"><Plus size={28} /></button>
      </header>

      {/* Stats Bar */}
      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2">
        <StatChip icon="🎬" label={`${stats.movies} Movies`} />
        <StatChip icon="📺" label={`${stats.series} Series`} />
        <StatChip icon="⭐" label={`${stats.avg} Avg Rating`} />
        <StatChip icon="🔖" label={`${stats.watchlist} Watchlist`} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B6F6F]/40" size={18} />
        <input 
          type="text" 
          placeholder="Search your watch world... 🔍"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#FDFAF7] pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-[#B76E79]/20 font-nunito font-semibold"
        />
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 bg-[#B76E79]/5 p-1 rounded-xl h-12">
        <TabButton active={activeTab === 'want'} label="🔖" onClick={() => setActiveTab('want')} />
        <TabButton active={activeTab === 'watching'} label="▶️" onClick={() => setActiveTab('watching')} />
        <TabButton active={activeTab === 'finished'} label="✅" onClick={() => setActiveTab('finished')} />
        <TabButton active={activeTab === 'favorites'} label="❤️" onClick={() => setActiveTab('favorites')} />
      </div>

      {/* List */}
      <div className="space-y-4">
         {filteredItems.length === 0 ? (
           <div className="text-center py-20 opacity-30">
             <span className="text-6xl">🎬</span>
             <p className="font-accent italic text-lg mt-4">No titles found in this tab! 🌸</p>
           </div>
         ) : (
           <div className={activeTab === 'watching' ? 'space-y-4' : 'grid grid-cols-2 gap-4'}>
             {filteredItems.map(item => (
               <WatchCard 
                 key={item.id} 
                 item={item} 
                 layout={activeTab === 'watching' ? 'list' : 'grid'} 
                 onUpdate={(updates) => updateItem(item.id, updates)}
                 onDelete={() => deleteItem(item.id)}
                 onStatusChange={(status) => updateItem(item.id, { status })}
                 triggerCelebration={triggerCelebration}
               />
             ))}
           </div>
         )}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowAddForm(false)} />
             <motion.div 
               initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
               className="relative w-full max-w-[480px] bg-white rounded-t-[32px] p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
             >
                <div className="w-12 h-1.5 bg-[#8B6F6F]/20 rounded-full mx-auto" />
                <h4 className="text-xl font-serif font-bold text-center">Add to your World 🍿</h4>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => setNewItem({...newItem, type: 'movie'})}
                     className={`p-6 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${newItem.type === 'movie' ? 'bg-[#B76E79]/5 border-[#B76E79]' : 'bg-[#FDFAF7] border-transparent'}`}
                   >
                     <span className="text-3xl">🎬</span>
                     <span className="font-bold text-xs uppercase tracking-widest text-[#B76E79]">Movie</span>
                   </button>
                   <button 
                     onClick={() => setNewItem({...newItem, type: 'series'})}
                     className={`p-6 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${newItem.type === 'series' ? 'bg-[#B76E79]/5 border-[#B76E79]' : 'bg-[#FDFAF7] border-transparent'}`}
                   >
                     <span className="text-3xl">📺</span>
                     <span className="font-bold text-xs uppercase tracking-widest text-[#B76E79]">Series</span>
                   </button>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B6F6F]">What is the title? 🎬</label>
                   <input 
                      type="text" 
                      value={newItem.title || ''}
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                      placeholder="Title..."
                      className="w-full bg-[#FDFAF7] p-4 rounded-xl border-none focus:ring-2 focus:ring-[#B76E79]/20 font-nunito font-bold"
                   />
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B6F6F]">Genre 🍿</label>
                   <div className="flex flex-wrap gap-2">
                      {GENRES.map(g => (
                        <button 
                          key={g} 
                          onClick={() => {
                            const genres = newItem.genres || [];
                            const updated = genres.includes(g) ? genres.filter(x => x !== g) : [...genres, g];
                            setNewItem({...newItem, genres: updated});
                          }}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${newItem.genres?.includes(g) ? 'bg-[#B76E79] text-white border-[#B76E79]' : 'bg-transparent border-[#B76E79]/20'}`}
                        >
                          {g}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B6F6F]">Language 🌍</label>
                      <select 
                        value={newItem.language} 
                        onChange={(e) => setNewItem({...newItem, language: e.target.value})}
                        className="w-full bg-[#FDFAF7] p-3 rounded-xl text-xs font-bold"
                      >
                         <option value="">Select...</option>
                         {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B6F6F]">Platform 📱</label>
                      <select 
                        value={newItem.platform} 
                        onChange={(e) => setNewItem({...newItem, platform: e.target.value})}
                        className="w-full bg-[#FDFAF7] p-3 rounded-xl text-xs font-bold"
                      >
                         <option value="">Select...</option>
                         {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B6F6F]">Status ✨</label>
                   <div className="grid grid-cols-2 gap-2">
                      {STATUSES.map(s => (
                        <button 
                          key={s.value}
                          onClick={() => setNewItem({...newItem, status: s.value as any})}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold text-left transition-all ${newItem.status === s.value ? 'bg-[#B76E79] text-white' : 'bg-[#FDFAF7]'}`}
                        >
                          {s.label}
                        </button>
                      ))}
                   </div>
                </div>

                {newItem.type === 'series' && (
                  <div className="grid grid-cols-2 gap-4 bg-[#B76E79]/5 p-4 rounded-2xl">
                     <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest opacity-60">Seasons</label>
                        <input type="number" placeholder="Total..." className="w-full bg-white/50 p-2 rounded-lg text-sm" onChange={(e) => setNewItem({...newItem, totalSeasons: parseInt(e.target.value)})}/>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-widest opacity-60">Episodes</label>
                        <input type="number" placeholder="Total..." className="w-full bg-white/50 p-2 rounded-lg text-sm" onChange={(e) => setNewItem({...newItem, totalEpisodes: parseInt(e.target.value)})}/>
                     </div>
                  </div>
                )}

                <button 
                  onClick={addItem}
                  className="w-full bg-[#B76E79] text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-[#C2185B] transition-all"
                >
                  Add to Watch World 💕
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatChip({ icon, label }: { icon: string, label: string }) {
  return (
    <div className="flex-none flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-white/50 shadow-sm">
      <span className="text-sm">{icon}</span>
      <span className="text-[10px] font-black tracking-tight text-[#2C1810]/70 whitespace-nowrap">{label}</span>
    </div>
  );
}

function TabButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`rounded-lg font-bold text-lg transition-all ${active ? 'bg-[#B76E79] text-white shadow-sm' : 'text-[#8B6F6F] opacity-50'}`}
    >
      {label}
    </button>
  );
}

function WatchCard({ item, layout, onUpdate, onDelete, onStatusChange, triggerCelebration }: { 
  item: WatchItem, layout: 'list' | 'grid', onUpdate: (u: any) => void, onDelete: () => void, onStatusChange: (s: any) => void, triggerCelebration: (m: string) => void
}) {
  if (layout === 'list') {
    return (
      <motion.div layout className="glass-card p-4 flex items-center gap-4 relative group">
         <div className="w-16 aspect-[2/3] bg-gradient-to-br from-[#B76E79]/20 to-[#B76E79]/10 rounded-lg flex items-center justify-center text-2xl shadow-inner">
           {item.type === 'movie' ? '🎬' : '📺'}
         </div>
         <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
               <p className="font-nunito font-bold text-[15px] truncate text-[#2C1810]">{item.title}</p>
               <button onClick={() => onUpdate({ isFavorite: !item.isFavorite })} className={item.isFavorite ? 'text-[#C2185B]' : 'text-gray-300'}>
                 <Heart size={16} fill={item.isFavorite ? 'currentColor' : 'none'} />
               </button>
            </div>
            <div className="flex items-center gap-2">
               <span className="bg-[#B76E79]/10 text-[#B76E79] text-[9px] font-black uppercase px-2 py-0.5 rounded-md">{item.platform}</span>
               <span className="text-[9px] text-[#8B6F6F] font-bold">{item.genres[0]}</span>
            </div>
            {item.type === 'series' ? (
              <div className="space-y-2 mt-2">
                 <div className="flex justify-between items-center text-[10px] font-bold text-[#8B6F6F]">
                    <span>S{item.currentSeason || 1} • Ep {item.currentEpisode || 0} of {item.totalEpisodes || '?'}</span>
                    <button 
                      onClick={() => {
                        const cur = (item.currentEpisode || 0) + 1;
                        onUpdate({ currentEpisode: cur });
                        if (cur === item.totalEpisodes) {
                          triggerCelebration("YOU FINISHED IT!! 🎉🎊 Time to rate it, lokki amar! ⭐");
                          onUpdate({ status: 'finished' });
                        } else {
                          triggerCelebration(`Episode ${cur} done! Keep going, Tanha 📺💕`);
                        }
                      }}
                      className="text-[#B76E79] font-black hover:underline"
                    >
                      + Ep 📺
                    </button>
                 </div>
                 <div className="h-1 bg-[#B76E79]/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((item.currentEpisode || 0) / (item.totalEpisodes || 1)) * 100, 100)}%` }}
                      className="h-full bg-[#B76E79]"
                    />
                 </div>
              </div>
            ) : (
              <button 
                onClick={() => onStatusChange('finished')}
                className="mt-2 w-full py-2 bg-[#B76E79]/5 rounded-lg text-[10px] font-black text-[#B76E79] uppercase"
              >
                ✅ Finished!
              </button>
            )}
         </div>
         <button onClick={onDelete} className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
           <Trash2 size={12} />
         </button>
      </motion.div>
    );
  }

  // Grid Layout
  return (
    <motion.div layout className="glass-card p-3 flex flex-col gap-3 relative group">
       <div className="w-full aspect-[2/3] bg-gradient-to-br from-[#B76E79]/20 to-[#B76E79]/10 rounded-xl flex items-center justify-center text-4xl shadow-inner relative overflow-hidden">
          {item.type === 'movie' ? '🎬' : '📺'}
          {item.isFavorite && <div className="absolute top-2 right-2 text-rose-500 text-sm">❤️</div>}
          <div className="absolute top-2 left-2 bg-black/20 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] text-white font-black uppercase">
            {item.type}
          </div>
       </div>
       <div className="min-w-0 space-y-1 text-center">
          <p className="font-nunito font-bold text-xs truncate text-[#2C1810]">{item.title}</p>
          <div className="flex justify-center flex-wrap gap-1">
             <span className="text-[8px] text-[#B76E79] font-black px-1.5 py-0.5 bg-[#B76E79]/10 rounded-md truncate max-w-full">
               {item.genres[0]}
             </span>
          </div>
          {item.status === 'finished' && (
            <div className="flex justify-center gap-0.5 pt-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={10} fill={s <= (item.rating || 0) ? '#B76E79' : 'none'} stroke={s <= (item.rating || 0) ? '#B76E79' : '#8B6F6F'} opacity={s <= (item.rating || 0) ? 1 : 0.2}/>
              ))}
            </div>
          )}
       </div>
       <div className="flex gap-2 mt-auto">
          {item.status === 'want' && (
            <button onClick={() => onStatusChange('watching')} className="flex-1 py-1.5 bg-[#B76E79] text-white rounded-lg text-[9px] font-black flex items-center justify-center gap-1">
              <Play size={10} /> START
            </button>
          )}
          {item.status !== 'finished' && item.status !== 'want' && (
             <button onClick={() => onStatusChange('finished')} className="flex-1 py-1.5 bg-green-500 text-white rounded-lg text-[9px] font-black flex items-center justify-center gap-1">
               <Check size={10} /> DONE
             </button>
          )}
       </div>
       <button onClick={onDelete} className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10">
           <Trash2 size={12} />
       </button>
    </motion.div>
  );
}
