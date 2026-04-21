import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Medicine, DoseLog, Prescription, MedicalReport } from '../types';
import { format, addDays, isSameDay, parseISO, startOfDay, isAfter, isBefore } from 'date-fns';
import { ChevronLeft, Plus, Pill, FileText, Activity, Trash2, Check, Clock, AlertCircle, Search, Camera, Sparkles, X, Heart } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onBack: () => void;
  triggerCelebration: (msg: string) => void;
}

const MEDICINE_COLORS = ['#B76E79', '#FFAB91', '#CE93D8', '#81C784', '#FFD54F', '#F48FB1', '#9C7BB5', '#F06292'];
const MED_TYPES = [
  { value: 'tablet', label: '💊 Tablet' },
  { value: 'syrup', label: '🧴 Syrup' },
  { value: 'injection', label: '💉 Injection' },
  { value: 'supplement', label: '🌿 Supplement' },
  { value: 'vitamin', label: '🍊 Vitamin' },
  { value: 'other', label: '💆 Other' }
];

export default function Medicines({ onBack, triggerCelebration }: Props) {
  const [activeTab, setActiveTab] = useState<'medicines' | 'prescriptions' | 'reports'>('medicines');
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('tanha_medicines');
    return saved ? JSON.parse(saved) : [];
  });
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => {
    const saved = localStorage.getItem('tanha_dose_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('tanha_prescriptions');
    return saved ? JSON.parse(saved) : [];
  });
  const [reports, setReports] = useState<MedicalReport[]>(() => {
    const saved = localStorage.getItem('tanha_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState<Partial<Medicine>>({
    type: 'tablet', color: MEDICINE_COLORS[0], frequency: 'once', 
    times: ['08:00'], withFood: 'any', isOngoing: true, startDate: format(new Date(), 'yyyy-MM-dd'),
    remindersEnabled: true, reminderOffset: 10, isPaused: false
  });
  
  const [aiAnalysis, setAiAnalysis] = useState<{ loading: boolean, result: any, disclaimerAccepted: boolean } | null>(null);

  const saveMeds = (updated: Medicine[]) => {
    setMedicines(updated);
    localStorage.setItem('tanha_medicines', JSON.stringify(updated));
  };

  const saveDoses = (updated: DoseLog[]) => {
      setDoseLogs(updated);
      localStorage.setItem('tanha_dose_logs', JSON.stringify(updated));
  };

  const generateDoses = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayObj = startOfDay(new Date());
    let updatedDoses = [...doseLogs];
    let changed = false;

    medicines.forEach(med => {
      if (med.isPaused) return;
      const start = startOfDay(parseISO(med.startDate));
      const end = med.endDate ? startOfDay(parseISO(med.endDate)) : null;

      if (isAfter(start, todayObj)) return;
      if (end && isAfter(todayObj, end)) return;

      // Check if scheduled today
      let isScheduled = true;
      if (med.frequency === 'specific') {
         const dayName = format(new Date(), 'EEEE');
         isScheduled = med.specificDays.includes(dayName);
      } else if (med.frequency === 'weekly') {
          const dayName = format(new Date(), 'EEEE');
          isScheduled = med.weeklyDay === dayName;
      }

      if (isScheduled) {
        med.times.forEach(time => {
           const exists = updatedDoses.some(d => d.medicineId === med.id && d.date === today && d.scheduledTime === time);
           if (!exists) {
              updatedDoses.push({
                 id: Math.random().toString(),
                 medicineId: med.id,
                 date: today,
                 scheduledTime: time,
                 status: 'pending',
                 takenAt: null,
                 reasonMissed: null
              });
              changed = true;
           }
        });
      }
    });

    if (changed) saveDoses(updatedDoses);
  };

  useEffect(() => { generateDoses(); }, [medicines]);

  const toggleDose = (id: string, status: 'taken' | 'missed' | 'late') => {
    const updated = doseLogs.map(d => d.id === id ? { ...d, status, takenAt: status === 'taken' ? new Date().toISOString() : null } : d);
    saveDoses(updated);
    if (status === 'taken') {
       triggerCelebration("💊 Done, Tanha! One step closer to feeling better 💕");
    }
  };

  const todayDoses = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return doseLogs.filter(d => d.date === today).sort((a,b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [doseLogs]);

  const progress = useMemo(() => {
    if (todayDoses.length === 0) return 0;
    const taken = todayDoses.filter(d => d.status === 'taken').length;
    return Math.round((taken / todayDoses.length) * 100);
  }, [todayDoses]);

  const runAnalysis = async (imageBase64: string) => {
    setAiAnalysis({ loading: true, result: null, disclaimerAccepted: false });
  };

  const performAiCall = async (imageBase64: string) => {
     try {
       const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
       const response = await ai.models.generateContent({
         model: "gemini-3-flash-preview",
         contents: [
           { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
           { text: `You are a warm, compassionate medical assistant named "Tanha AI". 
           Help Tanha understand this report in simple, caring terms. 
           STRICT RULES: Never diagnose. Never recommend medicines. NO jargon. Always include disclaimer.
           Format exactly as:
           📋 WHAT THIS REPORT SHOWS
           📊 YOUR VALUES AT A GLANCE
           🌸 WHAT THIS GENERALLY MEANS
           💡 GENERAL WELLNESS TIPS
           ⚕️ IMPORTANT DISCLAIMER` }
         ]
       });
       setAiAnalysis(prev => prev ? { ...prev, loading: false, result: response.text } : null);
     } catch (err) {
       console.error(err);
       setAiAnalysis(null);
       alert("The image might be unclear, Tanha 🌸 Try again with better lighting!");
     }
  };

  return (
    <div className="min-h-screen pt-4 pb-40 px-6 space-y-6 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-[#8B6F6F]"><ChevronLeft size={24} /></button>
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-[#2C1810]">Tanha Health 💊</h2>
            <p className="text-sm font-accent italic text-[#8B6F6F]">Stay strong, healthy, and beautiful 🌸</p>
          </div>
        </div>
        <button onClick={() => setShowAddForm(true)} className="text-[#B76E79]"><Plus size={28} /></button>
      </header>

      {/* Tabs */}
      <div className="grid grid-cols-3 bg-[#B76E79]/5 p-1 rounded-xl h-11">
         <button onClick={() => setActiveTab('medicines')} className={`text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'medicines' ? 'bg-[#B76E79] text-white shadow-sm' : 'text-[#8B6F6F]/60'}`}>Medicines</button>
         <button onClick={() => setActiveTab('prescriptions')} className={`text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'prescriptions' ? 'bg-[#B76E79] text-white shadow-sm' : 'text-[#8B6F6F]/60'}`}>Prescriptions</button>
         <button onClick={() => setActiveTab('reports')} className={`text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'reports' ? 'bg-[#B76E79] text-white shadow-sm' : 'text-[#8B6F6F]/60'}`}>Reports</button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'medicines' && (
          <motion.div key="meds" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
             {/* Progress Card */}
             <div className="glass-card p-6 space-y-4 shadow-sm border-none bg-white">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#8B6F6F]">
                   <span>{format(new Date(), 'EEEE, MMMM d')}</span>
                   <span>{todayDoses.filter(d => d.status === 'taken').length} of {todayDoses.length} doses done</span>
                </div>
                <div className="h-2 w-full bg-[#B76E79]/10 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-[#B76E79]" />
                </div>
                <p className="text-sm font-accent italic text-center text-[#2C1810]">
                   {progress === 100 ? "All done today!! My healthy queen 🥺👑💕" : 
                    progress > 50 ? "Almost there! So proud 💪" : 
                    progress > 0 ? "Good start! Keep going 💕" : "Start your medicines, Tanha 💊🌸"}
                </p>
             </div>

             {/* Doses List */}
             <div className="space-y-6">
                {['Morning', 'Afternoon', 'Night'].map(period => {
                   const doses = todayDoses.filter(d => {
                      const hour = parseInt(d.scheduledTime.split(':')[0]);
                      if (period === 'Morning') return hour < 12;
                      if (period === 'Afternoon') return hour >= 12 && hour < 18;
                      return hour >= 18;
                   });
                   if (doses.length === 0) return null;
                   return (
                     <div key={period} className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#8B6F6F] px-1">{period === 'Morning' ? '🌅 Morning' : period === 'Afternoon' ? '☀️ Afternoon' : '🌙 Night'}</h3>
                        {doses.map(dose => {
                          const med = medicines.find(m => m.id === dose.medicineId);
                          if (!med) return null;
                          return (
                            <div key={dose.id} className="glass-card p-4 flex items-center gap-4 border-l-[4px]" style={{ borderLeftColor: med.color }}>
                               <div className="flex-1 min-w-0">
                                  <p className="font-nunito font-bold text-[#2C1810]">{med.name}</p>
                                  <p className="text-[10px] text-[#8B6F6F] font-bold">{med.dosage} • {med.withFood === 'yes' ? 'With Food 🍽️' : med.withFood === 'no' ? 'Empty Stomach ⭕' : 'Anytime 🤷'}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-[10px] font-black text-[#8B6F6F] uppercase mb-1 flex items-center gap-1 justify-end"><Clock size={10} /> {dose.scheduledTime}</p>
                                  {dose.status === 'taken' ? (
                                    <span className="bg-[#B76E79] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">✅ Taken</span>
                                  ) : (
                                    <button 
                                      onClick={() => toggleDose(dose.id, 'taken')}
                                      className="bg-[#B76E79]/10 text-[#B76E79] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ring-1 ring-[#B76E79]/30 active:scale-95 transition-all"
                                    >
                                      💊 Take Now
                                    </button>
                                  )}
                               </div>
                            </div>
                          );
                        })}
                     </div>
                   );
                })}
             </div>
          </motion.div>
        )}

        {activeTab === 'prescriptions' && (
           <motion.div key="pres" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {prescriptions.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                  <FileText size={48} className="mx-auto mb-4" />
                  <p className="font-accent italic text-lg">No prescriptions saved yet, Tanha 🌸</p>
                </div>
              ) : (
                prescriptions.map(p => (
                  <div key={p.id} className="glass-card p-5 space-y-3">
                     <div className="flex justify-between items-start">
                        <div className="min-w-0">
                           <p className="font-nunito font-bold text-[#2C1810] text-lg">{p.doctorName}</p>
                           <p className="text-[10px] font-bold text-[#8B6F6F] uppercase tracking-widest">{p.specialization} • {p.date}</p>
                        </div>
                        <FileText size={20} className="text-[#B76E79]" />
                     </div>
                     <p className="text-sm font-bold text-[#C2185B] bg-[#C2185B]/5 px-3 py-2 rounded-xl">Target: {p.diagnosis}</p>
                     <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#B76E79]/10 text-[#B76E79] rounded-xl text-xs font-black uppercase tracking-widest">
                        <Sparkles size={14} /> Analyze with Tanha AI 🤖💕
                     </button>
                  </div>
                ))
              )}
           </motion.div>
        )}

        {activeTab === 'reports' && (
           <motion.div key="reps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                  <Activity size={48} className="mx-auto mb-4" />
                  <p className="font-accent italic text-lg">No reports saved yet 🔬</p>
                </div>
              ) : (
                reports.map(r => (
                  <div key={r.id} className="glass-card p-5 space-y-3">
                     <div className="flex justify-between items-start">
                        <div className="min-w-0">
                           <p className="font-serif font-bold text-[#2C1810] text-lg">{r.type}</p>
                           <p className="text-[10px] font-bold text-[#8B6F6F] uppercase tracking-widest">{r.labName} • {r.date}</p>
                        </div>
                        <Activity size={20} className={r.status === 'normal' ? 'text-green-500' : 'text-[#B76E79]'} />
                     </div>
                     <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                          r.status === 'normal' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {r.status === 'normal' ? '✅ Normal' : '🔍 Not Analyzed'}
                        </span>
                     </div>
                     <button 
                        onClick={() => runAnalysis('')}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#B76E79]/10 text-[#B76E79] rounded-xl text-xs font-black uppercase tracking-widest"
                     >
                        <Sparkles size={14} /> Analyze with Tanha AI 🤖💕
                     </button>
                  </div>
                ))
              )}
           </motion.div>
        )}
      </AnimatePresence>

      {/* Add Form (Medicine) */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setShowAddForm(false)} />
             <motion.div 
               initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
               className="relative w-full max-w-[480px] bg-white rounded-t-[32px] p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
             >
                <div className="w-12 h-1.5 bg-[#8B6F6F]/20 rounded-full mx-auto" />
                <h4 className="text-xl font-serif font-bold text-center">Add Medicine 💊</h4>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B6F6F]">Medicine Name</label>
                    <input type="text" placeholder="e.g. Paracetamol 🌸" value={newMed.name || ''} onChange={(e) => setNewMed({...newMed, name: e.target.value})} className="w-full bg-[#FDFAF7] p-4 rounded-xl font-bold text-[#2C1810]" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B6F6F]">Type</label>
                    <div className="flex flex-wrap gap-2">
                       {MED_TYPES.map(t => (
                         <button key={t.value} onClick={() => setNewMed({...newMed, type: t.value as any})} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${newMed.type === t.value ? 'bg-[#B76E79] text-white border-[#B76E79]' : 'bg-[#FDFAF7] border-transparent'}`}>{t.label}</button>
                       ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B6F6F]">Dosage</label>
                        <input type="text" placeholder="1 tablet" value={newMed.dosage || ''} onChange={(e) => setNewMed({...newMed, dosage: e.target.value})} className="w-full bg-[#FDFAF7] p-3 rounded-xl text-sm" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B6F6F]">Color</label>
                        <div className="flex flex-wrap gap-1">
                           {MEDICINE_COLORS.map(c => (
                             <button key={c} onClick={() => setNewMed({...newMed, color: c})} className={`w-6 h-6 rounded-full border-2 transition-all ${newMed.color === c ? 'border-black' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B6F6F]">Time</label>
                     <input type="time" value={newMed.times?.[0]} onChange={(e) => setNewMed({...newMed, times: [e.target.value]})} className="w-full bg-[#FDFAF7] p-3 rounded-xl" />
                  </div>

                  <div className="space-y-4 pt-4">
                    <button 
                      onClick={() => {
                        const med: Medicine = {
                          ...newMed as Medicine,
                          id: Math.random().toString(),
                          createdAt: new Date().toISOString()
                        };
                        saveMeds([...medicines, med]);
                        setShowAddForm(false);
                        triggerCelebration("Added! Medicine is now tracked 💊🌸");
                      }}
                      className="w-full bg-[#B76E79] text-white py-5 rounded-2xl font-bold"
                    >
                      Start Tracking 💊💕
                    </button>
                  </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Analysis Overlay */}
      <AnimatePresence>
        {aiAnalysis && (
          <div className="fixed inset-0 z-[500] bg-white flex flex-col p-6 overflow-y-auto no-scrollbar">
             {!aiAnalysis.disclaimerAccepted ? (
                <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center pt-20">
                   <div className="w-full bg-[#C2185B] text-white p-6 rounded-3xl font-serif text-xl font-bold flex flex-col items-center gap-4">
                      <span>🏥 Please Read First, Tanha</span>
                   </div>
                   <div className="space-y-4 px-4 font-nunito font-semibold text-[#2C1810]">
                      <p>This analysis is for general understanding only.</p>
                      <p>It is NOT a medical diagnosis or professional medical advice.</p>
                      <p>No AI system can replace a qualified certified doctor.</p>
                      <p>Always share your reports with your doctor. Their opinion is final. Always.</p>
                      <p className="text-[#B76E79] font-bold">Your health is precious, Tanha 🌸 Always trust your doctor first 💕</p>
                   </div>
                   <button 
                     onClick={() => {
                       setAiAnalysis(p => p ? { ...p, disclaimerAccepted: true } : null);
                       performAiCall(''); // Base64 would go here
                     }}
                     className="w-full bg-[#B76E79] text-white py-5 rounded-2xl font-bold shadow-xl"
                   >
                     I understand 💕
                   </button>
                </div>
             ) : (
                <div className="space-y-6 pt-12">
                   <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-serif font-bold text-[#2C1810]">Tanha AI 🤖💕</h2>
                     <button onClick={() => setAiAnalysis(null)} className="p-2 rounded-full bg-gray-100"><X size={20} /></button>
                   </div>
                   
                   {aiAnalysis.loading ? (
                     <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                           <Sparkles size={48} className="text-[#B76E79]" />
                        </motion.div>
                        <p className="font-accent italic text-[#8B6F6F]">Analyzing the values carefully... 📊</p>
                     </div>
                   ) : (
                     <div className="space-y-6 whitespace-pre-wrap font-nunito leading-relaxed text-[#2C1810]">
                        {aiAnalysis.result || "No analysis found."}
                     </div>
                   )}
                </div>
             )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
