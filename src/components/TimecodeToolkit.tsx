import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Download, Sun, Moon, LayoutDashboard, Plus, Minus, ArrowRight, RefreshCw } from 'lucide-react';
import ToolSidebar from './ToolSidebar';

export default function TimecodeToolkit({ setPage, isDark, toggleTheme }: { setPage: (p: string) => void, isDark?: boolean, toggleTheme?: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tc1, setTc1] = useState('00:00:00:00');
  const [tc2, setTc2] = useState('00:00:00:00');
  const [fps, setFps] = useState(24);
  const [result, setResult] = useState('00:00:00:00');
  const [history, setHistory] = useState<string[]>([]);

  const tcToFrames = (tc: string, fpsVal: number) => {
    const parts = tc.split(':').map(Number);
    if (parts.length !== 4) return 0;
    const [h, m, s, f] = parts;
    return (((h * 3600) + (m * 60) + s) * fpsVal) + f;
  };

  const framesToTc = (frames: number, fpsVal: number) => {
    const h = Math.floor(frames / (3600 * fpsVal));
    const m = Math.floor((frames % (3600 * fpsVal)) / (60 * fpsVal));
    const s = Math.floor((frames % (60 * fpsVal)) / fpsVal);
    const f = frames % fpsVal;
    return [h, m, s, f].map(v => v.toString().padStart(2, '0')).join(':');
  };

  const handleAdd = () => {
    const total = tcToFrames(tc1, fps) + tcToFrames(tc2, fps);
    const res = framesToTc(total, fps);
    setResult(res);
    setHistory(prev => [`${tc1} + ${tc2} = ${res} (${fps}fps)`, ...prev.slice(0, 9)]);
  };

  const handleSub = () => {
    const total = Math.max(0, tcToFrames(tc1, fps) - tcToFrames(tc2, fps));
    const res = framesToTc(total, fps);
    setResult(res);
    setHistory(prev => [`${tc1} - ${tc2} = ${res} (${fps}fps)`, ...prev.slice(0, 9)]);
  };

  return (
    <div className="flex flex-col h-full apple-gradient overflow-hidden relative">
       <ToolSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} currentPage="timecode" setPage={setPage} />

       <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.8] dark:opacity-30">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[var(--accent)]/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
       </div>

       <div className="absolute top-0 left-0 right-0 h-[84px] flex items-center justify-between z-50 px-8 font-sans">
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
           >
             <LayoutDashboard className="w-4 h-4" /> <span className="label-micro uppercase font-bold tracking-widest">Toolkit</span>
           </button>
           
           <h2 className="text-sm font-black tracking-tighter text-[var(--text-main)] uppercase italic flex items-center gap-3">
             <Clock className="w-5 h-5 text-[var(--accent)]" /> 
             Timecode Toolkit
           </h2>

          <div className="flex justify-end gap-2">
             {toggleTheme && (
               <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={toggleTheme}
                 className="p-3 rounded-full glass border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
               >
                 {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </motion.button>
             )}
          </div>
       </div>

      <div className="p-8 flex flex-col gap-8 h-full overflow-hidden relative z-10 pt-24 max-w-5xl mx-auto w-full">
         <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-8 items-stretch flex-1 min-h-0 pb-12">
            <div className="p-10 rounded-3xl glass border border-[var(--border)] flex flex-col gap-10 shadow-2xl overflow-y-auto">
               <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="label-micro text-[var(--text-dim)]">Primary Timecode (HH:MM:SS:FF)</label>
                        <input 
                           value={tc1}
                           onChange={(e) => setTc1(e.target.value)}
                           className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl p-6 text-2xl font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] transition-all"
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="label-micro text-[var(--text-dim)]">Secondary Timecode (HH:MM:SS:FF)</label>
                        <input 
                           value={tc2}
                           onChange={(e) => setTc2(e.target.value)}
                           className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-2xl p-6 text-2xl font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] transition-all"
                        />
                     </div>
                  </div>

                  <div className="flex items-center gap-6 p-6 rounded-2xl bg-[var(--bg-shell)] border border-[var(--border)]">
                     <div className="flex-1 space-y-2">
                        <label className="label-micro text-[var(--text-dim)]">Frame Rate (FPS)</label>
                        <div className="flex gap-2">
                           {[23.976, 24, 25, 29.97, 30, 50, 59.94, 60].map(f => (
                              <button 
                                 key={f}
                                 onClick={() => setFps(f)}
                                 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${fps === f ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-input)] text-[var(--text-dim)] border border-[var(--border)] hover:text-[var(--text-main)]'}`}
                              >
                                 {f}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-center gap-6">
                  <motion.button 
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={handleAdd}
                     className="flex-1 py-5 rounded-2xl bg-[var(--accent)] text-white font-bold tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-[var(--accent)]/20"
                  >
                     <Plus className="w-5 h-5" /> ADDITION
                  </motion.button>
                  <motion.button 
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={handleSub}
                     className="flex-1 py-5 rounded-2xl bg-[var(--bg-shell)] border border-[var(--border)] text-[var(--text-main)] font-bold tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-[var(--border)] transition-colors"
                  >
                     <Minus className="w-5 h-5" /> SUBTRACTION
                  </motion.button>
               </div>

               <div className="mt-auto pt-10 border-t border-[var(--border)] text-center">
                  <div className="inline-block p-8 rounded-3xl bg-[var(--accent-soft)] border border-[var(--accent)]/10 shadow-xl">
                     <p className="label-micro text-[var(--accent-text)] mb-2 uppercase tracking-[0.3em]">Atomic Calculation Result</p>
                     <p className="text-6xl font-black font-mono text-[var(--text-main)] tracking-tighter">{result}</p>
                  </div>
               </div>
            </div>

            <div className="p-10 rounded-3xl glass border border-[var(--border)] flex flex-col gap-8 shadow-2xl">
               <div className="flex items-center justify-between">
                  <h3 className="label-micro font-bold uppercase tracking-widest text-[var(--text-dim)]">Log History</h3>
                  <button onClick={() => setHistory([])} className="text-[10px] font-bold text-[var(--accent-text)] uppercase tracking-widest hover:underline">Clear</button>
               </div>
               <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {history.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                        <RefreshCw className="w-12 h-12" />
                        <p className="label-micro text-[10px] tracking-widest">No Calculations Logged</p>
                     </div>
                  ) : (
                     history.map((h, i) => (
                        <motion.div 
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           key={i} 
                           className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border)] group flex items-center justify-between"
                        >
                           <span className="text-xs font-mono text-[var(--text-dim)] group-hover:text-[var(--text-main)] transition-colors">{h}</span>
                           <ArrowRight className="w-3 h-3 text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all" />
                        </motion.div>
                     ))
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
