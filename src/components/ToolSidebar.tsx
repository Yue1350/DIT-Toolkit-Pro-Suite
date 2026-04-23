import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LayoutDashboard, FolderTree, FileVideo, ClipboardList, HardDrive, BookOpen } from 'lucide-react';

interface ToolSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  setPage: (page: string) => void;
}

export default function ToolSidebar({ isOpen, onClose, currentPage, setPage }: ToolSidebarProps) {
  const tools = [
    { id: 'folder', label: 'Folder Generator', icon: FolderTree },
    { id: 'metadata', label: 'Metadata Extractor', icon: FileVideo },
    { id: 'storage', label: 'Storage Estimator', icon: HardDrive },
  ];

  const handleToolClick = (id: string) => {
    setPage(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 h-full w-80 bg-[var(--bg-panel)]/90 backdrop-blur-2xl border-r border-[var(--border)] z-[101] p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex flex-col">
                <h3 className="text-xl font-black uppercase text-[var(--accent-text)] italic tracking-tighter">DIT Toolkit</h3>
                <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.3em]">Pro Suite v6.0</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[var(--bg-shell)] rounded-full text-[var(--text-dim)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => handleToolClick('home')} 
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--bg-shell)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-all font-bold tracking-widest uppercase text-xs group"
              >
                <div className="p-2 rounded-lg bg-[var(--bg-input)] group-hover:bg-[var(--accent-soft)] transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span>Dashboard</span>
              </button>

              <div className="h-px bg-[var(--border)] my-4 opacity-50" />

              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = currentPage === tool.id;
                return (
                  <button 
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)} 
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold tracking-widest uppercase text-xs group ${
                      isActive 
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent)]/20 shadow-lg' 
                        : 'hover:bg-[var(--bg-shell)] text-[var(--text-dim)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-input)] group-hover:bg-[var(--accent-soft)]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="absolute bottom-8 left-8 right-8">
               <button 
                  onClick={() => handleToolClick('help')}
                  className="w-full p-4 rounded-2xl bg-[var(--accent)]/5 border border-[var(--accent)]/10 text-center hover:bg-[var(--accent)]/10 transition-all group flex items-center justify-center gap-3"
               >
                  <BookOpen className="w-4 h-4 text-[var(--accent)] group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] font-black text-[var(--accent-text)] uppercase tracking-[0.2em] leading-relaxed">
                    Documentation
                  </p>
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
