
import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
  position?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '', position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        left: rect.left + rect.width / 2,
        top: position === 'top' ? rect.top : rect.bottom,
      });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Cập nhật vị trí khi cuộn trang hoặc thay đổi kích thước màn hình
  useEffect(() => {
    if (isVisible) {
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
    }
    return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  return (
    <div 
        className={`relative flex items-center justify-center ${className}`} 
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && createPortal(
        <div 
          className="fixed z-[9999] pointer-events-none"
          style={{ 
              left: coords.left, 
              top: coords.top,
              // Dịch chuyển để căn giữa và tạo khoảng cách
              transform: `translate(-50%, ${position === 'top' ? '-100%' : '0'}) translateY(${position === 'top' ? '-8px' : '8px'})`
          }}
        >
          <div className="relative p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl text-center border border-gray-700 max-w-[200px] w-max animate-in fade-in zoom-in-95 duration-200">
            {content}
            <div 
                className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                    position === 'top' ? 'top-full border-t-gray-900' : 'bottom-full border-b-gray-900'
                }`}
            ></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
