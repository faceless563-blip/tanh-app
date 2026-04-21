import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, View, UserSettings } from './types';
import { getDayInfo, getDayOfYear } from './utils/helpers';
import Onboarding from './components/Onboarding';
import Home from './components/Home';
import Settings from './components/Settings';
import More from './components/More';
import CycleTracker from './components/CycleTracker';
import HairCare from './components/HairCare';
import ImportantDates from './components/ImportantDates';
import ShoppingList from './components/ShoppingList';
import SelfCare from './components/SelfCare';
import WatchWorld from './components/WatchWorld';
import Diary from './components/Diary';
import Medicines from './components/Medicines';
import BottomNav from './components/BottomNav';
import CelebrationPopup from './components/CelebrationPopup';
import WelcomePopup from './components/WelcomePopup';
import { format } from 'date-fns';

export default function App() {
  const [currentView, setView] = useState<View>('home');
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    return localStorage.getItem('tanha_onboarding_complete') === 'true';
  });
  const [welcomeShown, setWelcomeShown] = useState<boolean>(() => {
    return localStorage.getItem('tanha_welcome_shown') === 'true';
  });
  
  const [anchorTasks, setAnchorTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tanha_anchor_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [todayTasks, setTodayTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tanha_today_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [showGrandFinale, setShowGrandFinale] = useState(false);

  const dayInfo = useMemo(() => getDayInfo(), [new Date().getHours()]);

  // Midnight Reset Logic Phase 3
  useEffect(() => {
    const lastOpen = localStorage.getItem('tanha_last_open_date');
    const today = new Date().toDateString();
    const todayISO = format(new Date(), 'yyyy-MM-dd');
    
    if (lastOpen && lastOpen !== today) {
      setTodayTasks([]); 
      localStorage.setItem('tanha_last_open_date', today);
      
      // Phase 3 Resets
      // Self Care already logged today? (Handled by checking date in logs)
      // Medicine doses generation happens on mount and nav
    }
    localStorage.setItem('tanha_last_open_date', today);
  }, []);

  // Sync today tasks to localStorage
  useEffect(() => {
    localStorage.setItem('tanha_today_tasks', JSON.stringify(todayTasks));
  }, [todayTasks]);

  // Initialize today's anchor tasks if needed
  useEffect(() => {
    if (onboardingComplete) {
      const today = new Date().toDateString();
      const lastReset = localStorage.getItem('tanha_tasks_last_reset');
      
      if (lastReset !== today) {
        const dailyAnchors: Task[] = anchorTasks.map(at => ({
          ...at,
          completed: false,
          type: 'anchor',
          id: `anchor-${at.id}-${today}`
        }));
        setTodayTasks(dailyAnchors);
        localStorage.setItem('tanha_tasks_last_reset', today);
      }
    }
  }, [onboardingComplete, anchorTasks]);

  const handleTaskToggle = (taskId: string) => {
    setTodayTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const targetTask = updated.find(t => t.id === taskId);
      if (targetTask?.completed) triggerCelebration();
      if (updated.length > 0 && updated.every(t => t.completed)) {
        setTimeout(() => setShowGrandFinale(true), 1000);
      }
      return updated;
    });
  };

  const triggerCelebration = (customMsg?: string) => {
    const MESSAGES = [
      "You did it! Amar lokki is amazing! 💖",
      "One step closer to your dreams, Tanha! ✨",
      "I'm so proud of you, my love! 🥰",
      "Keep that beautiful momentum going! 🌸",
      "You are unstoppable today! 🔥",
      "That's my girl! So productive! ❤️",
      "Every tick is a victory! 🏆",
      "Making it look easy, aren't you? 🌟",
      "Love seeing you win, Tanha! 💌",
      "Simply the best! 🌸💪",
      "You've got this! Always! 💖",
      "Beautiful work, amar jaan! 💕",
      "Pure excellence! 🌺",
      "My heart is cheering for you! 📣❤️",
      "Doing great things, Tanha! ✨"
    ];
    setCelebrationMessage(customMsg || MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  };

  if (!onboardingComplete) {
    return <Onboarding onComplete={(tasks) => {
      setAnchorTasks(tasks);
      localStorage.setItem('tanha_anchor_tasks', JSON.stringify(tasks));
      localStorage.setItem('tanha_onboarding_complete', 'true');
      setOnboardingComplete(true);
    }} />;
  }

  return (
    <div 
      className="min-h-screen transition-all duration-[2000ms] ease-in-out" 
      style={{ background: dayInfo.gradient }}
    >
      <div 
        className="max-container flex flex-col pt-12 pb-32 overflow-y-auto no-scrollbar"
        style={{ color: dayInfo.isDark ? '#FFFFFF' : '#2C1810' }}
      >
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <Home 
              key="home"
              tasks={todayTasks} 
              onToggle={handleTaskToggle}
              onAddTask={(t) => setTodayTasks(prev => [...prev, t])}
              dayInfo={dayInfo}
              setView={setView}
            />
          )}
          {currentView === 'settings' && (
            <Settings 
              key="settings"
              anchorTasks={anchorTasks} 
              onUpdateAnchors={(newAnchors) => {
                setAnchorTasks(newAnchors);
                localStorage.setItem('tanha_anchor_tasks', JSON.stringify(newAnchors));
              }}
              onBack={() => setView('home')}
            />
          )}
          {currentView === 'more' && <More key="more" setView={setView} />}
          {currentView === 'cycle' && <CycleTracker key="cycle" onBack={() => setView('more')} />}
          {currentView === 'hair' && <HairCare key="hair" onBack={() => setView('more')} />}
          {currentView === 'dates' && <ImportantDates key="dates" onBack={() => setView('more')} />}
          {currentView === 'shopping' && <ShoppingList key="shopping" onBack={() => setView('more')} />}
          {currentView === 'self-care' && <SelfCare key="self-care" onBack={() => setView('more')} triggerCelebration={triggerCelebration} />}
          {currentView === 'watch' && <WatchWorld key="watch" onBack={() => setView('more')} triggerCelebration={triggerCelebration} />}
          {currentView === 'diary' && <Diary key="diary" onBack={() => setView('more')} triggerCelebration={triggerCelebration} />}
          {currentView === 'medicines' && <Medicines key="medicines" onBack={() => setView('more')} triggerCelebration={triggerCelebration} />}
        </AnimatePresence>

        <BottomNav 
          currentView={currentView} 
          setView={setView} 
          onAdd={() => {
            // This will be handled by a local FAB state in Home or global
            window.dispatchEvent(new CustomEvent('open-add-task'));
          }}
        />
        
        <AnimatePresence>
          {!welcomeShown && (
            <WelcomePopup onDismiss={() => {
              setWelcomeShown(true);
              localStorage.setItem('tanha_welcome_shown', 'true');
            }} />
          )}
          {celebrationMessage && (
            <CelebrationPopup 
              message={celebrationMessage} 
              onDismiss={() => setCelebrationMessage(null)} 
            />
          )}
          {showGrandFinale && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-6"
            >
              <div className="glass-card p-10 text-center space-y-6 relative">
                 <div className="text-6xl mb-4 animate-bounce">🎊🌙💖</div>
                 <h2 className="text-3xl font-serif font-bold text-[#C2185B]">ALLLL DONE!!</h2>
                 <p className="font-accent italic text-lg leading-relaxed">
                   Amar lokki completed everything today! <br/>
                   I love you to the moon and back, forever and always 🌙💖✨
                 </p>
                 <button 
                   onClick={() => setShowGrandFinale(false)}
                   className="w-full bg-[#B76E79] text-white py-4 rounded-xl font-bold shadow-lg"
                 >
                   You're the best! 🥰
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
