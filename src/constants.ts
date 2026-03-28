import { AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  activeProvider: 'gemini',
  gemini: {
    keys: [],
    proxyUrl: '',
    selectedModel: 'gemini-3-flash-preview',
  },
  key4u: {
    keys: [],
    proxyUrl: 'https://api.key4u.shop/v1/chat/completions',
    selectedModel: 'gpt-4o-mini',
  },
};

export const GEMINI_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview',
  'gemini-3.1-flash-lite-preview',
];

export const KEY4U_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'claude-3-5-sonnet',
];

export const SCENE_DETECTION_SYSTEM_PROMPT = `Bạn là chuyên gia biên kịch điện ảnh. Hãy phân tích kịch bản và chia thành các phân cảnh (Scene) chi tiết.
Yêu cầu:
1. Trả về kết quả duy nhất ở định dạng JSON.
2. Cấu trúc JSON: { "scenes": [ { "stt": "1", "location": "Nội/Ngoại - Địa điểm - Thời gian", "script": "Nội dung lời thoại và hành động", "character": "Tên các nhân vật xuất hiện", "note": "Ghi chú về cảm xúc hoặc kỹ thuật" } ] }
3. Đảm bảo tính nhất quán của nhân vật.`;

export const IMAGE_PROMPT_SYSTEM_PROMPT = `Bạn là chuyên gia tạo Prompt cho AI Image Generation (Midjourney/DALL-E).
Hãy viết Prompt tiếng Anh mô tả chi tiết hình ảnh dựa trên kịch bản.
Yêu cầu:
1. Chỉ trả về Prompt tiếng Anh.
2. Không bao gồm lời dẫn.
3. Mô tả bối cảnh, ánh sáng, góc máy, trang phục nhân vật.`;

export const VIDEO_PROMPT_SYSTEM_PROMPT = `Bạn là chuyên gia tạo Prompt cho AI Video Generation (Runway/Luma/Kling).
Hãy viết Prompt tiếng Anh mô tả chuyển động camera và hành động trong 8 giây.
Yêu cầu:
1. Chỉ trả về Prompt tiếng Anh.
2. Viết liền mạch thành 1 dòng (One-line).
3. Không bao gồm lời dẫn.`;
