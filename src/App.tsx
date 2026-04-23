/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import FolderGenerator from './components/FolderGenerator';

import HelpPage from './components/HelpPage';
import MetadataExtractor from './components/MetadataExtractor';
import StorageEstimator from './components/StorageEstimator';

export default function App() {
  const [page, setPage] = useState('home');
  const [isDark, setIsDark] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const minWidth = 180;
    const maxWidth = 480;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, minWidth), maxWidth);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const isToolPage = ['folder', 'metadata', 'storage'].includes(page);

  return (
    <div className={`flex flex-col h-screen overflow-hidden bg-[var(--bg-shell)] text-[var(--text-main)] ${isResizing ? 'select-none cursor-col-resize' : ''}`}>
      {page !== 'home' && page !== 'help' && !isToolPage && (
        <Header isDark={isDark} toggleTheme={toggleTheme} setPage={setPage} />
      )}
      
      <div className="flex flex-1 overflow-hidden relative">
        {page !== 'home' && page !== 'help' && !isToolPage && (
          <>
            <Sidebar currentPage={page} setPage={setPage} width={sidebarWidth} />
            <div 
              className={`w-1 h-full cursor-col-resize absolute left-[${sidebarWidth}px] top-0 z-[60] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/50 transition-colors pointer-events-auto`}
              style={{ left: `${sidebarWidth}px` }}
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
              }}
            />
          </>
        )}
        
        <main className="flex-1 overflow-hidden relative">
          {page === 'home' && <LandingPage setPage={setPage} isDark={isDark} toggleTheme={toggleTheme} />}
          {page === 'folder' && <FolderGenerator setPage={setPage} isDark={isDark} toggleTheme={toggleTheme} />}
          {page === 'metadata' && <MetadataExtractor setPage={setPage} isDark={isDark} toggleTheme={toggleTheme} />}
          {page === 'storage' && <StorageEstimator setPage={setPage} isDark={isDark} toggleTheme={toggleTheme} />}
          {page === 'help' && <HelpPage setPage={setPage} isDark={isDark} toggleTheme={toggleTheme} />}
        </main>
      </div>
    </div>
  );
}
