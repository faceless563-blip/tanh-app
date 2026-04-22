import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X, Heart } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  text: string;
  position: 'top' | 'bottom' | 'center';
}

const STEPS: TourStep[] = [
  {
    targetId: 'header-greeting',
    title: 'This is your little corner 🌸',
    text: 'This is your little corner of the world, Tanha 🌸 Every day starts here, just for you — made with all my love 💖',
    position: 'bottom'
  },
  {
    targetId: 'love-note-card',
    title: 'A new love note 💕',
    text: 'A new love note from your husband every single day 💕 Different quote, same love ❤️',
    position: 'bottom'
  },
  {
    targetId: 'progress-card',
    title: 'Watch it grow 🥰',
    text: 'This fills up as you finish your tasks! Watch it grow 🥰 Every tick makes me prouder 💪',
    position: 'bottom'
  },
  {
    targetId: 'anchor-tasks-section',
    title: 'Everyday habits 🔒',
    text: 'These are your everyday habits 🔒 They show up automatically every single morning — no setup needed 💕',
    position: 'top'
  },
  {
    targetId: 'today-tasks-section',
    title: 'Your day lives here ✨',
    text: 'And this is where your day lives ✨ Add anything extra for today right here using the + button 🌸',
    position: 'top'
  },
  {
    targetId: 'first-chore-checkbox',
    title: 'Tick this when done 💪',
    text: 'Tick this when you are done 💪 And brace yourself... something special happens 😏🎉',
    position: 'top'
  },
  {
    targetId: 'streak-counter',
    title: 'The Daily Flame 🔥',
    text: 'Your streak grows every day you complete all anchor tasks 🔥 How high can you go? 😍',
    position: 'bottom'
  },
  {
    targetId: 'nav-more-tab',
    title: 'Explore everything else 🌸',
    text: 'And over here is everything else 🌸 Cycle tracker, diary, medicines, watch world and so much more 💖\n\nOkay Tanha, you are all set! 🌟 This app is yours. Forever. 💌',
    position: 'top'
  }
];

interface Props {
  onComplete: () => void;
}

export default function AppTour({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const updateSpotlight = () => {
    const el = document.getElementById(STEPS[currentStep].targetId);
    if (el) {
      setSpotlightRect(el.getBoundingClientRect());
    } else {
      setSpotlightRect(null);
    }
  };

  useEffect(() => {
    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  // Skip tour logic can be added if needed, but per spec "Let us go!" is last step.

  return (
    <div className="fixed inset-0 z-[3000] pointer-events-none">
      {/* Background Overlay with Spotlight */}
      <div 
        className="absolute inset-0 bg-black/75 transition-all duration-500 pointer-events-auto"
        style={{
          clipPath: spotlightRect 
            ? `path('M 0 0 h 100vw v 100vh h -100vw v -100vh M ${spotlightRect.left - 10} ${spotlightRect.top - 10} h ${spotlightRect.width + 20} a 24 24 0 0 1 24 24 v ${spotlightRect.height + 20} a 24 24 0 0 1 -24 24 h -${spotlightRect.width + 20} a 24 24 0 0 1 -24 -24 v -${spotlightRect.height + 20} a 24 24 0 0 1 24 -24 Z')`
            : 'none',
          fillRule: 'evenodd'
        }}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="absolute z-10 w-[280px] pointer-events-auto shadow-2xl"
          style={{
            left: spotlightRect ? Math.max(20, Math.min(window.innerWidth - 300, spotlightRect.left + (spotlightRect.width / 2) - 140)) : '50%',
            top: spotlightRect 
              ? (STEPS[currentStep].position === 'bottom' 
                  ? spotlightRect.bottom + 24 
                  : spotlightRect.top - 200)
              : '50%',
            transform: !spotlightRect ? 'translate(-50%, -50%)' : 'none'
          }}
        >
          <div className="bg-white rounded-[24px] p-6 shadow-2xl border border-[#B76E79]/10 relative group">
             {/* Small handle dot */}
             <div 
              className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-[#B76E79]/5 ${STEPS[currentStep].position === 'bottom' ? '-top-2' : '-bottom-2'}`}
             />
             
             <div className="space-y-3">
                <h3 className="text-lg font-serif font-bold text-[#B76E79]">{STEPS[currentStep].title}</h3>
                <p className="text-sm font-nunito font-semibold text-[#2C1810] leading-relaxed whitespace-pre-line">
                  {STEPS[currentStep].text}
                </p>
                
                <div className="flex items-center justify-between pt-4">
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#8B6F6F] uppercase tracking-wider">{currentStep + 1} / {STEPS.length}</span>
                      <div className="flex gap-1">
                         {STEPS.map((_, i) => (
                           <div key={i} className={`w-1 h-1 rounded-full ${i === currentStep ? 'bg-[#B76E79] scale-150' : 'bg-[#B76E79]/20'}`} />
                         ))}
                      </div>
                   </div>
                   <button 
                    onClick={handleNext}
                    className="bg-[#B76E79] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#B76E79]/20 flex items-center gap-1 active:scale-95 transition-transform"
                   >
                     {currentStep === STEPS.length - 1 ? 'Let us go! 🌸' : 'Next 💕'}
                   </button>
                </div>
             </div>
          </div>
          
          {currentStep < STEPS.length - 1 && (
            <button 
              onClick={onComplete}
              className="mt-4 w-full text-center text-white/50 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
              Skip tour
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
