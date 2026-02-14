
import { Modality } from "@google/genai";

export interface Style {
  title: string;
  description: string;
  tooltip: string;
  locked: boolean;
  promptTemplate?: string;
  imageUrl?: string; // Changed from imageUrls array to single string
}

export interface Character {
  name:string;
  // Store images as base64 data URLs
  images: string[];
  stylePrompt: string;
}

export type ExcelRow = (string | number)[];

export interface TableRowData {
  id: number;
  originalRow: ExcelRow;
  contextPrompt: string;
  selectedCharacterIndices: number[];
  generatedImages: string[];
  mainImageIndex: number;
  isGenerating: boolean;
  error: string | null;
  lastUsedPrompt?: string;
  videoPrompt?: string;
  isGeneratingPrompt?: boolean;
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

export type GeminiModel = 'gemini-3-pro-preview' | 'gemini-3-flash-preview' | 'gemini-2.5-flash-lite-latest';
