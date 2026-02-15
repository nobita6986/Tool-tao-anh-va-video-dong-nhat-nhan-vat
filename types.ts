
import { Modality } from "@google/genai";

export interface Style {
  title: string;
  description: string;
  tooltip: string;
  locked: boolean;
  promptTemplate?: string;
  imageUrl?: string;
}

export interface Character {
  name:string;
  images: string[];
  stylePrompt: string;
}

export type ExcelRow = (string | number)[];

export interface TableRowData {
  id: number;
  originalRow: ExcelRow;
  contextPrompt: string;
  imagePrompt?: string; // Prompt cuối cùng dùng để tạo ảnh (đã gộp style)
  selectedCharacterIndices: number[];
  generatedImages: string[];
  mainImageIndex: number;
  isGenerating: boolean;
  error: string | null;
  lastUsedPrompt?: string;
  videoPrompt?: string;
  isGeneratingPrompt?: boolean;
}

export interface SavedSessionRow {
  stt: string | number;
  original: string; // Kịch bản gốc
  vietnamese: string; // Tiếng Việt
  imagePrompt: string;
  videoPrompt: string;
}

export interface SavedSession {
  id: string; // Timestamp ID
  name: string; // Tên dự án (lấy theo thời gian hoặc tên file)
  timestamp: number;
  rows: SavedSessionRow[];
}

export interface AdjustmentOptions {
  options: string[];
  manualPrompt: string;
}

export type MappedColumn = 'stt' | 'otherLang' | 'vietnamese' | 'promptName' | 'contextPrompt';
export type ColumnMapping = { [key in MappedColumn]?: number };

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// Cập nhật lại các Model ID chuẩn
export type GeminiModel = 'gemini-3-pro-preview' | 'gemini-3-flash-preview' | 'gemini-flash-lite-latest';

// Các Model tạo ảnh hỗ trợ
export type ImageGenModel = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview' | 'imagen-3.0-generate-001';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
