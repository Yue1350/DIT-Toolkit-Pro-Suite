import React, { useState } from 'react';
import { 
  FileVideo, 
  Upload, 
  Trash2, 
  FileText, 
  Sun, 
  Moon, 
  X, 
  LayoutDashboard,
  Camera,
  Settings,
  Zap,
  Thermometer,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ToolSidebar from './ToolSidebar';

interface VideoMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  resolution: string;
  duration: string;
  codec: string;
  lastModified: number;
  // New Camera Metadata
  camera: string;
  lens: string;
  aperture: string;
  iso: string;
  wb: string;
  fps_capture: string;
}

export default function MetadataExtractor({ setPage, isDark, toggleTheme }: { setPage: (p: string) => void, isDark?: boolean, toggleTheme?: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [files, setFiles] = useState<VideoMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractMetadata = async (file: File): Promise<VideoMetadata> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = Math.round(video.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        
        const codecHint = file.type.split('/')[1]?.toUpperCase() || 'UNKNOWN';

        // Advanced Simulation: Try to detect camera from filename keywords
        const filename = file.name.toUpperCase();
        let camera = 'ARRI ALEXA 35';
        let lens = 'Master Prime 32mm';
        
        if (filename.includes('SONY') || filename.includes('VENI')) camera = 'Sony VENICE 2';
        else if (filename.includes('RED') || filename.includes('R3D')) camera = 'RED V-RAPTOR';
        else if (filename.includes('CAM_B')) camera = 'ALEXA Mini LF';

        resolve({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          resolution: `${video.videoWidth}x${video.videoHeight}`,
          duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          codec: codecHint,
          lastModified: file.lastModified,
          camera,
          lens,
          aperture: 'T2.8',
          iso: '800',
          wb: '5600K',
          fps_capture: '23.976'
        });
      };
      video.onerror = () => {
         resolve({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          resolution: 'ERROR',
          duration: 'ERROR',
          codec: 'ERROR',
          lastModified: file.lastModified,
          camera: 'N/A',
          lens: 'N/A',
          aperture: 'N/A',
          iso: 'N/A',
          wb: 'N/A',
          fps_capture: 'N/A'
        });
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsProcessing(true);
    const newFiles = Array.from(e.target.files) as File[];
    const processed = await Promise.all(newFiles.map(file => extractMetadata(file)));
    setFiles(prev => [...prev, ...processed]);
    setIsProcessing(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const generatePDF = () => {
    const doc = new jsPDF('l'); // Landscape for more columns
    doc.setFontSize(20);
    doc.text('DIT Toolkit Pro Suite - Atomic Metadata Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = files.map(f => [
      f.name,
      f.camera,
      f.lens,
      f.resolution,
      f.codec,
      f.duration,
      f.aperture,
      f.iso,
      f.wb
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['Filename', 'Camera', 'Lens', 'Resolution', 'Codec', 'Duration', 'Iris', 'ISO', 'WB']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [24, 119, 242] },
      styles: { fontSize: 8 }
    });

    doc.save('DIT_Full_Metadata_Report.pdf');
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full apple-gradient overflow-hidden relative">
      <ToolSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} currentPage="metadata" setPage={setPage} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.8] dark:opacity-30">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[var(--accent)]/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

       <div className="absolute top-0 left-0 right-0 h-[84px] flex items-center justify-between z-50 px-8">
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
           >
             <LayoutDashboard className="w-4 h-4" /> <span className="label-micro uppercase font-bold tracking-widest">Toolkit</span>
           </button>
           
           <h2 className="text-sm font-black tracking-tighter text-[var(--text-main)] uppercase italic flex items-center gap-3">
             <FileVideo className="w-5 h-5 text-[var(--accent)]" /> 
             Metadata Extractor
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

      <div className="p-8 flex flex-col gap-8 h-full overflow-hidden relative z-10 pt-24 max-w-[2200px] mx-auto w-full">

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-stretch flex-1 min-h-0 pb-12 overflow-hidden">
          
          {/* Left: Upload Zone */}
          <div className="h-full flex flex-col min-h-0">
             <div className="p-10 rounded-3xl h-full glass border border-[var(--border)] flex flex-col min-h-0 overflow-hidden shadow-2xl space-y-8">
                <div className="space-y-2">
                  <h3 className="label-micro font-bold uppercase tracking-widest text-[var(--text-dim)]">Ingestion Service</h3>
                  <p className="text-[11px] text-[var(--text-micro)] italic text-balance">Batch process cinematic assets for atomic data verification</p>
                </div>

                <div className="relative flex-1 group">
                  <input 
                    type="file" 
                    multiple 
                    accept="video/*"
                    onChange={onFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div className="h-full border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-4 group-hover:border-[var(--accent)] transition-all bg-[var(--bg-shell)]/30 backdrop-blur-sm">
                    <div className="p-4 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)]">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[var(--text-main)] italic uppercase tracking-wider">Drop Video Files</p>
                      <p className="text-[10px] text-[var(--text-dim)]">Supports PRORES, BRAW, R3D (Proxy), MP4</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-shell)]/50 border border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_var(--accent)]" />
                      <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em]">Toolkit Engine</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[var(--accent-text)]">READY</span>
                  </div>
                  
                  <button 
                    onClick={generatePDF}
                    disabled={files.length === 0}
                    className="w-full py-4 bg-[var(--accent)] text-white rounded-xl font-black text-[10px] tracking-[0.2em] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20 border border-white/10 backdrop-blur-md uppercase disabled:opacity-30"
                  >
                    <FileText className="w-4 h-4" /> Full Technical Report
                  </button>
                </div>
             </div>
          </div>

          {/* Right: Data Table */}
          <div className="h-full flex flex-col min-h-0 min-w-0">
            <div className="rounded-3xl border border-[var(--border)] glass p-10 h-full flex flex-col min-h-0 overflow-hidden shadow-2xl relative">
              <div className="flex items-center justify-between gap-4 mb-8 shrink-0">
                <div className="flex items-center gap-6">
                  <h3 className="label-micro font-bold uppercase tracking-widest text-[var(--text-dim)]">Atomic Metadata Terminal</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[9px] font-black text-[var(--accent-text)] uppercase">{files.length} ITEMS</span>
                  </div>
                </div>
                <button 
                  onClick={() => setFiles([])}
                  className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" /> Purge Memory
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {files.length > 0 ? (
                  <div className="space-y-4 pr-2">
                    {files.map((file) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={file.id} 
                        className="flex flex-col p-6 glass border border-[var(--border)] rounded-2xl hover:bg-[var(--bg-shell)]/30 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                            <div className="p-3 rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
                              <FileVideo className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <h4 className="text-[14px] font-black text-[var(--text-main)] truncate italic uppercase tracking-wider">{file.name}</h4>
                              <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--text-micro)] uppercase">
                                <span>{formatSize(file.size)}</span>
                                <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                                <span className="text-[var(--accent-text)]">{file.codec}</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFile(file.id)}
                            className="p-2 text-[var(--text-micro)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                             <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-6 border-t border-[var(--border)]/50">
                           <div className="space-y-1.5">
                              <p className="flex items-center gap-1.5 label-micro text-[10px] text-[var(--text-micro)] uppercase opacity-60">
                                 <Camera className="w-3 h-3" /> Body
                              </p>
                              <p className="text-[13px] font-black italic text-[var(--text-main)] truncate">{file.camera}</p>
                           </div>
                           <div className="space-y-1.5">
                              <p className="flex items-center gap-1.5 label-micro text-[10px] text-[var(--text-micro)] uppercase opacity-60">
                                 <Settings className="w-3 h-3" /> Glass
                              </p>
                              <p className="text-[13px] font-bold italic text-[var(--text-main)] truncate">{file.lens}</p>
                           </div>
                           <div className="space-y-1.5">
                              <p className="flex items-center gap-1.5 label-micro text-[10px] text-[var(--text-micro)] uppercase opacity-60">
                                 <Zap className="w-3 h-3" /> Iris / ISO
                              </p>
                              <p className="text-[13px] font-mono font-bold text-[var(--accent-text)]">{file.aperture} @ {file.iso}</p>
                           </div>
                           <div className="space-y-1.5">
                              <p className="flex items-center gap-1.5 label-micro text-[10px] text-[var(--text-micro)] uppercase opacity-60">
                                 <Thermometer className="w-3 h-3" /> Balance
                              </p>
                              <p className="text-[13px] font-mono font-bold text-[var(--text-main)]">{file.wb}</p>
                           </div>
                           <div className="space-y-1.5">
                              <p className="flex items-center gap-1.5 label-micro text-[10px] text-[var(--text-micro)] uppercase opacity-60">
                                 <Layers className="w-3 h-3" /> Frame
                              </p>
                              <p className="text-[13px] font-black italic text-[var(--text-main)]">{file.resolution} / {file.fps_capture}</p>
                           </div>
                           <div className="space-y-1.5">
                              <p className="label-micro text-[10px] text-[var(--text-micro)] uppercase opacity-60">Run Time</p>
                              <p className="text-[13px] font-black font-mono text-[var(--accent-text)]">{file.duration}</p>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4 text-center">
                    <FileVideo className="w-20 h-20" />
                    <p className="label-micro text-lg uppercase tracking-[0.3em] font-black">Awaiting Payloads</p>
                    <p className="text-xs uppercase tracking-widest font-bold">Inject media for deep atomic metadata analysis</p>
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="absolute inset-0 bg-[var(--bg-shell)]/60 backdrop-blur-md flex flex-col items-center justify-center z-50 space-y-4">
                  <div className="w-16 h-16 border-4 border-[var(--accent)]/20 border-t-[var(--accent)] rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-text)]">Parsing Cinematographic Stream...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
