import React from 'react';
import { motion } from 'motion/react';
import { Home as HomeIcon, LayoutGrid, Plus } from 'lucide-react';
import { View } from '../types';

interface Props {
  currentView: View;
  setView: (v: View) => void;
  onAdd: () => void;
}

export default function BottomNav({ currentView, setView, onAdd }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-20 bg-[#FDFAF7] border-t border-[rgba(183,110,121,0.2)] rounded-t-[24px] flex items-center justify-around px-8 z-[70] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <button 
        onClick={() => setView('home')}
        className={`flex flex-col items-center gap-1 transition-all ${currentView === 'home' ? 'text-[#B76E79] opacity-100' : 'text-[#8B6F6F] opacity-90'}`}
      >
        <HomeIcon size={24} strokeWidth={currentView === 'home' ? 2.5 : 2} />
        <span className="text-[10px] font-bold">My Day</span>
      </button>

      <button 
        onClick={onAdd}
        className="w-14 h-14 bg-[#B76E79] rounded-full flex items-center justify-center text-white shadow-lg -translate-y-6 hover:scale-110 active:scale-95 transition-all z-10"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      <button 
        onClick={() => setView('more')}
        className={`flex flex-col items-center gap-1 transition-all ${currentView === 'more' ? 'text-[#B76E79] opacity-100' : 'text-[#8B6F6F] opacity-90'}`}
      >
        <LayoutGrid size={24} strokeWidth={currentView === 'more' ? 2.5 : 2} />
        <span className="text-[10px] font-bold">More</span>
      </button>
    </nav>
  );
}
