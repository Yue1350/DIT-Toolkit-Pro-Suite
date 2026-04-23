import React from 'react';
import { Terminal, FileVideo, BookOpen, ShieldCheck, ArrowLeft, ChevronDown, Sun, Moon, Clock, HardDrive, FolderTree } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function HelpPage({ setPage, isDark, toggleTheme }: { setPage: (p: string) => void, isDark?: boolean, toggleTheme?: () => void }) {
  const [openVersion, setOpenVersion] = React.useState<string | null>('v6.0.0');

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'folder', label: 'FOLDER' },
    { id: 'metadata', label: 'METADATA' },
    { id: 'storage', label: 'STORAGE' },
    { id: 'help', label: 'DOCUMENTATION' }
  ];

  const changeLogs = [
    {
      version: 'v6.0.0',
      date: '2026.04.22',
      items: [
        "Renamed branding from 'Toolkit' across the suite",
        "Refactored Storage Estimator with high-precision calculation logic",
        "Unified UI architecture for all tools using slide-in navigation",
        "Refactored Metadata Extractor with ultra-wide layout and deep camera metadata",
        "Upgraded footer consistency across all documentation pages"
      ]
    },
    {
      version: 'v5.5.0',
      date: '2026.04.18',
      items: [
        "Apple-style animated gradient background system",
        "Full glassmorphism UI implementation (Glass-morphic buttons/panels)",
        "Global underscore removal from all UI labels and names",
        "Enhanced dark theme contrast and luxury color palette",
        "Refined background decoration richness and animations",
        "Improved navigation components and blur effects"
      ]
    },
    {
      version: 'v5.0.0',
      date: '2026.03.15',
      items: [
        "Initial Pro Suite Release",
        "Folder Structure Generator implementation",
        "Video Metadata Extractor implementation",
        "Timecode Calculation Engine implementation",
        "Basic Dark/Light theme support"
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full apple-gradient overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-[84px] flex items-center justify-between z-50 px-8">
          <div className="w-[120px]" />
          <nav className="flex items-center gap-1 p-1.5 glass border border-[var(--border)] rounded-full shadow-2xl backdrop-blur-2xl">
            {navItems.map((item) => (
               <motion.button 
                key={item.id}
                whileHover={{ backgroundColor: 'var(--bg-shell)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(item.id)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-medium tracking-[0.2em] transition-all whitespace-nowrap ${item.id === 'help' ? 'text-[var(--accent-text)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
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

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[var(--accent)]/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
       </div>

      <div className="flex-1 overflow-y-auto z-10 pt-32">
        <div className="max-w-5xl mx-auto px-8 py-20 flex flex-col items-center text-center space-y-16">
          <div className="space-y-8 max-w-2xl text-center">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[var(--text-main)]">
              TECHNICAL <br />
              <span className="text-[var(--accent-text)]">PROTOCOLS</span>
            </h1>
            <p className="text-[var(--text-dim)] text-lg leading-relaxed italic font-light">
              Standardized media ingestion workflows and atomic asset verification procedures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full text-left">
            <div className="tech-panel p-10 rounded-3xl space-y-8 glass border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-all shadow-2xl">
              <div className="flex items-center gap-4 text-[var(--accent-text)] font-bold uppercase tracking-widest text-xs">
                <div className="p-3 rounded-xl bg-[var(--accent-soft)]">
                  <FolderTree className="w-6 h-6" />
                </div>
                Folder Structure Generator
              </div>
              <div className="space-y-5 text-[14px] text-[var(--text-dim)] leading-relaxed italic">
                <div className="flex gap-4">
                  <span className="font-mono text-[var(--accent-text)] font-bold">01</span>
                  <p><strong>Input:</strong> Define Project, Day, and Category parameters.</p>
                </div>
                <div className="flex gap-4">
                  <span className="font-mono text-[var(--accent-text)] font-bold">02</span>
                  <p><strong>Logic:</strong> System generates standardized hierarchies (R#001, etc.).</p>
                </div>
                <div className="flex gap-4">
                  <span className="font-mono text-[var(--accent-text)] font-bold">03</span>
                  <p><strong>Verification:</strong> Edit and re-order items in the live terminal view.</p>
                </div>
                <div className="flex gap-4">
                  <span className="font-mono text-[var(--accent-text)] font-bold">04</span>
                  <p><strong>Execution:</strong> Write directly to local disk or export as a deployment ZIP.</p>
                </div>
              </div>
            </div>

            <div className="tech-panel p-10 rounded-3xl space-y-8 glass border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-all shadow-2xl">
              <div className="flex items-center gap-4 text-[var(--accent-text)] font-bold uppercase tracking-widest text-xs">
                <div className="p-3 rounded-xl bg-[var(--accent-soft)]">
                  <FileVideo className="w-6 h-6" />
                </div>
                Video Metadata Extractor
              </div>
              <div className="space-y-5 text-[14px] text-[var(--text-dim)] leading-relaxed italic">
                <div className="flex gap-4">
                  <span className="font-mono text-[var(--accent-text)] font-bold">01</span>
                  <p><strong>Ingestion:</strong> Drag raw video files into the landing zone.</p>
                </div>
                <div className="flex gap-4">
                  <span className="font-mono text-[var(--accent-text)] font-bold">02</span>
                  <p><strong>Extraction:</strong> Instant parsing of resolution, duration, and codec data.</p>
                </div>
                <div className="flex gap-4">
                  <span className="font-mono text-[var(--accent-text)] font-bold">03</span>
                  <p><strong>Review:</strong> Audit the extraction terminal for codec consistency.</p>
                </div>
                <div className="flex gap-4">
                  <span className="font-mono text-[var(--accent-text)] font-bold">04</span>
                  <p><strong>Reporting:</strong> Generate high-fidelity PDF logs for post-production sync.</p>
                </div>
              </div>
            </div>

            <div className="tech-panel p-10 rounded-3xl space-y-8 glass border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-all shadow-2xl">
              <div className="flex items-center gap-4 text-[var(--accent-text)] font-bold uppercase tracking-widest text-xs">
                <div className="p-3 rounded-xl bg-[var(--accent-soft)]">
                  <HardDrive className="w-6 h-6" />
                </div>
                Storage Estimator
              </div>
              <div className="space-y-5 text-[14px] text-[var(--text-dim)] leading-relaxed italic">
                <div className="flex gap-4">
                  <span className="font-mono text-[var(--accent-text)] font-bold">01</span>
                  <p><strong>Configuration:</strong> Select format, resolution, and daily run-time.</p>
                </div>
                <div className="flex gap-4">
                  <span className="font-mono text-[var(--accent-text)] font-bold">02</span>
                  <p><strong>Logistics:</strong> Real-time estimation of total GB/TB requirements.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full pt-16 flex flex-col items-start gap-12 text-left">
              <div className="space-y-4">
                <div className="inline-flex flex-col">
                  <h2 className="text-4xl font-black tracking-tighter text-[var(--text-main)] uppercase italic">Change Log</h2>
                  <div className="h-1.5 w-full bg-[var(--accent)] mt-2" />
                </div>
                <p className="text-[var(--text-dim)] text-sm font-medium tracking-wide uppercase">System evolution and patch notes</p>
              </div>

              <div className="space-y-4 w-full">
                {changeLogs.map((log) => (
                  <div key={log.version} className="border border-[var(--border)] rounded-2xl overflow-hidden glass">
                    <button 
                      onClick={() => setOpenVersion(openVersion === log.version ? null : log.version)}
                      className="w-full flex items-center justify-between p-6 hover:bg-[var(--bg-shell)] transition-all text-left group"
                    >
                      <div className="flex items-center gap-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors ${openVersion === log.version ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-shell)] text-[var(--text-dim)] border border-[var(--border)]'}`}>
                          {log.version}
                        </span>
                        <span className="text-[var(--text-dim)] text-[11px] font-mono tracking-tighter uppercase">{log.date}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-[var(--text-dim)] transition-transform duration-300 ${openVersion === log.version ? 'rotate-180 text-[var(--accent)]' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {openVersion === log.version && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="px-8 pb-8 pt-2">
                             <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                               {log.items.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-4 text-[13px] text-[var(--text-dim)] leading-relaxed font-light italic group/item">
                                     <span className="text-[var(--accent)] mt-1.5 opacity-50">•</span>
                                     <span className="group-hover/item:text-[var(--text-main)] transition-colors">{item}</span>
                                  </li>
                               ))}
                             </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
          </div>

          <div className="w-full pt-32 pb-20 text-center">
             <div className="pt-24 border-t border-[var(--border)] max-w-4xl mx-auto">
                <p className="label-micro opacity-50">© 2026 DIT TOOLKIT PRO SUITE. ALL RIGHTS RESERVED.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
