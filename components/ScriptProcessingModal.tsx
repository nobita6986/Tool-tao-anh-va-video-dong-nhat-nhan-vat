
import React, { useState } from 'react';

export type SegmentationMethod = 'current' | 'punctuation' | 'custom';

interface ScriptProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: SegmentationMethod, customRule?: string) => void;
}

export const ScriptProcessingModal: React.FC<ScriptProcessingModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [method, setMethod] = useState<SegmentationMethod>('current');
  const [partCount, setPartCount] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    let rule = undefined;
    if (method === 'custom') {
        rule = `Chia toàn bộ kịch bản thành đúng ${partCount} phân cảnh (Scene).`;
    }
    onConfirm(method, rule);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[110] p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-[32px] w-full max-w-xl shadow-2xl space-y-8 animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Tùy chọn phân đoạn kịch bản</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Chọn cách AI sẽ chia nhỏ kịch bản của bạn thành các phân cảnh.</p>
        </div>

        <div className="space-y-4">
          <div 
            onClick={() => setMethod('current')}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${method === 'current' ? 'bg-green-50 dark:bg-green-900/20 border-green-500 ring-4 ring-green-500/10' : 'bg-gray-50 dark:bg-[#020a06] border-gray-100 dark:border-gray-800 hover:border-green-300'}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${method === 'current' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
              ⚡
            </div>
            <div className="flex-grow">
              <p className={`font-black text-sm uppercase ${method === 'current' ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>Tối ưu (7-15 từ)</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Chia nhỏ kịch bản thành các câu ngắn, dễ đọc, không cắt ngang câu. (Mặc định)</p>
            </div>
          </div>

          <div 
            onClick={() => setMethod('punctuation')}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${method === 'punctuation' ? 'bg-green-50 dark:bg-green-900/20 border-green-500 ring-4 ring-green-500/10' : 'bg-gray-50 dark:bg-[#020a06] border-gray-100 dark:border-gray-800 hover:border-green-300'}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${method === 'punctuation' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
              📍
            </div>
            <div className="flex-grow">
              <p className={`font-black text-sm uppercase ${method === 'punctuation' ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>Theo dấu chấm câu</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Dựa hoàn toàn vào dấu chấm câu để ngắt đoạn. Phù hợp cho kịch bản có câu dài phức tạp.</p>
            </div>
          </div>

          <div 
            onClick={() => setMethod('custom')}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${method === 'custom' ? 'bg-green-50 dark:bg-green-900/20 border-green-500 ring-4 ring-green-500/10' : 'bg-gray-50 dark:bg-[#020a06] border-gray-100 dark:border-gray-800 hover:border-green-300'}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${method === 'custom' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
              🔢
            </div>
            <div className="flex-grow">
              <p className={`font-black text-sm uppercase ${method === 'custom' ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>Chia theo số lượng</p>
              <p className="text-[10px] text-gray-400 mt-0.5">AI sẽ tự động chia kịch bản thành đúng số lượng phân cảnh bạn yêu cầu.</p>
            </div>
          </div>

          {method === 'custom' && (
            <div className="animate-in slide-in-from-top-2">
                 <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Số lượng phân cảnh mong muốn</label>
                 <input
                  type="number"
                  autoFocus
                  min="1"
                  value={partCount}
                  onChange={(e) => setPartCount(e.target.value)}
                  placeholder="Nhập số lượng (Ví dụ: 10)..."
                  className="w-full bg-gray-50 dark:bg-[#020a06] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-green-400 transition-all shadow-inner font-bold text-gray-900 dark:text-white"
                />
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
          >
            Hủy
          </button>
          <button 
            onClick={handleConfirm}
            disabled={method === 'custom' && (!partCount || parseInt(partCount) <= 0)}
            className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 shadow-xl shadow-green-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            Bắt đầu xử lý &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
