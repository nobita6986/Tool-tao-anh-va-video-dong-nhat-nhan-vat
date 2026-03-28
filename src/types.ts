export type AIProvider = 'gemini' | 'key4u';

export interface GeminiConfig {
  keys: string[];
  proxyUrl?: string;
  selectedModel: string;
}

export interface Key4UConfig {
  keys: string[];
  proxyUrl?: string;
  selectedModel: string;
}

export interface AppConfig {
  activeProvider: AIProvider;
  gemini: GeminiConfig;
  key4u: Key4UConfig;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface Scene {
  id: string;
  originalRow: string[]; // [STT, Bối cảnh, Kịch bản, Nhân vật, Ghi chú]
  imagePrompt?: string;
  videoPrompt?: string;
  mainAsset?: string; // Base64 image
  isGeneratingImage?: boolean;
  isGeneratingVideo?: boolean;
  isGeneratingPrompt?: boolean;
  error?: string;
}

export interface SceneDetectionResult {
  scenes: {
    stt: string;
    location: string;
    script: string;
    character: string;
    note: string;
  }[];
}
