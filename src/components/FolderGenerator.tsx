import React, { useState } from 'react';
import { Terminal, Folder, FolderTree, Plus, Trash2, Download, Package, FileCode, ChevronRight, ChevronDown, Edit2, X, Check, AlertCircle, Camera, Music, Layers, Film, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ToolSidebar from './ToolSidebar';

interface FolderNode {
  id: string;
  name: string;
  isExpanded?: boolean;
  children?: FolderNode[];
}

export default function FolderGenerator({ setPage, isDark, toggleTheme }: { setPage: (p: string) => void, isDark?: boolean, toggleTheme?: () => void }) {
  const [project, setProject] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0].replace(/-/g, ''));
  const [day, setDay] = useState('01');
  const [unit, setUnit] = useState('MAIN');
  const [category, setCategory] = useState('CAMERA');
  const [camId, setCamId] = useState('A');
  const [roll, setRoll] = useState('001');
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const [previewStructure, setPreviewStructure] = useState<FolderNode[]>([]);
  const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isIframeError, setIsIframeError] = useState(false);

  // Auto-reset roll when context changes
  React.useEffect(() => {
    setRoll('001');
  }, [camId, category, day, date]);

  const getSubFolders = (cat: string) => {
    switch (cat) {
      case 'CAMERA': return ['OCF', 'REPORTS'];
      case 'SOUND': return ['WAV', 'REPORTS'];
      case 'PROXY': return ['MOV', 'REPORTS'];
      default: return [];
    }
  };

  const sortNodes = (nodes: FolderNode[]) => {
    return [...nodes].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  };

  const insertPath = (nodes: FolderNode[], path: string[], depth = 0): { nodes: FolderNode[], added: boolean } => {
    if (path.length === 0) return { nodes, added: false };
    
    const [currentName, ...rest] = path;
    const existingNodeIndex = nodes.findIndex(n => n.name === currentName);
    
    if (existingNodeIndex !== -1) {
      const existingNode = nodes[existingNodeIndex];
      if (rest.length === 0) return { nodes, added: false }; 
      
      const result = insertPath(existingNode.children || [], rest, depth + 1);
      if (!result.added) return { nodes, added: false };
      
      const newNodes = [...nodes];
      // Expand project/day levels, but potentially keep rolls collapsed
      const shouldCollapse = depth >= 4;
      newNodes[existingNodeIndex] = { 
        ...existingNode, 
        children: sortNodes(result.nodes),
        isExpanded: shouldCollapse ? existingNode.isExpanded : true 
      };
      return { nodes: sortNodes(newNodes), added: true };
    } else {
      const createBranch = (parts: string[], currentDepth: number): FolderNode => {
        const [name, ...remaining] = parts;
        return {
          id: Math.random().toString(36).substr(2, 9),
          name,
          // Collapse rolls and everything below by default
          isExpanded: currentDepth < 4,
          children: remaining.length > 0 ? sortNodes([createBranch(remaining, currentDepth + 1)]) : []
        };
      };
      return { nodes: sortNodes([...nodes, createBranch(path, depth)]), added: true };
    }
  };

  const addToPreview = () => {
    if (!project) return;
    setError(null);
    
    // Netflix Guideline: YYYYMMDD_D## (Example: 20240101_D01)
    const dayTag = `${date}_D${day.padStart(2, '0')}`;
    
    // Netflix Guideline: Camera Level (Example: A_CAM)
    const categoryTag = category === 'CAMERA' ? `${camId}_CAM` : category;
    
    // Netflix Guideline: Roll ID (Example: A001)
    const rollId = category === 'CAMERA' ? `${camId}${roll.padStart(3, '0')}` : 
                   category === 'SOUND' ? `S${roll.padStart(3, '0')}` : 
                   `P${roll.padStart(3, '0')}`;
    
    // Hierarchy: Project / Day / Unit / Camera_or_Sound / Roll_ID
    let basePath: string[] = [project, dayTag, `${unit}_UNIT`, categoryTag, rollId];
    
    const subs = getSubFolders(category);
    
    let tempStructure = [...previewStructure];
    let addedAny = false;
    
    if (subs.length === 0) {
      const { nodes, added } = insertPath(tempStructure, basePath);
      tempStructure = nodes;
      addedAny = added;
    } else {
      for (const sub of subs) {
        const fullPath = [...basePath, sub];
        const { nodes, added } = insertPath(tempStructure, fullPath);
        tempStructure = nodes;
        if (added) addedAny = true;
      }
    }
    
    if (!addedAny) {
      setError(`Duplicate structure found for ${basePath.join('/')}`);
    } else {
      setPreviewStructure(tempStructure);
      // Auto-increment for next roll
      const nextRoll = (parseInt(roll) + 1).toString().padStart(3, '0');
      setRoll(nextRoll);
    }
  };

  const pickTargetDir = async () => {
    setError(null);
    setIsIframeError(false);
    
    if (!('showDirectoryPicker' in window)) {
      setIsIframeError(true);
      setError('BROWSER_UNSUPPORTED: Technical limitation in current view.');
      return;
    }

    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker();
      setRootHandle(handle);
    } catch (err: any) {
      console.error(err);
      if (err.name === 'AbortError') return;
      if (err.message?.includes('Cross origin sub frames') || err.name === 'SecurityError') {
        setIsIframeError(true);
        setError('Security Restriction: Open in a new tab for direct writing.');
      } else {
        setError('Failed to access local file system.');
      }
    }
  };

  const generateToLocal = async () => {
    setError(null);
    setIsIframeError(false);

    if (previewStructure.length === 0) {
      setError('No structure to generate.');
      return;
    }
    
    if (!('showDirectoryPicker' in window)) {
      setIsIframeError(true);
      setError('BROWSER_UNSUPPORTED: Use ZIP or open in New Tab.');
      return;
    }

    let handle = rootHandle;
    if (!handle) {
      try {
        // @ts-ignore
        handle = await window.showDirectoryPicker();
        setRootHandle(handle);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (err.message?.includes('Cross origin sub frames') || err.name === 'SecurityError') {
          setIsIframeError(true);
          setError('Open in a new tab for local folder generation.');
        } else {
          setError('Target directory not selected.');
        }
        return;
      }
    }
    
    try {
      const createDirectoryRecursive = async (parentHandle: FileSystemDirectoryHandle, nodes: FolderNode[]) => {
        for (const node of nodes) {
          const subHandle = await parentHandle.getDirectoryHandle(node.name, { create: true });
          if (node.children && node.children.length > 0) {
            await createDirectoryRecursive(subHandle, node.children);
          }
        }
      };

      await createDirectoryRecursive(handle!, previewStructure);
      alert('Generation complete. Folders successfully written to disk.');
    } catch (err: any) {
      console.error(err);
      if (err.name === 'SecurityError') {
        setIsIframeError(true);
        setError('Security Error: Use a new tab for local generation.');
      } else {
        setError('Failed to write to local system.');
      }
    }
  };

  const toggleNode = (id: string) => {
    const updateNode = (nodes: FolderNode[]): FolderNode[] => {
      return nodes.map(node => {
        if (node.id === id) return { ...node, isExpanded: !node.isExpanded };
        if (node.children) return { ...node, children: updateNode(node.children) };
        return node;
      });
    };
    setPreviewStructure(updateNode(previewStructure));
  };

  const deleteNode = (id: string) => {
    const updateNodes = (nodes: FolderNode[]): FolderNode[] => {
      return nodes.filter(node => node.id !== id).map(node => ({
        ...node,
        children: node.children ? updateNodes(node.children) : []
      }));
    };
    setPreviewStructure(updateNodes(previewStructure));
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  };

  const saveEdit = () => {
    if (!editingId || !editValue.trim()) return;
    const updateNodes = (nodes: FolderNode[]): FolderNode[] => {
      const updated = nodes.map(node => {
        if (node.id === editingId) return { ...node, name: editValue.toUpperCase() };
        if (node.children) return { ...node, children: updateNodes(node.children) };
        return node;
      });
      return sortNodes(updated);
    };
    setPreviewStructure(updateNodes(previewStructure));
    setEditingId(null);
  };

  const downloadZip = async () => {
    if (previewStructure.length === 0) return;
    const zip = new JSZip();

    const addNodeToZip = (node: FolderNode, parentPath: string = '') => {
      const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
      zip.folder(currentPath);
      if (node.children) {
        node.children.forEach(child => addNodeToZip(child, currentPath));
      }
    };

    previewStructure.forEach(node => addNodeToZip(node));

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${project || 'DIT'}.zip`);
  };

  const clearPreview = () => setPreviewStructure([]);

  const renderTree = (nodes: FolderNode[], depth = 0) => {
    return nodes.map((node, index) => {
      const isLast = index === nodes.length - 1;
      // Align vertical line with Folder icon center
      // Row Padding-2 (8px) + Folder (w-4 = 16px, center 8px) = 16px
      const lineLeftOffset = 16; 

      return (
        <div key={node.id} className="relative">
          <div 
            className={`flex items-center gap-3 py-1.5 px-2 hover:bg-[var(--bg-shell)] rounded-lg transition-all group relative min-h-[36px] ${node.children && node.children.length > 0 ? 'cursor-pointer' : ''}`}
            onClick={() => node.children && node.children.length > 0 && toggleNode(node.id)}
          >
            {/* Tree Lines */}
            {depth > 0 && (
              <>
                {/* Vertical Line above */}
                <div 
                  className="absolute top-0 h-[18px] border-l border-[var(--border)]" 
                  style={{ left: `-${32 - lineLeftOffset}px` }} 
                />
                
                {/* Horizontal Line branch */}
                <div 
                  className="absolute top-[18px] border-t border-[var(--border)]" 
                  style={{ left: `-${32 - lineLeftOffset}px`, width: `${32 - (32 - lineLeftOffset)}px` }} 
                />
                
                {/* Vertical Line below (only if not last child) */}
                {!isLast && (
                  <div 
                    className="absolute top-[18px] bottom-0 border-l border-[var(--border)]" 
                    style={{ left: `-${32 - lineLeftOffset}px` }} 
                  />
                )}
              </>
            )}
            
            <div className="flex items-center gap-2.5 flex-1 z-10">
              <div className="relative">
                <Folder className={`w-4 h-4 transition-colors ${node.children && node.children.length > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'}`} />
                {node.children && node.children.length > 0 && (
                  <div className="absolute -right-1 -bottom-1">
                    {node.isExpanded ? 
                      <ChevronDown className="w-2 h-2 text-white/50" /> : 
                      <ChevronRight className="w-2 h-2 text-white/50" />
                    }
                  </div>
                )}
              </div>
              
              {editingId === node.id ? (
                <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                  <input 
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    className="bg-white/10 border border-[var(--accent)] rounded px-2 py-0.5 text-xs font-mono outline-none w-full"
                  />
                  <button onClick={saveEdit} className="p-1 text-green-400 hover:bg-white/10 rounded"><Check className="w-3 h-3" /></button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-red-100 hover:bg-white/10 rounded"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <span className="text-[12px] font-mono select-none">{node.name}</span>
              )}
            </div>

            {!editingId && (
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity z-20" onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={() => startEditing(node.id, node.name)}
                  className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded" title="Rename"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => deleteNode(node.id)} 
                  className="p-1 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded" title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          {node.children && node.children.length > 0 && node.isExpanded && (
            <div className="ml-[32px]">
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full apple-gradient overflow-hidden relative">
       <ToolSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} currentPage="folder" setPage={setPage} />

       {/* Dashboard Background Decoration */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.8] dark:opacity-30">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[var(--accent)]/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '4s' }} />
       </div>

       <div className="absolute top-0 left-0 right-0 h-[84px] flex items-center justify-between z-50 px-8">
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
           >
             <LayoutDashboard className="w-4 h-4" /> <span className="label-micro uppercase font-bold tracking-widest">Toolkit</span>
           </button>
           
           <h2 className="text-sm font-black tracking-tighter text-[var(--text-main)] uppercase italic flex items-center gap-3">
             <FolderTree className="w-5 h-5 text-[var(--accent)]" /> 
             Structure Generator
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

      <div className="p-8 flex flex-col gap-8 h-full overflow-hidden relative z-10 pt-24 max-w-[1920px] mx-auto w-full">

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-stretch flex-1 min-h-0 pb-12 overflow-hidden">
          {/* Left: Configuration */}
          <div className="h-full flex flex-col min-h-0">
            <div className="p-10 rounded-3xl h-full glass border border-[var(--border)] flex flex-col min-h-0 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between gap-4 mb-8 shrink-0 min-h-[36px]">
                <h3 className="label-micro font-bold uppercase tracking-widest text-[var(--text-dim)]">Ingestion Configuration</h3>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={error}
                    className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20 max-w-[200px]"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" /> <span className="truncate">{error === 'Duplicate' ? 'Duplicate' : error.includes('BROWSER') ? 'BROWSER LIMIT' : 'SYSTEM ERROR'}</span>
                  </motion.div>
                )}
              </div>
              
              <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                <div className="space-y-1.5">
                  <label className="label-micro flex items-center gap-2">
                    <Package className="w-3 h-3" /> Project Name
                  </label>
                  <input 
                    type="text" 
                    value={project} 
                    onChange={e => setProject(e.target.value.toUpperCase())}
                    placeholder="EX: AURORA 2025"
                    className="tech-input w-full focus:border-[var(--accent)] transition-all rounded-xl" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label-micro flex items-center gap-2">
                      <Terminal className="w-3 h-3" /> Date
                    </label>
                    <input type="text" value={date} onChange={e => setDate(e.target.value)} className="tech-input w-full rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-micro flex items-center gap-2">
                      <Terminal className="w-3 h-3" /> Day
                    </label>
                    <input type="text" value={day} onChange={e => setDay(e.target.value)} className="tech-input w-full rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label-micro flex items-center gap-2">
                      <Layers className="w-3 h-3" /> Unit
                    </label>
                    <select 
                      value={unit} 
                      onChange={e => setUnit(e.target.value)}
                      className="tech-input w-full rounded-xl appearance-none cursor-pointer pr-10"
                    >
                      <option value="MAIN">MAIN</option>
                      <option value="2ND">2ND</option>
                      <option value="SPLINTER">SPLINTER</option>
                      <option value="AERIAL">AERIAL</option>
                      <option value="UNDERWATER">UNDERWATER</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-micro flex items-center gap-2">
                      <FileCode className="w-3 h-3" /> Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="tech-input w-full rounded-xl appearance-none cursor-pointer pr-10"
                    >
                      <option value="CAMERA">CAMERA</option>
                      <option value="SOUND">SOUND</option>
                      <option value="PROXY">PROXY</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label-micro flex items-center gap-2">
                      <Terminal className="w-3 h-3" /> Cam ID
                    </label>
                    <input type="text" value={camId} onChange={e => setCamId(e.target.value.toUpperCase())} className="tech-input w-full rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-micro flex items-center gap-2">
                      <Terminal className="w-3 h-3" /> Roll No.
                    </label>
                    <input type="text" value={roll} onChange={e => setRoll(e.target.value)} className="tech-input w-full rounded-xl" />
                  </div>
                </div>
                {isIframeError && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                    <p className="text-[10px] text-amber-500 leading-relaxed font-bold uppercase tracking-widest">
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      iFrame Security Restriction Detected
                    </p>
                    <p className="text-[11px] text-[var(--text-dim)]">
                      Browser security prevents file access within iFrames. Please 
                      <span className="text-white"> open this app in a new tab </span> 
                      to enable direct local folder generation.
                    </p>
                    <button 
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all"
                    >
                      Open in New Tab
                    </button>
                  </div>
                )}

                <div className="space-y-1.5 pt-4 border-t border-white/5">
                  <label className="label-micro flex items-center gap-2">
                    <FolderTree className="w-3 h-3 text-[var(--accent)]" /> Target Deployment Root
                  </label>
                  <button 
                    type="button"
                    onClick={pickTargetDir}
                    className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between text-[11px] transition-all ${rootHandle ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-text)]' : 'bg-white/5 border-white/10 text-[var(--text-dim)] hover:border-white/20'}`}
                  >
                    <span className="truncate max-w-[200px] font-bold">{rootHandle ? `TARGET: ${rootHandle.name}` : 'Select Destination Folder...'}</span>
                    <Plus className={`w-3.5 h-3.5 transition-transform ${rootHandle ? 'rotate-45' : ''}`} />
                  </button>
                  {rootHandle && (
                    <p className="text-[9px] text-[var(--text-micro)] uppercase tracking-widest mt-1 opacity-60">Directory context locked and ready</p>
                  )}
                </div>
              </div>

              <div className="h-8 shrink-0" />

              <div className="grid grid-cols-1 gap-3 shrink-0">
                <button 
                  onClick={addToPreview}
                  disabled={!project}
                  className="w-full py-4 bg-[var(--accent)] text-white rounded-xl font-bold text-[10px] tracking-[0.2em] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20 border border-white/10 backdrop-blur-md uppercase"
                >
                  <Plus className="w-4 h-4" /> Add to Hierarchy
                </button>
              </div>
            </div>
          </div>

          {/* Right: Preview & Execution */}
          <div className="h-full flex flex-col min-h-0 min-w-0">
            <div className="rounded-3xl border border-[var(--border)] glass p-10 font-mono h-full flex flex-col min-h-0 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between gap-4 mb-8 shrink-0 min-h-[36px]">
                <h3 className="label-micro font-bold uppercase tracking-widest text-[var(--text-dim)]">Directory Hierarchy Preview</h3>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={clearPreview}
                    className="h-9 px-4 glass-button text-[10px] font-bold hover:text-red-400 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> CLEAR
                  </button>
                  <button 
                    onClick={downloadZip}
                    disabled={previewStructure.length === 0}
                    className="h-9 px-4 rounded-xl border border-[var(--accent)] text-[var(--accent)] text-[10px] font-bold hover:bg-[var(--accent)] hover:text-white transition-all flex items-center gap-2 disabled:opacity-30 uppercase bg-white/5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download ZIP
                  </button>
                  <button 
                    type="button"
                    onClick={generateToLocal}
                    disabled={!project || previewStructure.length === 0}
                    className="h-9 px-6 rounded-xl bg-[var(--accent)] text-white text-[10px] font-bold hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-30 shadow-lg shadow-[var(--accent)]/20 border border-white/10 backdrop-blur-md uppercase"
                  >
                    <FolderTree className="w-3.5 h-3.5" /> Generate to Local
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                {previewStructure.length > 0 ? (
                  <div className="space-y-4">
                    {renderTree(previewStructure)}
                  </div>
                ) : (
                  <div className="h-full py-20 flex flex-col items-center justify-center opacity-20 space-y-4 text-center">
                    <Folder className="w-16 h-16" />
                    <p className="label-micro text-lg uppercase tracking-widest">Awaiting Configuration</p>
                    <p className="label-micro text-xs">Set parameters and click ADD FOLDER to build hierarchy</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
