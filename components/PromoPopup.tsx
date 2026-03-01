import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const PromoPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after 5 minutes, then every 5 minutes
    const interval = setInterval(() => {
      setIsVisible(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white dark:bg-[#0b2b1e] border border-blue-200 dark:border-blue-800 rounded-lg shadow-xl p-4 flex flex-col gap-2 relative">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        
        <div className="flex items-start gap-3 pr-6">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Gợi ý công cụ hữu ích</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Chúng tôi có tool ghép tạo video từ ảnh/video khớp lời thoại với Audio, Voice chạy tới đâu là Ảnh/video hiển thị tới đó.
            </p>
            <div className="mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Mời các bạn tham khảo: </span>
              <a 
                href="https://www.ai86.pro/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                AI86.Pro
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
