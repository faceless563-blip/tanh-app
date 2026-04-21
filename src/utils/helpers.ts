import { DayInfo } from '../types';

export const getDayInfo = (): DayInfo => {
  const now = new Date();
  const hour = now.getHours();
  
  let gradient = '';
  let vibe = '';
  let isDark = false;
  let greeting = '';

  if (hour >= 5 && hour < 7) {
    gradient = 'linear-gradient(to bottom, #FFECD2, #FCB69F)';
    vibe = 'Soft Dawn 🌅';
    greeting = 'Good Morning, Tanha ☀️';
  } else if (hour >= 7 && hour < 12) {
    gradient = 'linear-gradient(to bottom, #FFF0F3, #FFD6E0)';
    vibe = 'Fresh Bloom 🌸';
    greeting = 'Good Morning, Tanha ☀️';
  } else if (hour >= 12 && hour < 16) {
    gradient = 'linear-gradient(to bottom, #FFF9C4, #FFCCBC)';
    vibe = 'Golden Hour ☀️';
    greeting = 'Good Afternoon, Tanha 🌤️';
  } else if (hour >= 16 && hour < 18) {
    gradient = 'linear-gradient(to bottom, #F8BBD9, #E1BEE7)';
    vibe = 'Rose Dusk 🌺';
    greeting = 'Good Afternoon, Tanha 🌤️';
  } else if (hour >= 18 && hour < 21) {
    gradient = 'linear-gradient(to bottom, #E8D5F5, #F8BBD9)';
    vibe = 'Twilight Petals 🌙';
    greeting = 'Good Evening, Tanha 🌸';
  } else if (hour >= 21) {
    gradient = 'linear-gradient(to bottom, #3D1A4A, #6B2D6B)';
    vibe = 'Starlight 🌟';
    greeting = 'Good Night, Tanha 🌙';
    isDark = true;
  } else {
    gradient = 'linear-gradient(to bottom, #1A0A1E, #3D1535)';
    vibe = 'Midnight Rose 🌹';
    greeting = 'Good Night, Tanha 🌙';
    isDark = true;
  }

  const dateStr = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return { greeting, dateStr, vibe, isDark, gradient };
};

export const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};
