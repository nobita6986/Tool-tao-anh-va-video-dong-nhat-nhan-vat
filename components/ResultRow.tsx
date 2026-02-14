
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
                className="bg-gray-50 dark:bg-[#020a06] border border-gray-200 dark:border-[#1f4d3a] p-2 rounded-lg w-full text-left text-xs text-gray-700 dark:text-gray-300 truncate"
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

  return (
    <tr className="hover:bg-gray-50/50 dark:hover:bg-green-900/5 transition-colors">
      <td className="p-4 align-top text-gray-400 font-mono text-xs w-12">{rowData.originalRow[0]}</td>
      <td className="p-4 align-top text-gray-600 dark:text-gray-400 text-xs w-32 min-w-[128px]">{(rowData.originalRow[1] as string)}</td>
      <td className="p-4 align-top text-gray-800 dark:text-gray-200 text-xs font-medium w-32 min-w-[128px]">{(rowData.originalRow[2] as string)}</td>
      <td className="p-4 align-top w-32 min-w-[128px]">
        <CharacterSelector
          characters={characters}
          selectedIndices={rowData.selectedCharacterIndices}
          onChange={(indices) => onUpdateRow({ ...rowData, selectedCharacterIndices: indices })}
        />
      </td>
      {/* Cố định chiều rộng cột Prompt Bối cảnh */}
      <td className="p-4 align-top w-[300px] min-w-[300px] max-w-[300px]">
        <textarea
          rows={6}
          className="w-full bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded p-1 text-xs text-gray-600 dark:text-gray-400 outline-none resize-none focus:text-green-600 dark:focus:text-green-300 transition-colors h-32"
          value={rowData.contextPrompt}
          onChange={(e) => onUpdateRow({ ...rowData, contextPrompt: e.target.value })}
        />
      </td>
      <td className="p-4 align-top w-48 min-w-[192px]">
        <div className="flex flex-col gap-2 min-h-[120px] justify-center">
            {rowData.isGenerating ? (
                <div className="flex flex-col items-center gap-2 py-8">
                    <div className="spinner w-8 h-8"></div>
                    <span className="text-[10px] font-bold text-green-600 animate-pulse">ĐANG VẼ...</span>
                    {rowData.error && rowData.error.includes('Key') && (
                        <span className="text-[9px] text-orange-500 font-medium text-center leading-tight">{rowData.error}</span>
                    )}
                </div>
            ) : mainAsset ? (
                <div className="space-y-2">
                    <img 
                        src={mainAsset} 
                        className="w-full aspect-video object-cover rounded-lg border border-gray-200 dark:border-green-900/30 cursor-pointer hover:ring-2 hover:ring-green-400 transition-all"
                        onClick={() => onViewImage(mainAsset, rowData.id)}
                    />
                    <div className="flex justify-between gap-1">
                        <button onClick={() => onStartRemake(rowData)} className="flex-1 text-[10px] font-bold py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md hover:bg-green-100 hover:text-green-700 transition-colors">Tạo lại</button>
                        {rowData.generatedImages.length > 1 && (
                            <button onClick={() => onOpenHistory(rowData)} className="flex-1 text-[10px] font-bold py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md">{rowData.generatedImages.length} Bản</button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => onGenerateImage(rowData.id)} 
                        className="w-full aspect-video border-2 border-dashed border-gray-200 dark:border-green-900/30 rounded-lg flex flex-col items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors group"
                    >
                        <span className="text-xl group-hover:scale-125 transition-transform">🎨</span>
                        <span className="text-[10px] font-bold mt-1">TẠO ẢNH</span>
                    </button>
                    {rowData.error && (
                        <p className="text-[9px] text-red-500 font-medium text-center line-clamp-3 leading-tight px-1" title={rowData.error}>{rowData.error}</p>
                    )}
                </div>
            )}
        </div>
      </td>
      {/* Cố định chiều rộng cột Prompt Video */}
      <td className="p-4 align-top w-[300px] min-w-[300px] max-w-[300px]">
        {rowData.isGeneratingPrompt ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
                <div className="spinner w-5 h-5"></div>
                <span className="text-[10px] font-bold text-green-600">ĐANG VIẾT...</span>
            </div>
        ) : rowData.videoPrompt ? (
            <textarea
                rows={6}
                readOnly
                className="w-full bg-gray-50 dark:bg-[#020a06] border border-gray-100 dark:border-[#1f4d3a] rounded-lg p-3 text-[10px] text-gray-500 dark:text-gray-400 outline-none resize-none h-32"
                value={rowData.videoPrompt}
            />
        ) : (
            <button 
                onClick={() => onGenerateVideoPrompt(rowData.id)}
                className="w-full py-8 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl text-green-700 dark:text-green-400 font-bold text-xs hover:bg-green-100 transition-all flex flex-col items-center gap-1 h-32 justify-center"
            >
                <span>🎬</span>
                TẠO PROMPT VIDEO
            </button>
        )}
      </td>
    </tr>
  );
};
