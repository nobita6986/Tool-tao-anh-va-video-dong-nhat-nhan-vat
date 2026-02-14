
import React from 'react';
import type { Style, TableRowData, Character } from '../types';
import { ResultsTable } from './ResultsTable';
import { FileDropzone } from './FileDropzone';

interface ResultsViewProps {
  selectedStyle: Style;
  tableData: TableRowData[];
  characters: Character[];
  defaultCharacterIndex: number | null;
  onBack: () => void;
  onDocUpload: (file: File) => void;
  onUpdateRow: (row: TableRowData) => void;
  onGenerateImage: (rowId: number) => void;
  onGenerateAllImages: () => void;
  onGenerateVideoPrompt: (rowId: number) => void;
  onGenerateAllVideoPrompts: () => void;
  onDownloadAll: () => void;
  onViewImage: (imageUrl: string, rowId: number) => void;
  onStartRemake: (row: TableRowData) => void;
  onOpenHistory: (row: TableRowData) => void;
  onSendToVideo: (rowId: number) => void;
  isProcessing?: boolean;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  selectedStyle,
  tableData,
  characters,
  onBack,
  onDocUpload,
  onStartRemake,
  onOpenHistory,
  onGenerateImage,
  onGenerateAllImages,
  onGenerateAllVideoPrompts,
  onGenerateVideoPrompt,
  onDownloadAll,
  defaultCharacterIndex,
  onViewImage,
  isProcessing = false,
  ...rest
}) => {
  return (
    <section className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl space-y-8 min-h-[400px] flex flex-col">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎨</span>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Phong cách</p>
                <h2 className="text-lg font-bold text-green-600 dark:text-green-300 leading-tight">{selectedStyle.title}</h2>
            </div>
        </div>
        <button onClick={onBack} className="text-sm font-semibold py-2 px-4 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 dark:bg-[#0f3a29] dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900 transition-colors">
            &larr; Quay lại
        </button>
      </div>

      {tableData.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center py-10">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-10">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Bước 2: Tải Kịch Bản</h3>
                <p className="text-gray-500 dark:text-gray-400">Hệ thống sẽ tự động phân cảnh và viết Prompt bối cảnh cho bạn.</p>
            </div>

            <FileDropzone 
                onDrop={(f) => onDocUpload(f[0])} 
                accept=".txt,.docx" 
                className="group relative h-64 bg-gray-50 dark:bg-[#020a06] border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-10 flex flex-col items-center justify-center hover:border-green-500 dark:hover:border-green-500 transition-all cursor-pointer overflow-hidden shadow-inner"
                dropMessage="Tải kịch bản của bạn"
            >
                {isProcessing ? (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="spinner w-12 h-12"></div>
                        <p className="text-green-600 font-bold animate-pulse">AI Đang xử lý kịch bản... vui lòng đợi</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-6xl group-hover:scale-110 transition-transform">📄</div>
                        <p className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">Nhấn hoặc thả tệp kịch bản vào đây</p>
                        <p className="text-sm text-gray-400">Hỗ trợ định dạng .docx hoặc .txt</p>
                    </>
                )}
            </FileDropzone>
            
            <div className="mt-10 grid grid-cols-3 gap-4">
                {[
                    { icon: '✂️', text: 'Tự động phân đoạn' },
                    { icon: '🌍', text: 'Dịch thuật đa ngữ' },
                    { icon: '✍️', text: 'Viết Prompt bối cảnh' }
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center p-4 bg-gray-50 dark:bg-[#020a06]/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <span className="text-2xl mb-1">{item.icon}</span>
                        <span className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 text-center">{item.text}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <ResultsTable
          tableData={tableData}
          characters={characters}
          selectedStyle={selectedStyle}
          defaultCharacterIndex={defaultCharacterIndex}
          onStartRemake={onStartRemake}
          onOpenHistory={onOpenHistory}
          onGenerateImage={onGenerateImage}
          onGenerateAllImages={onGenerateAllImages}
          onGenerateAllVideoPrompts={onGenerateAllVideoPrompts}
          onGenerateVideoPrompt={onGenerateVideoPrompt}
          onDownloadAll={onDownloadAll}
          onViewImage={onViewImage}
          onUpdateRow={rest.onUpdateRow}
          onSendToVideo={rest.onSendToVideo}
        />
      )}
    </section>
  );
};
