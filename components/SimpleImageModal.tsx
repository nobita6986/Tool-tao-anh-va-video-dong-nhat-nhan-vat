
import React, { useEffect } from 'react';

interface SimpleImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const SimpleImageModal: React.FC<SimpleImageModalProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 flex justify-center items-center z-[100] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative max-w-[95vw] max-h-[95vh] flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white text-2xl flex items-center justify-center transition-colors"
        >
          &times;
        </button>
        <img
          src={imageUrl}
          alt="Full size preview"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};
