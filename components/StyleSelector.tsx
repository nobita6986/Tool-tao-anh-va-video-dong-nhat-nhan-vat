
import React, { useState, useMemo } from 'react';
import type { Style, AspectRatio } from '../types';
import { STYLES } from '../constants';
import { CopyIcon } from './icons';
import { Tooltip } from './Tooltip';

interface StyleSelectorProps {
  onSelectStyle: (style: Style) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ onSelectStyle, aspectRatio, setAspectRatio }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyleIndex, setSelectedStyleIndex] = useState<number>(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy Prompt Hướng dẫn');

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
    const GUIDE_TEMPLATE = `IMPORTANT REQUIREMENT: Use only the image I provide to extract the character’s appearance and outfit. All background, environment, and actions must be created entirely from the text prompt below. Do not copy or reuse the original image background. This line must appear in every prompt.

Redraw my character with the exact same appearance and outfit, customized in:* [STYLE DESCRIPTION] *

Character details: [CHARACTER_STYLE]
+ Skin/Fur style: [SKIN_STYLE]*
+ Outfit style: [OUTFIT_STYLE]*
+ Face style: [FACE_STYLE]*
+ Other characters (if any): [OTHER_CHARS_STYLE]*
+ Body proportions (all characters): [BODY_RATIO]*
+ Background style: [BG_STYLE]*

The scene background is [A]

OUTPUT GUIDE: Do not write any text, title, or description. Your entire response must be only the generated image.*`;

    navigator.clipboard.writeText(GUIDE_TEMPLATE).then(() => {
        setCopyButtonText('Đã chép!');
        setTimeout(() => setCopyButtonText('Copy Prompt Hướng dẫn'), 2000);
    });
  };

  return (
    <section className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Bước 1: Chọn Phong Cách & Tỷ Lệ</h2>
        <p className="text-gray-500 dark:text-gray-400">Hệ thống hỗ trợ 20+ phong cách nghệ thuật được tối ưu cho AI.</p>
      </div>

      <div className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] rounded-[32px] shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 items-stretch h-[650px]">
          {/* Left Side: Style Library / Custom Prompt */}
          <div className="p-8 flex flex-col border-r border-gray-100 dark:border-gray-800 h-full overflow-hidden">
            <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-[#020a06] rounded-2xl mb-6 flex-shrink-0">
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
              <div className="flex flex-col flex-grow overflow-hidden">
                <div className="space-y-4 flex flex-col h-full">
                  <div className="relative flex-shrink-0">
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">Tìm kiếm phong cách</label>
                    <input 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Gõ để tìm nhanh..."
                      className="w-full bg-gray-50 dark:bg-[#020a06] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-green-400 transition-all shadow-inner"
                    />
                  </div>

                  <div className="flex flex-col flex-grow overflow-hidden">
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">Danh sách phong cách</label>
                    <div className="flex-grow overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-[#020a06]/30">
                      {filteredStyles.length > 0 ? (
                        filteredStyles.map((style) => {
                          const originalIndex = STYLES.indexOf(style);
                          const isActive = selectedStyleIndex === originalIndex;
                          return (
                            <Tooltip key={style.title} content={style.tooltip || style.description} position="top" className="w-full !justify-start">
                                <div
                                onClick={() => setSelectedStyleIndex(originalIndex)}
                                className={`flex items-center gap-4 p-4 cursor-pointer border-b border-gray-100 dark:border-gray-800/50 last:border-none transition-all hover:bg-white dark:hover:bg-green-900/10 w-full ${isActive ? 'bg-white dark:bg-green-900/20 ring-1 ring-inset ring-green-500' : ''}`}
                                >
                                <img src={style.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0" alt="" />
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-center">
                                    <p className={`font-bold text-sm truncate pr-2 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{style.title}</p>
                                    {isActive && <span className="text-[10px] bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter flex-shrink-0">Đang chọn</span>}
                                    </div>
                                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{style.description}</p>
                                </div>
                                </div>
                            </Tooltip>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-gray-400 italic text-sm">Không tìm thấy phong cách nào khớp.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-[0.2em] flex-shrink-0">Prompt phong cách cá nhân</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Nhập prompt template theo cấu trúc mới..."
                  className="flex-grow w-full bg-gray-50 dark:bg-[#020a06] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-sm outline-none focus:ring-2 focus:ring-green-400 transition-all resize-none shadow-inner custom-scrollbar font-mono"
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

          {/* Right Side: Prompt Template Display (Replaces Image Preview) */}
          <div className="bg-gray-50 dark:bg-[#020a06]/50 p-8 flex flex-col h-full gap-6 overflow-hidden">
            <div className="flex justify-between items-start flex-shrink-0">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Phong cách đã chọn</p>
                  <h3 className="font-black text-2xl uppercase tracking-tight text-gray-900 dark:text-white line-clamp-1">
                      {showCustom ? 'Tùy chỉnh' : activeStyle.title}
                  </h3>
               </div>
            </div>

            {/* Prompt Template Text Area */}
            <div className="flex-grow relative group rounded-[24px] overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col">
                <div className="bg-gray-100 dark:bg-[#1f4d3a] px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10 flex-shrink-0">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Prompt Mẫu (Template)
                   </label>
                   <span className="text-[9px] text-gray-400 bg-white dark:bg-[#020a06] px-2 py-0.5 rounded">Read-only</span>
                </div>
                <textarea
                   readOnly
                   value={showCustom ? customPrompt : (activeStyle.promptTemplate || "Không có prompt mẫu cho phong cách này.")}
                   className="flex-grow w-full bg-white dark:bg-[#020a06] p-6 text-[11px] font-mono text-gray-600 dark:text-gray-300 resize-none outline-none custom-scrollbar leading-relaxed whitespace-pre-wrap"
                   spellCheck={false}
                />
            </div>
            
            <div className="space-y-6 flex-shrink-0">
                 {/* Aspect Ratio Selector */}
                 <div className="bg-white dark:bg-[#020a06] p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 flex gap-1 shadow-sm">
                    {(['16:9', '9:16', '1:1', '4:3', '3:4'] as AspectRatio[]).map((ratio) => (
                        <Tooltip key={ratio} content={`Tỷ lệ khung hình ${ratio}`}>
                            <button
                                onClick={() => setAspectRatio(ratio)}
                                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    aspectRatio === ratio 
                                    ? 'bg-green-600 text-white shadow-md' 
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                {ratio}
                            </button>
                        </Tooltip>
                    ))}
                 </div>

                {!showCustom && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed px-1 line-clamp-2">
                        {activeStyle.description}
                    </p>
                )}

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
    </section>
  );
};
