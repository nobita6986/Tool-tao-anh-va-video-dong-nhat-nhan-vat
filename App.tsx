
import React, { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { STYLES, PRESET_PROMPT_CONTEXT } from './constants';
import type { Style, Character, TableRowData, ExcelRow, AdjustmentOptions, ColumnMapping, ChatMessage, GeminiModel, ImageGenModel, AspectRatio, SavedSession, SavedSessionRow } from './types';
import { StyleSelector } from './components/StyleSelector';
import { CharacterManager } from './components/CharacterManager';
import { ResultsView } from './components/ResultsView';
import { ImageModal } from './components/ImageModal';
import { SimpleImageModal } from './components/SimpleImageModal';
import { RemakeModal } from './components/RemakeModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { createProjectAssetsZip, readExcelFile, createRowAssetsZip, exportVideoPromptsToExcel, exportImagePromptsToExcel, createFramesJsonWithImgAndPrompt, readTextFile, parseMarkdownTables, exportCleanScriptToTxt } from './utils/fileUtils';
import { FileDropzone } from './components/FileDropzone';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { SunIcon, MoonIcon } from './components/icons';
import { getPromptAndPartsForRow, getPromptForRow } from './utils/fileUtils';
import { ChatModal } from './components/ChatModal';
import { ApiKeyManager } from './components/ApiKeyManager';
import { ScriptProcessingModal, SegmentationMethod } from './components/ScriptProcessingModal';
import { Tooltip } from './components/Tooltip';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { GuideModal } from './components/GuideModal';
import { LibraryModal } from './components/LibraryModal';
import { WelcomeModal } from './components/WelcomeModal';

const normalizeName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '');
};

const getCharacterIndicesFromStt = (stt: string | number, characters: Character[], defaultCharacterIndices: number[]): number[] => {
    const sttString = String(stt || '').toLowerCase();
    const selectedCharacterIndices: number[] = [];
    const normalizedCharMap = new Map<string, number>();
    characters.forEach((c, i) => { if (c.name) normalizedCharMap.set(normalizeName(c.name), i); });
    let characterNamesFromStt: string[] = [];
    const multiCharMatch = sttString.match(/\[(.*?)\]/);
    if (multiCharMatch && multiCharMatch[1]) {
        characterNamesFromStt = multiCharMatch[1].split('+').map(name => name.trim());
    } else {
        const singleCharMatch = sttString.match(/^([\p{L}]+)/u);
        if (singleCharMatch && singleCharMatch[1]) characterNamesFromStt = [singleCharMatch[1]];
    }
    characterNamesFromStt.forEach(name => {
        const normalized = normalizeName(name);
        if (normalizedCharMap.has(normalized)) selectedCharacterIndices.push(normalizedCharMap.get(normalized)!);
    });
    if (selectedCharacterIndices.length === 0) {
        const hasAnyLetter = /[\p{L}]/u.test(sttString);
        if (hasAnyLetter && defaultCharacterIndices.length > 0) selectedCharacterIndices.push(...defaultCharacterIndices);
    }
    return selectedCharacterIndices;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([{ name: '', images: [], stylePrompt: '' }]);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [defaultCharacterIndices, setDefaultCharacterIndices] = useState<number[]>([]);
  const [viewingImage, setViewingImage] = useState<{ imageUrl: string; rowId: number } | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [remakingRow, setRemakingRow] = useState<TableRowData | null>(null);
  const [historyRow, setHistoryRow] = useState<TableRowData | null>(null);
  const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [videoPromptNote, setVideoPromptNote] = useState('');
  const [isProcessingScript, setIsProcessingScript] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => Date.now().toString());
  
  // Model xử lý văn bản (Text Model)
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(() => {
    return (localStorage.getItem('selected_gemini_model') as GeminiModel) || 'gemini-3-flash-preview';
  });

  // Model tạo ảnh (Image Model)
  const [selectedImageModel, setSelectedImageModel] = useState<ImageGenModel>(() => {
    return (localStorage.getItem('selected_image_model') as ImageGenModel) || 'gemini-2.5-flash-image';
  });

  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  // Logic hiển thị WelcomeModal: Chỉ hiện nếu chưa từng hiện trong vòng 12h qua
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => {
    const lastShown = localStorage.getItem('welcome_modal_last_shown');
    if (!lastShown) return true;
    
    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;
    
    // Nếu thời gian đã qua > 12h thì hiện lại
    return (now - parseInt(lastShown, 10)) > twelveHours;
  });

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<string[]>(() => {
    const saved = localStorage.getItem('user_api_keys');
    return saved ? JSON.parse(saved) : [];
  });

  const [pendingScriptFile, setPendingScriptFile] = useState<File | null>(null);

  const [chatState, setChatState] = useState<'closed' | 'open' | 'minimized'>('closed');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiReplying, setIsAiReplying] = useState(false);

  const stateRef = useRef({ tableData, selectedStyle, characters, defaultCharacterIndices, aspectRatio });
  useEffect(() => {
    stateRef.current = { tableData, selectedStyle, characters, defaultCharacterIndices, aspectRatio };
  }, [tableData, selectedStyle, characters, defaultCharacterIndices, aspectRatio]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auto-save logic
  useEffect(() => {
    if (tableData.length === 0) return;

    const saveTimeout = setTimeout(() => {
      try {
        const storedSessions = localStorage.getItem('studyo_sessions');
        let sessions: SavedSession[] = storedSessions ? JSON.parse(storedSessions) : [];
        
        // Extract only necessary text data to save space (exclude base64 images)
        const sessionRows: SavedSessionRow[] = tableData.map(row => ({
          stt: row.originalRow[0],
          original: String(row.originalRow[1] || ''),
          vietnamese: String(row.originalRow[2] || ''),
          imagePrompt: row.imagePrompt || '',
          videoPrompt: row.videoPrompt || ''
        }));

        const sessionName = tableData.length > 0 
            ? `Dự án ${new Date(parseInt(currentSessionId)).toLocaleString('vi-VN')}` 
            : 'Dự án Mới';

        const currentSession: SavedSession = {
          id: currentSessionId,
          name: sessionName,
          timestamp: Date.now(),
          rows: sessionRows
        };

        // Update or add current session
        const existingIndex = sessions.findIndex(s => s.id === currentSessionId);
        if (existingIndex >= 0) {
            sessions[existingIndex] = currentSession;
        } else {
            sessions.push(currentSession);
        }

        // Limit to last 20 sessions to save localstorage space
        if (sessions.length > 20) {
            sessions = sessions.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
        }

        localStorage.setItem('studyo_sessions', JSON.stringify(sessions));
        // console.log("Auto-saved session", currentSessionId);
      } catch (e) {
        console.error("Auto-save failed (likely quota exceeded):", e);
      }
    }, 3000); // Debounce save every 3 seconds

    return () => clearTimeout(saveTimeout);
  }, [tableData, currentSessionId]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleUpdateApiKeys = (keys: string[]) => {
    setApiKeys(keys);
    localStorage.setItem('user_api_keys', JSON.stringify(keys));
  };

  const handleUpdateModel = (model: GeminiModel) => {
    setSelectedModel(model);
    localStorage.setItem('selected_gemini_model', model);
    showToast(`Đã chuyển model văn bản sang: ${model}`, 'success');
  };

  const handleUpdateImageModel = (model: ImageGenModel) => {
    setSelectedImageModel(model);
    localStorage.setItem('selected_image_model', model);
    showToast(`Đã chuyển model ảnh sang: ${model}`, 'success');
  };
  
  const toggleTheme = () => setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');

  const getAiInstance = useCallback((keyIndex = 0) => {
    const availableKeys = apiKeys.length > 0 ? apiKeys : [process.env.API_KEY || ''];
    const safeIndex = keyIndex % availableKeys.length;
    const key = availableKeys[safeIndex];
    
    // Mask key for logging safety
    const maskedKey = key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : '***';
    console.log(`[AI Engine] Sử dụng Key #${safeIndex + 1}: ${maskedKey}`);
    
    return {
        ai: new GoogleGenAI({ apiKey: key }),
        keyCount: availableKeys.length,
        currentIndex: safeIndex
    };
  }, [apiKeys]);

  useEffect(() => {
    if (tableData.length > 0) {
      setTableData(currentTableData => {
        let hasChanges = false;
        const updatedTableData = currentTableData.map(row => {
          const newIndices = getCharacterIndicesFromStt(row.originalRow[0], characters, defaultCharacterIndices);
          if (JSON.stringify([...row.selectedCharacterIndices].sort()) !== JSON.stringify([...newIndices].sort())) {
            hasChanges = true;
            return { ...row, selectedCharacterIndices: newIndices };
          }
          return row;
        });
        return hasChanges ? updatedTableData : currentTableData;
      });
    }
  }, [characters, defaultCharacterIndices]);

  const handleCharactersChange = (newCharacters: Character[]) => { setCharacters(newCharacters); };
  const handleVideoPromptNoteChange = (note: string) => { setVideoPromptNote(note); };
  
  const handleToggleDefaultCharacter = useCallback((index: number) => {
    setDefaultCharacterIndices(prev => {
        if (prev.includes(index)) return prev.filter(i => i !== index);
        return [...prev, index];
    });
  }, []);

  const handleStyleSelect = useCallback((style: Style) => { 
      setSelectedStyle(style); 
      showToast(`Đã chọn phong cách: ${style.title}`, 'success');
  }, [showToast]);

  const handleBackToStyles = () => { setSelectedStyle(null); setTableData([]); };
  
  const handleUpdateRow = useCallback((updatedRow: TableRowData) => { setTableData(prevData => prevData.map(row => (row.id === updatedRow.id ? updatedRow : row))); }, []);

  const handleAutoFillCharacters = useCallback(() => {
    const definedCharacters = characters
        .map((c, i) => ({ name: c.name.trim().toLowerCase(), index: i }))
        .filter(c => c.name.length > 0 && defaultCharacterIndices.includes(c.index));

    if (definedCharacters.length === 0) {
        showToast("Vui lòng kích hoạt ít nhất một nhân vật trước khi tự động điền.", 'warning');
        return;
    }

    let fillCount = 0;
    const updatedTableData = tableData.map(row => {
        const vietnameseText = String(row.originalRow[2] || "").toLowerCase();
        const originalText = String(row.originalRow[1] || "").toLowerCase();
        const combinedText = ` ${originalText} ${vietnameseText} `;

        const detected = definedCharacters
            .filter(c => {
                const regex = new RegExp(`\\b${c.name}\\b`, 'i');
                return regex.test(combinedText);
            })
            .map(c => c.index);
        
        if (detected.length > 0) {
            fillCount++;
            return { ...row, selectedCharacterIndices: detected };
        }
        return row;
    });

    if (fillCount === 0) {
        showToast("Không tìm thấy tên nhân vật nào khớp trong kịch bản.", 'warning');
    } else {
        setTableData(updatedTableData);
        showToast(`Đã cập nhật nhân vật cho ${fillCount} phân cảnh.`, 'success');
    }
  }, [characters, tableData, defaultCharacterIndices, showToast]);

  const handleDocUpload = useCallback(async (file: File, method: SegmentationMethod, customRule?: string) => {
    setIsProcessingScript(true);
    
    // Tạo session ID mới khi upload script mới
    setCurrentSessionId(Date.now().toString());

    const runProcessing = async (keyIdx = 0): Promise<void> => {
        try {
            const scriptText = await readTextFile(file);
            const { ai } = getAiInstance(keyIdx);
            
            let segmentationInstruction = '';
            if (method === 'current') {
              segmentationInstruction = 'Chia nhỏ kịch bản trên ra thành các dòng ngắn 7-15 chữ, đảm bảo không cắt ngang câu.';
            } else if (method === 'punctuation') {
              segmentationInstruction = 'Chia nhỏ kịch bản trên theo từng câu hoàn chỉnh (dựa trên dấu chấm câu).';
            } else {
              segmentationInstruction = `Phân đoạn kịch bản theo yêu cầu sau: ${customRule}`;
            }

            const systemInstruction = `Bạn là một chuyên gia kịch bản. Chuyển kịch bản thành bảng phân cảnh 5 cột Markdown: STT, Kịch bản Anh, Kịch bản Việt, Tóm tắt, Prompt tiếng Anh chi tiết.
QUY TẮC PHÂN CẢNH: ${segmentationInstruction}
DỊCH THUẬT: Tự động dịch sang tiếng Anh cho cột "Kịch bản Anh".
PROMPT: Viết prompt tiếng Anh chi tiết cho bối cảnh.
LƯU Ý: Không thêm văn bản thừa ngoài bảng Markdown.`;

            const response = await ai.models.generateContent({
                model: selectedModel, 
                contents: `${systemInstruction}\n\nKịch bản thô: "${scriptText}"`,
            });

            const tableRows = parseMarkdownTables(response.text || '');
            if (tableRows.length === 0) throw new Error("AI không tạo được bảng kịch bản.");

            const newTableData: TableRowData[] = tableRows.map((cols, index) => {
                const stt = cols[0] || String(index + 1);
                const id = parseInt(String(stt).replace(/[^0-9]/g, ''), 10) || (index + 1);
                return {
                    id,
                    originalRow: [stt, cols[1] || '', cols[2] || '', cols[3] || '', cols[4] || ''],
                    contextPrompt: cols[4] || '',
                    selectedCharacterIndices: getCharacterIndicesFromStt(stt, characters, defaultCharacterIndices),
                    generatedImages: [],
                    mainImageIndex: -1,
                    isGenerating: false,
                    error: null,
                    videoPrompt: '',
                    isGeneratingPrompt: false,
                    imagePrompt: ''
                };
            });
            setTableData(newTableData);
            showToast('Xử lý kịch bản thành công!', 'success');
        } catch (error: any) {
            const { keyCount } = getAiInstance();
            if (error.message.includes('429') && keyIdx < keyCount - 1) {
                console.warn(`[AI Engine] Key #${keyIdx + 1} hết hạn mức, đang thử Key #${keyIdx + 2}...`);
                return runProcessing(keyIdx + 1);
            }
            showToast(`Lỗi xử lý kịch bản: ${error.message}`, 'error');
        } finally {
            setIsProcessingScript(false);
            setPendingScriptFile(null);
        }
    };

    await runProcessing(0);
  }, [characters, defaultCharacterIndices, getAiInstance, selectedModel, showToast]);

  const generateImage = useCallback(async (rowId: number, adjustments?: AdjustmentOptions, retryCount = 0, keyIdx = 0) => {
    setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, isGenerating: true, error: keyIdx > 0 ? `Đang thử lại với Key #${keyIdx + 1}...` : null } : r));

    try {
      const { tableData: currentTable, selectedStyle: currentStyle, characters: currentChars, defaultCharacterIndices: currentDef, aspectRatio: currentRatio } = stateRef.current;
      const row = currentTable.find(r => r.id === rowId);
      if (!row || !currentStyle) return;

      const rowIndex = currentTable.findIndex(r => r.id === rowId);
      const { prompt, parts } = getPromptAndPartsForRow({ 
        row, rowIndex, tableData: currentTable, selectedStyle: currentStyle, 
        characters: currentChars, defaultCharacterIndices: currentDef, adjustments 
      });
      
      const { ai } = getAiInstance(keyIdx);
      let generatedBase64: string | undefined;

      if (selectedImageModel.includes('imagen')) {
         // Imagen Model
         const response = await ai.models.generateImages({
            model: selectedImageModel,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: currentRatio, 
                outputMimeType: 'image/jpeg'
            }
         });
         generatedBase64 = response.generatedImages?.[0]?.image?.imageBytes;
      } else {
         // Gemini Models
         const imageConfig: any = {
             aspectRatio: currentRatio 
         };
         if (selectedImageModel === 'gemini-3-pro-image-preview') {
             imageConfig.imageSize = '2K';
         }

         const response = await ai.models.generateContent({ 
            model: selectedImageModel, 
            contents: { parts: parts },
            config: {
                imageConfig
            }
         });
         generatedBase64 = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      }
      
      if (generatedBase64) {
        const imageUrl = `data:image/png;base64,${generatedBase64}`;
        setTableData(prev => prev.map(r => {
            if (r.id === rowId) {
                const newImages = [...r.generatedImages, imageUrl];
                return { ...r, generatedImages: newImages, mainImageIndex: newImages.length - 1, isGenerating: false, error: null, lastUsedPrompt: prompt };
            }
            return r;
        }));
      } else throw new Error("Không nhận được dữ liệu ảnh.");
    } catch (err: any) {
      const errorMessage = err.message || "Lỗi không xác định";
      const { keyCount } = getAiInstance();
      
      if (errorMessage.includes("429")) {
          if (keyIdx < keyCount - 1) {
              console.warn(`[Image Engine] Key #${keyIdx + 1} hit quota, rotating to Key #${keyIdx + 2}`);
              return generateImage(rowId, adjustments, retryCount, keyIdx + 1);
          } else if (retryCount < 3) {
              const backoffTime = 15000 * (retryCount + 1);
              setTableData(prev => prev.map(r => r.id === rowId ? { ...r, error: `Hết hạn mức toàn bộ Key, chờ ${backoffTime/1000}s để thử lại đợt mới...` } : r));
              await delay(backoffTime);
              return generateImage(rowId, adjustments, retryCount + 1, 0); 
          }
      }

      let finalError = errorMessage;
      if (finalError.includes("429")) finalError = "Hạn mức API đã hết trên tất cả các Key. Hãy kiểm tra gói cước hoặc thêm Key mới.";
      setTableData(prev => prev.map(r => r.id === rowId ? { ...r, error: `Lỗi: ${finalError}`, isGenerating: false } : r));
      showToast(`Lỗi tạo ảnh (Row ${rowId}): ${finalError}`, 'error');
    }
  }, [getAiInstance, selectedImageModel, showToast]);

  const handleGenerateAllImages = useCallback(async (isRegenerate: boolean = false) => {
    // Nếu isRegenerate là true, lấy tất cả các dòng chưa đang xử lý
    // Nếu isRegenerate là false, chỉ lấy các dòng chưa có ảnh và chưa đang xử lý
    const rowsToProcess = tableData.filter(r => !r.isGenerating && (isRegenerate || r.generatedImages.length === 0));
    
    if (rowsToProcess.length === 0) {
        showToast(isRegenerate ? "Không có phân cảnh nào để tạo lại." : "Không có ảnh mới cần tạo.", 'info');
        return;
    }

    if (isRegenerate && rowsToProcess.length > 5) {
        if (!window.confirm(`Bạn có chắc chắn muốn tạo lại ảnh cho toàn bộ ${rowsToProcess.length} phân cảnh không? Việc này sẽ tiêu tốn tài nguyên.`)) {
            return;
        }
    }

    showToast(`Bắt đầu tạo ${rowsToProcess.length} ảnh...`, 'info');

    for (const row of rowsToProcess) {
        await generateImage(row.id);
        await delay(5000 + Math.random() * 2000); 
    }
    showToast('Hoàn tất quy trình tạo ảnh hàng loạt.', 'success');
  }, [tableData, generateImage, showToast]);

  const generateVideoPromptForRow = useCallback(async (rowId: number, keyIdx = 0) => {
    const rowIndex = tableData.findIndex(row => row.id === rowId);
    if (rowIndex === -1) return;
    const row = tableData[rowIndex];
    const mainAsset = row.mainImageIndex > -1 ? row.generatedImages[row.mainImageIndex] : (row.generatedImages.length > 0 ? row.generatedImages[row.generatedImages.length - 1] : null);
    
    // Ưu tiên dùng imagePrompt, nếu không có thì dùng contextPrompt để tạo prompt video (Text to Video)
    const textPromptToUse = row.imagePrompt || row.contextPrompt;

    if (!mainAsset && !textPromptToUse) { 
        handleUpdateRow({ ...row, error: "Cần có ảnh hoặc nội dung prompt để tạo prompt video." }); 
        showToast('Cần có ảnh hoặc prompt ảnh để tạo prompt video', 'warning'); 
        return; 
    }

    setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, isGeneratingPrompt: true, error: null, videoPrompt: '' } : r));
    try {
        const { ai } = getAiInstance(keyIdx);
        const parts: any[] = [];
        const baseInstruction = `Hãy viết Prompt Video tiếng Anh dài 300 chữ mô tả chuyển động camera 8 giây. ${videoPromptNote}\n\nYÊU CẦU BẮT BUỘC: Chỉ trả về duy nhất đoạn text tiếng Anh chứa nội dung prompt, VIẾT LIỀN MẠCH THÀNH 1 DÒNG (One-line), KHÔNG XUỐNG DÒNG. Tuyệt đối KHÔNG bao gồm bất kỳ lời dẫn, giải thích, tiêu đề (ví dụ: "Here is the prompt", "Video Prompt:") hay định dạng markdown nào.`;

        if (mainAsset) {
            // Trường hợp 1: Có ảnh -> Ưu tiên tạo từ ảnh (Image to Video Prompt)
            parts.push({ inlineData: { data: mainAsset.split(',')[1], mimeType: 'image/png' } });
            parts.push({ text: `Từ kịch bản [${row.originalRow[2]}] và hình ảnh cung cấp, ${baseInstruction}` });
        } else {
            // Trường hợp 2: Không có ảnh -> Tạo từ text (Text to Video Prompt)
            parts.push({ text: `Dựa trên mô tả hình ảnh: "${textPromptToUse}"\n\nKịch bản: "${row.originalRow[2]}"\n\n${baseInstruction}` });
        }

        const responseStream = await ai.models.generateContentStream({ model: selectedModel, contents: { parts } });
        for await (const chunk of responseStream) {
            // Force replace newlines in the incoming stream chunk
            const cleanChunk = (chunk.text || '').replace(/[\r\n]+/g, ' ');
            setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, videoPrompt: ((r.videoPrompt || '') + cleanChunk).replace(/[\r\n]+/g, ' ') } : r));
        }
    } catch (err: any) {
        const { keyCount } = getAiInstance();
        if (err.message.includes('429') && keyIdx < keyCount - 1) {
            return generateVideoPromptForRow(rowId, keyIdx + 1);
        }
        handleUpdateRow({ ...tableData.find(r => r.id === rowId)!, error: `Lỗi: ${err.message}` });
        showToast(`Lỗi tạo prompt video: ${err.message}`, 'error');
    } finally { setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, isGeneratingPrompt: false } : r)); }
  }, [tableData, handleUpdateRow, videoPromptNote, getAiInstance, selectedModel, showToast]);

  // Tạo hàng loạt prompt ảnh cuối cùng (Image Prompt)
  const handleCreateAllImagePrompts = useCallback(() => {
    if (!selectedStyle) return;
    const updatedTableData = tableData.map(row => {
        const finalPrompt = getPromptForRow(row, selectedStyle, characters);
        return { ...row, imagePrompt: finalPrompt };
    });
    setTableData(updatedTableData);
    showToast('Đã tạo xong prompt cho tất cả các ô Image.', 'success');
  }, [tableData, selectedStyle, characters, showToast]);

  const handleSetMainImage = useCallback((rowId: number, index: number) => {
    setTableData(prevData => prevData.map(row => (row.id === rowId ? { ...row, mainImageIndex: index } : row)));
    showToast('Đã đặt ảnh chính thành công.', 'success');
  }, [showToast]);

  const handleDownloadRowAssets = useCallback((row: TableRowData) => {
    if (!createRowAssetsZip(row, `assets_row_${row.id}.zip`)) {
        showToast('Không có dữ liệu để tải xuống cho dòng này.', 'warning');
    } else {
        showToast('Đang tải xuống tài sản của dòng...', 'success');
    }
  }, [showToast]);

  const handleDownloadAllAssets = useCallback(() => {
     if (!createProjectAssetsZip(tableData, `images-assets.zip`)) {
         showToast('Không có ảnh nào để tải xuống.', 'warning');
     } else {
         showToast('Đang nén và tải xuống toàn bộ ảnh...', 'success');
     }
  }, [tableData, showToast]);

  const handleExportPrompts = useCallback(() => {
      if (!exportVideoPromptsToExcel(tableData, `Scripts.xlsx`)) {
          showToast('Không có prompt video nào để xuất.', 'warning');
      } else {
          showToast('Đã xuất file Scripts.xlsx', 'success');
      }
  }, [tableData, showToast]);

  const handleExportImagePrompts = useCallback(() => {
      if (!exportImagePromptsToExcel(tableData, `ImagePrompts.xlsx`)) {
          showToast('Không có prompt ảnh nào để xuất.', 'warning');
      } else {
          showToast('Đã xuất file ImagePrompts.xlsx', 'success');
      }
  }, [tableData, showToast]);

  const handleDownloadScript = useCallback(() => {
      if (!exportCleanScriptToTxt(tableData, `Clean_Script.txt`)) {
          showToast('Không có nội dung kịch bản để tải xuống.', 'warning');
      } else {
          showToast('Đã tải xuống kịch bản sạch.', 'success');
      }
  }, [tableData, showToast]);

  const handleResetApp = () => {
      if (window.confirm("Bạn có chắc chắn muốn tải lại trang? Dữ liệu chưa lưu sẽ bị mất.")) {
          window.location.reload();
      }
  };

  const handleSendMessageToAI = async (prompt: string, keyIdx = 0) => {
    const updatedMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: prompt }];
    if (keyIdx === 0) setChatMessages(updatedMessages);
    setIsAiReplying(true);
    try {
        const { ai } = getAiInstance(keyIdx);
        const history = updatedMessages.slice(0, -1).map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }));
        const chat = ai.chats.create({ model: selectedModel, history: history });
        const responseStream = await chat.sendMessageStream({ message: prompt });
        let fullResponse = '';
        if (keyIdx === 0) setChatMessages(prev => [...prev, { role: 'model', content: '' }]);
        for await (const chunk of responseStream) {
            fullResponse += chunk.text || '';
            setChatMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = fullResponse;
                return newMessages;
            });
        }
    } catch (err: any) {
        const { keyCount } = getAiInstance();
        if (err.message.includes('429') && keyIdx < keyCount - 1) {
            return handleSendMessageToAI(prompt, keyIdx + 1);
        }
        setChatMessages(prev => [...prev, { role: 'model', content: `Lỗi: ${err.message}` }]);
    } finally { setIsAiReplying(false); }
  };

  const handleInitiateScriptUpload = (file: File) => {
    setPendingScriptFile(file);
  };
  
  const handleCloseWelcome = () => {
    localStorage.setItem('welcome_modal_last_shown', Date.now().toString());
    setIsWelcomeOpen(false);
  };

  const handleWelcomeOpenGuide = () => {
    localStorage.setItem('welcome_modal_last_shown', Date.now().toString());
    setIsWelcomeOpen(false);
    setIsGuideOpen(true);
  };

  const hasGeneratedImages = tableData.some(row => row.generatedImages.length > 0);

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#020a06]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#1f4d3a] py-3 px-6 header-bg">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-x-6 gap-y-3">
            <h1 onClick={handleResetApp} className="text-2xl font-bold tracking-wider bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent cursor-pointer">StudyAI86</h1>
            <div className="flex items-center flex-wrap justify-end gap-2">
               <Tooltip content="Mở thư viện các phiên làm việc đã lưu" position="bottom">
                    <button onClick={() => setIsLibraryOpen(true)} className="flex-shrink-0 h-10 font-bold py-2 px-4 rounded-lg bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200 transition-colors shadow-sm">
                        📂 Thư viện
                    </button>
               </Tooltip>
               <Tooltip content="Tải xuống kịch bản gốc sạch (file .txt)" position="bottom">
                    <button onClick={handleDownloadScript} className="flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-orange-100 hover:text-orange-700 transition-colors whitespace-nowrap shadow-sm">
                        Tải kịch bản
                    </button>
               </Tooltip>
               <Tooltip content="Xuất danh sách prompt ảnh (Image Prompts) ra file Excel" position="bottom">
                    <button onClick={handleExportImagePrompts} className="flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-orange-100 hover:text-orange-700 transition-colors whitespace-nowrap shadow-sm">
                        Tải prompt ảnh
                    </button>
               </Tooltip>
               <Tooltip content="Xuất danh sách prompt video ra file Excel" position="bottom">
                    <button onClick={handleExportPrompts} className="flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-orange-100 hover:text-orange-700 transition-colors whitespace-nowrap shadow-sm">
                        Tải prompt video
                    </button>
               </Tooltip>
               <Tooltip content={hasGeneratedImages ? "Tải xuống tất cả ảnh đã tạo dưới dạng file ZIP" : "Chức năng chỉ khả dụng khi có ảnh đã tạo"} position="bottom">
                    <button 
                        onClick={handleDownloadAllAssets} 
                        disabled={!hasGeneratedImages}
                        className={`flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg border transition-colors whitespace-nowrap shadow-sm ${
                            hasGeneratedImages 
                            ? "bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border-gray-300 dark:border-green-700 hover:bg-orange-100 hover:text-orange-700" 
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed"
                        }`}
                    >
                        Tải toàn bộ ảnh
                    </button>
               </Tooltip>
               <Tooltip content="Xem hướng dẫn sử dụng" position="bottom">
                    <button onClick={() => setIsGuideOpen(true)} className="flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-orange-100 hover:text-orange-700 transition-colors shadow-sm">
                        Hướng dẫn
                    </button>
               </Tooltip>
               <Tooltip content="Cấu hình API Key và Model AI" position="bottom">
                    <button onClick={() => setIsApiKeyManagerOpen(true)} className="flex-shrink-0 h-10 font-bold py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm">
                        API & Model
                    </button>
               </Tooltip>
               <Tooltip content="Chuyển đổi giao diện Sáng/Tối" position="bottom">
                    <button onClick={toggleTheme} className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-orange-100 hover:text-orange-700 transition-colors shadow-sm">
                        {theme === 'dark' ? <SunIcon className="w-6 h-6"/> : <MoonIcon className="w-6 h-6"/>}
                    </button>
               </Tooltip>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
       <FileDropzone onDrop={(f) => handleInitiateScriptUpload(f[0])} accept=".txt,.docx" dropMessage="Tải kịch bản" disableClick={true}>
        {!selectedStyle ? ( 
            <StyleSelector 
                onSelectStyle={handleStyleSelect} 
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
            /> 
        ) : (
          <div className="space-y-6">
            <CharacterManager 
              characters={characters} 
              setCharacters={handleCharactersChange} 
              defaultCharacterIndices={defaultCharacterIndices} 
              onToggleDefault={handleToggleDefaultCharacter} 
              videoPromptNote={videoPromptNote} 
              onVideoPromptNoteChange={handleVideoPromptNoteChange}
              tableData={tableData}
              selectedModel={selectedModel}
              onAutoFillRows={handleAutoFillCharacters}
              getAiInstance={(idx = 0) => { 
                  const { ai } = getAiInstance(idx); 
                  return { ai, rotate: () => {} }; 
              }}
              onViewImage={setPreviewImageUrl}
              showToast={showToast}
            />
            <ResultsView 
                selectedStyle={selectedStyle} 
                tableData={tableData} 
                characters={characters} 
                defaultCharacterIndices={defaultCharacterIndices} 
                onBack={handleBackToStyles} 
                onDocUpload={handleInitiateScriptUpload} 
                onUpdateRow={handleUpdateRow} 
                onGenerateImage={generateImage} 
                onGenerateAllImages={handleGenerateAllImages} 
                onGenerateVideoPrompt={generateVideoPromptForRow} 
                onGenerateAllVideoPrompts={() => tableData.forEach(r => generateVideoPromptForRow(r.id))}
                onGenerateAllContextPrompts={handleCreateAllImagePrompts}
                onDownloadAll={handleDownloadAllAssets} 
                onViewImage={(imageUrl, rowId) => setViewingImage({ imageUrl, rowId })} 
                onStartRemake={setRemakingRow} 
                onOpenHistory={setHistoryRow} 
                onSendToVideo={(id) => generateVideoPromptForRow(id)} 
                isProcessing={isProcessingScript} 
                showToast={showToast}
            />
          </div>
        )}
       </FileDropzone>
      </main>

      <footer className="bg-white/80 dark:bg-[#020a06]/80 backdrop-blur-md border-t border-gray-200 dark:border-[#1f4d3a] py-6 mt-8">
        <div className="container mx-auto text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Bản quyền © {new Date().getFullYear()} StudyAI86. Mọi quyền được bảo lưu.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
                Liên hệ hỗ trợ: <a href="https://www.facebook.com/deshunvn" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline font-bold">DeshunVN</a>
            </p>
        </div>
      </footer>

      <ImageModal viewData={viewingImage} tableData={tableData} onClose={() => setViewingImage(null)} />
      <SimpleImageModal imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
      <RemakeModal rowData={remakingRow} tableData={tableData} onClose={() => setRemakingRow(null)} onRemake={(id, adj) => { setRemakingRow(null); generateImage(id, adj); }} />
      <ConfirmationModal isOpen={!!confirmation} message={confirmation?.message || ''} onConfirm={() => confirmation?.onConfirm()} onClose={() => setConfirmation(null)} />
      <VersionHistoryModal isOpen={!!historyRow} rowData={historyRow ? tableData.find(r => r.id === historyRow.id) : null} onClose={() => setHistoryRow(null)} onSetMain={handleSetMainImage} onDownloadAll={handleDownloadRowAssets} />
      
      <ApiKeyManager 
        isOpen={isApiKeyManagerOpen} 
        onClose={() => setIsApiKeyManagerOpen(false)} 
        apiKeys={apiKeys} 
        setApiKeys={handleUpdateApiKeys} 
        selectedModel={selectedModel} 
        onSelectModel={handleUpdateModel} 
        selectedImageModel={selectedImageModel}
        onSelectImageModel={handleUpdateImageModel}
        showToast={showToast}
      />
      
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <WelcomeModal isOpen={isWelcomeOpen} onClose={handleCloseWelcome} onOpenGuide={handleWelcomeOpenGuide} />
      <LibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} showToast={showToast} onLoadSession={() => {}} />

      <ScriptProcessingModal 
        isOpen={!!pendingScriptFile} 
        onClose={() => setPendingScriptFile(null)} 
        onConfirm={(method, customRule) => {
          if (pendingScriptFile) {
            handleDocUpload(pendingScriptFile, method, customRule);
          }
        }} 
      />

      <ChatModal isOpen={chatState === 'open'} onClose={() => setChatState('closed')} onMinimize={() => setChatState('minimized')} messages={chatMessages} onSendMessage={handleSendMessageToAI} isAiReplying={isAiReplying} onPresentScript={() => {}} />
    </>
  );
}
