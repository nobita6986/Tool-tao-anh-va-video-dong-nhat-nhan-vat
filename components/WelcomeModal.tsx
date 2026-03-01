
import React from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onOpenGuide }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[200] p-4 animate-in fade-in zoom-in-95 duration-300">
      <div 
        className="bg-white dark:bg-[#0b2b1e] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#1f4d3a] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative header background */}
        <div className="h-32 bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <h1 className="text-4xl font-black text-white uppercase tracking-widest drop-shadow-md z-10 text-center">
                StudyAI86 Studio
            </h1>
        </div>

        <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chào mừng bạn đến với công cụ sáng tạo!</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Giải pháp All-in-One chuyển thể kịch bản thành Video & Storyboard.
                </p>
            </div>

            <div className="bg-gray-50 dark:bg-[#020a06]/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                <h3 className="font-bold text-green-600 dark:text-green-400 uppercase text-xs tracking-wider mb-2">Tính năng nổi bật:</h3>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                        <span className="text-xl">🎭</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300"><strong>Đồng nhất nhân vật tuyệt đối:</strong> Giữ nguyên khuôn mặt và trang phục nhân vật xuyên suốt hàng trăm phân cảnh.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-xl">⚡</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300"><strong>Tự động hóa 90%:</strong> Từ kịch bản thô &rarr; Phân cảnh &rarr; Prompt ảnh &rarr; Prompt video chỉ trong vài click.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-xl">🎬</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300"><strong>Hỗ trợ làm Video AI:</strong> Tự động viết prompt chuyển động camera chuyên sâu cho Kling, Runway, Luma.</span>
                    </li>
                </ul>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg border border-orange-100 dark:border-orange-800 flex gap-3 items-start">
                <span className="text-xl">⚠️</span>
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                    Lưu ý quan trọng: Để đạt hiệu quả tốt nhất và tránh lãng phí tài nguyên, vui lòng <strong>đọc kỹ Hướng dẫn sử dụng</strong> trước khi bắt đầu.
                </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex gap-3 items-start">
                <span className="text-xl">ℹ️</span>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    Chúng tôi có tool ghép tạo video từ ảnh/video khớp lời thoại với Audio, Voice chạy tới đâu là Ảnh/video hiển thị tới đó. Mời các bạn tham khảo: <a href="https://www.ai86.pro/" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-blue-600">AI86.Pro</a>
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
                <button 
                    onClick={onOpenGuide}
                    className="py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-95 flex flex-col items-center justify-center gap-1"
                >
                    <span>📖 Mở Hướng Dẫn</span>
                    <span className="text-[10px] font-normal opacity-80">(Khuyên dùng cho người mới)</span>
                </button>
                <button 
                    onClick={onClose}
                    className="py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl transition-all active:scale-95"
                >
                    🚀 Bắt đầu ngay
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
