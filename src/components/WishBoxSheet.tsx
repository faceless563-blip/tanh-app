import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Send } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishBoxSheet({ isOpen, onClose }: Props) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Say something first, Tanha 🌸');
      return;
    }

    // Immediately show success
    setIsSuccess(true);
    
    // Silent background send
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'origin': 'http://localhost'
        },
        body: JSON.stringify({
          service_id: (import.meta as any).env.VITE_EMAILJS_SERVICE_ID,
          template_id: (import.meta as any).env.VITE_EMAILJS_TEMPLATE_ID,
          user_id: (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY,
          template_params: {
            message: message,
            time: new Date().toString()
          }
        })
      });
    } catch (e) {
      // Silent fail
      console.log('Silent fail');
    }

    // Auto close after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
      setMessage('');
      onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-[480px] bg-[#FDFAF7] rounded-t-[32px] p-8 shadow-2xl pointer-events-auto min-h-[400px]"
          >
            <div className="w-12 h-1.5 bg-[#8B6F6F]/20 rounded-full mx-auto mb-8" />
            
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-serif font-bold text-[#B76E79]">What is on your mind, Tanha? 🌸</h2>
                    <p className="text-sm font-accent italic text-[#8B6F6F]">A problem? A wish? Anything at all — just say it 💕</p>
                  </div>

                  <div className="relative">
                    <textarea 
                      autoFocus
                      value={message}
                      onChange={(e) => { setMessage(e.target.value); setError(''); }}
                      placeholder="Type anything here... I am listening 🥺"
                      className="w-full min-h-[180px] p-6 rounded-3xl bg-[#FFFEF7] border border-[#B76E79]/10 font-accent italic text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#B76E79]/40 transition-all no-scrollbar text-[#2C1810]"
                    />
                    {error && (
                      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-[#C2185B] font-bold text-center mt-2">{error}</motion.p>
                    )}
                  </div>

                  <button 
                    onClick={handleSend}
                    className="w-full bg-[#B76E79] text-white py-5 rounded-full font-bold shadow-xl shadow-[#B76E79]/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Send size={20} className="ml-1" /> Send 💌
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center space-y-6"
                >
                  <motion.div 
                    animate={{ 
                      y: [0, -20, 0],
                      rotate: [0, 10, -10, 0]
                    }} 
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-7xl relative"
                  >
                    💌
                    <div className="absolute inset-0 flex items-center justify-center">
                       {[...Array(5)].map((_, i) => (
                         <motion.div
                           key={i}
                           initial={{ opacity: 0, scale: 0 }}
                           animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], x: (i - 2) * 40, y: -60 }}
                           transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                           className="absolute text-2xl"
                         >
                           💖
                         </motion.div>
                       ))}
                    </div>
                  </motion.div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-serif font-bold text-[#B76E79]">Sent! 💖</h2>
                    <p className="text-lg font-accent italic text-[#2C1810] leading-relaxed">
                      Your message is on its way 🌸<br/>
                      Someone who loves you is listening, always 🥺
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
