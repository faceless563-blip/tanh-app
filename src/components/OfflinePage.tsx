import React from 'react';
import { motion } from 'motion/react';

export default function OfflinePage() {
  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#FFF0F3] p-8 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-8xl animate-bounce">🌸</div>
        <h1 className="text-3xl font-serif font-bold text-[#B76E79]">You are offline, Tanha 💕</h1>
        <p className="font-accent italic text-lg leading-relaxed text-[#2C1810]">
          "But your app still works! 🌟<br/>
          All your data is saved on your phone.<br/>
          Everything will sync when you are back online 🌸"
        </p>
        <div className="pt-8">
          <div className="inline-block px-6 py-3 bg-[#B76E79]/10 rounded-full text-[#B76E79] font-bold animate-pulse">
            Waiting for connection...
          </div>
        </div>
      </motion.div>
    </div>
  );
}
