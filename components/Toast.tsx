
import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InfoIcon } from './icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastMessage;
  removeToast: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 3000); // Tự động tắt sau 3 giây

    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-white dark:bg-[#0b2b1e] border-green-500 text-green-700 dark:text-green-300';
      case 'error':
        return 'bg-white dark:bg-[#2b0b0b] border-red-500 text-red-700 dark:text-red-300';
      case 'warning':
        return 'bg-white dark:bg-[#2b1e0b] border-orange-500 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-white dark:bg-[#0b1e2b] border-blue-500 text-blue-700 dark:text-blue-300';
    }
  };

  const getIcon = () => {
      switch (toast.type) {
          case 'success': return <CheckCircleIcon className="w-6 h-6" />;
          case 'error': return <XCircleIcon className="w-6 h-6" />;
          default: return <InfoIcon className="w-6 h-6" />;
      }
  }

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border-l-4 transition-all animate-in slide-in-from-right-full duration-300 ${getStyles()}`}>
      <div className="flex-shrink-0">{getIcon()}</div>
      <p className="font-medium text-sm">{toast.message}</p>
      <button onClick={() => removeToast(toast.id)} className="ml-auto text-current opacity-70 hover:opacity-100 text-xl font-bold">
        &times;
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-24 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} removeToast={removeToast} />
        </div>
      ))}
    </div>
  );
};
