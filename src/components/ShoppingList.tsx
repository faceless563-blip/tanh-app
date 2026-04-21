import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingItem } from '../types';
import { ChevronLeft, Plus, X, Trash2, Share2, AlertCircle, ShoppingCart, Check } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const CATEGORIES = [
  { label: 'Groceries', icon: '🥦', color: '#81C784' },
  { label: 'Beauty', icon: '💄', color: '#F06292' },
  { label: 'Clothing', icon: '👗', color: '#BA68C8' },
  { label: 'Home', icon: '🏠', color: '#FFD54F' },
  { label: 'Health', icon: '💊', color: '#4FC3F7' },
  { label: 'Other', icon: '📦', color: '#B76E79' }
];

export default function ShoppingList({ onBack }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('tanha_shopping_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Groceries',
    quantity: 1,
    isUrgent: false
  });

  const [expandedBought, setExpandedBought] = useState(false);
  const [error, setError] = useState('');

  const saveItems = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    localStorage.setItem('tanha_shopping_list', JSON.stringify(newItems));
  };

  const addItem = () => {
    if (!newItem.name.trim()) {
      setError('Give it a name first, Tanha! 🌸');
      return;
    }
    const item: ShoppingItem = {
      id: Math.random().toString(),
      name: newItem.name.trim(),
      category: newItem.category,
      quantity: newItem.quantity,
      isUrgent: newItem.isUrgent,
      isBought: false,
      addedAt: new Date().toISOString(),
      boughtAt: null
    };
    saveItems([...items, item]);
    setNewItem({ name: '', category: 'Groceries', quantity: 1, isUrgent: false });
    setError('');
  };

  const toggleBought = (id: string) => {
    const updated = items.map(item => 
      item.id === id 
        ? { ...item, isBought: !item.isBought, boughtAt: !item.isBought ? new Date().toISOString() : null } 
        : item
    );
    saveItems(updated);
  };

  const deleteItem = (id: string) => {
    saveItems(items.filter(i => i.id !== id));
  };

  const clearBought = () => {
    if (confirm("Clear all bought items, Tanha? 🛒")) {
      saveItems(items.filter(i => !i.isBought));
    }
  };

  const shareList = () => {
    const toGet = items.filter(i => !i.isBought);
    const text = `Shopping List 🛒\n${toGet.map(i => `[ ] ${i.name}${i.quantity > 1 ? ` (x${i.quantity})` : ''}`).join('\n')}`;
    if (navigator.share) {
      navigator.share({ title: 'Shopping List', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('List copied to clipboard! 💕');
    }
  };

  const pendingItems = items.filter(i => !i.isBought);
  const boughtItems = items.filter(i => i.isBought);
  const urgentItems = pendingItems.filter(i => i.isUrgent);
  const normalItems = pendingItems.filter(i => !i.isUrgent);

  return (
    <div className="min-h-screen pt-4 pb-40 px-6 space-y-8 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-[#8B6F6F]"><ChevronLeft size={24} /></button>
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-[#2C1810]">Shopping List 🛒</h2>
            <p className="text-sm font-semibold opacity-60 text-[#8B6F6F]">{pendingItems.length} things to get 🛒</p>
          </div>
        </div>
        <div className="flex gap-4 text-[#8B6F6F]/40">
           <button onClick={shareList}><Share2 size={20} /></button>
           <button onClick={clearBought}><Trash2 size={20} /></button>
        </div>
      </header>

      {/* Add Item Form */}
      <div className="glass-card p-6 space-y-5 bg-white shadow-md border-none">
         <div className="space-y-4">
            <input 
              type="text" 
              placeholder="What do we need, Tanha? 🛒"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="w-full bg-[#FDFAF7] p-4 rounded-xl border-none focus:ring-2 focus:ring-[#B76E79]/20 font-nunito font-bold text-[#2C1810] placeholder:text-[#8B6F6F]/30"
            />
            {error && <p className="text-xs text-[#C2185B] font-bold px-1">{error}</p>}
         </div>

         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 bg-[#FDFAF7] px-3 py-1.5 rounded-xl border border-[rgba(183,110,121,0.1)]">
               <span className="text-[10px] font-bold text-[#8B6F6F]">Qty:</span>
               <button onClick={() => setNewItem({...newItem, quantity: Math.max(1, newItem.quantity - 1)})} className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-[#B76E79]"><X size={12} /></button>
               <span className="w-6 text-center font-bold text-sm">{newItem.quantity}</span>
               <button onClick={() => setNewItem({...newItem, quantity: newItem.quantity + 1})} className="w-6 h-6 rounded-md bg-[#B76E79] flex items-center justify-center text-white"><Plus size={12} /></button>
            </div>

            <button 
              onClick={() => setNewItem({...newItem, isUrgent: !newItem.isUrgent})}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newItem.isUrgent ? 'bg-[#C2185B] text-white border-[#C2185B] shadow-sm' : 'bg-transparent border-[#B76E79]/30 text-[#B76E79]'}`}
            >
              {newItem.isUrgent ? 'URGENT 🔴' : 'NORMAL'}
            </button>
         </div>

         <div className="flex overflow-x-auto no-scrollbar gap-2 py-1">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.label} 
                onClick={() => setNewItem({...newItem, category: cat.label})}
                className={`flex-none px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${newItem.category === cat.label ? 'bg-[#B76E79]/10 text-[#B76E79] border border-[#B76E79]/20' : 'bg-white text-[#8B6F6F] opacity-50 border border-transparent'}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
         </div>

         <button 
           onClick={addItem}
           className="w-full bg-[#B76E79] text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-[#C2185B] transition-all"
         >
           Add Item 💕
         </button>
      </div>

      {/* List Sections */}
      <div className="space-y-6">
         {items.length === 0 ? (
            <div className="text-center py-20 opacity-30">
               <span className="text-6xl">🛒</span>
               <p className="font-accent italic text-xl mt-4">Nothing on the list yet! 🛒<br/>Lucky you 😄💕</p>
            </div>
         ) : (
            <>
               {urgentItems.length > 0 && (
                  <div className="space-y-4">
                     <h3 className="text-sm font-black uppercase tracking-widest text-[#C2185B] px-1 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Urgent
                     </h3>
                     <div className="space-y-3">
                        {urgentItems.map(item => <ShoppingCard key={item.id} item={item} onToggle={toggleBought} onDelete={deleteItem} />)}
                     </div>
                  </div>
               )}

               <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#8B6F6F] px-1">📋 To Get</h3>
                  <div className="space-y-3">
                     {normalItems.map(item => <ShoppingCard key={item.id} item={item} onToggle={toggleBought} onDelete={deleteItem} />)}
                     {pendingItems.length === 0 && <p className="text-center py-4 font-accent italic text-[#8B6F6F] opacity-50">All caught up! ✨</p>}
                  </div>
               </div>

               {boughtItems.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <button 
                      onClick={() => setExpandedBought(!expandedBought)}
                      className="w-full flex items-center justify-between text-[#8B6F6F]/60 font-bold text-xs uppercase px-1"
                    >
                      <span>✅ Got It ({boughtItems.length})</span>
                      <ChevronLeft size={16} className={`transition-transform ${expandedBought ? '-rotate-90' : ''}`} />
                    </button>
                    {expandedBought && (
                      <div className="space-y-3">
                         {boughtItems.map(item => <ShoppingCard key={item.id} item={item} onToggle={toggleBought} onDelete={deleteItem} />)}
                      </div>
                    )}
                  </div>
               )}
            </>
         )}
      </div>
    </div>
  );
}

function ShoppingCard({ item, onToggle, onDelete }: { item: ShoppingItem, onToggle: (id: string) => void, onDelete: (id: string) => void }) {
  const cat = CATEGORIES.find(c => c.label === item.category);
  return (
    <motion.div 
      layout
      className={`glass-card p-4 flex items-center gap-4 border-l-[4px] relative group ${item.isBought ? 'bg-white/40' : ''}`}
      style={{ borderLeftColor: cat?.color }}
    >
       <button 
         onClick={() => onToggle(item.id)}
         className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center shrink-0 ${
           item.isBought ? 'bg-[#8B6F6F]/20 border-transparent text-[#8B6F6F]' : 'border-[#B76E79]/30'
         }`}
       >
         {item.isBought && <Check size={14} strokeWidth={3} />}
       </button>

       <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
             <p className={`font-nunito font-black truncate text-base ${item.isBought ? 'line-through text-[#8B6F6F] opacity-50' : 'text-[#2C1810]'}`}>
               {item.name}
             </p>
             {item.quantity > 1 && <span className="bg-[#B76E79]/10 text-[#B76E79] text-[9px] font-black px-1.5 py-0.5 rounded-md">x{item.quantity}</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-[10px] opacity-60">{cat?.icon} {item.category}</span>
             {item.isUrgent && !item.isBought && <span className="text-[9px] font-black text-[#C2185B] uppercase tracking-tighter">🔴 URGENT</span>}
          </div>
       </div>

       <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 text-[#C2185B]/40 hover:text-[#C2185B] transition-all">
          <Trash2 size={16} />
       </button>
    </motion.div>
  );
}
