export interface Task {
  id: string;
  title: string;
  completed: boolean;
  emoji: string;
  time?: string;
  type: 'anchor' | 'today';
}

export type View = 
  | 'home' 
  | 'settings' 
  | 'more' 
  | 'onboarding' 
  | 'cycle' 
  | 'hair' 
  | 'dates' 
  | 'shopping'
  | 'self-care'
  | 'watch'
  | 'diary'
  | 'medicines'
  | 'wish-box'
  | 'sleep'
  | 'vault'
  | 'birthday-journey';

export interface BirthdayJourneyNote {
  day: number;
  message: string;
  isVoice?: boolean;
}

export interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationMinutes: number;
  qualityRating: number;
  wakingFeelings: string[];
  sleepDisruptors: string[];
  notes: string;
  cyclePhase: string;
}

export interface SleepSettings {
  targetBedtime: string;
  targetWakeTime: string;
}

export interface LoveLetter {
  id: string;
  title: string;
  content: string;
  moodColor: string;
  accent: string;
  firstLine: string;
}

export interface Wish {
  id: string;
  content: string;
  category: 'travel' | 'fashion' | 'feeling' | 'other';
  date: string;
  isGranted: boolean;
}

export interface UserSettings {
  tanha_onboarding_complete: boolean;
  tanha_welcome_shown: boolean;
  tanha_last_open_date: string;
}

export interface DayInfo {
  greeting: string;
  dateStr: string;
  vibe: string;
  isDark: boolean;
  gradient: string;
}

export interface CycleSettings {
  lastPeriodStart: string;
  cycleLength: number;
  periodDuration: number;
}

export interface CycleLog {
  date: string;
  flow?: string;
  moods: string[];
  symptoms: string[];
  waterLiters: number;
  notes: string;
}

export interface HairCareLog {
  type: 'shampoo' | 'oil';
  date: string;
  loggedAt: string;
}

export interface ImportantDate {
  id: string;
  title: string;
  category: 'anniversary' | 'birthday' | 'appointment' | 'milestone' | 'other';
  date: string | null;
  notes: string;
  repeat: 'none' | 'yearly' | 'monthly' | 'weekly';
  createdAt: string;
  needsDate?: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  isUrgent: boolean;
  isBought: boolean;
  addedAt: string;
  boughtAt: string | null;
}

export interface BathLog {
  date: string;
  loggedAt: string;
}

export interface SelfCareDailyLog {
  moisturizer: boolean;
  facewash: boolean;
  nails: boolean;
  teethMorning: boolean;
  teethNight: boolean;
  sunscreen: boolean;
  vitamins: boolean;
  water: boolean;
}

export interface WatchItem {
  id: string;
  title: string;
  type: 'movie' | 'series';
  posterBase64: string | null;
  genres: string[];
  language: string;
  platform: string;
  status: 'want' | 'watching' | 'finished' | 'hold' | 'dropped' | 'unreleased';
  totalSeasons: number | null;
  totalEpisodes: number | null;
  currentSeason: number | null;
  currentEpisode: number | null;
  rating: number | null;
  review: string | null;
  recommendedBy: string | null;
  wouldRewatch: 'yes' | 'maybe' | 'no' | null;
  isFavorite: boolean;
  dateStarted: string | null;
  dateFinished: string | null;
  dateAdded: string;
  updatedAt: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  writtenAt: string;
  updatedAt: string;
  title: string | null;
  body: string;
  mood: string | null;
  weather: string | null;
  type: 'normal' | 'gratitude' | 'dear_diary' | 'dream' | 'letter' | 'rant';
  tags: string[];
  photoBase64s: string[];
  isLocked: boolean;
  isFavorite: boolean;
  wordCount: number;
}

export interface Medicine {
  id: string;
  name: string;
  type: 'tablet' | 'syrup' | 'injection' | 'supplement' | 'vitamin' | 'other';
  dosage: string;
  color: string;
  frequency: 'once' | 'twice' | 'three' | 'four' | 'specific' | 'weekly' | 'needed';
  specificDays: string[];
  weeklyDay: string | null;
  times: string[];
  withFood: 'yes' | 'no' | 'any';
  isOngoing: boolean;
  startDate: string;
  durationValue: number | null;
  durationUnit: 'days' | 'weeks' | 'months' | null;
  endDate: string | null;
  remindersEnabled: boolean;
  reminderOffset: number;
  notes: string;
  isPaused: boolean;
  createdAt: string;
}

export interface DoseLog {
  id: string;
  medicineId: string;
  date: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'missed' | 'late';
  takenAt: string | null;
  reasonMissed: string | null;
}

export interface Prescription {
  id: string;
  doctorName: string;
  specialization: string;
  hospitalName: string;
  date: string;
  diagnosis: string;
  photoBase64s: string[];
  notes: string;
  analysis: string | null;
  createdAt: string;
}

export interface MedicalReport {
  id: string;
  type: string;
  labName: string;
  date: string;
  doctorName: string;
  photoBase64s: string[];
  notes: string;
  status: 'pending' | 'normal' | 'warning';
  analysis: string | null;
  createdAt: string;
}
