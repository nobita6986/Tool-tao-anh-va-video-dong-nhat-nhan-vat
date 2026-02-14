
import React from 'react';
import type { TableRowData, Character, Style } from '../types';
import { ResultRow } from './ResultRow';
import { InfoIcon } from './icons';

interface ResultsTableProps {
  tableData: TableRowData[];
  characters: Character[];
  defaultCharacterIndex: number | null;
  onUpdateRow: (row: TableRowData) => void;
  onGenerateImage: (rowId: number) => void;
  onGenerateAllImages: () => void;
  onGenerateAllVideoPrompts: () => void;
  onGenerateVideoPrompt: (rowId: number) => void;
  onDownloadAll: () => void;
  onStartRemake: (row: TableRowData) => void;
  selectedStyle: Style;
  onViewImage: (imageUrl: string, rowId: number) => void;
  onOpenHistory: (row: TableRowData) => void;
  onSendToVideo: (rowId: number) => void;
}

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative flex items-center group">
        <InfoIcon className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500 cursor-pointer" />
        {/* Changed from bottom-full to top-full and increased z-index */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] shadow-xl border border-gray-700">
            {text}
            {/* Added a small arrow pointing up */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-gray-900"></div>
        </div>
    </div>
);

export const ResultsTable: React.FC<ResultsTableProps> = ({ 
  tableData, 
  characters, 
  onUpdateRow, 
  onGenerateImage, 
  onGenerateAllImages, 
  onGenerateAllVideoPrompts, 
  onDownloadAll, 
  selectedStyle, 
  onViewImage, 
  onStartRemake, 
  onOpenHistory, 
  onSendToVideo, 
  onGenerateVideoPrompt, 
  defaultCharacterIndex 
}) => {
  const headers = [
    { text: "STT", tooltip: "Số thứ tự phân cảnh. Dùng để định danh và gán nhân vật tự động." },
    { text: "Ngôn ngữ gốc", tooltip: "Nội dung kịch bản gốc dùng để AI hiểu sâu về bối cảnh." },
    { text: "Tiếng Việt", tooltip: "Bản dịch tiếng Việt dùng để người dùng kiểm soát nội dung." },
    { text: "Nhân vật", tooltip: "Danh sách nhân vật xuất hiện trong cảnh này. Ảnh tham chiếu sẽ được gửi kèm prompt." },
    { text: "Prompt bối cảnh", tooltip: "Mô tả chi tiết môi trường, ánh sáng, hành động cho AI vẽ ảnh." },
    { text: "Image", tooltip: "Kết quả hình ảnh từ AI. Nhấn vào ảnh để xem toàn màn hình." },
    { text: "Prompt video", tooltip: "Câu lệnh điều khiển camera và chuyển động được AI phân tích từ hình ảnh." },
  ];

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center bg-green-50/50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">⚡ Mẹo: Sử dụng các nút điều khiển hàng loạt để tối ưu hóa quy trình sản xuất.</p>
            <div className="flex gap-3">
                <div className="group relative">
                    <button 
                        onClick={onGenerateAllImages} 
                        className="text-sm font-bold py-2.5 px-6 rounded-lg bg-green-600 text-white hover:bg-orange-500 shadow-md transition-all active:scale-95"
                    >
                        Tạo ảnh hàng loạt
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-[60] text-center border border-gray-700">
                        Kích hoạt vẽ AI cho tất cả các phân cảnh chưa có ảnh cùng lúc.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                    </div>
                </div>

                <div className="group relative">
                    <button 
                        onClick={onGenerateAllVideoPrompts} 
                        className="text-sm font-bold py-2.5 px-6 rounded-lg bg-green-100 text-green-700 hover:bg-orange-100 hover:text-orange-700 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-300 transition-all border border-green-200 dark:border-green-800 active:scale-95"
                    >
                        Tạo tất cả prompt video
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-[60] text-center border border-gray-700">
                        AI sẽ đọc từng ảnh đã vẽ để viết câu lệnh chuyển động camera 8 giây.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            </div>
        </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#1f4d3a] shadow-sm">
        <table className="w-full border-collapse text-sm bg-white dark:bg-[#0b2b1e]">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#020a06] border-b border-gray-200 dark:border-[#1f4d3a]">
              {headers.map(h => 
                <th key={h.text} className="p-4 text-left text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px] relative">
                    <div className="flex items-center">
                        {h.text}
                        {h.tooltip && <Tooltip text={h.tooltip} />}
                    </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#1f4d3a]">
            {tableData.map(row => (
              <ResultRow 
                key={row.id} 
                rowData={row} 
                characters={characters} 
                onUpdateRow={onUpdateRow} 
                onGenerateImage={onGenerateImage} 
                onGenerateVideoPrompt={onGenerateVideoPrompt} 
                selectedStyle={selectedStyle} 
                onViewImage={onViewImage} 
                onStartRemake={onStartRemake} 
                onOpenHistory={onOpenHistory} 
                onSendToVideo={onSendToVideo} 
                defaultCharacterIndex={defaultCharacterIndex} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
