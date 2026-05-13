import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HardDrive, Sun, Moon, LayoutDashboard, AlertCircle, Clock, Video, Music, ShieldCheck, X } from 'lucide-react';
import ToolSidebar from './ToolSidebar';

export default function StorageEstimator({ setPage, isDark, toggleTheme }: { setPage: (p: string) => void, isDark?: boolean, toggleTheme?: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Storage Estimator State
  const [format, setFormat] = useState('');
  const [resolution, setResolution] = useState('');
  const [frameRate, setFrameRate] = useState(0);
  const [audioCodec, setAudioCodec] = useState('');
  const [audioChannels, setAudioChannels] = useState(0);
  const [duration, setDuration] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [includeVideo, setIncludeVideo] = useState(false);
  const [includeAudio, setIncludeAudio] = useState(false);
  const [storageResult, setStorageResult] = useState({ size: 0, unit: 'GB' });
  const [videoSize, setVideoSize] = useState(0);
  const [audioSize, setAudioSize] = useState(0);
  const [selectedDrive, setSelectedDrive] = useState<string>('Local');
  const [driveCapacity, setDriveCapacity] = useState<number>(0); // GB
  const [usedSpace, setUsedSpace] = useState<number>(0); // GB
  const [targetDriveName, setTargetDriveName] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const [pendingType, setPendingType] = useState('SSD');
  const [pendingCapacity, setPendingCapacity] = useState(1000);

  const selectPreset = (name: string, capacity: number) => {
    setTargetDriveName(name);
    setDriveCapacity(capacity);
    setUsedSpace(0);
  };

  const resetDrive = () => {
    setTargetDriveName(null);
    setUsedSpace(0);
    setDriveCapacity(0);
  };

  // Bitrates in Mbps at 4K 24p (Standardized)
  const bitrateMap: Record<string, number> = {
    'ProRes 4444 XQ': 1697, 
    'ProRes 4444': 1131, 
    'ProRes 422 HQ': 707, 
    'ProRes 422': 471,
    'ProRes 422 LT': 330, 
    'ProRes 422 Proxy': 147, 
    'DNxHR 444': 1130, 
    'DNxHR HQX': 710,
    'H.264 (High)': 100, 
    'H.265 (High)': 60, 
    'ARRIRAW 3.4K': 1800, 
    'REDCODE 8:1': 800,
    'REDCODE 5:1': 1200, 
    'XAVC-I 4K': 240,
  };

  const audioBitrates: Record<string, number> = {
    'PCM 32-bit float 48kHz': 1.536, 
    'PCM 24-bit 48kHz': 1.152, 
    'PCM 16-bit 48kHz': 0.768,
    'AAC 320kbps': 0.32, 
    'MP3 320kbps': 0.32, 
    'FLAC Lossless': 0.8,
  };

  useEffect(() => {
    const baseBitrate = bitrateMap[format];
    if (!baseBitrate) {
      setVideoSize(0);
      setAudioSize(0);
      setStorageResult({ size: 0, unit: 'GB' });
      return;
    }
    
    // Precise Resolution Scaling (Targeting 4K as 1.0)
    let resScale = 0;
    if (resolution.includes('HD')) resScale = (1920 * 1080) / (3840 * 2160); // 0.25
    else if (resolution.includes('2K')) resScale = (2048 * 1080) / (3840 * 2160); // ~0.26
    else if (resolution.includes('4K')) resScale = 1;
    else if (resolution.includes('6K')) resScale = (6144 * 3160) / (3840 * 2160); // ~2.34
    else if (resolution.includes('8K')) resScale = (7680 * 4320) / (3840 * 2160); // 4.0
    
    if (resScale === 0 || frameRate === 0) {
      setVideoSize(0);
      setAudioSize(0);
      setStorageResult({ size: 0, unit: 'GB' });
      return;
    }

    const frameRateMultiplier = frameRate / 24;
    const singleChannelAudioMbps = audioBitrates[audioCodec] || 1.152;
    
    // Standard File System Overhead (Approx 3%)
    const OVERHEAD = 1.03;
    
    const rawVideoBitrateMbps = includeVideo ? (baseBitrate * resScale * frameRateMultiplier) : 0;
    const audioBitrateMbps = includeAudio ? (audioChannels * singleChannelAudioMbps) : 0;
    
    const totalSeconds = (duration.hours * 3600) + (duration.minutes * 60) + duration.seconds;
    
    // Decimal GB Calculation (10^9 bits to GB)
    const videoGB = ((rawVideoBitrateMbps * totalSeconds) / 8) / 1000;
    const audioGB = ((audioBitrateMbps * totalSeconds) / 8) / 1000;
    const totalGB = (videoGB + audioGB) * OVERHEAD;
    
    setVideoSize(videoGB * OVERHEAD);
    setAudioSize(audioGB * OVERHEAD);
    
    if (totalGB >= 1000) {
      setStorageResult({ size: totalGB / 1000, unit: 'TB' });
    } else {
      setStorageResult({ size: totalGB, unit: 'GB' });
    }
  }, [format, resolution, frameRate, audioCodec, audioChannels, duration, includeVideo, includeAudio]);

  const bufferSize = (videoSize + audioSize) * 0.2;
  const totalRequired = usedSpace + videoSize + audioSize + bufferSize;
  
  // Use totalRequired as capacity when no drive is selected for better visualization
  const visCapacity = driveCapacity > 0 ? driveCapacity : (totalRequired > 0 ? totalRequired : 1);
  
  const freeSpace = driveCapacity > 0 ? Math.max(0, driveCapacity - totalRequired) : 0;
  const isOverflow = driveCapacity > 0 && totalRequired > driveCapacity;
  const overflowAmount = isOverflow ? totalRequired - driveCapacity : 0;

  const getRatio = (val: number) => (totalRequired > 0 || usedSpace > 0 ? val / visCapacity : 0);

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

      <div className="p-8 flex flex-col gap-8 h-full relative z-10 pt-24 max-w-[1600px] mx-auto w-full overflow-hidden">
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
                          <option value="" disabled>Select Video Codec...</option>
                          {Object.keys(bitrateMap).map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="label-micro">Resolution</label>
                          <select value={resolution} onChange={e => setResolution(e.target.value)} className="tech-input w-full rounded-xl">
                             <option value="" disabled>Select...</option>
                             <option>HD (1920x1080)</option><option>4K (3840x2160)</option><option>8K (7680x4320)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="label-micro">FPS</label>
                          <select value={frameRate} onChange={e => setFrameRate(Number(e.target.value))} className="tech-input w-full rounded-xl">
                            <option value={0} disabled>Select...</option>
                            {[23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60, 120].map(f => <option key={f} value={f}>{f} fps</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={`space-y-6 pt-6 border-t border-white/5 transition-all ${includeAudio ? '' : 'opacity-20 pointer-events-none'}`}>
                      <div className="space-y-2">
                        <label className="label-micro">Audio Codec</label>
                        <select value={audioCodec} onChange={e => setAudioCodec(e.target.value)} className="tech-input w-full rounded-xl">
                          <option value="" disabled>Select Audio Codec...</option>
                          {Object.keys(audioBitrates).map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="label-micro">Channels</label>
                        <select value={audioChannels} onChange={e => setAudioChannels(Number(e.target.value))} className="tech-input w-full rounded-xl">
                          <option value={0} disabled>Select Audio Channels...</option>
                          <option value={1}>Mono (1.0)</option>
                          <option value={2}>Stereo (2.0)</option>
                          <option value={6}>Surround (5.1)</option>
                          <option value={8}>Immersive (7.1)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-white/5">
                      <label className="label-micro flex items-center gap-2"><Clock className="w-3 h-3" /> Capture Duration</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <input type="number" min="0" value={duration.hours} onChange={e => setDuration({...duration, hours: Number(e.target.value)})} className="tech-input text-center rounded-xl w-full" />
                          <p className="text-[9px] font-black text-center text-[var(--text-dim)] uppercase tracking-widest">Hrs</p>
                        </div>
                        <div className="space-y-1">
                          <input type="number" min="0" max="59" value={duration.minutes} onChange={e => setDuration({...duration, minutes: Number(e.target.value)})} className="tech-input text-center rounded-xl w-full" />
                          <p className="text-[9px] font-black text-center text-[var(--text-dim)] uppercase tracking-widest">Min</p>
                        </div>
                        <div className="space-y-1">
                          <input type="number" min="0" max="59" value={duration.seconds} onChange={e => setDuration({...duration, seconds: Number(e.target.value)})} className="tech-input text-center rounded-xl w-full" />
                          <p className="text-[9px] font-black text-center text-[var(--text-dim)] uppercase tracking-widest">Sec</p>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="h-full flex flex-col min-h-0">
               <div className="p-6 lg:p-8 rounded-3xl h-full glass border border-[var(--border)] flex flex-col min-h-0 overflow-hidden shadow-2xl relative">
                  <div className="flex flex-col items-center justify-start space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 relative z-10 pt-4 px-4">
                      {/* Condensed Header */}
                      <div className="flex flex-col items-center text-center pb-0">
                       <p className="label-micro text-[var(--text-dim)] mb-0 opacity-60">Estimated Export Footprint</p>
                       <div className="flex items-baseline gap-2">
                         <span className="text-[64px] lg:text-[84px] font-black tracking-tighter text-[var(--text-main)] italic leading-none drop-shadow-2xl">{storageResult.size.toFixed(2)}</span>
                         <span className="text-xl font-black text-[var(--accent)] uppercase italic">{storageResult.unit}</span>
                       </div>
                    </div>

                    <div className="flex flex-col xl:flex-row items-center justify-center gap-6 lg:gap-12 w-full max-w-7xl mx-auto px-6">
                       {/* Left Side Labels */}
                       <div className="hidden xl:flex flex-col items-start gap-8 w-[180px] shrink-0 pointer-events-none">
                          {targetDriveName && (
                            <motion.div 
                              animate={{ 
                                scale: hoveredSegment === 'free' ? 1.1 : 1,
                                opacity: (hoveredSegment && hoveredSegment !== 'free') ? 0.3 : 1
                              }}
                            >
                              <span className={`text-[10px] uppercase font-black tracking-widest ${isOverflow ? 'text-red-500' : 'text-green-500'}`}>
                                {isOverflow ? 'Drive Deficit' : 'Free Remaining'}
                              </span>
                              <div className={`text-xl font-black italic leading-none ${isOverflow ? 'text-red-500' : 'text-green-500'}`}>
                                {isOverflow ? `-${overflowAmount.toFixed(1)}` : freeSpace.toFixed(1)} GB
                              </div>
                            </motion.div>
                          )}

                          {bufferSize > 0 && (
                            <motion.div 
                              animate={{ 
                                scale: hoveredSegment === 'buffer' ? 1.15 : 1,
                                opacity: (hoveredSegment && hoveredSegment !== 'buffer') ? 0.3 : 1
                              }}
                            >
                              <span className="text-[10px] uppercase font-black text-purple-400 tracking-widest flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Buffer Space
                              </span>
                              <div className="text-xl font-black text-purple-400 italic leading-none">{bufferSize.toFixed(1)} GB</div>
                            </motion.div>
                          )}
                       </div>

                        <div className="relative flex flex-col items-center justify-center w-full max-w-[280px] lg:max-w-[340px] shrink-0">
                            <div className="relative aspect-square w-full">
                            {!targetDriveName ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none p-4">
                               <div className="flex flex-col gap-2.5 w-full max-w-[180px] pointer-events-auto glass p-5 rounded-2xl border border-white/10 shadow-2xl">
                                 <p className="label-micro text-center mb-0.5 text-[var(--accent)] tracking-widest">Target Drive</p>
                                 <div className="space-y-1">
                                   <select 
                                     value={pendingCapacity} 
                                     onChange={e => setPendingCapacity(Number(e.target.value))}
                                     className="w-full text-[10px] h-9 rounded-xl bg-black/60 border border-white/10 px-3 text-white font-mono appearance-none cursor-pointer hover:border-[var(--accent)] transition-all outline-none"
                                   >
                                     <option value={128} className="bg-[#1a1a1a]">128 GB</option>
                                     <option value={256} className="bg-[#1a1a1a]">256 GB</option>
                                     <option value={512} className="bg-[#1a1a1a]">512 GB</option>
                                     <option value={1000} className="bg-[#1a1a1a]">1 TB</option>
                                     <option value={2000} className="bg-[#1a1a1a]">2 TB</option>
                                     <option value={4000} className="bg-[#1a1a1a]">4 TB</option>
                                     <option value={8000} className="bg-[#1a1a1a]">8 TB</option>
                                     <option value={16000} className="bg-[#1a1a1a]">16 TB</option>
                                     <option value={32000} className="bg-[#1a1a1a]">32 TB</option>
                                   </select>
                                 </div>
                                 <button 
                                   onClick={() => selectPreset(`Capacity: ${pendingCapacity >= 1000 ? (pendingCapacity/1000) + 'TB' : pendingCapacity + 'GB'}`, pendingCapacity)}
                                   className="w-full mt-0.5 h-9 rounded-xl bg-[var(--accent)] text-white text-[9px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-xl border border-white/10"
                                 >
                                   Initialize Drive
                                 </button>
                               </div>
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 m-6 pointer-events-none">
                               <motion.div 
                                 initial={{ scale: 0.9, opacity: 0 }}
                                 animate={{ scale: 1, opacity: 1 }}
                                 className="flex flex-col items-center"
                               >
                                 <HardDrive className={`w-10 h-10 mb-2 drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] ${isOverflow ? 'text-red-500 animate-pulse' : 'text-[var(--accent)]'}`} />
                                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-main)] max-w-[100px] text-center truncate">{targetDriveName}</p>
                                 <button 
                                   onClick={resetDrive}
                                   className="mt-3 h-6 px-3 glass-button text-[8px] font-bold tracking-widest text-[var(--text-dim)] hover:text-red-500 transition-all pointer-events-auto"
                                 >
                                   <X className="w-2.5 h-2.5 mr-1 text-red-500" /> REMOVE DRIVE
                                 </button>
                               </motion.div>
                            </div>
                          ) }
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 400 400">
                            <circle cx="200" cy="200" r="145" fill="none" stroke="var(--border)" strokeWidth="34" className="opacity-10" />
                             
                            {/* Visual Normalization Logic for Arcs */}
                            {(() => {
                              const totalRaw = usedSpace + videoSize + audioSize + bufferSize;
                              const visScaleFactor = (driveCapacity > 0 && totalRaw > driveCapacity) ? (driveCapacity / totalRaw) : 1;
                              
                              const getNormalizedRatio = (val: number) => {
                                if (driveCapacity <= 0) return (totalRaw > 0 ? val / totalRaw : 0);
                                const rawRatio = val / driveCapacity;
                                return isOverflow ? (rawRatio * visScaleFactor) : rawRatio;
                              };

                              let currentRotation = 0;

                              return (
                                <>
                                  {/* Used Space */}
                                  <motion.circle cx="200" cy="200" r="145" fill="none" stroke="var(--text-dim)" strokeWidth="34" strokeDasharray={2*Math.PI*145} strokeDashoffset={(2*Math.PI*145)*(1-getNormalizedRatio(usedSpace))} onMouseEnter={() => setHoveredSegment('used')} onMouseLeave={() => setHoveredSegment(null)} className={`transition-all duration-300 cursor-pointer ${hoveredSegment === 'used' ? 'opacity-60 stroke-[44]' : 'opacity-20'}`} />
                                  {(() => { currentRotation += getNormalizedRatio(usedSpace); return null; })()}

                                  {/* Video */}
                                  <motion.circle cx="200" cy="200" r="145" fill="none" stroke="var(--accent)" strokeWidth="34" strokeDasharray={2*Math.PI*145} strokeDashoffset={(2*Math.PI*145)*(1-getNormalizedRatio(videoSize))} style={{ rotate: `${currentRotation*360}deg`, transformOrigin: 'center' }} onMouseEnter={() => setHoveredSegment('video')} onMouseLeave={() => setHoveredSegment(null)} className={`transition-all duration-300 cursor-pointer ${hoveredSegment==='video'?'stroke-[44]':'opacity-80'}`} />
                                  {(() => { currentRotation += getNormalizedRatio(videoSize); return null; })()}

                                  {/* Audio */}
                                  <motion.circle cx="200" cy="200" r="145" fill="none" stroke="#f59e0b" strokeWidth="34" strokeDasharray={2*Math.PI*145} strokeDashoffset={(2*Math.PI*145)*(1-getNormalizedRatio(audioSize))} style={{ rotate: `${currentRotation*360}deg`, transformOrigin: 'center' }} onMouseEnter={() => setHoveredSegment('audio')} onMouseLeave={() => setHoveredSegment(null)} className={`transition-all duration-300 cursor-pointer ${hoveredSegment==='audio'?'stroke-[44]':'opacity-80'}`} />
                                  {(() => { currentRotation += getNormalizedRatio(audioSize); return null; })()}

                                  {/* Buffer */}
                                  <motion.circle cx="200" cy="200" r="145" fill="none" stroke="#a855f7" strokeWidth="34" strokeDasharray={2*Math.PI*145} strokeDashoffset={(2*Math.PI*145)*(1-getNormalizedRatio(bufferSize))} style={{ rotate: `${currentRotation*360}deg`, transformOrigin: 'center' }} onMouseEnter={() => setHoveredSegment('buffer')} onMouseLeave={() => setHoveredSegment(null)} className={`transition-all duration-300 cursor-pointer ${hoveredSegment==='buffer'?'stroke-[44]':'opacity-40'}`} />
                                  
                                  {/* Overflow Danger Ring */}
                                  {isOverflow && (
                                    <motion.circle 
                                      cx="200" cy="200" r="168" 
                                      fill="none" 
                                      stroke="#ef4444" 
                                      strokeWidth="3" 
                                      strokeDasharray={2*Math.PI*168} 
                                      className="opacity-40"
                                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    />
                                  )}
                                </>
                              );
                            })()}
                          </svg>

                            </div>

                            <div className="w-full max-w-[280px] mt-6 mb-4">
                              <div className="p-4 rounded-2xl glass border border-[var(--border)] flex flex-col items-center bg-black/20 shadow-xl">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-1">Total Projected Footprint</p>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-black italic text-[var(--text-main)]">
                                    {totalRequired >= 1000 ? (totalRequired / 1000).toFixed(2) : totalRequired.toFixed(2)}
                                  </span>
                                  <span className="text-[10px] font-black text-[var(--text-dim)] uppercase">
                                    {totalRequired >= 1000 ? 'TB' : 'GB'}
                                  </span>
                                </div>
                              </div>
                            </div>

                          {isOverflow && (
                           <motion.div 
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="absolute bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 z-30 shadow-2xl backdrop-blur-md"
                           >
                             <AlertCircle className="w-5 h-5 shrink-0" />
                             <div className="whitespace-nowrap">
                               <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Critical Overflow Impact</p>
                               <p className="text-xs font-bold">Additional {overflowAmount.toFixed(1)} GB required on target</p>
                             </div>
                           </motion.div>
                          )}
                       </div>

                        {/* Right Side Labels */}
                       <div className="hidden xl:flex flex-col items-end gap-10 w-[180px] shrink-0 pointer-events-none">
                          {(targetDriveName || usedSpace > 0) && (
                            <motion.div 
                              animate={{ 
                                scale: hoveredSegment === 'used' ? 1.1 : 1,
                                opacity: (hoveredSegment && hoveredSegment !== 'used') ? 0.3 : 1
                              }}
                            >
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-widest leading-none">Drive Capacity</span>
                                {targetDriveName ? (
                                  <select 
                                    value={driveCapacity} 
                                    onChange={(e) => setDriveCapacity(Number(e.target.value))}
                                    className="bg-transparent border-none text-[11px] font-bold text-[var(--text-dim)] cursor-pointer outline-none mb-1 hover:text-[var(--accent)] transition-colors p-0 decoration-dotted underline text-right pointer-events-auto"
                                  >
                                    {[128, 256, 512, 1000, 2000, 4000, 8000, 16000, 32000].map(c => (
                                      <option key={c} value={c} className="bg-[#111] text-white">{(c >= 1000 ? (c/1000).toFixed(0) : c) + (c >= 1000 ? ' TB' : ' GB')}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="text-[10px] font-bold text-[var(--text-dim)] mb-1 opacity-50">Auto Scale</div>
                                )}
                                <span className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-widest">Used Space</span>
                                <div className="text-xl font-black text-[var(--text-dim)] italic leading-none">{usedSpace.toFixed(1)} GB</div>
                              </div>
                            </motion.div>
                          )}

                          {videoSize > 0 && (
                            <motion.div 
                              animate={{ 
                                scale: hoveredSegment === 'video' ? 1.1 : 1,
                                opacity: (hoveredSegment && hoveredSegment !== 'video') ? 0.3 : 1
                              }}
                            >
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-black text-[var(--accent)] tracking-widest flex items-center justify-end gap-1">
                                  <Video className="w-3 h-3" /> Video Size
                                </span>
                                <div className="text-xl font-black text-[var(--accent)] italic leading-none">{videoSize.toFixed(1)} GB</div>
                              </div>
                            </motion.div>
                          )}

                          {audioSize > 0 && (
                            <motion.div 
                              animate={{ 
                                scale: hoveredSegment === 'audio' ? 1.1 : 1,
                                opacity: (hoveredSegment && hoveredSegment !== 'audio') ? 0.3 : 1
                              }}
                            >
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-black text-amber-500 tracking-widest flex items-center justify-end gap-1">
                                  <Music className="w-3 h-3" /> Audio Size
                                </span>
                                <div className="text-xl font-black text-amber-500 italic leading-none">{audioSize.toFixed(1)} GB</div>
                              </div>
                            </motion.div>
                          )}
                       </div>

                       {/* Mobile/Compact Grid Legend */}
                       <div className="xl:hidden grid grid-cols-2 gap-x-8 gap-y-4 mt-2 w-full px-4 pb-6">
                          {targetDriveName && freeSpace > 0 && (
                            <div className="flex flex-col">
                              <span className={`text-[10px] uppercase font-black tracking-widest ${isOverflow ? 'text-red-500' : 'text-green-500'}`}>
                                Free Capacity
                              </span>
                              <div className={`text-xl font-black italic ${isOverflow ? 'text-red-500' : 'text-green-500'}`}>
                                {isOverflow ? `-${overflowAmount.toFixed(1)}` : freeSpace.toFixed(1)} GB
                              </div>
                            </div>
                          )}
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-widest">Used Space</span>
                            <div className="text-xl font-black italic">{usedSpace.toFixed(1)} GB</div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black text-[var(--accent)] tracking-widest flex items-center gap-1">
                              <Video className="w-3 h-3" /> Video
                            </span>
                            <div className="text-xl font-black italic">{videoSize.toFixed(1)} GB</div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-black text-amber-500 tracking-widest flex items-center gap-1">
                              <Music className="w-3 h-3" /> Audio
                            </span>
                            <div className="text-xl font-black italic">{audioSize.toFixed(1)} GB</div>
                          </div>
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
