import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  Play, 
  Image as ImageIcon, 
  Video, 
  Settings, 
  User, 
  Table as TableIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

import { 
  AIProvider, 
  AppConfig, 
  Character, 
  Scene, 
  SceneDetectionResult 
} from './types';
import { 
  DEFAULT_CONFIG, 
  GEMINI_MODELS, 
  KEY4U_MODELS, 
  SCENE_DETECTION_SYSTEM_PROMPT,
  IMAGE_PROMPT_SYSTEM_PROMPT,
  VIDEO_PROMPT_SYSTEM_PROMPT
} from './constants';
import { cn } from './lib/utils';

// --- Utility Hooks ---
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// --- Main App Component ---
export default function App() {
  const [config, setConfig] = useLocalStorage<AppConfig>('app_config', DEFAULT_CONFIG);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useLocalStorage<Character[]>('app_characters', []);
  const [activeTab, setActiveTab] = useState<'config' | 'characters' | 'scenes'>('config');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptText, setScriptText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'info' | 'error' | 'success' } | null>(null);

  // --- AI Service Logic ---
  const callAI = async (prompt: string, systemInstruction: string, imageBase64?: string) => {
    const provider = config.activeProvider;
    
    if (provider === 'gemini') {
      const keys = config.gemini.keys;
      if (keys.length === 0) throw new Error('Vui lòng thêm ít nhất 1 Gemini API Key');
      
      const key = keys[Math.floor(Math.random() * keys.length)];
      const ai = new GoogleGenAI({ 
        apiKey: key,
        httpOptions: config.gemini.proxyUrl ? { baseUrl: config.gemini.proxyUrl } : undefined
      });

      const parts: any[] = [{ text: prompt }];
      if (imageBase64) {
        parts.push({
          inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: "image/png"
          }
        });
      }

      const response = await ai.models.generateContent({
        model: config.gemini.selectedModel,
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });

      return response.text;
    } else {
      const keys = config.key4u.keys;
      if (keys.length === 0) throw new Error('Vui lòng thêm ít nhất 1 Key4U API Key');
      
      const key = keys[Math.floor(Math.random() * keys.length)];
      const url = config.key4u.proxyUrl || 'https://api.key4u.shop/v1/chat/completions';

      const messages: any[] = [
        { role: 'system', content: systemInstruction },
      ];

      if (imageBase64) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        });
      } else {
        messages.push({ role: 'user', content: prompt });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: config.key4u.selectedModel,
          messages,
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Lỗi từ Key4U API');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    }
  };

  // --- Handlers ---
  const handleImageUpload = (id: string, type: 'character' | 'scene', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (type === 'character') {
        setCharacters(prev => prev.map(c => c.id === id ? { ...c, imageUrl: base64 } : c));
      } else {
        setScenes(prev => prev.map(s => s.id === id ? { ...s, mainAsset: base64 } : s));
      }
    };
    reader.readAsDataURL(file);
  };
  const handleProcessScript = async () => {
    if (!scriptText.trim()) return;
    setIsProcessing(true);
    setStatusMessage({ text: 'Đang phân tích kịch bản...', type: 'info' });

    try {
      const result = await callAI(scriptText, SCENE_DETECTION_SYSTEM_PROMPT);
      const parsed: SceneDetectionResult = JSON.parse(result);
      
      const newScenes: Scene[] = parsed.scenes.map((s, idx) => ({
        id: `scene-${Date.now()}-${idx}`,
        originalRow: [s.stt, s.location, s.script, s.character, s.note],
      }));

      setScenes(newScenes);
      setActiveTab('scenes');
      setStatusMessage({ text: 'Phân tích kịch bản thành công!', type: 'success' });
    } catch (error: any) {
      console.error(error);
      setStatusMessage({ text: `Lỗi: ${error.message}`, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateImagePrompt = async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isGeneratingPrompt: true } : s));

    try {
      // Include character descriptions if available
      const characterNames = scene.originalRow[3].split(',').map(n => n.trim());
      const relevantChars = characters.filter(c => characterNames.includes(c.name));
      const charContext = relevantChars.map(c => `${c.name}: ${c.description}`).join('\n');

      const prompt = `Kịch bản: ${scene.originalRow[2]}\nBối cảnh: ${scene.originalRow[1]}\nNhân vật: ${scene.originalRow[3]}\n\nThông tin nhân vật:\n${charContext}`;
      
      const result = await callAI(prompt, IMAGE_PROMPT_SYSTEM_PROMPT, scene.mainAsset);
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, imagePrompt: result } : s));
    } catch (error: any) {
      console.error(error);
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, error: error.message } : s));
    } finally {
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isGeneratingPrompt: false } : s));
    }
  };

  const generateVideoPrompt = async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;

    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isGeneratingVideo: true } : s));

    try {
      const prompt = `Kịch bản: ${scene.originalRow[2]}\nBối cảnh: ${scene.originalRow[1]}\nNhân vật: ${scene.originalRow[3]}`;
      const result = await callAI(prompt, VIDEO_PROMPT_SYSTEM_PROMPT, scene.mainAsset);
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, videoPrompt: result } : s));
    } catch (error: any) {
      console.error(error);
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, error: error.message } : s));
    } finally {
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isGeneratingVideo: false } : s));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      // Skip header if it exists
      const rows = data.slice(1).filter(row => row.length > 0);
      const newScenes: Scene[] = rows.map((row, idx) => ({
        id: `scene-${Date.now()}-${idx}`,
        originalRow: row.map(cell => String(cell || '')),
      }));

      setScenes(newScenes);
      setActiveTab('scenes');
    };
    reader.readAsBinaryString(file);
  };

  const exportToExcel = () => {
    const data = scenes.map(s => ({
      'STT': s.originalRow[0],
      'Bối cảnh': s.originalRow[1],
      'Kịch bản': s.originalRow[2],
      'Nhân vật': s.originalRow[3],
      'Ghi chú': s.originalRow[4],
      'Image Prompt': s.imagePrompt || '',
      'Video Prompt': s.videoPrompt || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scenes");
    XLSX.writeFile(wb, "scenes_export.xlsx");
  };

  // --- Render Helpers ---
  const renderConfig = () => (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      <div className="flex gap-4 border-b border-black/10 mb-8">
        <button 
          onClick={() => setConfig(prev => ({ ...prev, activeProvider: 'gemini' }))}
          className={cn("tab", config.activeProvider === 'gemini' && "active")}
        >
          Gemini
        </button>
        <button 
          onClick={() => setConfig(prev => ({ ...prev, activeProvider: 'key4u' }))}
          className={cn("tab", config.activeProvider === 'key4u' && "active")}
        >
          Key4U
        </button>
      </div>

      {config.activeProvider === 'gemini' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase font-bold mb-2 opacity-50">Model</label>
              <select 
                value={config.gemini.selectedModel}
                onChange={(e) => setConfig(prev => ({ ...prev, gemini: { ...prev.gemini, selectedModel: e.target.value } }))}
                className="input"
              >
                {GEMINI_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold mb-2 opacity-50">Proxy URL (Optional)</label>
              <input 
                type="text"
                value={config.gemini.proxyUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, gemini: { ...prev.gemini, proxyUrl: e.target.value } }))}
                placeholder="https://..."
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold mb-2 opacity-50">API Keys (One per line)</label>
            <textarea 
              value={config.gemini.keys.join('\n')}
              onChange={(e) => setConfig(prev => ({ ...prev, gemini: { ...prev.gemini, keys: e.target.value.split('\n').filter(k => k.trim()) } }))}
              rows={5}
              className="input font-mono"
              placeholder="AIza..."
            />
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase font-bold mb-2 opacity-50">Model</label>
              <select 
                value={config.key4u.selectedModel}
                onChange={(e) => setConfig(prev => ({ ...prev, key4u: { ...prev.key4u, selectedModel: e.target.value } }))}
                className="input"
              >
                {KEY4U_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold mb-2 opacity-50">Base URL</label>
              <input 
                type="text"
                value={config.key4u.proxyUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, key4u: { ...prev.key4u, proxyUrl: e.target.value } }))}
                placeholder="https://api.key4u.shop/v1/chat/completions"
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold mb-2 opacity-50">API Keys (One per line)</label>
            <textarea 
              value={config.key4u.keys.join('\n')}
              onChange={(e) => setConfig(prev => ({ ...prev, key4u: { ...prev.key4u, keys: e.target.value.split('\n').filter(k => k.trim()) } }))}
              rows={5}
              className="input font-mono"
              placeholder="sk-..."
            />
          </div>
        </motion.div>
      )}

      <div className="pt-8 border-t border-black/10">
        <h3 className="text-xs uppercase font-bold mb-4 tracking-widest">Nhập kịch bản thô</h3>
        <textarea 
          value={scriptText}
          onChange={(e) => setScriptText(e.target.value)}
          rows={10}
          className="input mb-4"
          placeholder="Dán kịch bản của bạn vào đây để phân tích..."
        />
        <button 
          onClick={handleProcessScript}
          disabled={isProcessing || !scriptText.trim()}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Phân tích kịch bản
        </button>
      </div>
    </div>
  );

  const renderCharacters = () => (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-serif italic">Nhân vật & Đồng nhất</h2>
        <button 
          onClick={() => setCharacters(prev => [...prev, { id: Date.now().toString(), name: '', description: '' }])}
          className="btn flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Thêm nhân vật
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map(char => (
          <div key={char.id} className="border border-black p-4 space-y-4 bg-white/50 relative">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-4">
                <input 
                  type="text"
                  value={char.name}
                  onChange={(e) => setCharacters(prev => prev.map(c => c.id === char.id ? { ...c, name: e.target.value } : c))}
                  placeholder="Tên nhân vật"
                  className="input font-bold"
                />
                <textarea 
                  value={char.description}
                  onChange={(e) => setCharacters(prev => prev.map(c => c.id === char.id ? { ...c, description: e.target.value } : c))}
                  placeholder="Mô tả chi tiết (ngoại hình, trang phục, tính cách...)"
                  rows={4}
                  className="input"
                />
              </div>
              <div className="w-24 h-32 border border-black flex flex-col items-center justify-center relative overflow-hidden bg-black/5">
                {char.imageUrl ? (
                  <>
                    <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setCharacters(prev => prev.map(c => c.id === char.id ? { ...c, imageUrl: undefined } : c))}
                      className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white rounded-full shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-1 opacity-30 hover:opacity-100 transition-opacity">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[8px] font-bold uppercase">Upload</span>
                    <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(char.id, 'character', e.target.files[0])} />
                  </label>
                )}
              </div>
            </div>
            <button 
              onClick={() => setCharacters(prev => prev.filter(c => c.id !== char.id))}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderScenes = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-serif italic">Bảng phân cảnh</h2>
          <div className="flex gap-2">
            <label className="btn flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> Import Excel
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".xlsx,.xls,.csv" />
            </label>
            <button onClick={exportToExcel} className="btn flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              scenes.forEach(s => generateImagePrompt(s.id));
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" /> Tạo tất cả Image Prompt
          </button>
          <button 
            onClick={() => {
              scenes.forEach(s => generateVideoPrompt(s.id));
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Video className="w-4 h-4" /> Tạo tất cả Video Prompt
          </button>
        </div>
      </div>

      <div className="border-t-2 border-black">
        <div className="grid grid-cols-[40px_1.5fr_3fr_1.5fr_2fr_2fr] border-b-2 border-black bg-black/5">
          <div className="col-header">STT</div>
          <div className="col-header">Bối cảnh</div>
          <div className="col-header">Kịch bản</div>
          <div className="col-header">Nhân vật</div>
          <div className="col-header">Image Prompt</div>
          <div className="col-header">Video Prompt</div>
        </div>

        {scenes.map((scene, idx) => (
          <div key={scene.id} className="grid grid-cols-[40px_1.5fr_3fr_1.5fr_2fr_2fr] border-b border-black/10 hover:bg-black/5 transition-colors group">
            <div className="data-value opacity-50">{scene.originalRow[0] || idx + 1}</div>
            <div className="data-value space-y-2">
              <div className="w-full aspect-video border border-black/10 bg-black/5 relative overflow-hidden">
                {scene.mainAsset ? (
                  <>
                    <img src={scene.mainAsset} alt="Scene" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, mainAsset: undefined } : s))}
                      className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white rounded-full shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-30 hover:!opacity-100 transition-opacity">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-[8px] font-bold uppercase">Ref Image</span>
                    <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(scene.id, 'scene', e.target.files[0])} />
                  </label>
                )}
              </div>
              <div className="text-[11px] font-bold">{scene.originalRow[1]}</div>
            </div>
            <div className="data-value text-xs line-clamp-4 group-hover:line-clamp-none transition-all">{scene.originalRow[2]}</div>
            <div className="data-value italic">{scene.originalRow[3]}</div>
            
            <div className="p-2 space-y-2 border-l border-black/5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold opacity-30">Image Prompt</span>
                <button 
                  onClick={() => generateImagePrompt(scene.id)}
                  disabled={scene.isGeneratingPrompt}
                  className="p-1 hover:bg-black hover:text-white transition-all rounded"
                >
                  {scene.isGeneratingPrompt ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                </button>
              </div>
              {scene.imagePrompt ? (
                <div className="text-[11px] font-mono bg-white/50 p-2 border border-black/5 max-h-32 overflow-y-auto">
                  {scene.imagePrompt}
                </div>
              ) : (
                <div className="text-[10px] italic opacity-30">Chưa có prompt...</div>
              )}
            </div>

            <div className="p-2 space-y-2 border-l border-black/5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold opacity-30">Video Prompt</span>
                <button 
                  onClick={() => generateVideoPrompt(scene.id)}
                  disabled={scene.isGeneratingVideo}
                  className="p-1 hover:bg-black hover:text-white transition-all rounded"
                >
                  {scene.isGeneratingVideo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                </button>
              </div>
              {scene.videoPrompt ? (
                <div className="text-[11px] font-mono bg-white/50 p-2 border border-black/5 max-h-32 overflow-y-auto">
                  {scene.videoPrompt}
                </div>
              ) : (
                <div className="text-[10px] italic opacity-30">Chưa có prompt...</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-black p-4 flex justify-between items-center bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-serif italic text-xl">V</div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-tighter">Script to Prompt VIP</h1>
            <p className="text-[10px] uppercase opacity-50 tracking-widest">Character Consistency Engine</p>
          </div>
        </div>

        <nav className="flex gap-1">
          <button 
            onClick={() => setActiveTab('config')}
            className={cn("p-2 flex items-center gap-2 text-xs uppercase font-bold tracking-widest transition-all", activeTab === 'config' ? "bg-black text-white" : "hover:bg-black/5")}
          >
            <Settings className="w-4 h-4" /> Cấu hình
          </button>
          <button 
            onClick={() => setActiveTab('characters')}
            className={cn("p-2 flex items-center gap-2 text-xs uppercase font-bold tracking-widest transition-all", activeTab === 'characters' ? "bg-black text-white" : "hover:bg-black/5")}
          >
            <User className="w-4 h-4" /> Nhân vật
          </button>
          <button 
            onClick={() => setActiveTab('scenes')}
            className={cn("p-2 flex items-center gap-2 text-xs uppercase font-bold tracking-widest transition-all", activeTab === 'scenes' ? "bg-black text-white" : "hover:bg-black/5")}
          >
            <TableIcon className="w-4 h-4" /> Phân cảnh
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'config' && renderConfig()}
            {activeTab === 'characters' && renderCharacters()}
            {activeTab === 'scenes' && renderScenes()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Status Bar */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className={cn(
              "fixed bottom-4 right-4 p-4 border border-black shadow-xl flex items-center gap-3 z-[100]",
              statusMessage.type === 'info' && "bg-white",
              statusMessage.type === 'success' && "bg-green-50",
              statusMessage.type === 'error' && "bg-red-50"
            )}
          >
            {statusMessage.type === 'info' && <Loader2 className="w-5 h-5 animate-spin" />}
            {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
            <span className="text-xs font-bold">{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="ml-4 p-1 hover:bg-black/5 rounded">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-black/10 p-2 text-[9px] uppercase tracking-[0.2em] opacity-30 text-center">
        Professional Script Adaptation Tool • v2.0 • Powered by Gemini & Key4U
      </footer>
    </div>
  );
}
