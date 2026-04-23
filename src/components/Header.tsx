import React from 'react';
import { Sun, Moon, Plus } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  setPage: (page: string) => void;
}

export default function Header({ isDark, toggleTheme, setPage }: HeaderProps) {
  return (
    <header className="h-[52px] w-full bg-[var(--bg-panel)] border-b border-[var(--border)] px-5 flex items-center gap-3.5 z-50 backdrop-blur-xl">
      <div className="logo-mark cursor-pointer glass" onClick={() => setPage('home')}>
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <polygon points="8,1.5 14,5 14,11 8,14.5 2,11 2,5" fill="rgba(0,0,0,0.1)" stroke="currentColor" strokeWidth="1.2"/>
          <polygon points="8,5 11,6.8 11,9.2 8,11 5,9.2 5,6.8" fill="currentColor"/>
        </svg>
      </div>
      <span 
        className="text-[13px] font-bold tracking-tight cursor-pointer hover:text-[var(--accent)] transition-colors uppercase text-[var(--text-main)]"
        onClick={() => setPage('home')}
      >
        AUTOMATED MEDIA WORKFLOW
      </span>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-[var(--border)] glass-button hover:bg-[var(--bg-input)] transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
        </button>
        
        <button 
          onClick={() => setPage('help')}
          className="text-[11px] font-bold px-4 py-1.5 rounded-full glass-button border border-[var(--border)] hover:bg-[var(--bg-input)] transition-all uppercase tracking-widest"
        >
          Help
        </button>
      </div>
    </header>
  );
}
