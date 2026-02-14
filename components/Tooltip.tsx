
import React, { ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
  position?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '', position = 'top' }) => {
  return (
    <div className={`group relative flex items-center justify-center ${className}`}>
      {children}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 w-max max-w-[200px] p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-[100] text-center border border-gray-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
          position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}
      >
        {content}
        <div 
            className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                position === 'top' ? 'top-full border-t-gray-900' : 'bottom-full border-b-gray-900'
            }`}
        ></div>
      </div>
    </div>
  );
};
