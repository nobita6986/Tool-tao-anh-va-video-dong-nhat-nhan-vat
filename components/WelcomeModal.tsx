
import React from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onOpenGuide }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[200] p-2 sm:p-4 animate-in fade-in zoom-in-95 duration-300">
      <div 
        className="bg-white dark:bg-[#0b2b1e] w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#1f4d3a] relative max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative header background */}
        <div className="h-24 sm:h-28 bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-md z-10 text-center px-4">
                StudyAI86 Studio
            </h1>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="text-center space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Chào mừng bạn đến với công cụ sáng tạo!</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Giải pháp All-in-One chuyển thể kịch bản thành Video & Storyboard.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#020a06]/50 p-4 sm:p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
                <h3 className="font-bold text-green-600 dark:text-green-400 uppercase text-[10px] tracking-wider mb-1">Tính năng nổi bật:</h3>
                <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                        <span className="text-lg">🎭</span>
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300"><strong>Đồng nhất nhân vật:</strong> Giữ nguyên khuôn mặt xuyên suốt hàng trăm phân cảnh.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-lg">⚡</span>
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300"><strong>Tự động hóa 90%:</strong> Từ kịch bản &rarr; Phân cảnh &rarr; Prompt ảnh &rarr; Video chỉ vài click.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-lg">🎬</span>
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300"><strong>Hỗ trợ làm Video AI:</strong> Viết prompt camera chuyên sâu cho Kling, Runway, Luma.</span>
                    </li>
                </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-800 flex gap-2 items-start">
                <span className="text-lg">⚠️</span>
                <p className="text-[11px] sm:text-xs text-orange-800 dark:text-orange-200 font-medium">
                    Lưu ý quan trọng: Vui lòng <strong>đọc kỹ Hướng dẫn sử dụng</strong> trước khi bắt đầu để đạt hiệu quả tốt nhất.
                </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800 flex gap-2 items-start">
                <span className="text-lg">ℹ️</span>
                <p className="text-[11px] sm:text-xs text-blue-800 dark:text-blue-200 font-medium">
                    Tool ghép video khớp lời thoại Audio/Voice: <a href="https://www.ai86.pro/" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-blue-600">AI86.Pro</a>
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
                <button 
                    onClick={onOpenGuide}
                    className="py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-95 flex flex-col items-center justify-center gap-0.5"
                >
                    <span className="text-sm">📖 Mở Hướng Dẫn</span>
                    <span className="text-[9px] font-normal opacity-80">(Khuyên dùng cho người mới)</span>
                </button>
                <button 
                    onClick={onClose}
                    className="py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
                >
                    🚀 Bắt đầu ngay
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
