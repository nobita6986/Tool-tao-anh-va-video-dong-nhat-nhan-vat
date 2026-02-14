
import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
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
import { ColumnMapper } from './components/ColumnMapper';
import { ChatModal } from './components/ChatModal';
import { PresentScriptModal } from './components/PresentScriptModal';
import { ChatBubble } from './components/ChatBubble';
import { ApiKeyManager } from './components/ApiKeyManager';

const IMAGE_GENERATION_COST_USD = 0.0025;

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [videoPromptNote, setVideoPromptNote] = useState('');
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false);
  const [isProcessingScript, setIsProcessingScript] = useState(false);
  
  const [apiKeys, setApiKeys] = useState<string[]>(JSON.parse(localStorage.getItem('user_api_keys') || '[]'));
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>((localStorage.getItem('user_selected_model') as GeminiModel) || 'gemini-3-pro-preview');

  const [chatState, setChatState] = useState<'closed' | 'open' | 'minimized'>('closed');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiReplying, setIsAiReplying] = useState(false);

  useEffect(() => {
    localStorage.setItem('user_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('user_selected_model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');

  const getAiInstance = useCallback((): { ai: GoogleGenAI, rotate: () => void } => {
    const keys = apiKeys.length > 0 ? apiKeys : [process.env.API_KEY || ''];
    const idx = currentKeyIndex % keys.length;
    const rotate = () => setCurrentKeyIndex((prev) => (prev + 1) % keys.length);
    const apiKeyToUse = keys[idx];
    if (!apiKeyToUse) {
      throw new Error("Vui lòng cấu hình ít nhất một API Key trong mục 'API & Model'.");
    }
    return { ai: new GoogleGenAI({ apiKey: apiKeyToUse }), rotate };
  }, [apiKeys, currentKeyIndex]);

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

  const handleCharactersChange = (newCharacters: Character[]) => { setCharacters(newCharacters); setHasUnsavedChanges(true); };
  const handleVideoPromptNoteChange = (note: string) => { setVideoPromptNote(note); setHasUnsavedChanges(true); };
  const handleSetDefaultCharacter = useCallback((index: number | null) => { setDefaultCharacterIndex(index); setHasUnsavedChanges(true); }, []);
  const handleStyleSelect = useCallback((style: Style) => { setSelectedStyle(style); setHasUnsavedChanges(true); }, []);
  const handleBackToStyles = () => { setSelectedStyle(null); setTableData([]); };
  
  const handleUpdateRow = useCallback((updatedRow: TableRowData) => { setTableData(prevData => prevData.map(row => (row.id === updatedRow.id ? updatedRow : row))); setHasUnsavedChanges(true); }, []);

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
        alert("Không tìm thấy tên nhân vật nào khớp trong kịch bản. Lưu ý: Hệ thống tìm kiếm theo tên chính xác bạn đã đặt.");
    } else {
        setTableData(updatedTableData);
        alert(`Thành công! Đã cập nhật nhân vật cho ${fillCount} phân cảnh.`);
    }
  }, [characters, tableData]);

  const handleDocUpload = useCallback(async (file: File) => {
    setIsProcessingScript(true);
    try {
      const scriptText = await readTextFile(file);
      const { ai, rotate } = getAiInstance();
      
      const systemInstruction = `Bạn là một chuyên gia kịch bản điện ảnh. Nhiệm vụ của bạn là nhận một kịch bản thô và chuyển đổi nó thành một bảng phân cảnh chi tiết 5 cột chuẩn xác.
Quy trình:
1. Chia nhỏ kịch bản thành các phân đoạn ngắn (7-15 chữ).
2. Viết Prompt bối cảnh (Cột 5) cực kỳ chi tiết bằng tiếng Anh, mô tả bối cảnh, hành động, ánh sáng và góc máy cho AI vẽ ảnh.
3. Tên prompt (Cột 4) là tóm tắt ngắn bằng tiếng Việt.
4. STT (Cột 1) tăng dần 1, 2, 3...
5. Cột 2 và 3 là kịch bản phân đoạn bằng tiếng Anh và tiếng Việt.

YÊU CẦU ĐỊNH DẠNG: Chỉ trả về một bảng Markdown duy nhất, không thêm bất kỳ văn bản nào khác.
Kịch bản thô: "${scriptText}"`;

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: systemInstruction,
      });

      // Fixed: response.text is a property, handled safely with || ''
      const tableRows = parseMarkdownTables(response.text || '');
      if (tableRows.length === 0) throw new Error("AI không tạo được bảng kịch bản hợp lệ.");

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
      setHasUnsavedChanges(true);
    } catch (error: any) {
      alert(`Lỗi xử lý kịch bản: ${error.message}. Thử đổi sang model Flash để ổn định hơn.`);
    } finally {
      setIsProcessingScript(false);
    }
  }, [characters, defaultCharacterIndex, getAiInstance, selectedModel]);

  const generateImage = useCallback(async (rowId: number, adjustments?: AdjustmentOptions) => {
    setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, isGenerating: true, error: null } : r));

    try {
      const row = tableData.find(r => r.id === rowId);
      if (!row || !selectedStyle) return;

      const rowIndex = tableData.findIndex(r => r.id === rowId);
      const { prompt, parts } = getPromptAndPartsForRow({ row, rowIndex, tableData, selectedStyle, characters, defaultCharacterIndex, adjustments });
      
      const { ai, rotate } = getAiInstance();
      const response = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash-image', 
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
      } else throw new Error("Không nhận được dữ liệu ảnh từ AI.");
    } catch (err: any) {
      let errorMessage = err.message;
      if (errorMessage.includes("429")) {
          errorMessage = "Hệ thống (429): Tần suất yêu cầu quá nhanh. Hãy thêm nhiều API Key hoặc chờ 2 phút để tiếp tục.";
          getAiInstance().rotate(); // Chuyển key ngay khi gặp lỗi limit
      }
      setTableData(prev => prev.map(r => r.id === rowId ? { ...r, error: `Lỗi: ${errorMessage}`, isGenerating: false } : r));
    }
  }, [characters, selectedStyle, tableData, defaultCharacterIndex, getAiInstance]);

  const handleGenerateAllImages = useCallback(async () => {
    const rowsToProcess = tableData.filter(r => r.generatedImages.length === 0 && !r.isGenerating);
    if (rowsToProcess.length === 0) {
        alert("Tất cả các dòng đều đã có ảnh hoặc đang được tạo.");
        return;
    }

    for (let i = 0; i < rowsToProcess.length; i++) {
        await generateImage(rowsToProcess[i].id);
        // Tăng delay lên 2.5s để đảm bảo không bị 429 với 1 key free
        await delay(2500); 
    }
  }, [tableData, generateImage]);

  const generateVideoPromptForRow = useCallback(async (rowId: number) => {
    const rowIndex = tableData.findIndex(row => row.id === rowId);
    if (rowIndex === -1) return;
    const row = tableData[rowIndex];
    const mainAsset = row.mainImageIndex > -1 ? row.generatedImages[row.mainImageIndex] : (row.generatedImages.length > 0 ? row.generatedImages[row.generatedImages.length - 1] : null);
    if (!mainAsset) { handleUpdateRow({ ...row, error: "Cần có ảnh chính để tạo prompt video." }); return; }
    setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, isGeneratingPrompt: true, error: null, videoPrompt: '' } : r));
    try {
        const { ai, rotate } = getAiInstance();
        const parts = [{ inlineData: { data: mainAsset.split(',')[1], mimeType: mainAsset.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png' } }, { text: `Từ kịch bản [${row.originalRow[2]}] hãy viết Prompt Video tiếng Anh dài 300 chữ theo cấu trúc mô tả chi tiết 8 giây camera move. ${videoPromptNote}` }];
        const responseStream = await ai.models.generateContentStream({ model: selectedModel, contents: { parts } });
        for await (const chunk of responseStream) {
            setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, videoPrompt: (r.videoPrompt || '') + (chunk.text || '') } : r));
        }
    } catch (err: any) {
        handleUpdateRow({ ...tableData.find(r => r.id === rowId)!, error: `Lỗi viết prompt video: ${err.message}` });
        getAiInstance().rotate();
    } finally { setTableData(prevData => prevData.map(r => r.id === rowId ? { ...r, isGeneratingPrompt: false } : r)); }
  }, [tableData, handleUpdateRow, videoPromptNote, getAiInstance, selectedModel]);

  const handleSetMainImage = useCallback((rowId: number, index: number) => {
    setTableData(prevData => prevData.map(row => (row.id === rowId ? { ...row, mainImageIndex: index } : row)));
    setHasUnsavedChanges(true);
  }, []);

  const handleDownloadRowAssets = useCallback((row: TableRowData) => {
    createRowAssetsZip(row, `assets_row_${row.id}.zip`);
  }, []);

  const handleResetApp = () => window.location.reload();

  const handleAppDrop = useCallback((files: File[]) => {
    if (files.length > 0) {
      handleDocUpload(files[0]);
    }
  }, [handleDocUpload]);

  const handleSendMessageToAI = async (prompt: string) => {
    const updatedMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: prompt }];
    setChatMessages(updatedMessages);
    setIsAiReplying(true);
    try {
        const { ai, rotate } = getAiInstance();
        const history = updatedMessages.slice(0, -1).map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }));
        const chat = ai.chats.create({ model: selectedModel, history: history });
        const responseStream = await chat.sendMessageStream({ message: prompt });
        let fullResponse = '';
        setChatMessages(prev => [...prev, { role: 'model', content: '' }]);
        for await (const chunk of responseStream) {
            fullResponse += chunk.text || '';
            setChatMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = fullResponse;
                return newMessages;
            });
        }
    } catch (err: any) {
        setChatMessages(prev => [...prev, { role: 'model', content: `Lỗi: ${err.message}` }]);
        getAiInstance().rotate();
    } finally { setIsAiReplying(false); }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#020a06]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#1f4d3a] py-3 px-6 header-bg">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-x-6 gap-y-3">
            <h1 onClick={handleResetApp} className="text-2xl font-bold tracking-wider gradient-text cursor-pointer">StudyAI86</h1>
            <div className="flex items-center flex-wrap justify-end gap-2">
               <button onClick={() => setIsApiKeyManagerOpen(true)} className="flex-shrink-0 h-10 font-bold py-2 px-4 rounded-lg bg-green-100 text-green-700 dark:bg-[#0f3a29] dark:text-green-300 border border-green-700 hover:bg-orange-100 hover:text-orange-700 transition-colors whitespace-nowrap shadow-sm">
                ⚙️ API & Model
              </button>
               {/* Fixed: tableTableData was a typo, corrected to tableData */}
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
       <FileDropzone onDrop={handleAppDrop} accept=".txt,.docx">
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
              getAiInstance={getAiInstance}
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
      <ApiKeyManager isOpen={isApiKeyManagerOpen} onClose={() => setIsApiKeyManagerOpen(false)} apiKeys={apiKeys} setApiKeys={setApiKeys} selectedModel={selectedModel} onSelectModel={setSelectedModel} />
      <ChatModal isOpen={chatState === 'open'} onClose={() => setChatState('closed')} onMinimize={() => setChatState('minimized')} messages={chatMessages} onSendMessage={handleSendMessageToAI} isAiReplying={isAiReplying} onPresentScript={() => {}} />
      {chatBubbleCondition && <ChatBubble onClick={() => setChatState('open')} />}
    </>
  );
}

const chatBubbleCondition = false;
