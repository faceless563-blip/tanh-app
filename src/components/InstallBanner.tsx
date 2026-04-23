import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    const isDismissed = localStorage.getItem('tanha_install_banner_dismissed') === 'true';
    
    if (!isInstalled && !isDismissed) {
      // Detect platform
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setPlatform('ios');
        setShow(true);
      } else if (/android/.test(userAgent)) {
        setPlatform('android');
        // Android prompt is handled by beforeinstallprompt event
      } else {
        setPlatform('other');
        setShow(true);
      }
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (localStorage.getItem('tanha_install_banner_dismissed') !== 'true') {
        setShow(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('tanha_install_banner_dismissed', 'true');
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        handleDismiss();
      }
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-[2000] bg-gradient-to-r from-[#B76E79] to-[#C2185B] p-4 shadow-lg flex items-center justify-between gap-4 text-white"
        >
          <div className="flex-1 text-center font-nunito text-sm font-bold">
            {platform === 'ios' ? (
              <span>📲 Tap the share button ↑ then 'Add to Home Screen' to install 🌸</span>
            ) : platform === 'android' ? (
              <button onClick={handleInstall} className="underline decoration-white/50 underline-offset-4">
                📲 Install Tanha App 🌸
              </button>
            ) : (
              <span>📲 Install this app on your phone! Tap ··· then 'Add to Home Screen' 🌸</span>
            )}
          </div>
          <button onClick={handleDismiss} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
