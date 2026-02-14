
import React, { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { STYLES, PRESET_PROMPT_CONTEXT } from './constants';
import type { Style, Character, TableRowData, ExcelRow, AdjustmentOptions, ColumnMapping, ChatMessage, GeminiModel } from './types';
import { StyleSelector } from './components/StyleSelector';
import { CharacterManager } from './components/CharacterManager';
import { ResultsView } from './components/ResultsView';
import { ImageModal } from './components/ImageModal';
import { RemakeModal } from './components/RemakeModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { createProjectAssetsZip, readExcelFile, createRowAssetsZip, exportPromptsToTxt, createFramesJsonWithImgAndPrompt, readTextFile, parseMarkdownTables } from './utils/fileUtils';
import { FileDropzone } from './components/FileDropzone';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { SunIcon, MoonIcon } from './components/icons';
import { getPromptAndPartsForRow } from './utils/fileUtils';
import { ChatModal } from './components/ChatModal';
import { ApiKeyManager } from './components/ApiKeyManager';

// Model chuyên dụng để tạo ảnh
const IMAGE_GEN_MODEL = 'gemini-2.5-flash-image';

const normalizeName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '');
};

const getCharacterIndicesFromStt = (stt: string | number, characters: Character[], defaultCharacterIndex: number | null): number[] => {
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
        if (hasAnyLetter && defaultCharacterIndex !== null) selectedCharacterIndices.push(defaultCharacterIndex);
    }
    return selectedCharacterIndices;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([{ name: '', images: [], stylePrompt: '' }]);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [defaultCharacterIndex, setDefaultCharacterIndex] = useState<number | null>(null);
  const [viewingImage, setViewingImage] = useState<{ imageUrl: string; rowId: number } | null>(null);
  const [remakingRow, setRemakingRow] = useState<TableRowData | null>(null);
  const [historyRow, setHistoryRow] = useState<TableRowData | null>(null);
  const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [videoPromptNote, setVideoPromptNote] = useState('');
  const [isProcessingScript, setIsProcessingScript] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(() => {
    // Chuyển mặc định sang flash để tránh lỗi 429
    return (localStorage.getItem('selected_gemini_model') as GeminiModel) || 'gemini-3-flash-preview';
  });

  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<string[]>(() => {
    const saved = localStorage.getItem('user_api_keys');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatState, setChatState] = useState<'closed' | 'open' | 'minimized'>('closed');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiReplying, setIsAiReplying] = useState(false);

  const stateRef = useRef({ tableData, selectedStyle, characters, defaultCharacterIndex });
  useEffect(() => {
    stateRef.current = { tableData, selectedStyle, characters, defaultCharacterIndex };
  }, [tableData, selectedStyle, characters, defaultCharacterIndex]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleUpdateApiKeys = (keys: string[]) => {
    setApiKeys(keys);
    localStorage.setItem('user_api_keys', JSON.stringify(keys));
  };

  const handleUpdateModel = (model: GeminiModel) => {
    setSelectedModel(model);
    localStorage.setItem('selected_gemini_model', model);
  };
  
  const toggleTheme = () => setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');

  // Hàm lấy instance AI có hỗ trợ xoay vòng Key
  const getAiInstance = useCallback((keyIndex = 0) => {
    const availableKeys = apiKeys.length > 0 ? apiKeys : [process.env.API_KEY || ''];
    const safeIndex = keyIndex % availableKeys.length;
    const key = availableKeys[safeIndex];
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
          const newIndices = getCharacterIndicesFromStt(row.originalRow[0], characters, defaultCharacterIndex);
          if (JSON.stringify([...row.selectedCharacterIndices].sort()) !== JSON.stringify([...newIndices].sort())) {
            hasChanges = true;
            return { ...row, selectedCharacterIndices: newIndices };
          }
          return row;
        });
        return hasChanges ? updatedTableData : currentTableData;
      });
    }
  }, [characters, defaultCharacterIndex]);

  const handleCharactersChange = (newCharacters: Character[]) => { setCharacters(newCharacters); };
  const handleVideoPromptNoteChange = (note: string) => { setVideoPromptNote(note); };
  const handleSetDefaultCharacter = useCallback((index: number | null) => { setDefaultCharacterIndex(index); }, []);
  const handleStyleSelect = useCallback((style: Style) => { setSelectedStyle(style); }, []);
  const handleBackToStyles = () => { setSelectedStyle(null); setTableData([]); };
  
  const handleUpdateRow = useCallback((updatedRow: TableRowData) => { setTableData(prevData => prevData.map(row => (row.id === updatedRow.id ? updatedRow : row))); }, []);

  const handleAutoFillCharacters = useCallback(() => {
    const definedCharacters = characters
        .map((c, i) => ({ name: c.name.trim().toLowerCase(), index: i }))
        .filter(c => c.name.length > 0);

    if (definedCharacters.length === 0) {
        alert("Vui lòng đặt tên cho ít nhất một nhân vật trước khi sử dụng chức năng này.");
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
        alert("Không tìm thấy tên nhân vật nào khớp trong kịch bản.");
    } else {
        setTableData(updatedTableData);
        alert(`Thành công! Đã cập nhật nhân vật cho ${fillCount} phân cảnh.`);
    }
  }, [characters, tableData]);

  const handleDocUpload = useCallback(async (file: File) => {
    setIsProcessingScript(true);
    
    const runProcessing = async (keyIdx = 0): Promise<void> => {
        try {
            const scriptText = await readTextFile(file);
            const { ai, keyCount } = getAiInstance(keyIdx);
            
            const systemInstruction = `Bạn là một chuyên gia kịch bản. Chuyển kịch bản thành bảng phân cảnh 5 cột Markdown: STT, Kịch bản Anh, Kịch bản Việt, Tóm tắt, Prompt tiếng Anh chi tiết. Không thêm văn bản thừa.`;

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
                    selectedCharacterIndices: getCharacterIndicesFromStt(stt, characters, defaultCharacterIndex),
                    generatedImages: [],
                    mainImageIndex: -1,
                    isGenerating: false,
                    error: null,
                    videoPrompt: '',
                    isGeneratingPrompt: false
                };
            });
            setTableData(newTableData);
        } catch (error: any) {
            // Nếu lỗi 429 và còn Key khác, thử Key tiếp theo
            const { keyCount } = getAiInstance();
            if (error.message.includes('429') && keyIdx < keyCount - 1) {
                console.warn(`Key ${keyIdx} hết hạn mức, đang thử Key ${keyIdx + 1}...`);
                return runProcessing(keyIdx + 1);
            }
            alert(`Lỗi xử lý kịch bản: ${error.message}`);
        } finally {
            setIsProcessingScript(false);
        }
    };

    await runProcessing(0);
  }, [characters, defaultCharacterIndex, getAiInstance, selectedModel]);

  const generateImage = useCallback(async (rowId: number, adjustments?: AdjustmentOptions, retryCount = 0, keyIdx = 0) => {
    setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, isGenerating: true, error: null } : r));

    try {
      const { tableData: currentTable, selectedStyle: currentStyle, characters: currentChars, defaultCharacterIndex: currentDef } = stateRef.current;
      const row = currentTable.find(r => r.id === rowId);
      if (!row || !currentStyle) return;

      const rowIndex = currentTable.findIndex(r => r.id === rowId);
      const { prompt, parts } = getPromptAndPartsForRow({ 
        row, rowIndex, tableData: currentTable, selectedStyle: currentStyle, 
        characters: currentChars, defaultCharacterIndex: currentDef, adjustments 
      });
      
      const { ai, keyCount } = getAiInstance(keyIdx);
      const response = await ai.models.generateContent({ 
        model: IMAGE_GEN_MODEL, 
        contents: { parts: parts } 
      });
      
      const generatedBase64 = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      
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
      
      // Xoay vòng Key nếu gặp lỗi 429
      if (errorMessage.includes("429")) {
          if (keyIdx < keyCount - 1) {
              return generateImage(rowId, adjustments, retryCount, keyIdx + 1);
          } else if (retryCount < 3) {
              const backoffTime = 5000 * (retryCount + 1);
              setTableData(prev => prev.map(r => r.id === rowId ? { ...r, error: `Hết hạn mức toàn bộ Key, chờ ${backoffTime/1000}s...` } : r));
              await delay(backoffTime);
              return generateImage(rowId, adjustments, retryCount + 1, 0); // Quay lại key đầu tiên sau khi đợi
          }
      }

      let finalError = errorMessage;
      if (finalError.includes("429")) finalError = "Hạn mức API đã hết trên tất cả các Key. Hãy nâng cấp hoặc đợi vài phút.";
      setTableData(prev => prev.map(r => r.id === rowId ? { ...r, error: `Lỗi: ${finalError}`, isGenerating: false } : r));
    }
  }, [getAiInstance]);

  const handleGenerateAllImages = useCallback(async () => {
    const rowsToProcess = tableData.filter(r => r.generatedImages.length === 0 && !r.isGenerating);
    if (rowsToProcess.length === 0) {
        alert("Không có ảnh mới cần tạo.");
        return;
    }

    for (let i = 0; i < rowsToProcess.length; i++) {
        await generateImage(rowsToProcess[i].id);
        await delay(3000); // Giảm delay vì đã có xoay vòng Key
    }
  }, [tableData, generateImage]);

  const generateVideoPromptForRow = useCallback(async (rowId: number, keyIdx = 0) => {
    const rowIndex = tableData.findIndex(row => row.id === rowId);
    if (rowIndex === -1) return;
    const row = tableData[rowIndex];
    const mainAsset = row.mainImageIndex > -1 ? row.generatedImages[row.mainImageIndex] : (row.generatedImages.length > 0 ? row.generatedImages[row.generatedImages.length - 1] : null);
    if (!mainAsset) { handleUpdateRow({ ...row, error: "Cần có ảnh chính để tạo prompt video." }); return; }
    setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, isGeneratingPrompt: true, error: null, videoPrompt: '' } : r));
    try {
        const { ai, keyCount } = getAiInstance(keyIdx);
        const parts = [{ inlineData: { data: mainAsset.split(',')[1], mimeType: 'image/png' } }, { text: `Từ kịch bản [${row.originalRow[2]}] hãy viết Prompt Video tiếng Anh dài 300 chữ mô tả chuyển động camera 8 giây. ${videoPromptNote}` }];
        const responseStream = await ai.models.generateContentStream({ model: selectedModel, contents: { parts } });
        for await (const chunk of responseStream) {
            setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, videoPrompt: (r.videoPrompt || '') + (chunk.text || '') } : r));
        }
    } catch (err: any) {
        const { keyCount } = getAiInstance();
        if (err.message.includes('429') && keyIdx < keyCount - 1) {
            return generateVideoPromptForRow(rowId, keyIdx + 1);
        }
        handleUpdateRow({ ...tableData.find(r => r.id === rowId)!, error: `Lỗi: ${err.message}` });
    } finally { setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, isGeneratingPrompt: false } : r)); }
  }, [tableData, handleUpdateRow, videoPromptNote, getAiInstance, selectedModel]);

  const handleSetMainImage = useCallback((rowId: number, index: number) => {
    setTableData(prevData => prevData.map(row => (row.id === rowId ? { ...row, mainImageIndex: index } : row)));
  }, []);

  const handleDownloadRowAssets = useCallback((row: TableRowData) => {
    createRowAssetsZip(row, `assets_row_${row.id}.zip`);
  }, []);

  const handleResetApp = () => window.location.reload();

  const handleSendMessageToAI = async (prompt: string, keyIdx = 0) => {
    const updatedMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: prompt }];
    if (keyIdx === 0) setChatMessages(updatedMessages);
    setIsAiReplying(true);
    try {
        const { ai, keyCount } = getAiInstance(keyIdx);
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

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#020a06]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#1f4d3a] py-3 px-6 header-bg">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-x-6 gap-y-3">
            <h1 onClick={handleResetApp} className="text-2xl font-bold tracking-wider gradient-text cursor-pointer">StudyAI86</h1>
            <div className="flex items-center flex-wrap justify-end gap-2">
               <button onClick={() => setIsApiKeyManagerOpen(true)} className="flex-shrink-0 h-10 font-bold py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm">
                API & Model
              </button>
               <button onClick={() => createProjectAssetsZip(tableData, `images-assets.zip`)} className="flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-orange-100 hover:text-orange-700 transition-colors whitespace-nowrap shadow-sm">
                Tải toàn bộ ảnh
              </button>
              <button onClick={() => exportPromptsToTxt(tableData, `Scripts.txt`)} className="flex-shrink-0 h-10 font-semibold py-2 px-4 rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-orange-100 hover:text-orange-700 transition-colors whitespace-nowrap shadow-sm">
                Xuất Prompt
              </button>
               <button onClick={toggleTheme} className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-[#0f3a29] text-gray-800 dark:text-green-300 border border-gray-300 dark:border-green-700 hover:bg-orange-100 hover:text-orange-700 transition-colors shadow-sm">
                 {theme === 'dark' ? <SunIcon className="w-6 h-6"/> : <MoonIcon className="w-6 h-6"/>}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
       <FileDropzone onDrop={(f) => handleDocUpload(f[0])} accept=".txt,.docx" dropMessage="Tải kịch bản" disableClick={true}>
        {!selectedStyle ? ( <StyleSelector onSelectStyle={handleStyleSelect} /> ) : (
          <div className="space-y-6">
            <CharacterManager 
              characters={characters} 
              setCharacters={handleCharactersChange} 
              defaultCharacterIndex={defaultCharacterIndex} 
              onSetDefault={handleSetDefaultCharacter} 
              videoPromptNote={videoPromptNote} 
              onVideoPromptNoteChange={handleVideoPromptNoteChange}
              tableData={tableData}
              selectedModel={selectedModel}
              onAutoFillRows={handleAutoFillCharacters}
              getAiInstance={(idx) => { 
                  const { ai } = getAiInstance(idx); 
                  return { ai, rotate: () => {} }; 
              }}
            />
            <ResultsView selectedStyle={selectedStyle} tableData={tableData} characters={characters} defaultCharacterIndex={defaultCharacterIndex} onBack={handleBackToStyles} onDocUpload={handleDocUpload} onUpdateRow={handleUpdateRow} onGenerateImage={generateImage} onGenerateAllImages={handleGenerateAllImages} onGenerateVideoPrompt={generateVideoPromptForRow} onGenerateAllVideoPrompts={() => tableData.forEach(r => generateVideoPromptForRow(r.id))} onDownloadAll={() => createProjectAssetsZip(tableData, `images_assets.zip`)} onViewImage={setViewingImage} onStartRemake={setRemakingRow} onOpenHistory={setHistoryRow} onSendToVideo={(id) => generateVideoPromptForRow(id)} isProcessing={isProcessingScript} />
          </div>
        )}
       </FileDropzone>
      </main>

      <ImageModal viewData={viewingImage} tableData={tableData} onClose={() => setViewingImage(null)} />
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
      />

      <ChatModal isOpen={chatState === 'open'} onClose={() => setChatState('closed')} onMinimize={() => setChatState('minimized')} messages={chatMessages} onSendMessage={handleSendMessageToAI} isAiReplying={isAiReplying} onPresentScript={() => {}} />
    </>
  );
}
