import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, ArrowRight, ShieldCheck, Fingerprint } from 'lucide-react';

interface Props {
  onUnlock: () => void;
}

export default function Gatekeeper({ onUnlock }: Props) {
  const [password, setPassword] = useState('');
  const [storedPassword, setStoredPassword] = useState<string | null>(localStorage.getItem('tanha_app_password'));
  const [error, setError] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(!storedPassword);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAction = () => {
    if (isSettingUp) {
      if (password.length < 4) {
        setError(true);
        setTimeout(() => setError(false), 500);
        return;
      }
      if (password !== confirmPassword) {
        setError(true);
        setTimeout(() => setError(false), 500);
        return;
      }
      localStorage.setItem('tanha_app_password', password);
      onUnlock();
    } else {
      if (password === storedPassword) {
        onUnlock();
      } else {
        setError(true);
        setPassword('');
        setTimeout(() => setError(false), 500);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAction();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#FDFAF7] overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF0F3] via-[#FFE4EC] to-[#F8E8FF]" />
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#B76E79]/20 blur-[120px] rounded-full animate-breathing" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#C2185B]/10 blur-[120px] rounded-full animate-breathing" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        className="relative z-10 w-full max-w-md px-8 py-12"
      >
        <div className="text-center mb-10 space-y-4">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="w-20 h-20 bg-white shadow-2xl rounded-3xl mx-auto flex items-center justify-center text-[#B76E79] mb-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#B76E79]/5 to-transparent" />
            <AnimatePresence mode="wait">
              {isSettingUp ? (
                <motion.div key="lock" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <ShieldCheck size={32} strokeWidth={1.5} />
                </motion.div>
              ) : (
                <motion.div key="unlock" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Lock size={32} strokeWidth={1.5} className={error ? 'text-red-400' : ''} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <h1 className="text-3xl font-serif font-bold text-[#2C1810]">
            {isSettingUp ? 'Secure Your Space 🌸' : 'Welcome Back, Tanha'}
          </h1>
          <p className="text-sm font-accent italic text-[#8B6F6F]">
            {isSettingUp ? 'Set a password to keep your memories private.' : 'Enter your password to proceed.'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isSettingUp ? "New Password" : "Password"}
              autoFocus
              className={`w-full h-16 bg-white/60 backdrop-blur-xl border-2 rounded-2xl px-6 font-mono text-center text-2xl tracking-[0.5em] transition-all focus:outline-none focus:ring-4 focus:ring-[#B76E79]/10 ${error ? 'border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.2)]' : 'border-[#B76E79]/5 focus:border-[#B76E79]/30'}`}
            />
            {!isSettingUp && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B76E79]/30">
                <Fingerprint size={20} />
              </div>
            )}
          </div>

          {isSettingUp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
            >
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Confirm Password"
                className={`w-full h-16 bg-white/60 backdrop-blur-xl border-2 rounded-2xl px-6 font-mono text-center text-2xl tracking-[0.5em] transition-all focus:outline-none focus:ring-4 focus:ring-[#B76E79]/10 ${error && password !== confirmPassword ? 'border-red-400' : 'border-[#B76E79]/5 focus:border-[#B76E79]/30'}`}
              />
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAction}
            className="w-full h-16 bg-[#B76E79] text-white rounded-2xl font-bold shadow-xl shadow-[#B76E79]/20 flex items-center justify-center gap-3 group transition-colors hover:bg-[#A65E69]"
          >
            <span>{isSettingUp ? 'Set & Enter' : 'Unlock App'}</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        <div className="mt-12 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#B76E79]/40 flex items-center justify-center gap-2">
                <span className="w-8 h-[1px] bg-current opacity-20" />
                Designed For Forever
                <span className="w-8 h-[1px] bg-current opacity-20" />
            </p>
        </div>
      </motion.div>

      {/* Floating Sparkles for Cinema Feel */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
            <motion.div 
                key={i}
                className="absolute w-1 h-1 bg-[#B76E79] rounded-full opacity-20"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                }}
                animate={{
                    opacity: [0.1, 0.4, 0.1],
                    scale: [1, 1.5, 1],
                }}
                transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                }}
            />
        ))}
      </div>
    </div>
  );
}
