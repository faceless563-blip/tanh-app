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
import WishBoxSheet from './components/WishBoxSheet';
import SleepTracker from './components/SleepTracker';
import LoveLetterVault from './components/LoveLetterVault';
import AppTour from './components/AppTour';
import BirthdayJourney from './components/BirthdayJourney';
import NewFeaturesPopup from './components/NewFeaturesPopup';
import BackgroundParticles from './components/BackgroundParticles';
import InteractionOverlay from './components/InteractionOverlay';
import BottomNav from './components/BottomNav';
import CelebrationPopup from './components/CelebrationPopup';
import WelcomePopup from './components/WelcomePopup';
import OfflinePage from './components/OfflinePage';
import InstallBanner from './components/InstallBanner';
import { format } from 'date-fns';

export default function App() {
  const [currentView, setView] = useState<View>('home');
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    return localStorage.getItem('tanha_onboarding_complete') === 'true';
  });
  const [welcomeShown, setWelcomeShown] = useState<boolean>(() => {
    return localStorage.getItem('tanha_welcome_shown') === 'true';
  });
  
  const [showNewFeatures, setShowNewFeatures] = useState<boolean>(() => {
    return localStorage.getItem('tanha_new_features_v2_shown') !== 'true';
  });

  const [showTour, setShowTour] = useState<boolean>(false);
  const [isWishBoxOpen, setIsWishBoxOpen] = useState(false);

  const [anchorTasks, setAnchorTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tanha_anchor_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [streak, setStreak] = useState<number>(0);
  const [showVaultHint, setShowVaultHint] = useState(false);

  useEffect(() => {
    // Basic streak calculation from localStorage 'tanha_streak_data'
    // For demo purpose, we check if 7 days done
    const streakData = JSON.parse(localStorage.getItem('tanha_streak_data') || '{"count": 0, "lastDate": ""}');
    setStreak(streakData.count);
    
    // Vault hint reveal
    if (streakData.count >= 7 && localStorage.getItem('tanha_vault_hint_shown') !== 'true') {
      setShowVaultHint(true);
    }
  }, []);
  const [todayTasks, setTodayTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tanha_today_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [showGrandFinale, setShowGrandFinale] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const dayInfo = useMemo(() => getDayInfo(), [new Date().getHours()]);

  // Midnight Reset Logic Phase 4
  useEffect(() => {
    const lastOpen = localStorage.getItem('tanha_last_open_date');
    const today = new Date().toDateString();
    
    if (lastOpen && lastOpen !== today) {
      setTodayTasks([]); 
      localStorage.setItem('tanha_last_open_date', today);
      
      // Phase 4 Reset Completions
      localStorage.removeItem('tanha_bath_logs_daily'); // Reset bath
      localStorage.removeItem('tanha_self_care_daily'); // Reset self care
      localStorage.removeItem('tanha_dismissed_nudges'); // Clear nudges
      
      // Medicine doses generation logic...
      // Streaks updates...
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
        const streakData = JSON.parse(localStorage.getItem('tanha_streak_data') || '{"count": 0, "lastDate": ""}');
        const todayStr = new Date().toDateString();
        if (streakData.lastDate !== todayStr) {
          streakData.count += 1;
          streakData.lastDate = todayStr;
          localStorage.setItem('tanha_streak_data', JSON.stringify(streakData));
          setStreak(streakData.count);
          if (streakData.count >= 7 && localStorage.getItem('tanha_vault_hint_shown') !== 'true') {
             setShowVaultHint(true);
          }
        }
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
      className="min-h-screen transition-all duration-[2000ms] ease-in-out relative overflow-hidden" 
      style={{ background: dayInfo.gradient }}
    >
      <InstallBanner />
      {!isOnline && <OfflinePage />}
      <InteractionOverlay />
      <BackgroundParticles dayInfo={dayInfo} />
      <div className="grain-overlay" />
      <div 
        className="max-container flex flex-col pt-12 pb-32 overflow-y-auto no-scrollbar relative z-10"
        style={{ color: dayInfo.isDark ? '#FFFFFF' : '#2C1810' }}
      >
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ filter: "blur(20px)", opacity: 0, scale: 1.1 }}
              animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
              exit={{ filter: "blur(20px)", opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              <Home 
                tasks={todayTasks} 
                onToggle={handleTaskToggle}
                onAddTask={(t) => setTodayTasks(prev => [...prev, t])}
                dayInfo={dayInfo}
                setView={setView}
                setIsWishBoxOpen={setIsWishBoxOpen}
                streak={streak}
              />
            </motion.div>
          )}
          {currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <Settings 
                anchorTasks={anchorTasks} 
                onUpdateAnchors={(newAnchors) => {
                  setAnchorTasks(newAnchors);
                  localStorage.setItem('tanha_anchor_tasks', JSON.stringify(newAnchors));
                }}
                onBack={() => setView('home')}
                onRestartTour={() => {
                  setView('home');
                  setShowTour(true);
                }}
              />
            </motion.div>
          )}
          {currentView === 'more' && (
            <motion.div
              key="more"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <More setView={setView} />
            </motion.div>
          )}
          {/* ... keeping other views but wrapping them for liquid feel ... */}
          {currentView === 'cycle' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="cycle"><CycleTracker onBack={() => setView('more')} /></motion.div>}
          {currentView === 'hair' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="hair"><HairCare onBack={() => setView('more')} /></motion.div>}
          {currentView === 'dates' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="dates"><ImportantDates onBack={() => setView('more')} /></motion.div>}
          {currentView === 'shopping' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="shopping"><ShoppingList onBack={() => setView('more')} /></motion.div>}
          {currentView === 'self-care' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="self-care"><SelfCare onBack={() => setView('more')} triggerCelebration={triggerCelebration} /></motion.div>}
          {currentView === 'watch' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="watch"><WatchWorld onBack={() => setView('more')} triggerCelebration={triggerCelebration} /></motion.div>}
          {currentView === 'diary' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="diary"><Diary onBack={() => setView('more')} triggerCelebration={triggerCelebration} /></motion.div>}
          {currentView === 'medicines' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="medicines"><Medicines onBack={() => setView('more')} triggerCelebration={triggerCelebration} /></motion.div>}
          {currentView === 'sleep' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="sleep"><SleepTracker onBack={() => setView('more')} dayInfo={dayInfo} /></motion.div>}
          {currentView === 'vault' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="vault"><LoveLetterVault onBack={() => setView('more')} /></motion.div>}
          {currentView === 'birthday-journey' && (
            <motion.div 
              key="birthday-journey"
              initial={{ opacity: 0, x: 100 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <BirthdayJourney onBack={() => setView('home')} />
            </motion.div>
          )}
        </AnimatePresence>

        <WishBoxSheet isOpen={isWishBoxOpen} onClose={() => setIsWishBoxOpen(false)} />

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
              // Start tour after welcome
              if (localStorage.getItem('tanha_tour_shown') !== 'true') {
                setTimeout(() => setShowTour(true), 1000);
              }
            }} />
          )}

          {welcomeShown && showNewFeatures && (
            <NewFeaturesPopup 
              isOpen={showNewFeatures} 
              onDismiss={(openWish) => {
                setShowNewFeatures(false);
                localStorage.setItem('tanha_new_features_v2_shown', 'true');
                if (openWish) setIsWishBoxOpen(true);
              }} 
            />
          )}

          {showTour && (
            <AppTour onComplete={() => {
              setShowTour(false);
              localStorage.setItem('tanha_tour_shown', 'true');
              triggerCelebration("Tour complete! Now go show today who is boss, Tanha 💪💖");
            }} />
          )}

          {showVaultHint && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="fixed inset-0 z-[2600] flex items-center justify-center bg-black/60 p-8"
             >
                <div className="glass-card p-10 text-center space-y-6 relative border-[#FFD54F]/20">
                   <div className="text-6xl mb-4 animate-pulse">💌</div>
                   <h2 className="text-2xl font-serif font-bold text-[#B76E79]">A Message for Tanha...</h2>
                   <p className="font-accent italic text-lg leading-relaxed text-[#2C1810]">
                     "Tanha... you have been so consistent 🥺<br/>
                     I left something for you somewhere in this app.<br/>
                     Find it 💌"
                   </p>
                   <button 
                     onClick={() => {
                       setShowVaultHint(false);
                       localStorage.setItem('tanha_vault_hint_shown', 'true');
                     }}
                     className="w-full bg-[#B76E79] text-white py-4 rounded-xl font-bold shadow-lg"
                   >
                     I will find it! 🌸
                   </button>
                </div>
             </motion.div>
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
