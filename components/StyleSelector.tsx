
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Style } from '../types';
import { STYLES } from '../constants';
import { CopyIcon } from './icons';

interface StyleSelectorProps {
  onSelectStyle: (style: Style) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ onSelectStyle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyleIndex, setSelectedStyleIndex] = useState<number>(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy Prompt Hướng dẫn');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStyles = useMemo(() => {
    return STYLES.filter(s => 
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const activeStyle = STYLES[selectedStyleIndex];

  const handleConfirm = () => {
    if (showCustom) {
      if (!customPrompt.trim()) {
        alert('Vui lòng nhập prompt phong cách.');
        return;
      }
      onSelectStyle({
        title: 'Phong cách tùy chỉnh',
        description: 'Phong cách do bạn định nghĩa.',
        tooltip: '', locked: false,
        promptTemplate: customPrompt,
      });
    } else {
      onSelectStyle(activeStyle);
    }
  };

  const handleCopyGuidePrompt = () => {
    const GUIDE_TEMPLATE = `Cấu trúc Prompt chuẩn (Tiếng Anh mang lại kết quả tốt nhất):
Subject: [Name of character], [detailed appearance, clothing]
Action: [what they are doing], [pose], [expression]
Environment: [detailed location], [weather], [time of day], [background elements]
Lighting: [cinematic lighting style], [color temperature], [shadow types]
Camera: [camera angle], [lens type, e.g., 35mm], [composition, e.g., rule of thirds]
Atmosphere: [mood], [fog, dust, sparkles]
Quality: 8k resolution, highly detailed, photorealistic, sharp focus, masterpiece.

Ví dụ:
"Sarah, a 25-year-old woman with braided blonde hair wearing a green silk dress. She is standing on a balcony looking at a futuristic city at sunset. Dramatic orange and purple lighting. Wide shot, low angle, bokeh background. Cyberpunk aesthetic, 8k, highly detailed."`;

    navigator.clipboard.writeText(GUIDE_TEMPLATE).then(() => {
        setCopyButtonText('Đã chép!');
        setTimeout(() => setCopyButtonText('Copy Prompt Hướng dẫn'), 2000);
    });
  };

  return (
    <section className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Bước 1: Chọn Phong Cách Nghệ Thuật</h2>
        <p className="text-gray-500 dark:text-gray-400">Hệ thống hỗ trợ 20+ phong cách nghệ thuật được tối ưu cho AI.</p>
      </div>

      <div className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] rounded-[32px] shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[500px] items-stretch">
          {/* Left Side: Custom Dropdown */}
          <div className="p-10 flex flex-col border-r border-gray-100 dark:border-gray-800">
            <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-[#020a06] rounded-2xl mb-8 flex-shrink-0">
              <button 
                onClick={() => setShowCustom(false)}
                className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${!showCustom ? 'bg-white dark:bg-green-600 text-green-700 dark:text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Thư viện
              </button>
              <button 
                onClick={() => setShowCustom(true)}
                className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${showCustom ? 'bg-white dark:bg-green-600 text-green-700 dark:text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Tùy chỉnh
              </button>
            </div>

            {!showCustom ? (
              <div className="flex flex-col flex-grow" ref={dropdownRef}>
                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-[0.2em]">Chọn phong cách có sẵn</label>
                    
                    {/* Custom Dropdown Trigger */}
                    <div 
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full bg-gray-50 dark:bg-[#020a06] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-green-400 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <img src={activeStyle.imageUrl} className="w-10 h-10 rounded-xl object-cover shadow-md" alt="" />
                        <div className="text-left">
                          <p className="font-bold text-gray-900 dark:text-white">{activeStyle.title}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Đã chọn</p>
                        </div>
                      </div>
                      <span className={`text-xl transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </div>

                    {/* Dropdown Menu */}
                    {isOpen && (
                      <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                          <input 
                            type="text"
                            autoFocus
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm phong cách (vd: Anime, 3D...)"
                            className="w-full bg-gray-50 dark:bg-[#020a06] border-none rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-400"
                          />
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                          {filteredStyles.map((style) => {
                            const originalIndex = STYLES.indexOf(style);
                            return (
                              <div
                                key={style.title}
                                onClick={() => {
                                  setSelectedStyleIndex(originalIndex);
                                  setIsOpen(false);
                                }}
                                className="flex items-center gap-4 p-4 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer border-b border-gray-50 dark:border-gray-800/50 last:border-none transition-colors"
                              >
                                <img src={style.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                                <div>
                                  <p className="font-bold text-sm text-gray-900 dark:text-white">{style.title}</p>
                                  <p className="text-[10px] text-gray-400 line-clamp-1">{style.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto pt-6">
                  <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-900/20">
                    <p className="text-xs text-green-700 dark:text-green-300 font-medium leading-relaxed italic">
                      "Hệ thống sẽ tự động thêm các câu lệnh bổ trợ vào kịch bản để đảm bảo kết quả giống hệt phong cách mẫu này."
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-grow space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-[0.2em] flex-shrink-0">Prompt phong cách cá nhân</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ví dụ: 3D render, Unreal Engine 5, cinematic lighting, hyper-realistic, 8k..."
                  className="flex-grow w-full bg-gray-50 dark:bg-[#020a06] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-sm outline-none focus:ring-2 focus:ring-green-400 transition-all resize-none shadow-inner"
                />
                <button
                  onClick={handleCopyGuidePrompt}
                  className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-green-500 transition-colors uppercase tracking-[0.2em] flex-shrink-0"
                >
                  <CopyIcon className="w-4 h-4" />
                  {copyButtonText}
                </button>
              </div>
            )}
          </div>

          {/* Right Side: High-Quality Preview Card */}
          <div className="bg-gray-50 dark:bg-[#020a06]/50 p-10 flex flex-col justify-center items-center">
            <div className="w-full max-w-[320px] h-full flex flex-col justify-between">
              <div className="aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 group relative mb-6">
                <img 
                  key={showCustom ? 'custom' : activeStyle.imageUrl}
                  src={showCustom ? 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80' : activeStyle.imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt="Preview" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Preview</p>
                  <h3 className="font-black text-2xl uppercase tracking-tight">{showCustom ? 'Tùy chỉnh' : activeStyle.title}</h3>
                </div>
              </div>
              
              <div className="text-center space-y-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed px-4">
                  {showCustom ? 'Tạo hình ảnh dựa trên mô tả phong cách tự do của bạn.' : activeStyle.description}
                </p>
                <button
                  onClick={handleConfirm}
                  disabled={showCustom && !customPrompt.trim()}
                  className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-orange-500 shadow-xl shadow-green-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  Bắt đầu tạo &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
