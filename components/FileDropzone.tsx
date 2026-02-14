
import React, { useState, DragEvent, useCallback, useRef } from 'react';

interface FileDropzoneProps {
  onDrop: (files: File[]) => void;
  accept: string;
  children: React.ReactNode;
  className?: string;
  dropMessage?: string;
  disableClick?: boolean; // Thuộc tính mới
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ 
  onDrop, 
  accept, 
  children, 
  className, 
  dropMessage = 'Thả tệp vào đây',
  disableClick = false // Mặc định là cho phép click
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());

  const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const droppedFiles = Array.from(files);
    const validFiles = droppedFiles.filter((file: File) => {
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return fileExtension === type;
      });
    });
    
    if (validFiles.length > 0) {
      onDrop(validFiles);
    } else {
      alert(`Không có tệp hợp lệ. Vui lòng chọn các tệp có định dạng: ${accept}`);
    }
  };

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    processFiles(e.dataTransfer.files);
    e.dataTransfer.clearData();
  }, [onDrop, accept, acceptedTypes]);

  const handleClick = (e: React.MouseEvent) => {
    if (disableClick) return;
    inputRef.current?.click();
  };

  return (
    <div
      className={`relative ${!disableClick ? 'cursor-pointer' : ''} ${className || ''}`}
      onDrop={handleDrop}
      onDragOver={handleDrag}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onClick={handleClick}
    >
      {!disableClick && (
        <input
          type="file"
          ref={inputRef}
          onChange={(e) => {
            processFiles(e.target.files);
            e.target.value = '';
          }}
          accept={accept}
          multiple
          className="hidden"
        />
      )}
      {isDragActive && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-green-100/90 dark:bg-green-900/80 border-4 border-dashed border-green-500 dark:border-green-400 rounded-xl pointer-events-none">
          <p className="text-2xl font-bold text-green-800 dark:text-white">{dropMessage}</p>
        </div>
      )}
      {children}
    </div>
  );
};
