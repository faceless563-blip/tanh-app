import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { DayInfo } from '../types';

interface Props {
  dayInfo: DayInfo;
}

const BackgroundParticles: React.FC<Props> = ({ dayInfo }) => {
  const isNight = dayInfo.isDark;
  
  // Use useMemo to prevent re-rendering particles on every state change
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      size: Math.random() * (isNight ? 3 : 20) + (isNight ? 1 : 10),
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
      rotation: Math.random() * 360,
    }));
  }, [isNight]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            opacity: 0, 
            x: `${p.left}vw`, 
            y: '-10vh',
            rotate: p.rotation 
          }}
          animate={{ 
            opacity: [0, 0.4, 0.4, 0],
            y: '110vh',
            x: `${p.left + (Math.random() * 10 - 5)}vw`,
            rotate: p.rotation + 360
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay,
            ease: "linear"
          }}
          className="absolute"
          style={{ willChange: 'transform, opacity' }}
        >
          {isNight ? (
            <div 
              style={{ width: p.size, height: p.size }} 
              className="bg-white rounded-full blur-[1px] shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            />
          ) : (
            <div className="text-rose-300 opacity-60" style={{ fontSize: p.size }}>
              🌸
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default BackgroundParticles;
