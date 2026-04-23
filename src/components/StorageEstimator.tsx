import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HardDrive, Sun, Moon, LayoutDashboard, Calculator, ArrowRight, Info, AlertCircle, Clock, Zap, Video, Gauge, Music, FolderTree, Plus, ShieldCheck } from 'lucide-react';
import ToolSidebar from './ToolSidebar';

export default function StorageEstimator({ setPage, isDark, toggleTheme }: { setPage: (p: string) => void, isDark?: boolean, toggleTheme?: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Storage Estimator State
  const [format, setFormat] = useState('ProRes 422 HQ');
  const [resolution, setResolution] = useState('4K (3840x2160)');
  const [frameRate, setFrameRate] = useState(24);
  const [audioCodec, setAudioCodec] = useState('PCM 24-bit 48kHz');
  const [audioChannels, setAudioChannels] = useState(2);
  const [duration, setDuration] = useState({ hours: 1, minutes: 0, seconds: 0 });
  const [includeVideo, setIncludeVideo] = useState(true);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [storageResult, setStorageResult] = useState({ size: 0, unit: 'GB' });
  const [videoSize, setVideoSize] = useState(0);
  const [audioSize, setAudioSize] = useState(0);
  const [selectedDrive, setSelectedDrive] = useState<string>('Local');
  const [driveCapacity, setDriveCapacity] = useState<number>(1000); // GB
  const [usedSpace, setUsedSpace] = useState<number>(300); // GB
  const [targetHandle, setTargetHandle] = useState<any>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Available "Drives" (Defaults)
  const drives = [
    { name: 'Local', capacity: 1000, used: 300 },
    { name: 'NVMe SSD', capacity: 2000, used: 800 },
    { name: 'Work HDD', capacity: 8000, used: 5500 },
  ];

  // Bitrates in Mbps
  const bitrateMap: Record<string, number> = {
    'ProRes 4444 XQ': 1697, 'ProRes 4444': 1131, 'ProRes 422 HQ': 754, 'ProRes 422': 503,
    'ProRes 422 LT': 352, 'ProRes 422 Proxy': 156, 'DNxHR 444': 1130, 'DNxHR HQX': 750,
    'H.264 (High)': 100, 'H.265 (High)': 60, 'ARRIRAW 3.4K': 2400, 'REDCODE 8:1': 800,
    'REDCODE 5:1': 1200, 'XAVC-I 4K': 240,
  };

  const audioBitrates: Record<string, number> = {
    'PCM 32-bit float 48kHz': 1.536, 'PCM 24-bit 48kHz': 1.152, 'PCM 16-bit 48kHz': 0.768,
    'AAC 320kbps': 0.32, 'MP3 320kbps': 0.32, 'FLAC Lossless': 0.8,
  };

  useEffect(() => {
    const baseBitrate = bitrateMap[format] || 500;
    let resolutionMultiplier = 1;
    if (resolution.includes('HD')) resolutionMultiplier = 0.25;
    else if (resolution.includes('2K')) resolutionMultiplier = 0.3;
    else if (resolution.includes('6K')) resolutionMultiplier = 2.25;
    else if (resolution.includes('8K')) resolutionMultiplier = 4;
    
    const frameRateMultiplier = frameRate / 24;
    const singleChannelAudioMbps = audioBitrates[audioCodec] || 1.152;
    const OVERHEAD = 1.07;
    const rawVideoBitrateMbps = includeVideo ? (baseBitrate * resolutionMultiplier * frameRateMultiplier) : 0;
    const audioBitrateMbps = includeAudio ? (audioChannels * singleChannelAudioMbps) : 0;
    const finalBitrateMbps = (rawVideoBitrateMbps + audioBitrateMbps) * OVERHEAD;
    const totalSeconds = (duration.hours * 3600) + (duration.minutes * 60) + duration.seconds;
    const totalMegabits = finalBitrateMbps * totalSeconds;
    const totalGB = (totalMegabits / 8) / 1024;
    
    setVideoSize(((rawVideoBitrateMbps * OVERHEAD) * totalSeconds / 8) / 1024);
    setAudioSize(((audioBitrateMbps * OVERHEAD) * totalSeconds / 8) / 1024);
    
    if (totalGB >= 1000) {
      setStorageResult({ size: totalGB / 1024, unit: 'TB' });
    } else {
      setStorageResult({ size: totalGB, unit: 'GB' });
    }
  }, [format, resolution, frameRate, audioCodec, audioChannels, duration, includeVideo, includeAudio]);

  const bufferSize = (videoSize + audioSize) * 0.2;
  const totalRequired = usedSpace + videoSize + audioSize + bufferSize;
  const freeSpace = Math.max(0, driveCapacity - totalRequired);
  const isOverflow = totalRequired > driveCapacity;
  const overflowAmount = totalRequired - driveCapacity;

  const [isCalculating, setIsCalculating] = useState(false);

  const calculateFolderSize = async (dirHandle: FileSystemDirectoryHandle): Promise<number> => {
    let size = 0;
    try {
      // @ts-ignore
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') size += (await entry.getFile()).size;
        else if (entry.kind === 'directory') size += await calculateFolderSize(entry);
      }
    } catch (e) { console.warn('Access error'); }
    return size;
  };

  const pickTargetDir = async () => {
    if (!('showDirectoryPicker' in window)) return;
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker();
      setTargetHandle(handle);
      setIsCalculating(true);
      const totalBytes = await calculateFolderSize(handle);
      const totalGB = totalBytes / (1024 ** 3);
      setUsedSpace(totalGB);
      if (totalGB < 450) setDriveCapacity(500);
      else if (totalGB < 900) setDriveCapacity(1000);
      else if (totalGB < 1800) setDriveCapacity(2000);
      else setDriveCapacity(Math.ceil(totalGB / 1000) * 1000);
      setIsCalculating(false);
    } catch (err) { setIsCalculating(false); }
  };

  return (
    <div className="flex flex-col h-full apple-gradient overflow-hidden relative">
       <ToolSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} currentPage="storage" setPage={setPage} />
       <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.8]">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[var(--accent)]/10 rounded-full blur-[140px] animate-pulse" />
       </div>

       <div className="absolute top-0 left-0 right-0 h-[84px] flex items-center justify-between z-50 px-8">
           <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors">
             <LayoutDashboard className="w-4 h-4" /> <span className="label-micro uppercase font-bold tracking-widest">Toolkit</span>
           </button>
           <h2 className="text-sm font-black tracking-tighter text-[var(--text-main)] uppercase italic flex items-center gap-3">
             <HardDrive className="w-5 h-5 text-[var(--accent)]" /> Storage Estimator
           </h2>
           <div className="flex justify-end gap-2">
             {toggleTheme && (
               <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleTheme} className="p-3 rounded-full glass border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text-main)]">
                 {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </motion.button>
             )}
           </div>
       </div>

      <div className="p-8 flex flex-col gap-8 h-full relative z-10 pt-24 max-w-[1920px] mx-auto w-full overflow-hidden">
         <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-stretch flex-1 min-h-0 pb-12 overflow-hidden">
            <div className="h-full flex flex-col min-h-0">
               <div className="p-10 rounded-3xl h-full glass border border-[var(--border)] flex flex-col min-h-0 overflow-hidden shadow-2xl relative">
                  <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4 px-2">
                    <div className="space-y-3">
                      <label className="label-micro text-[var(--text-micro)]">Stream Inclusions</label>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button onClick={() => setIncludeVideo(!includeVideo)} className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${includeVideo ? 'bg-[var(--accent)] text-white' : 'bg-white/5 opacity-40 grayscale'}`}>
                          <Video className="w-4 h-4" /> <span className="text-[11px] font-black uppercase">Video</span>
                        </motion.button>
                        <motion.button onClick={() => setIncludeAudio(!includeAudio)} className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${includeAudio ? 'bg-amber-500 text-white' : 'bg-white/5 opacity-40 grayscale'}`}>
                          <Music className="w-4 h-4" /> <span className="text-[11px] font-black uppercase">Audio</span>
                        </motion.button>
                      </div>
                    </div>

                    <div className={`space-y-6 pt-6 border-t border-white/5 transition-all ${includeVideo ? '' : 'opacity-20 pointer-events-none'}`}>
                      <div className="space-y-2">
                        <label className="label-micro">Video Codec</label>
                        <select value={format} onChange={e => setFormat(e.target.value)} className="tech-input w-full rounded-xl">
                          {Object.keys(bitrateMap).map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="label-micro">Resolution</label>
                          <select value={resolution} onChange={e => setResolution(e.target.value)} className="tech-input w-full rounded-xl">
                             <option>HD (1920x1080)</option><option>4K (3840x2160)</option><option>8K (7680x4320)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="label-micro">FPS</label>
                          <select value={frameRate} onChange={e => setFrameRate(Number(e.target.value))} className="tech-input w-full rounded-xl">
                            {[24, 30, 60].map(f => <option key={f} value={f}>{f} fps</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={`space-y-6 pt-6 border-t border-white/5 transition-all ${includeAudio ? '' : 'opacity-20 pointer-events-none'}`}>
                      <div className="space-y-2">
                        <label className="label-micro">Audio Codec</label>
                        <select value={audioCodec} onChange={e => setAudioCodec(e.target.value)} className="tech-input w-full rounded-xl">
                          {Object.keys(audioBitrates).map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="label-micro">Channels</label>
                        <select value={audioChannels} onChange={e => setAudioChannels(Number(e.target.value))} className="tech-input w-full rounded-xl">
                          <option value={1}>Mono (1.0)</option>
                          <option value={2}>Stereo (2.0)</option>
                          <option value={6}>Surround (5.1)</option>
                          <option value={8}>Immersive (7.1)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-white/5">
                      <label className="label-micro flex items-center gap-2"><Clock className="w-3 h-3" /> Capture Duration</label>
                      <div className="grid grid-cols-3 gap-4">
                        <input type="number" value={duration.hours} onChange={e => setDuration({...duration, hours: Number(e.target.value)})} className="tech-input text-center rounded-xl" />
                        <input type="number" value={duration.minutes} onChange={e => setDuration({...duration, minutes: Number(e.target.value)})} className="tech-input text-center rounded-xl" />
                        <input type="number" value={duration.seconds} onChange={e => setDuration({...duration, seconds: Number(e.target.value)})} className="tech-input text-center rounded-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5">
                    <button onClick={pickTargetDir} disabled={isCalculating} className={`w-full py-4 px-5 rounded-2xl border flex items-center justify-between text-[11px] transition-all ${targetHandle ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-[var(--text-dim)] border-white/10'}`}>
                      <div className="flex items-center gap-3 truncate">
                        <FolderTree className={`w-4 h-4 ${isCalculating ? 'animate-bounce' : ''}`} />
                        <span>{isCalculating ? 'Scanning...' : (targetHandle ? targetHandle.name : 'Choose Drive Path...')}</span>
                      </div>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            </div>

            <div className="h-full flex flex-col min-h-0">
               <div className="p-10 rounded-3xl h-full glass border border-[var(--border)] flex flex-col min-h-0 overflow-hidden shadow-2xl relative">
                  <div className="flex flex-col items-center justify-start space-y-12 overflow-y-auto pr-2 custom-scrollbar flex-1 relative z-10 pt-10">
                    <div className="flex flex-col items-center text-center">
                       <div className="flex items-baseline gap-3">
                         <span className="text-[100px] lg:text-[120px] font-black tracking-tighter text-[var(--text-main)] italic leading-none drop-shadow-2xl">{storageResult.size.toFixed(2)}</span>
                         <span className="text-3xl font-black text-[var(--accent)] uppercase italic">{storageResult.unit}</span>
                       </div>
                    </div>

                    <div className="relative flex items-center justify-center w-full max-w-[440px] aspect-square">
                       <svg className="w-full h-full -rotate-90" viewBox="0 0 400 400">
                         {/* All fills must be "none" to prevent the center from capturing pointer events */}
                         <circle cx="200" cy="200" r="145" fill="none" stroke="var(--border)" strokeWidth="34" className="opacity-10" />
                         
                         <motion.circle cx="200" cy="200" r="145" fill="none" stroke="var(--text-dim)" strokeWidth="34" strokeDasharray={2*Math.PI*145} strokeDashoffset={(2*Math.PI*145)*(1-(usedSpace/driveCapacity))} onMouseEnter={() => setHoveredSegment('used')} onMouseLeave={() => setHoveredSegment(null)} className={`transition-all duration-300 cursor-pointer ${hoveredSegment === 'used' ? 'opacity-60 stroke-[44]' : 'opacity-20'}`} />
                         
                         <motion.circle cx="200" cy="200" r="145" fill="none" stroke="var(--accent)" strokeWidth="34" strokeDasharray={2*Math.PI*145} strokeDashoffset={(2*Math.PI*145)*(1-(videoSize/driveCapacity))} style={{ rotate: `${(usedSpace/driveCapacity)*360}deg`, transformOrigin: 'center' }} onMouseEnter={() => setHoveredSegment('video')} onMouseLeave={() => setHoveredSegment(null)} className={`transition-all duration-300 cursor-pointer ${hoveredSegment==='video'?'stroke-[44]':'opacity-80'}`} />
                         
                         <motion.circle cx="200" cy="200" r="145" fill="none" stroke="#f59e0b" strokeWidth="34" strokeDasharray={2*Math.PI*145} strokeDashoffset={(2*Math.PI*145)*(1-(audioSize/driveCapacity))} style={{ rotate: `${((usedSpace+videoSize)/driveCapacity)*360}deg`, transformOrigin: 'center' }} onMouseEnter={() => setHoveredSegment('audio')} onMouseLeave={() => setHoveredSegment(null)} className={`transition-all duration-300 cursor-pointer ${hoveredSegment==='audio'?'stroke-[44]':'opacity-80'}`} />
                         
                         <motion.circle cx="200" cy="200" r="145" fill="none" stroke="#a855f7" strokeWidth="34" strokeDasharray={2*Math.PI*145} strokeDashoffset={(2*Math.PI*145)*(1-(bufferSize/driveCapacity))} style={{ rotate: `${((usedSpace+videoSize+audioSize)/driveCapacity)*360}deg`, transformOrigin: 'center' }} onMouseEnter={() => setHoveredSegment('buffer')} onMouseLeave={() => setHoveredSegment(null)} className={`transition-all duration-300 cursor-pointer ${hoveredSegment==='buffer'?'stroke-[44]':'opacity-40'}`} />

                         <motion.circle 
                            cx="200" cy="200" r="145" 
                            fill="none" 
                            stroke="transparent" 
                            strokeWidth="34" 
                            strokeDasharray={2*Math.PI*145} 
                            strokeDashoffset={(2*Math.PI*145)*(1-(freeSpace/driveCapacity))} 
                            style={{ rotate: `${((usedSpace+videoSize+audioSize+bufferSize)/driveCapacity)*360}deg`, transformOrigin: 'center' }} 
                            onMouseEnter={() => setHoveredSegment('free')} 
                            onMouseLeave={() => setHoveredSegment(null)} 
                            className="cursor-pointer" 
                          />
                       </svg>
                       <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <motion.div 
                            className="absolute text-right"
                            animate={{ 
                              x: -280, 
                              y: -120,
                              scale: hoveredSegment === 'free' ? 1.15 : 1,
                              opacity: (hoveredSegment && hoveredSegment !== 'free') ? 0.3 : 1
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          >
                            <span className="text-[10px] uppercase font-black text-green-500 tracking-widest">Free Remaining</span>
                            <div className="text-2xl font-black text-green-500 italic leading-none">{freeSpace.toFixed(1)} GB</div>
                          </motion.div>

                          <motion.div 
                            className="absolute text-right"
                            animate={{ 
                              x: -280, 
                              y: 10,
                              scale: hoveredSegment === 'buffer' ? 1.15 : 1,
                              opacity: (hoveredSegment && hoveredSegment !== 'buffer') ? 0.3 : 1
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          >
                            <span className="text-[10px] uppercase font-black text-purple-400 tracking-widest flex items-center justify-end gap-1">
                              <ShieldCheck className="w-3 h-3" /> Buffer Space
                            </span>
                            <div className="text-2xl font-black text-purple-400 italic leading-none">{bufferSize.toFixed(1)} GB</div>
                          </motion.div>

                          <motion.div 
                            className="absolute text-left"
                            animate={{ 
                              x: 280, 
                              y: -120,
                              scale: hoveredSegment === 'used' ? 1.15 : 1,
                              opacity: (hoveredSegment && hoveredSegment !== 'used') ? 0.3 : 1
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          >
                            <span className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-widest">Drive Used</span>
                            <div className="text-2xl font-black text-[var(--text-dim)] italic leading-none">{usedSpace.toFixed(1)} GB</div>
                          </motion.div>

                          <motion.div 
                            className="absolute text-left"
                            animate={{ 
                              x: 280, 
                              y: 10,
                              scale: hoveredSegment === 'video' ? 1.15 : 1,
                              opacity: (hoveredSegment && hoveredSegment !== 'video') ? 0.3 : 1
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          >
                            <span className="text-[10px] uppercase font-black text-[var(--accent)] tracking-widest flex items-center gap-1">
                              <Video className="w-3 h-3" /> Video Size
                            </span>
                            <div className="text-2xl font-black text-[var(--accent)] italic leading-none">{videoSize.toFixed(1)} GB</div>
                          </motion.div>

                          <motion.div 
                            className="absolute text-left"
                            animate={{ 
                              x: 280, 
                              y: 110,
                              scale: hoveredSegment === 'audio' ? 1.15 : 1,
                              opacity: (hoveredSegment && hoveredSegment !== 'audio') ? 0.3 : 1
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          >
                            <span className="text-[10px] uppercase font-black text-amber-500 tracking-widest flex items-center gap-1">
                              <Music className="w-3 h-3" /> Audio Size
                            </span>
                            <div className="text-2xl font-black text-amber-500 italic leading-none">{audioSize.toFixed(1)} GB</div>
                          </motion.div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
