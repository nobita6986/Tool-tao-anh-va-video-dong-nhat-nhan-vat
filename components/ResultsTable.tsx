
import React, { useState } from 'react';
import type { TableRowData, Character, Style } from '../types';
import { ResultRow } from './ResultRow';
import { InfoIcon } from './icons';
import { Tooltip } from './Tooltip';
import { ToastType } from './Toast';

interface ResultsTableProps {
  tableData: TableRowData[];
  characters: Character[];
  defaultCharacterIndices: number[];
  onUpdateRow: (row: TableRowData) => void;
  onGenerateImage: (rowId: number) => void;
  onGenerateAllImages: (isRegenerate?: boolean) => void;
  onGenerateAllVideoPrompts: () => void;
  onGenerateAllContextPrompts: () => void;
  onGenerateVideoPrompt: (rowId: number) => void;
  onDownloadAll: () => void;
  onStartRemake: (row: TableRowData) => void;
  selectedStyle: Style;
  onViewImage: (imageUrl: string, rowId: number) => void;
  onOpenHistory: (row: TableRowData) => void;
  onSendToVideo: (rowId: number) => void;
  showToast: (message: string, type: ToastType) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ 
  tableData, 
  characters, 
  onUpdateRow, 
  onGenerateImage, 
  onGenerateAllImages, 
  onGenerateAllVideoPrompts, 
  onGenerateAllContextPrompts,
  onDownloadAll, 
  selectedStyle, 
  onViewImage, 
  onStartRemake, 
  onOpenHistory, 
  onSendToVideo, 
  onGenerateVideoPrompt, 
  defaultCharacterIndices,
  showToast
}) => {
  // Mặc định ẩn cột Context Prompt để tiết kiệm diện tích
  const [showContextPrompt, setShowContextPrompt] = useState(false);

  const headers = [
    { text: "STT", tooltip: "Số thứ tự phân cảnh. Dùng để định danh và gán nhân vật tự động." },
    { text: "Kịch bản Gốc", tooltip: "Nội dung gốc từ file input (Giữ nguyên văn, không sửa đổi)." },
    { text: "Bản dịch / Hỗ trợ", tooltip: "Bản dịch (Anh <-> Việt) để tham khảo hoặc dùng cho prompt." },
    { text: "Nhân vật", tooltip: "Danh sách nhân vật xuất hiện trong cảnh này. Ảnh tham chiếu sẽ được gửi kèm prompt." },
    { text: "Prompt bối cảnh", tooltip: "Mô tả chi tiết môi trường, ánh sáng, hành động cho AI vẽ ảnh." },
    { text: "Prompt Image", tooltip: "Prompt cuối cùng được gửi đi để tạo ảnh (đã gộp style + character + context). Bạn có thể chỉnh sửa tại đây." },
    { text: "Prompt video", tooltip: "Câu lệnh điều khiển camera và chuyển động được AI phân tích từ hình ảnh." },
    { text: "Image", tooltip: "Kết quả hình ảnh từ AI. Nhấn vào ảnh để xem toàn màn hình." },
  ];

  const allRowsHaveImages = tableData.length > 0 && tableData.every(r => r.generatedImages.length > 0);

  return (
    <div className="space-y-4">
        {/* Hướng dẫn nhanh quy trình */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4 rounded-xl shadow-sm">
            <h4 className="text-blue-700 dark:text-blue-300 font-bold mb-2 flex items-center gap-2">
                <span className="text-lg">💡</span> Quy trình chuẩn để đồng nhất nhân vật:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200 ml-2">
                <li>Tại mục <strong>Quản lý nhân vật</strong> (bên trên): Dùng tính năng <span className="font-semibold bg-white dark:bg-black/20 px-1 rounded border border-blue-200 dark:border-blue-800">🔍 Tự động lấy nhân vật</span>, sau đó upload ảnh tham chiếu rõ mặt.</li>
                <li>Nhấn nút <span className="font-semibold bg-white dark:bg-black/20 px-1 rounded border border-blue-200 dark:border-blue-800">🪄 Tự động điền nhân vật vào cảnh</span> để AI phân tích và gán nhân vật cho từng dòng.</li>
                <li>Kiểm tra lại cột <strong>Nhân vật</strong> trong bảng bên dưới. Nếu sai, hãy chọn lại thủ công.</li>
                <li>Sau khi đã chốt nhân vật, mới tiến hành bấm các nút <strong>Tạo hàng loạt</strong> (Prompt ảnh, Prompt video...) ở thanh công cụ bên dưới.</li>
            </ol>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center bg-green-50/50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30 gap-4">
            <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 hidden md:block">⚡ Tác vụ hàng loạt:</p>
                <button 
                    onClick={() => setShowContextPrompt(!showContextPrompt)}
                    className={`text-xs font-bold py-2 px-3 rounded-lg border transition-all flex items-center gap-2 ${showContextPrompt 
                        ? 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' 
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                    }`}
                >
                    {showContextPrompt ? '🙈 Ẩn Prompt bối cảnh' : '👁️ Hiện Prompt bối cảnh'}
                </button>
            </div>

            <div className="flex gap-2 flex-wrap justify-end">
                <Tooltip content="Tạo prompt cuối cùng cho cột 'Prompt Image' (kết hợp Style + Context + Nhân vật) cho tất cả các dòng.">
                    <button 
                        onClick={onGenerateAllContextPrompts} 
                        className="text-xs font-bold py-2.5 px-4 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-md transition-all active:scale-95"
                    >
                        Tạo tất cả prompt ảnh
                    </button>
                </Tooltip>

                <Tooltip content="AI sẽ đọc từng ảnh đã vẽ để viết câu lệnh chuyển động camera 8 giây.">
                    <button 
                        onClick={onGenerateAllVideoPrompts} 
                        className="text-xs font-bold py-2.5 px-4 rounded-lg bg-green-100 text-green-700 hover:bg-orange-100 hover:text-orange-700 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-300 transition-all border border-green-200 dark:border-green-800 active:scale-95"
                    >
                        Tạo tất cả prompt video
                    </button>
                </Tooltip>

                <Tooltip content={allRowsHaveImages 
                    ? 'AI sẽ vẽ lại toàn bộ phiên bản mới cho tất cả các phân cảnh (tạo thêm bản sao).'
                    : 'Kích hoạt vẽ AI cho tất cả các phân cảnh chưa có ảnh cùng lúc.'
                }>
                    <button 
                        onClick={() => onGenerateAllImages(allRowsHaveImages)} 
                        className="text-xs font-bold py-2.5 px-4 rounded-lg bg-green-600 text-white hover:bg-orange-500 shadow-md transition-all active:scale-95"
                    >
                        {allRowsHaveImages ? 'Tạo lại ảnh hàng loạt' : 'Tạo ảnh hàng loạt'}
                    </button>
                </Tooltip>
            </div>
        </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#1f4d3a] shadow-sm">
        <table className="w-full border-collapse text-sm bg-white dark:bg-[#0b2b1e]">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#020a06] border-b border-gray-200 dark:border-[#1f4d3a]">
              {headers.map(h => {
                // Ẩn cột Prompt bối cảnh nếu state showContextPrompt = false
                if (h.text === "Prompt bối cảnh" && !showContextPrompt) return null;
                
                return (
                    <th key={h.text} className="p-2 text-left text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px]">
                        <div className="flex items-center">
                            {h.text}
                            {h.tooltip && (
                                <Tooltip content={h.tooltip}>
                                    <InfoIcon className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500 cursor-pointer" />
                                </Tooltip>
                            )}
                        </div>
                    </th>
                );
              })}
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
                defaultCharacterIndex={defaultCharacterIndices[0]}
                showContextPrompt={showContextPrompt}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
