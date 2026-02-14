
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Character, TableRowData, GeminiModel } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { FileDropzone } from './FileDropzone';

interface CharacterManagerProps {
  characters: Character[];
  setCharacters: (characters: Character[]) => void;
  defaultCharacterIndex: number | null;
  onSetDefault: (index: number | null) => void;
  videoPromptNote: string;
  onVideoPromptNoteChange: (note: string) => void;
  tableData: TableRowData[];
  selectedModel: GeminiModel;
  onAutoFillRows: () => void;
  getAiInstance: () => { ai: GoogleGenAI, rotate: () => void };
}

export const CharacterManager: React.FC<CharacterManagerProps> = ({ 
  characters, 
  setCharacters, 
  defaultCharacterIndex, 
  onSetDefault, 
  videoPromptNote, 
  onVideoPromptNoteChange,
  tableData,
  selectedModel,
  onAutoFillRows,
  getAiInstance
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNameChange = (index: number, name: string) => {
    const newCharacters = [...characters];
    const sanitizedName = name.replace(/[^\p{L}0-9\s]/gu, '');
    newCharacters[index] = { ...newCharacters[index], name: sanitizedName };
    setCharacters(newCharacters);
  };

  const handleStylePromptChange = (index: number, prompt: string) => {
    const newCharacters = [...characters];
    newCharacters[index] = { ...newCharacters[index], stylePrompt: prompt };
    setCharacters(newCharacters);
  };

  const addCharacterSlot = () => {
    setCharacters([{ name: '', images: [], stylePrompt: '' }, ...characters]);
  };

  const removeCharacterSlot = (index: number) => {
    if (characters.length <= 1) return;
    const newCharacters = characters.filter((_, i) => i !== index);
    setCharacters(newCharacters);
    if (defaultCharacterIndex === index) onSetDefault(null);
  };

  const removeImage = (charIndex: number, imgIndex: number) => {
    const newCharacters = [...characters];
    newCharacters[charIndex].images = newCharacters[charIndex].images.filter((_, i) => i !== imgIndex);
    setCharacters(newCharacters);
  };

  const detectCharacters = async () => {
    if (tableData.length === 0) {
      alert('Vui lòng tải kịch bản trước để AI có dữ liệu phân tích nhân vật.');
      return;
    }
    
    setIsDetecting(true);
    try {
      const scriptText = tableData.map(r => r.originalRow[2]).join(' ');
      const { ai, rotate } = getAiInstance();
      const prompt = `Phân tích kịch bản sau và liệt kê danh sách các nhân vật chính (chỉ lấy tên hoặc danh xưng ngắn gọn, ví dụ: "Sara", "Người chồng", "Ông già"). Trả về danh sách phân tách bằng dấu phẩy. 
Kịch bản: "${scriptText.substring(0, 3000)}"`;
      
      const response = await ai.models.generateContent({
        model: selectedModel.includes('pro') ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
        contents: prompt,
      });

      const names = response.text?.split(',').map(n => n.trim()).filter(n => n.length > 0) || [];
      if (names.length === 0) {
        alert('Không tìm thấy nhân vật rõ ràng trong kịch bản.');
      } else {
        const existingNames = new Set(characters.map(c => c.name.toLowerCase().trim()));
        const newSlots = names
          .filter(name => !existingNames.has(name.toLowerCase()))
          .map(name => ({ name, images: [], stylePrompt: '' }));
          
        setCharacters([...characters.filter(c => c.name || c.images.length > 0), ...newSlots]);
      }
    } catch (error: any) {
      alert(`Lỗi phân tích: ${error.message}`);
    } finally {
      setIsDetecting(false);
    }
  };

  const processAndUploadImages = async (index: number, files: File[]) => {
    const currentImageCount = characters[index].images.length;
    const remainingSlots = 5 - currentImageCount;
    if (remainingSlots <= 0) return;

    const filesToProcess = files.slice(0, remainingSlots);
    try {
      const base64Images = await Promise.all(filesToProcess.map(fileToBase64));
      const newCharacters = [...characters];
      newCharacters[index] = { ...newCharacters[index], images: [...newCharacters[index].images, ...base64Images] };
      setCharacters(newCharacters);
    } catch (error) {
      console.error('Error uploading:', error);
    }
  };

  return (
    <section className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] rounded-xl shadow-sm overflow-hidden">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-green-900/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`text-xl transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý nhân vật</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {characters.filter(c => c.name).length} nhân vật được đặt tên. Nhấn để mở rộng/thu gọn.
            </p>
          </div>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={detectCharacters}
            disabled={isDetecting}
            className="flex items-center gap-2 text-sm font-bold py-2 px-4 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 transition-all disabled:opacity-50 shadow-sm"
          >
            {isDetecting ? <div className="spinner w-4 h-4" /> : '🔍'} Tự động lấy nhân vật
          </button>
          <button 
            onClick={addCharacterSlot}
            className="text-sm font-bold py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-md transition-all active:scale-95"
          >
            Thêm nhân vật
          </button>
          <button 
            onClick={onAutoFillRows}
            className="flex items-center gap-2 text-sm font-bold py-2 px-4 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800 transition-all shadow-sm"
          >
            🪄 Tự động điền nhân vật vào cảnh
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-8 pt-0 border-t border-gray-100 dark:border-[#1f4d3a] space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {characters.map((char, index) => (
              <div key={index} className="relative group bg-gray-50 dark:bg-[#020a06] border border-gray-200 dark:border-[#1f4d3a] rounded-2xl p-5 transition-all hover:shadow-md">
                <button 
                  onClick={(e) => { e.stopPropagation(); removeCharacterSlot(index); }}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-500 hover:text-red-500 rounded-full text-xs transition-colors z-10"
                >
                  ✕
                </button>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      className="bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-bold w-full focus:border-green-500 outline-none transition-colors"
                      placeholder="Tên nhân vật..."
                      value={char.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                    />
                  </div>

                  <textarea
                    rows={2}
                    className="w-full bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-xs text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-green-500 resize-none"
                    placeholder="Lưu ý về phong cách..."
                    value={char.stylePrompt}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStylePromptChange(index, e.target.value)}
                  />

                  <FileDropzone
                    onDrop={(files) => processAndUploadImages(index, files)}
                    accept="image/*"
                    className="border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-xl p-4 text-center hover:border-green-400 transition-colors bg-white dark:bg-[#0b2b1e]"
                  >
                    <div className="text-[10px] text-gray-400 mb-2 uppercase font-bold">Thả hoặc nhấn để tải ảnh (Max 5)</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {char.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-200 group/img">
                          <img src={img} className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeImage(index, imgIdx); }}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-[10px]"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                      {char.images.length === 0 && <span className="text-2xl opacity-30">📸</span>}
                    </div>
                  </FileDropzone>

                  <button
                    onClick={(e) => { e.stopPropagation(); onSetDefault(defaultCharacterIndex === index ? null : index); }}
                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      defaultCharacterIndex === index 
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 border border-transparent'
                    }`}
                  >
                    {defaultCharacterIndex === index ? '✓ Đang sử dụng' : 'Sử dụng nhân vật này'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#1f4d3a]">
            <h3 className="text-sm font-black uppercase text-gray-500 tracking-widest mb-3">Ghi chú Prompt Video chung</h3>
            <textarea
              rows={2}
              className="w-full bg-gray-50 dark:bg-[#020a06] border border-gray-200 dark:border-[#1f4d3a] rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Ví dụ: Camera chuyển động mượt mà..."
              value={videoPromptNote}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onVideoPromptNoteChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </section>
  );
};
