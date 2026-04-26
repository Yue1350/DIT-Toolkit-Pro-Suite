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
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    }}
    whileHover={{ 
      y: -8, 
      transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } 
    }}
    whileTap={{ scale: 0.985 }}
    onClick={onClick}
    className="p-10 rounded-[2.5rem] cursor-pointer group relative overflow-hidden flex flex-col items-center text-center h-full glass min-h-[360px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] border border-[var(--border)] transition-all duration-700"
  >
    {/* Circle Container for Icon */}
    <div className="w-20 h-20 rounded-full bg-[var(--bg-shell)] border border-[var(--border)] mb-8 flex items-center justify-center text-[var(--accent-text)] group-hover:bg-[var(--accent)] group-hover:text-white group-hover:scale-110 transition-all duration-700 backdrop-blur-xl shadow-inner overflow-hidden">
      <div className="scale-110 group-hover:scale-125 transition-transform duration-700">
        {icon}
      </div>
    </div>

    <h3 className="text-2xl font-black mb-4 tracking-tighter text-[var(--text-main)] group-hover:text-[var(--accent-text)] transition-colors duration-500 italic uppercase">
      {title}
    </h3>
    <p className="text-[12px] font-bold text-[var(--text-dim)] leading-relaxed mb-8 flex-1 max-w-[280px] opacity-80 group-hover:opacity-100 transition-opacity duration-500 uppercase tracking-wider">
      {desc}
    </p>
    
    <div className="mt-auto flex items-center justify-center gap-3 text-[10px] font-black tracking-[0.3em] text-[var(--accent-text)] uppercase group-hover:translate-x-2 transition-all duration-500 group-hover:brightness-125">
      Start Production <ArrowRight className="w-4 h-4" />
    </div>

    {/* Subtle Inner Glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
  </motion.div>
);

export default function LandingPage({ setPage, isDark, toggleTheme }: { setPage: (p: string) => void, isDark?: boolean, toggleTheme?: () => void }) {
  const [openVersion, setOpenVersion] = useState<string | null>('v6.5.0');

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'folder', label: 'FOLDER' },
    { id: 'metadata', label: 'METADATA' },
    { id: 'storage', label: 'STORAGE' },
    { id: 'help', label: 'DOCUMENTATION' }
  ];

  const changeLogs = [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-full apple-gradient overflow-hidden relative"
    >
       <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="absolute top-0 left-0 right-0 h-[84px] flex items-center justify-between z-50 px-8"
       >
          <div className="w-[120px]" /> {/* Spacer for centering */}
          
          <nav className="flex items-center gap-1 p-1.5 glass border border-[var(--border)] rounded-full shadow-2xl backdrop-blur-2xl">
            {navItems.map((item) => (
               <motion.button 
                key={item.id}
                whileHover={{ backgroundColor: 'var(--bg-shell)', color: 'var(--text-main)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage(item.id)}
                className="px-6 py-2.5 rounded-full text-[10px] font-medium tracking-[0.2em] text-[var(--text-dim)] transition-all whitespace-nowrap"
               >
                 {item.label}
               </motion.button>
            ))}
          </nav>

          <div className="w-[120px] flex justify-end">
             {toggleTheme && (
               <motion.button
                 whileHover={{ scale: 1.05, backgroundColor: 'var(--bg-shell)' }}
                 whileTap={{ scale: 0.95 }}
                 onClick={toggleTheme}
                 className="p-3 rounded-full glass border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
               >
                 {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </motion.button>
             )}
          </div>
       </motion.div>

       {/* Background Decoration (Darkened for luxury feel) */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.6] dark:opacity-20">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[var(--accent)] rounded-full blur-[140px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.12, 0.1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-400 rounded-full blur-[140px]"
          />
       </div>

       <div className="flex-1 overflow-y-auto z-10 no-scrollbar">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-84px)] max-w-7xl mx-auto px-8 py-20 text-center space-y-24 pt-40">
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-12 max-w-4xl"
            >
              <div className="space-y-10">
                <motion.h1 
                  initial={{ letterSpacing: "-0.05em", opacity: 0 }}
                  animate={{ letterSpacing: "-0.02em", opacity: 1 }}
                  transition={{ delay: 0.4, duration: 1.2 }}
                  className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-[var(--text-main)]"
                >
                   DIT TOOLKIT <br />
                   <span className="text-[var(--accent-text)]">PRO SUITE</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="text-xl text-[var(--text-dim)] max-w-2xl mx-auto leading-relaxed italic font-light"
                >
                  <span className="text-[var(--text-main)] font-black uppercase tracking-widest text-sm block mb-4">The Next Evolution in On-Set Data Management</span>
                  Accelerate your digital imaging workflow with precision toolkit orchestration, atomic metadata validation, and robust storage logistics.
                </motion.p>
              </div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-wrap items-center justify-center gap-4"
              >
                 <button 
                  onClick={() => setPage('help')}
                  className="px-8 py-4 glass-button text-sm font-bold tracking-widest hover:bg-white/5 transition-all shadow-xl rounded-2xl border border-[var(--border)] active:scale-95"
                 >
                   DOCUMENTATION
                 </button>
                 <button 
                  onClick={() => setPage('folder')}
                  className="px-8 py-4 rounded-2xl bg-[var(--accent)] text-white text-sm font-bold tracking-widest hover:brightness-110 shadow-2xl shadow-[var(--accent)]/30 transition-all border border-white/20 backdrop-blur-md active:scale-95"
                 >
                   GET STARTED
                 </button>
              </motion.div>
            </motion.div>

              <motion.div 
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 1.2
                    }
                  }
                }}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl px-4 lg:px-8 mx-auto"
              >
                <FeatureCard 
                  title="Folder Structure"
                  desc="Generate standardized hierarchies for high-end camera, sound, and proxy data."
                  icon={<FolderTree className="w-10 h-10" />}
                  onClick={() => setPage('folder')}
                />
                <FeatureCard 
                  title="Metadata Engine"
                  desc="Extract atomic metadata and generate professional diagnostic PDF reports."
                  icon={<FileVideo className="w-10 h-10" />}
                  onClick={() => setPage('metadata')}
                />
                <FeatureCard 
                  title="Storage Logistics"
                  desc="Calculate estimated storage requirements based on format and resolution with precision."
                  icon={<HardDrive className="w-10 h-10" />}
                  onClick={() => setPage('storage')}
                />
              </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="w-full pt-32 pb-20 text-center"
          >
             <div className="pt-24 border-t border-[var(--border)] max-w-4xl mx-auto">
                <p className="label-micro opacity-40">© 2026 DIT TOOLKIT PRO SUITE. ALL RIGHTS RESERVED.</p>
             </div>
          </motion.div>
       </div>
    </motion.div>
  );
}
