
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { GeminiModel } from '../types';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: string[];
  setApiKeys: (keys: string[]) => void;
  selectedModel: GeminiModel;
  onSelectModel: (model: GeminiModel) => void;
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

const MODELS: { value: GeminiModel; label: string }[] = [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro Preview (Mạnh nhất - Ưu tiên)' },
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview (Cân bằng & Nhanh)' },
    { value: 'gemini-flash-lite-latest', label: 'Gemini Flash Lite (Tiết kiệm nhất)' },
];

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose, apiKeys, setApiKeys, selectedModel, onSelectModel }) => {
  const [newKey, setNewKey] = useState('');
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      // Sử dụng model Flash để xác thực vì nó phổ biến và nhanh nhất
      await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'hi',
      });
      return true;
    } catch (error: any) {
      console.error("API Key validation failed:", error);
      setValidationMessage(`Lỗi xác thực: ${error.message}`);
      return false;
    }
  };

  const handleAddKey = async () => {
    const trimmedKey = newKey.trim();
    if (!trimmedKey || apiKeys.includes(trimmedKey)) return;
    setValidationStatus('validating');
    setValidationMessage(null);
    const isValid = await validateApiKey(trimmedKey);
    if (isValid) {
        setValidationStatus('valid');
        setApiKeys([...apiKeys, trimmedKey]);
        setNewKey('');
        setTimeout(() => setValidationStatus('idle'), 2000);
    } else setValidationStatus('invalid');
  };

  const maskKey = (key: string) => key.length <= 8 ? '****' : `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[100] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl space-y-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cấu hình API & Model</h3>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 text-3xl">&times;</button>
        </div>
        
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold mb-2">Chọn mô hình AI (Model)</label>
                <select 
                    value={selectedModel}
                    onChange={(e) => onSelectModel(e.target.value as GeminiModel)}
                    className="w-full bg-gray-50 dark:bg-[#020a06] border border-gray-300 dark:border-[#1f4d3a] text-gray-900 dark:text-gray-200 p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-400 transition-all font-medium"
                >
                    {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <p className="text-[10px] text-gray-500 mt-1 italic">* Lưu ý: Model 3 Pro yêu cầu Key có quyền truy cập Preview.</p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="block text-sm font-semibold mb-2">Danh sách API Key ({apiKeys.length})</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 mb-4 scrollbar-thin">
                    {apiKeys.map((key, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-[#020a06] p-2 rounded border border-gray-200 dark:border-[#1f4d3a]">
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{maskKey(key)}</span>
                            <button onClick={() => setApiKeys(apiKeys.filter((_, i) => i !== idx))} className="text-red-500 text-xs font-bold hover:text-red-600 transition-colors">Xóa</button>
                        </div>
                    ))}
                    {apiKeys.length === 0 && <p className="text-xs text-gray-500 text-center italic py-4">Chưa có key nào. Ứng dụng sẽ dùng key mặc định hệ thống.</p>}
                </div>

                <div className="flex gap-2">
                    <input
                      type="password"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="Nhập API Key mới..."
                      className="flex-grow bg-gray-50 dark:bg-[#020a06] border border-gray-300 dark:border-[#1f4d3a] p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button 
                        onClick={handleAddKey}
                        disabled={validationStatus === 'validating' || !newKey.trim()}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-500 disabled:opacity-50 transition-all"
                    >
                        {validationStatus === 'validating' ? 'Đang kiểm tra...' : 'Thêm Key'}
                    </button>
                </div>
                {validationMessage && <p className="text-[10px] mt-1 text-red-400 font-medium">{validationMessage}</p>}
            </div>
        </div>

        <div className="text-center pt-4">
            <button onClick={onClose} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-8 py-2.5 rounded-lg font-bold hover:bg-orange-500 hover:text-white transition-all">Xong</button>
        </div>
      </div>
    </div>
  );
};
