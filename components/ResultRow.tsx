
import React, { useState, useRef, useEffect } from 'react';
import type { TableRowData, Character, Style, ExcelRow } from '../types';
import { getPromptForRow } from '../utils/fileUtils';
import { FileDropzone } from './FileDropzone';
import { CopyIcon } from './icons';

interface ResultRowProps {
  rowData: TableRowData;
  characters: Character[];
  defaultCharacterIndex: number | null;
  onUpdateRow: (row: TableRowData) => void;
  onGenerateImage: (rowId: number) => void;
  onGenerateVideoPrompt: (rowId: number) => void;
  onStartRemake: (row: TableRowData) => void;
  selectedStyle: Style;
  onViewImage: (imageUrl: string, rowId: number) => void;
  onOpenHistory: (row: TableRowData) => void;
  onSendToVideo: (rowId: number) => void;
}

const CharacterSelector: React.FC<{
    characters: Character[];
    selectedIndices: number[];
    onChange: (indices: number[]) => void;
}> = ({ characters, selectedIndices, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const validCharacters = characters.filter(c => c.name);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectionChange = (value: number) => {
        let newSelection: number[];
        if (value === -1) newSelection = [];
        else if (value === -2) newSelection = [-2];
        else {
            const current = selectedIndices.filter(i => i >= 0);
            newSelection = current.includes(value) ? current.filter(i => i !== value) : [...current, value];
        }
        onChange(newSelection);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-2 rounded-lg w-full text-left text-xs text-gray-700 dark:text-gray-300 truncate shadow-sm"
            >
                {selectedIndices.includes(-2) ? 'Random' : (selectedIndices.length === 0 ? 'None' : selectedIndices.map(i => characters[i]?.name).join(', '))}
            </button>
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] rounded-lg shadow-xl py-2 max-h-48 overflow-y-auto">
                    {[{ label: 'None', value: -1 }, { label: 'Random', value: -2 }, ...validCharacters.map((c, i) => ({ label: c.name, value: characters.findIndex(orig => orig === c) }))].map(opt => (
                        <label key={opt.value} className="flex items-center px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={opt.value < 0 ? selectedIndices.includes(opt.value) : selectedIndices.includes(opt.value)}
                                onChange={() => handleSelectionChange(opt.value)}
                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="ml-3 text-xs text-gray-700 dark:text-gray-300">{opt.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ResultRow: React.FC<ResultRowProps> = ({ rowData, characters, onUpdateRow, onGenerateImage, selectedStyle, onViewImage, onStartRemake, onOpenHistory, onSendToVideo, onGenerateVideoPrompt, defaultCharacterIndex }) => {
  const mainIndex = rowData.mainImageIndex > -1 ? rowData.mainImageIndex : (rowData.generatedImages.length > 0 ? rowData.generatedImages.length - 1 : -1);
  const mainAsset = mainIndex !== -1 ? rowData.generatedImages[mainIndex] : null;

  // Class chung cho các textarea để đảm bảo đồng bộ giao diện
  const textAreaClass = "w-full h-32 bg-gray-50/50 dark:bg-black/20 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-lg p-3 text-xs resize-none outline-none focus:bg-white dark:focus:bg-[#020a06] focus:ring-1 focus:ring-green-500/50 transition-all custom-scrollbar";

  return (
    <tr className="hover:bg-gray-50/50 dark:hover:bg-green-900/5 transition-colors group">
      {/* STT */}
      <td className="p-4 align-top text-gray-400 font-mono text-xs w-12 pt-6">{rowData.originalRow[0]}</td>
      
      {/* Ngôn ngữ gốc */}
      <td className="p-4 align-top w-48 min-w-[192px]">
        <textarea
            readOnly
            className={`${textAreaClass} text-gray-500 dark:text-gray-400`}
            value={(rowData.originalRow[1] as string) || ''}
            placeholder="Trống"
        />
      </td>

      {/* Tiếng Việt */}
      <td className="p-4 align-top w-48 min-w-[192px]">
        <textarea
            readOnly
            className={`${textAreaClass} font-medium text-gray-800 dark:text-gray-200`}
            value={(rowData.originalRow[2] as string) || ''}
            placeholder="Trống"
        />
      </td>

      {/* Nhân vật */}
      <td className="p-4 align-top w-32 min-w-[128px]">
        <CharacterSelector
          characters={characters}
          selectedIndices={rowData.selectedCharacterIndices}
          onChange={(indices) => onUpdateRow({ ...rowData, selectedCharacterIndices: indices })}
        />
      </td>

      {/* Prompt Bối Cảnh */}
      <td className="p-4 align-top w-[300px] min-w-[300px] max-w-[300px]">
        <textarea
          className={`${textAreaClass} text-gray-600 dark:text-gray-300 bg-white dark:bg-[#0b2b1e] border-gray-100 dark:border-[#1f4d3a]`}
          value={rowData.contextPrompt}
          onChange={(e) => onUpdateRow({ ...rowData, contextPrompt: e.target.value })}
          placeholder="Nhập prompt bối cảnh..."
        />
      </td>

      {/* Prompt Image (Final) */}
      <td className="p-4 align-top w-[300px] min-w-[300px] max-w-[300px]">
        <textarea
          className={`${textAreaClass} text-gray-700 dark:text-gray-200 bg-teal-50/30 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/30 font-medium`}
          value={rowData.imagePrompt || ''}
          onChange={(e) => onUpdateRow({ ...rowData, imagePrompt: e.target.value })}
          placeholder="Nhấn 'Tạo tất cả prompt ảnh' để tự động điền hoặc nhập thủ công..."
        />
      </td>

      {/* Prompt Video */}
      <td className="p-4 align-top w-[300px] min-w-[300px] max-w-[300px]">
        {rowData.isGeneratingPrompt ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-50 dark:bg-black/20 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="spinner w-5 h-5 border-2"></div>
                <span className="text-[10px] font-bold text-green-600 animate-pulse">ĐANG VIẾT...</span>
            </div>
        ) : rowData.videoPrompt ? (
            <textarea
                readOnly
                className={`${textAreaClass} text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#020a06]`}
                value={rowData.videoPrompt}
            />
        ) : (
            <button 
                onClick={() => onGenerateVideoPrompt(rowData.id)}
                className="w-full h-32 bg-gray-50 dark:bg-[#020a06]/50 border border-gray-200 dark:border-[#1f4d3a] rounded-xl text-gray-400 dark:text-gray-500 font-bold text-xs hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-900/10 dark:hover:text-green-400 transition-all flex flex-col items-center justify-center gap-2 group/video"
            >
                <span className="text-2xl group-hover/video:scale-110 transition-transform grayscale group-hover/video:grayscale-0">🎬</span>
                <span className="uppercase tracking-wider text-[10px]">Tạo Prompt Video</span>
            </button>
        )}
      </td>

      {/* Image */}
      <td className="p-4 align-top w-48 min-w-[192px]">
        <div className="flex flex-col gap-2 min-h-[120px] justify-start h-full">
            {rowData.isGenerating ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-50 dark:bg-black/20 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="spinner w-6 h-6 border-2"></div>
                    <span className="text-[10px] font-bold text-green-600 animate-pulse">ĐANG VẼ...</span>
                    {rowData.error && rowData.error.includes('Key') && (
                        <span className="text-[9px] text-orange-500 font-medium text-center leading-tight px-1">{rowData.error}</span>
                    )}
                </div>
            ) : mainAsset ? (
                <div className="space-y-2">
                    <div className="relative group/image overflow-hidden rounded-lg h-24 bg-gray-100 dark:bg-black">
                        <img 
                            src={mainAsset} 
                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
                            onClick={() => onViewImage(mainAsset, rowData.id)}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors pointer-events-none" />
                    </div>
                    <div className="flex justify-between gap-1">
                        <button onClick={() => onStartRemake(rowData)} className="flex-1 text-[10px] font-bold py-1.5 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors shadow-sm">Tạo lại</button>
                        {rowData.generatedImages.length > 1 && (
                            <button onClick={() => onOpenHistory(rowData)} className="flex-1 text-[10px] font-bold py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md border border-green-100 dark:border-green-800 hover:bg-green-100 transition-colors">{rowData.generatedImages.length} Bản</button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2 h-32">
                    <button 
                        onClick={() => onGenerateImage(rowData.id)} 
                        className="w-full h-full border-2 border-dashed border-gray-200 dark:border-green-900/30 rounded-lg flex flex-col items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-300 transition-all group/btn bg-white dark:bg-transparent"
                    >
                        <span className="text-xl group-hover/btn:scale-110 transition-transform mb-1">🎨</span>
                        <span className="text-[10px] font-black uppercase tracking-wider">Tạo ảnh</span>
                    </button>
                    {rowData.error && (
                        <p className="text-[9px] text-red-500 font-medium text-center line-clamp-2 leading-tight px-1" title={rowData.error}>{rowData.error}</p>
                    )}
                </div>
            )}
        </div>
      </td>
    </tr>
  );
};
