import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Music, Volume2, SkipForward, SkipBack } from 'lucide-react';

const AMBIENT_TRACKS = [
  { 
    id: 'ethereal', 
    name: 'Ethereal Dreams ✨', 
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c35078174a.mp3' 
  },
  { 
    id: 'piano', 
    name: 'Soft Midnight Piano 🎹', 
    url: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d0c6ff1bab.mp3' 
  },
  { 
    id: 'rain', 
    name: 'Nature Sounds 🌧️', 
    url: 'https://cdn.pixabay.com/audio/2021/09/06/audio_830364f308.mp3' 
  },
];

export default function LofiPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    const nextIdx = (currentTrack + 1) % AMBIENT_TRACKS.length;
    setCurrentTrack(nextIdx);
    // Auto-play next track if was playing
    if (isPlaying) {
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const prevTrack = () => {
    const prevIdx = (currentTrack - 1 + AMBIENT_TRACKS.length) % AMBIENT_TRACKS.length;
    setCurrentTrack(prevIdx);
    if (isPlaying) {
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-[999]">
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="absolute bottom-16 right-0 bg-white/80 backdrop-blur-xl border border-white/40 p-4 rounded-3xl shadow-2xl w-56"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-[#B76E79] flex items-center justify-center text-white ${isPlaying ? 'animate-spin-slow' : ''}`}>
                  <Music size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-black tracking-widest text-[#B76E79]">Atmosphere</p>
                  <p className="text-xs font-bold text-[#2C1810] truncate">{AMBIENT_TRACKS[currentTrack].name}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-[#B76E79]/10 p-2 rounded-2xl">
                <div className="flex items-center gap-1">
                  <button onClick={prevTrack} className="p-1.5 hover:bg-[#B76E79]/20 rounded-full transition-colors text-[#B76E79]">
                    <SkipBack size={14} />
                  </button>
                  <button onClick={togglePlay} className="w-9 h-9 bg-[#B76E79] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                    {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  </button>
                  <button onClick={nextTrack} className="p-1.5 hover:bg-[#B76E79]/20 rounded-full transition-colors text-[#B76E79]">
                    <SkipForward size={14} />
                  </button>
                </div>
                <div className="pr-1">
                   <Volume2 size={14} className="text-[#B76E79]" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowControls(!showControls)}
        className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-md border border-white/40 shadow-xl relative group`}
      >
        <motion.div
          animate={isPlaying ? { rotate: 360 } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="text-[#B76E79]"
        >
          <Music size={20} />
        </motion.div>
        {isPlaying && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        )}
      </motion.button>

      <audio 
        ref={audioRef}
        src={AMBIENT_TRACKS[currentTrack].url}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}
