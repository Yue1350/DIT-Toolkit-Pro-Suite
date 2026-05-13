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
import { FolderTree, Settings, HardDrive, Info, Moon, Sun, Monitor, LayoutGrid, ChevronRight, Menu, X, BookOpen, FileVideo } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [page, setPage] = useState('home');
  const [isDark, setIsDark] = useState(false);
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
          <AnimatePresence mode="wait" initial={false}>
            {page === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <LandingPage setPage={setPage} isDark={isDark} toggleTheme={toggleTheme} />
              </motion.div>
            )}
            {page === 'folder' && (
              <motion.div
                key="folder"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <FolderGenerator setPage={setPage} isDark={isDark} toggleTheme={toggleTheme} />
              </motion.div>
            )}
            {page === 'metadata' && (
              <motion.div
                key="metadata"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <MetadataExtractor setPage={setPage} isDark={isDark} toggleTheme={toggleTheme} />
              </motion.div>
            )}
            {page === 'storage' && (
              <motion.div
                key="storage"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <StorageEstimator setPage={setPage} isDark={isDark} toggleTheme={toggleTheme} />
              </motion.div>
            )}
            {page === 'help' && (
              <motion.div
                key="help"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <HelpPage setPage={setPage} isDark={isDark} toggleTheme={toggleTheme} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
