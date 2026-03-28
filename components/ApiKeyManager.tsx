
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { GeminiModel, ImageGenModel } from '../types';
import { ToastType } from './Toast';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: string[];
  setApiKeys: (keys: string[]) => void;
  key4uConfig: { apiKey: string; proxyUrl: string; enabled: boolean };
  setKey4uConfig: (config: { apiKey: string; proxyUrl: string; enabled: boolean }) => void;
  selectedModel: GeminiModel;
  onSelectModel: (model: GeminiModel) => void;
  selectedImageModel: ImageGenModel;
  onSelectImageModel: (model: ImageGenModel) => void;
  showToast: (message: string, type: ToastType) => void;
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

const MODELS: { value: GeminiModel; label: string }[] = [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro Preview (Mạnh nhất - Ưu tiên)' },
    { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview (Cân bằng & Nhanh)' },
    { value: 'gemini-flash-lite-latest', label: 'Gemini Flash Lite (Tiết kiệm nhất)' },
];

const IMAGE_MODELS: { value: ImageGenModel; label: string; desc: string }[] = [
    { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image', desc: 'Tốc độ nhanh, chỉnh sửa ảnh cục bộ, giữ nhất quán nhân vật tốt.' },
    { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro Image', desc: 'Chất lượng studio (4K), hiển thị văn bản chuẩn, xử lý prompt phức tạp.' },
    { value: 'imagen-3.0-generate-001', label: 'Imagen 3', desc: 'Chuyên tạo ảnh chân thực (Photorealism), chi tiết nghệ thuật cao.' },
];

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ 
    isOpen, onClose, apiKeys, setApiKeys, 
    key4uConfig, setKey4uConfig,
    selectedModel, onSelectModel,
    selectedImageModel, onSelectImageModel,
    showToast
}) => {
  const [newKey, setNewKey] = useState('');
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateApiKey = async (key: string, proxyUrl?: string): Promise<boolean> => {
    try {
      if (proxyUrl) {
        const endpoint = proxyUrl || 'https://api.key4u.shop/v1/chat/completions';
        const payload = {
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "hi" }],
            temperature: 0.7
        };
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }
        return true;
      } else {
        const ai = new GoogleGenAI({ apiKey: key });
        await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'hi',
        });
        return true;
      }
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
        showToast('API Key đã được thêm thành công', 'success');
        setTimeout(() => setValidationStatus('idle'), 2000);
    } else {
        setValidationStatus('invalid');
        showToast('API Key không hợp lệ', 'error');
    }
  };

  const handleTestKey4U = async () => {
    if (!key4uConfig.apiKey || !key4uConfig.proxyUrl) {
        showToast('Vui lòng nhập đầy đủ API Key và Proxy URL', 'warning');
        return;
    }
    setValidationStatus('validating');
    setValidationMessage(null);
    const isValid = await validateApiKey(key4uConfig.apiKey, key4uConfig.proxyUrl);
    if (isValid) {
        showToast('Kết nối Key4U thành công!', 'success');
        setValidationStatus('idle');
    } else {
        showToast('Kết nối Key4U thất bại', 'error');
        setValidationStatus('invalid');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[100] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#0b2b1e] border border-gray-200 dark:border-[#1f4d3a] p-8 rounded-xl space-y-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cấu hình API & Model</h3>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 text-3xl">&times;</button>
        </div>
        
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-2">Model Xử Lý Kịch Bản</label>
                    <select 
                        value={selectedModel}
                        onChange={(e) => onSelectModel(e.target.value as GeminiModel)}
                        className="w-full bg-gray-50 dark:bg-[#020a06] border border-gray-300 dark:border-[#1f4d3a] text-gray-900 dark:text-gray-200 p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-400 transition-all font-medium text-sm"
                    >
                        {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2">Model Tạo Ảnh (Image Gen)</label>
                    <select 
                        value={selectedImageModel}
                        onChange={(e) => onSelectImageModel(e.target.value as ImageGenModel)}
                        className="w-full bg-gray-50 dark:bg-[#020a06] border border-gray-300 dark:border-[#1f4d3a] text-gray-900 dark:text-gray-200 p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-400 transition-all font-medium text-sm"
                    >
                        {IMAGE_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="bg-gray-100 dark:bg-green-900/10 p-4 rounded-lg border border-gray-200 dark:border-green-900/20">
                <p className="text-xs font-bold text-gray-700 dark:text-green-300 mb-1">Thông tin Model ảnh đang chọn:</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                    {IMAGE_MODELS.find(m => m.value === selectedImageModel)?.desc}
                </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold">Cấu hình Proxy (Key4U / Khác)</label>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">{key4uConfig.enabled ? 'Đang dùng Proxy' : 'Dùng Key trực tiếp'}</span>
                        <button 
                            onClick={() => setKey4uConfig({ ...key4uConfig, enabled: !key4uConfig.enabled })}
                            className={`w-10 h-5 rounded-full transition-all relative ${key4uConfig.enabled ? 'bg-green-600' : 'bg-gray-400'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${key4uConfig.enabled ? 'left-5' : 'left-0.5'}`}></div>
                        </button>
                    </div>
                </div>

                {key4uConfig.enabled && (
                    <div className="space-y-3 p-3 bg-gray-50 dark:bg-[#020a06] rounded-lg border border-gray-200 dark:border-[#1f4d3a] animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Proxy URL (Mặc định Key4U)</label>
                            <input 
                                type="text"
                                value={key4uConfig.proxyUrl}
                                onChange={(e) => setKey4uConfig({ ...key4uConfig, proxyUrl: e.target.value })}
                                placeholder="https://api.key4u.shop/v1"
                                className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 p-2 rounded text-xs outline-none focus:ring-1 focus:ring-green-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Key4U API Key</label>
                            <div className="flex gap-2">
                                <input 
                                    type="password"
                                    value={key4uConfig.apiKey}
                                    onChange={(e) => setKey4uConfig({ ...key4uConfig, apiKey: e.target.value })}
                                    placeholder="sk-..."
                                    className="flex-grow bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 p-2 rounded text-xs outline-none focus:ring-1 focus:ring-green-500"
                                />
                                <button 
                                    onClick={handleTestKey4U}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-500 transition-all"
                                >
                                    Thử kết nối
                                </button>
                            </div>
                        </div>
                        <p className="text-[9px] text-gray-500 italic">Lưu ý: Khi bật Proxy, hệ thống sẽ ưu tiên dùng Key4U thay vì danh sách Key bên dưới.</p>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="block text-sm font-semibold mb-2">Danh sách API Key ({apiKeys.length})</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 mb-4 scrollbar-thin">
                    {apiKeys.map((key, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-[#020a06] p-2 rounded border border-gray-200 dark:border-[#1f4d3a]">
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">{key}</span>
                            <button onClick={() => setApiKeys(apiKeys.filter((_, i) => i !== idx))} className="text-red-500 text-xs font-bold hover:text-red-600 transition-colors ml-4 flex-shrink-0">Xóa</button>
                        </div>
                    ))}
                    {apiKeys.length === 0 && <p className="text-xs text-gray-500 text-center italic py-4">Chưa có key nào. Ứng dụng sẽ dùng key mặc định hệ thống.</p>}
                </div>

                <div className="flex gap-2">
                    <input
                      type="text"
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
