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
  Layers,
  Download,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ToolSidebar from './ToolSidebar';

interface VideoMetadata {
  id: string;
  name: string;
  path: string;
  size: number;
  container: string;
  resolution: string;
  aspectRatio: string;
  duration: string;        // HH:MM:SS:FF
  startTimecode: string | null;
  endTimecode: string | null;
  codec: string;
  bitrate: string;
  fps: string;
  bitDepth: string;
  lastModified: number;
  creationDate: number;
}

export default function MetadataExtractor({ setPage, isDark, toggleTheme }: { setPage: (p: string) => void, isDark?: boolean, toggleTheme?: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [files, setFiles] = useState<VideoMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const calculateAspectRatio = (w: number, h: number) => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const r = gcd(w, h);
    return `${w / r}:${h / r}`;
  };

  const analyzeVideoWithMediaInfo = async (file: File, customPath?: string): Promise<VideoMetadata> => {
    // @ts-ignore
    const MediaInfoModule = await import('mediainfo.js');
    const MediaInfo = MediaInfoModule.default;
    
    let mediainfo: any = null;
    try {
      mediainfo = await MediaInfo({
        format: 'object',
        locateFile: (path: string) => `https://cdn.jsdelivr.net/npm/mediainfo.js/dist/${path}`
      });

      const getSize = () => file.size;
      const readChunk = (chunkSize: number, offset: number) =>
        new Promise<Uint8Array>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event: any) => resolve(new Uint8Array(event.target.result));
          reader.onerror = reject;
          reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize));
        });

      const result = await mediainfo.analyzeData(getSize, readChunk);
      console.log('MediaInfo Raw JSON:', result);

      const general = result.media.track.find((t: any) => t['@type'] === 'General') || {};
      const video = result.media.track.find((t: any) => t['@type'] === 'Video') || {};
      const tracks = result.media.track;

      // 1. Timecode Logic - Check 'Time code' and 'Other'
      const timecodeTrack = tracks.find((t: any) => t['@type'] === 'Time code' || t['@type'] === 'Other') ?? {};
      const startTimecode = timecodeTrack.TimeCode_FirstFrame ?? general.TimeCode_FirstFrame ?? null;
      const endTimecode = timecodeTrack.TimeCode_LastFrame || null;

      // 2. ProRes Codec Mapping
      const proResMap: Record<string, string> = {
        'apcn': 'Apple ProRes 422',
        'apch': 'Apple ProRes 422 HQ',
        'apcs': 'Apple ProRes 422 LT',
        'apco': 'Apple ProRes 422 Proxy',
        'ap4h': 'Apple ProRes 4444',
        'ap4x': 'Apple ProRes 4444 XQ',
      };
      
      const codecId = video.CodecID?.toLowerCase();
      const codecName = video.Format_Commercial || proResMap[codecId] || video.Format || 'UNKNOWN PRO CODEC';
      
      // 3. Bit Depth Fallback
      const getBitDepthString = (vTrack: any, name: string) => {
        if (vTrack.BitDepth) return `${vTrack.BitDepth}-bit`;
        if (name.includes('4444')) return '12-bit';
        if (name.includes('ProRes')) return '10-bit';
        if (name.includes('HEVC')) return '10-bit';
        return '8-bit';
      };
      const bitDepth = getBitDepthString(video, codecName);

      // 4. FPS Precision with fractions
      const rawFps = parseFloat(video.FrameRate || '23.976');
      const FPS_FRACTIONS: Record<number, [number, number]> = {
        23.976: [24000, 1001],
        29.97:  [30000, 1001],
        59.94:  [60000, 1001],
      };
      
      let durationMs = parseFloat(general.Duration || '0');
      // MediaInfo.js version check for duration unit (some versions return seconds)
      if (durationMs > 0 && durationMs < 10000 && file.size > 10 * 1024 * 1024) {
        durationMs *= 1000;
      }
      
      let totalFrames = 0;
      const matchedFraction = Object.entries(FPS_FRACTIONS).find(([key]) => Math.abs(parseFloat(key) - rawFps) < 0.01);
      
      if (matchedFraction) {
        const [num, den] = matchedFraction[1];
        totalFrames = Math.floor((durationMs / 1000) * num / den);
      } else {
        totalFrames = Math.floor((durationMs / 1000) * rawFps);
      }

      const hours = Math.floor(durationMs / 3600000);
      const minutes = Math.floor((durationMs % 3600000) / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      const frameOfSecond = totalFrames % Math.round(rawFps);

      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        path: customPath || (file as any).webkitRelativePath || file.name,
        size: file.size,
        container: general.Format || file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        resolution: video.Width ? `${video.Width}x${video.Height}` : 'UNKNOWN',
        aspectRatio: video.DisplayAspectRatio_String || (video.Width ? calculateAspectRatio(parseInt(video.Width), parseInt(video.Height)) : '16:9'),
        duration: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frameOfSecond.toString().padStart(2, '0')}`,
        startTimecode,
        endTimecode,
        codec: codecName,
        bitrate: general.OverallBitRate ? `${(parseFloat(general.OverallBitRate) / 1000000).toFixed(2)} Mbps` : 'UNKNOWN',
        fps: video.FrameRate || '23.976',
        bitDepth,
        lastModified: file.lastModified,
        creationDate: (file as any).lastModifiedDate?.getTime() || file.lastModified
      };
    } catch (err) {
      console.error('MediaInfo error:', err);
      return extractMetadataFallback(file, customPath);
    } finally {
      if (mediainfo) mediainfo.close();
    }
  };

  const extractMetadataFallback = async (file: File, customPath?: string): Promise<VideoMetadata> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const extension = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      const container = (file.type.split('/')[1]?.toUpperCase() || extension).replace('QUICKTIME', 'MOV');

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const durationSec = video.duration;
        const minutes = Math.floor(durationSec / 60);
        const seconds = Math.floor(durationSec % 60);
        const bitrateMbps = (file.size * 8) / (durationSec * 1000000);
        
        let detectedCodec = 'H.264 / AVC';
        if (bitrateMbps > 150) detectedCodec = 'ProRes / High-Res (EST)';
        
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          path: customPath || file.name,
          size: file.size,
          container,
          resolution: `${video.videoWidth}x${video.videoHeight}`,
          aspectRatio: calculateAspectRatio(video.videoWidth, video.videoHeight),
          duration: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:00`,
          startTimecode: null,
          endTimecode: null,
          codec: detectedCodec,
          bitrate: `${bitrateMbps.toFixed(2)} Mbps`,
          fps: '23.976',
          bitDepth: '8-bit',
          lastModified: file.lastModified,
          creationDate: (file as any).lastModifiedDate?.getTime() || file.lastModified
        });
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          path: customPath || file.name,
          size: file.size,
          container,
          resolution: 'UNKNOWN',
          aspectRatio: '16:9',
          duration: '00:00:00:00',
          startTimecode: null,
          endTimecode: null,
          codec: 'Unknown Codec',
          bitrate: '0 Mbps',
          fps: '23.976',
          bitDepth: '8-bit',
          lastModified: file.lastModified,
          creationDate: (file as any).lastModifiedDate?.getTime() || file.lastModified
        });
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const scanEntries = async (entries: FileSystemEntry[]): Promise<{ file: File, path: string }[]> => {
    let results: { file: File, path: string }[] = [];
    
    for (const entry of entries) {
      if (entry.isFile) {
        const file = await new Promise<File>((resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject));
        // Check if it's a video file or common raw format
        const ext = file.name.split('.').pop()?.toLowerCase();
        const videoExtensions = ['mov', 'mp4', 'mxf', 'r3d', 'arri', 'ari', 'mkv', 'avi'];
        if (videoExtensions.includes(ext || '') || file.type.startsWith('video/')) {
          results.push({ file, path: entry.fullPath.startsWith('/') ? entry.fullPath.substring(1) : entry.fullPath });
        }
      } else if (entry.isDirectory) {
        const directoryReader = (entry as FileSystemDirectoryEntry).createReader();
        const dirEntries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
          directoryReader.readEntries(resolve, reject);
        });
        const subResults = await scanEntries(dirEntries);
        results = [...results, ...subResults];
      }
    }
    return results;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const items = Array.from(e.dataTransfer.items);
    const entryItems = items.map(item => (item as any).webkitGetAsEntry()).filter(entry => entry !== null) as FileSystemEntry[];
    
    try {
      const discovered = await scanEntries(entryItems);
      const processed = await Promise.all(discovered.map(item => analyzeVideoWithMediaInfo(item.file, item.path)));
      setFiles(prev => [...prev, ...processed]);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsProcessing(true);
    const newFiles = Array.from(e.target.files) as File[];
    const processed = await Promise.all(newFiles.map(file => analyzeVideoWithMediaInfo(file, (file as any).webkitRelativePath || file.name)));
    setFiles(prev => [...prev, ...processed]);
    setIsProcessing(false);
    // Reset input
    e.target.value = '';
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
      f.container,
      f.codec,
      f.bitDepth,
      f.resolution,
      f.fps,
      f.startTimecode || '--:--:--:--',
      f.duration,
      formatSize(f.size),
      new Date(f.lastModified).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Filename', 'Format', 'Codec', 'Depth', 'Resolution', 'FPS', 'Start TC', 'Length', 'Weight', 'Modified']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [24, 119, 242] },
      styles: { fontSize: 7 }
    });

    doc.save('DIT_Full_Metadata_Report.pdf');
  };

  const exportCSV = () => {
    if (files.length === 0) return;
    
    const headers = ['Filename', 'Container', 'Codec', 'Bit Depth', 'Resolution', 'Aspect Ratio', 'FPS', 'Bitrate', 'Start TC', 'End TC', 'Duration', 'Size', 'Last Modified', 'Creation Date', 'Path'];
    const csvContent = [
      headers.join(','),
      ...files.map(f => [
        `"${f.name}"`,
        `"${f.container}"`,
        `"${f.codec}"`,
        `"${f.bitDepth}"`,
        `"${f.resolution}"`,
        `"${f.aspectRatio}"`,
        `"${f.fps}"`,
        `"${f.bitrate}"`,
        `"${f.startTimecode || ''}"`,
        `"${f.endTimecode || ''}"`,
        `"${f.duration}"`,
        `"${f.size}"`,
        `"${new Date(f.lastModified).toISOString()}"`,
        `"${new Date(f.creationDate).toISOString()}"`,
        `"${f.path}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `DIT_Metadata_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n');
      if (lines.length < 2) return;

      const newFiles: VideoMetadata[] = [];
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parser for quoted values
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!values || values.length < 15) continue;

        const cleanValues = values.map(v => v.replace(/^"|"$/g, ''));

        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: cleanValues[0],
          container: cleanValues[1],
          codec: cleanValues[2],
          bitDepth: cleanValues[3],
          resolution: cleanValues[4],
          aspectRatio: cleanValues[5],
          fps: cleanValues[6],
          bitrate: cleanValues[7],
          startTimecode: cleanValues[8] || null,
          endTimecode: cleanValues[9] || null,
          duration: cleanValues[10],
          size: parseInt(cleanValues[11]) || 0,
          lastModified: Date.parse(cleanValues[12]) || Date.now(),
          creationDate: Date.parse(cleanValues[13]) || Date.now(),
          path: cleanValues[14] || cleanValues[0]
        });
      }
      setFiles(prev => [...prev, ...newFiles]);
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
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

      <div className="p-8 flex flex-col gap-8 h-full overflow-hidden relative z-10 pt-24 max-w-[1600px] mx-auto w-full">

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-stretch flex-1 min-h-0 pb-12 overflow-hidden">
          
          {/* Left: Upload Zone */}
          <div className="h-full flex flex-col min-h-0">
             <div className="p-10 rounded-3xl h-full glass border border-[var(--border)] flex flex-col min-h-0 overflow-hidden shadow-2xl space-y-8">
                <div className="space-y-2">
                  <h3 className="label-micro font-bold uppercase tracking-widest text-[var(--text-dim)]">Ingestion Service</h3>
                  <p className="text-[11px] text-[var(--text-micro)] italic text-balance">Batch process cinematic assets for atomic data verification</p>
                </div>

                <div className="relative flex-1 group">
                  <div 
                    className="absolute inset-0 z-20 cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                  />
                  <input 
                    type="file" 
                    id="file-upload-input"
                    multiple 
                    // @ts-ignore
                    webkitdirectory=""
                    // @ts-ignore
                    directory=""
                    accept="video/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                  <div className="h-full border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-4 group-hover:border-[var(--accent)] transition-all bg-[var(--bg-shell)]/30 backdrop-blur-sm">
                    <div className="p-4 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)]">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[var(--text-main)] italic uppercase tracking-wider">Drop Files or Folders</p>
                      <p className="text-[10px] text-[var(--text-dim)]">Supports PRORES, BRAW, R3D, MP4 Recursive</p>
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
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={exportCSV}
                      disabled={files.length === 0}
                      className="flex-1 py-3 bg-[var(--bg-shell)]/50 text-[var(--text-main)] rounded-xl font-bold text-[9px] tracking-widest hover:bg-[var(--bg-shell)] transition-all flex items-center justify-center gap-2 border border-[var(--border)] uppercase disabled:opacity-30"
                      title="Export CSV Backup"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                    
                    <div className="flex-1 relative">
                      <input 
                        type="file" 
                        accept=".csv"
                        onChange={importCSV}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <button 
                        className="w-full py-3 bg-[var(--bg-shell)]/50 text-[var(--text-main)] rounded-xl font-bold text-[9px] tracking-widest hover:bg-[var(--bg-shell)] transition-all flex items-center justify-center gap-2 border border-[var(--border)] uppercase"
                      >
                        <Database className="w-3.5 h-3.5" /> Load CSV
                      </button>
                    </div>
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
                  className="h-9 px-4 glass-button text-[10px] font-bold hover:text-red-400 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" /> CLEAR
                </button>
              </div>

              <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                {files.length > 0 ? (
                  <div className="min-w-[800px]">
                    <div className="grid grid-cols-[1fr_120px_120px_100px_180px_100px_100px] gap-4 px-6 py-4 border-b border-[var(--border)] label-micro text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-bold sticky top-0 bg-[var(--bg-shell)]/80 backdrop-blur-md z-20">
                      <div>Filename</div>
                      <div>Start TC</div>
                      <div>Length</div>
                      <div>Resolution</div>
                      <div>Codec</div>
                      <div>Bit Depth</div>
                      <div>FPS</div>
                    </div>
                    
                    <div className="flex flex-col">
                      {files.map((file) => (
                        <div key={file.id} className="border-b border-[var(--border)]/30">
                          <motion.div 
                            onClick={() => setExpandedId(expandedId === file.id ? null : file.id)}
                            className={`grid grid-cols-[1fr_120px_120px_100px_180px_100px_100px] gap-4 px-6 py-4 items-center cursor-pointer transition-all hover:bg-[var(--accent-soft)]/20 ${expandedId === file.id ? 'bg-[var(--accent-soft)]/30' : ''}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <FileVideo className={`w-4 h-4 shrink-0 ${expandedId === file.id ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'}`} />
                              <span className="text-xs font-bold text-[var(--text-main)] truncate italic uppercase tracking-wider">{file.name}</span>
                            </div>
                            <div className="text-[11px] font-mono font-bold text-[var(--text-main)]">{file.startTimecode || '—'}</div>
                            <div className="text-[11px] font-mono font-bold text-[var(--accent)] italic">{file.duration}</div>
                            <div className="text-[11px] font-mono font-bold text-[var(--text-main)] opacity-70">{file.resolution}</div>
                            <div>
                              <span className="px-2 py-0.5 rounded-md bg-[var(--bg-shell)] border border-[var(--border)] text-[9px] font-black text-[var(--accent-text)] uppercase tracking-tighter truncate block w-fit">
                                {file.codec}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-[var(--text-dim)] uppercase">{file.bitDepth}</div>
                            <div className="text-[11px] font-bold text-[var(--text-dim)]">{file.fps}</div>
                          </motion.div>

                          <AnimatePresence>
                            {expandedId === file.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-[var(--bg-shell)]/40"
                              >
                                <div className="p-8 pb-10">
                                  {/* Detail Header */}
                                  <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent-text)]">
                                        <FileVideo className="w-5 h-5" />
                                      </div>
                                      <div className="space-y-0.5">
                                        <h4 className="text-sm font-black text-[var(--text-main)] italic uppercase">{file.name}</h4>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">{formatSize(file.size)}</span>
                                          <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">{file.container}</span>
                                          <span className="px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[8px] font-black text-[var(--accent-text)] uppercase">{file.codec}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => removeFile(file.id)}
                                      className="h-8 px-3 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                      <X className="w-3.5 h-3.5" /> Remove
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-4 gap-0 divide-x divide-[var(--border)]/50">
                                    {/* TIME SECTION */}
                                    <div className="px-6 first:pl-0">
                                      <h5 className="label-micro text-[10px] text-[var(--accent)] mb-4 uppercase tracking-widest font-black">Time</h5>
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Start TC</span>
                                          <span className="text-xs font-mono font-bold text-[var(--text-main)]">{file.startTimecode || '—'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">End TC</span>
                                          <span className="text-xs font-mono font-bold text-[var(--text-main)]">{file.endTimecode || '—'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Length</span>
                                          <span className="text-xs font-mono font-bold text-[var(--accent)]">{file.duration}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* VIDEO SECTION */}
                                    <div className="px-6">
                                      <h5 className="label-micro text-[10px] text-[var(--accent)] mb-4 uppercase tracking-widest font-black">Video</h5>
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Resolution</span>
                                          <span className="text-xs font-bold text-[var(--text-main)]">{file.resolution}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Framerate</span>
                                          <span className="text-xs font-bold text-[var(--text-main)]">{file.fps} FPS</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Aspect Ratio</span>
                                          <span className="text-xs font-bold text-[var(--text-main)]">{file.aspectRatio}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* QUALITY SECTION */}
                                    <div className="px-6">
                                      <h5 className="label-micro text-[10px] text-[var(--accent)] mb-4 uppercase tracking-widest font-black">Quality</h5>
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Codec</span>
                                          <span className="text-xs font-bold text-[var(--text-main)]">{file.codec}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Bit Depth</span>
                                          <span className="text-xs font-bold text-[var(--text-main)]">{file.bitDepth}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Bitrate</span>
                                          <span className="text-xs font-mono font-bold text-[var(--accent)]">{file.bitrate}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* FILE SECTION */}
                                    <div className="px-6 last:pr-0">
                                      <h5 className="label-micro text-[10px] text-[var(--accent)] mb-4 uppercase tracking-widest font-black">File</h5>
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center gap-4">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] shrink-0">Path</span>
                                          <span className="text-[10px] font-bold text-[var(--text-main)] truncate text-right">{file.path}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Modified</span>
                                          <span className="text-[10px] font-bold text-[var(--text-main)]">{new Date(file.lastModified).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] uppercase font-bold text-[var(--text-dim)]">Created</span>
                                          <span className="text-[10px] font-bold text-[var(--text-main)]">{new Date(file.creationDate).toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
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
