import React from 'react';
import { Terminal, Home, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentPage: string;
  setPage: (page: string) => void;
  width: number;
}

export default function Sidebar({ currentPage, setPage, width }: SidebarProps) {
  const navItems = [
    { id: 'home', label: 'DASHBOARD', icon: Home },
    { id: 'folder', label: 'FOLDER STRUCTURE GENERATOR', icon: Terminal },
  ];

  return (
    <aside 
      className="sidebar bg-[var(--bg-panel)] border-r border-[var(--border)] h-[calc(100vh-52px)] flex flex-col p-4 gap-1 overflow-y-auto backdrop-blur-xl shrink-0"
      style={{ width: `${width}px` }}
    >
      {navItems.map((item, index) => (
        <React.Fragment key={item.id}>
          <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPage(item.id)}
            className={`nav-item relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl cursor-pointer transition-colors group ${currentPage === item.id ? 'text-[var(--accent-text)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
          >
            {currentPage === item.id && (
              <motion.div 
                layoutId="active-pill"
                className="absolute inset-0 bg-[var(--accent-soft)] border border-[var(--border)] rounded-xl backdrop-blur-md -z-10 shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <item.icon className={`w-[16px] h-[16px] shrink-0 translate-y-[-0.5px] transition-colors ${currentPage === item.id ? 'text-[var(--accent)]' : 'group-hover:text-[var(--text-main)]'}`} />
            <span className="text-[11px] font-medium tracking-widest z-10">{item.label}</span>
            {currentPage === item.id && (
              <motion.div 
                layoutId="active-indicator" 
                className="ml-auto w-1 h-3.5 bg-[var(--accent)] rounded-full z-10" 
              />
            )}
          </motion.div>
          {item.id === 'home' && (
            <div className="my-3 border-b border-white/5 mx-2" />
          )}
        </React.Fragment>
      ))}

      <div className="mt-auto pt-4 border-t border-white/5 space-y-1">
        <motion.div 
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPage('help')}
          className={`nav-item relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl cursor-pointer transition-colors group ${currentPage === 'help' ? 'text-[var(--accent-text)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
        >
          {currentPage === 'help' && (
            <motion.div 
              layoutId="active-pill"
              className="absolute inset-0 bg-[var(--accent-soft)] border border-[var(--border)] rounded-xl backdrop-blur-md -z-10 shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <HelpCircle className={`w-[16px] h-[16px] shrink-0 translate-y-[-0.5px] transition-colors ${currentPage === 'help' ? 'text-[var(--accent)]' : 'group-hover:text-[var(--text-main)]'}`} />
          <span className="text-[11px] font-medium tracking-widest uppercase z-10">Documentation</span>
          {currentPage === 'help' && (
            <motion.div 
              layoutId="active-indicator" 
              className="ml-auto w-1 h-3.5 bg-[var(--accent)] rounded-full z-10" 
            />
          )}
        </motion.div>
      </div>
    </aside>
  );
}
