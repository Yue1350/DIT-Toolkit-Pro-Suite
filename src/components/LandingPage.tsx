import React, { useState } from 'react';
import { FolderTree, ArrowRight, ChevronDown, Sun, Moon, FileVideo, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const FeatureCard = ({ title, desc, icon, onClick }: FeatureCardProps) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    onClick={onClick}
    className="p-10 rounded-3xl cursor-pointer group relative overflow-hidden flex flex-col items-center text-center h-full glass min-h-[340px] shadow-2xl border border-[var(--border)]"
  >
    <div className={`p-6 rounded-2xl bg-[var(--bg-input)] border border-[var(--border)] mb-8 text-[var(--accent-text)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-300 backdrop-blur-md shadow-lg`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-4 tracking-tight text-[var(--text-main)]">{title}</h3>
    <p className="text-sm text-[var(--text-dim)] leading-relaxed mb-8 flex-1 max-w-[280px]">
      {desc}
    </p>
    <div className="mt-auto flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest text-[var(--accent-text)] uppercase group-hover:translate-x-2 transition-transform">
      Launch Engine <ArrowRight className="w-4 h-4" />
    </div>
  </motion.div>
);

export default function LandingPage({ setPage, isDark, toggleTheme }: { setPage: (p: string) => void, isDark?: boolean, toggleTheme?: () => void }) {
  const [openVersion, setOpenVersion] = useState<string | null>('v5.5.0');

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'folder', label: 'FOLDER' },
    { id: 'metadata', label: 'METADATA' },
    { id: 'storage', label: 'STORAGE' },
    { id: 'help', label: 'DOCUMENTATION' }
  ];

  const changeLogs = [];

  return (
    <div className="flex flex-col h-full apple-gradient overflow-hidden relative">
       <div className="absolute top-0 left-0 right-0 h-[84px] flex items-center justify-between z-50 px-8">
          <div className="w-[120px]" /> {/* Spacer for centering */}
          
          <nav className="flex items-center gap-1 p-1.5 glass border border-[var(--border)] rounded-full shadow-2xl backdrop-blur-2xl">
            {navItems.map((item) => (
               <motion.button 
                key={item.id}
                whileHover={{ backgroundColor: 'var(--bg-shell)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(item.id)}
                className="px-6 py-2.5 rounded-full text-[10px] font-medium tracking-[0.2em] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-all whitespace-nowrap"
               >
                 {item.label}
               </motion.button>
            ))}
          </nav>

          <div className="w-[120px] flex justify-end">
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

       {/* Background Decoration (Darkened for luxury feel) */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.8] dark:opacity-30">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[var(--accent)]/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '4s' }} />
       </div>

       <div className="flex-1 overflow-y-auto z-10">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-84px)] max-w-7xl mx-auto px-8 py-20 text-center space-y-24 pt-32">
            <div className="space-y-12 max-w-4xl">
              <div className="space-y-10">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-[var(--text-main)]">
                   DIT TOOLKIT <br />
                   <span className="text-[var(--accent-text)]">PRO SUITE</span>
                </h1>
                <p className="text-xl text-[var(--text-dim)] max-w-2xl mx-auto leading-relaxed italic font-light">
                  <span className="text-[var(--text-main)] font-black uppercase tracking-widest text-sm block mb-4">The Next Evolution in On-Set Data Management</span>
                  Accelerate your digital imaging workflow with precision toolkit orchestration, atomic metadata validation, and robust storage logistics for elite productions.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                 <button 
                  onClick={() => setPage('help')}
                  className="px-8 py-4 glass-button text-sm font-bold tracking-widest hover:bg-white/10 transition-all shadow-xl rounded-2xl"
                 >
                   DOCUMENTATION
                 </button>
                 <button 
                  onClick={() => setPage('folder')}
                  className="px-8 py-4 rounded-2xl bg-[var(--accent)] text-white text-sm font-bold tracking-widest hover:brightness-110 shadow-2xl shadow-[var(--accent)]/30 transition-all border border-white/20 backdrop-blur-md"
                 >
                   GET STARTED
                 </button>
              </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl px-4 lg:px-8 mx-auto">
                <FeatureCard 
                  title="Folder Structure Generator"
                  desc="Generate standardized directory hierarchies for high-end camera, sound, and proxy data."
                  icon={<FolderTree className="w-10 h-10" />}
                  onClick={() => setPage('folder')}
                />
                <FeatureCard 
                  title="Video Metadata Extractor"
                  desc="Extract atomic metadata (Resolution, Codec, Duration) and generate professional PDF reports."
                  icon={<FileVideo className="w-10 h-10" />}
                  onClick={() => setPage('metadata')}
                />
                <FeatureCard 
                  title="Storage Estimator"
                  desc="Calculate estimated storage requirements based on format, resolution, and duration with accuracy."
                  icon={<HardDrive className="w-10 h-10" />}
                  onClick={() => setPage('storage')}
                />
              </div>
          </div>

          <div className="w-full pt-32 pb-20 text-center">
             <div className="pt-24 border-t border-[var(--border)] max-w-4xl mx-auto">
                <p className="label-micro opacity-50">© 2026 DIT TOOLKIT PRO SUITE. ALL RIGHTS RESERVED.</p>
             </div>
          </div>
       </div>
    </div>
  );
}
