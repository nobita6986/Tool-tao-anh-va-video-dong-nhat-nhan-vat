
import type { ExcelRow, TableRowData, Style, Character, SavedSessionRow } from '../types';

// These are expected to be available globally from CDN scripts in index.html
declare const XLSX: any;
declare const JSZip: any;
declare const mammoth: any;

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target!.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

export const readTextFile = (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const filename = file.name.toLowerCase();
        if (filename.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target!.result as string);
            reader.onerror = reject;
            reader.readAsText(file, 'UTF-8');
        } else if (filename.endsWith('.docx')) {
            if (typeof mammoth === 'undefined') {
                return reject(new Error('Thư viện đọc file .docx (mammoth.js) chưa được tải.'));
            }
            try {
                const arrayBuffer = await readFileAsArrayBuffer(file);
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                resolve(result.value);
            } catch (error) {
                reject(new Error('Không thể đọc nội dung từ file .docx.'));
            }
        } else {
            reject(new Error('Định dạng file không được hỗ trợ. Vui lòng sử dụng .txt hoặc .docx.'));
        }
    });
};

export const readExcelFile = async (file: File): Promise<ExcelRow[]> => {
    if (!file) throw new Error('No file provided');

    try {
        const data = await readFileAsArrayBuffer(file);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    } catch (err) {
        console.error("Error reading Excel file:", err);
        throw err;
    }
};

export const readKeysFromExcel = async (file: File): Promise<string[]> => {
    try {
        const excelData = await readExcelFile(file);
        if (!excelData || excelData.length < 1) return [];
        const startIndex = (excelData[0] && String(excelData[0][0]).toLowerCase().includes('key')) ? 1 : 0;
        return excelData.slice(startIndex)
            .map(row => (row && row.length > 0 ? String(row[0]).trim() : ''))
            .filter(key => key.length > 0 && key !== 'null' && key !== 'undefined');
    } catch (err) {
        console.error("Error reading keys from Excel:", err);
        throw err;
    }
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const getExtensionFromDataUrl = (dataUrl: string): string => {
    const mimeType = dataUrl.match(/data:(image\/[^;]+);/);
    if (mimeType && mimeType[1]) {
        switch (mimeType[1]) {
            case 'image/jpeg': return '.jpg';
            case 'image/png': return '.png';
            default: return `.${mimeType[1].split('/')[1] || 'png'}`;
        }
    }
    return '.png';
};

export const getPromptForRow = (row: TableRowData, selectedStyle: Style, characters: Character[]): string => {
    // Xác định xem có nhân vật nào được chọn không (không tính Random -2)
    // Nếu mảng rỗng hoặc chứa -1 -> Không có nhân vật
    const hasSpecificCharacter = row.selectedCharacterIndices.length > 0 && row.selectedCharacterIndices[0] >= 0;
    const isRandomCharacter = row.selectedCharacterIndices.length > 0 && row.selectedCharacterIndices[0] === -2;

    // Chọn Template: Nếu không có nhân vật và cũng không phải Random, dùng Scene Template (nếu có)
    // Nếu có nhân vật hoặc Random, dùng Prompt Template (Character focused)
    let basePrompt = '';
    
    if (!hasSpecificCharacter && !isRandomCharacter && selectedStyle.sceneTemplate) {
        basePrompt = selectedStyle.sceneTemplate;
    } else {
        basePrompt = selectedStyle.promptTemplate || (row.contextPrompt || "").replace(/[\r\n]+/g, ' ').trim();
    }
    
    // Tạo bản sao của template để thay thế
    const selectedCharIndices = row.selectedCharacterIndices;

    // Xử lý điền thông tin nhân vật vào [CHARACTER_STYLE]
    let characterDetails = '';
    
    if (hasSpecificCharacter) { 
        // Trường hợp có chọn nhân vật cụ thể
        const characterNames: string[] = [];
        selectedCharIndices.forEach((charIndex) => {
            const character = characters[charIndex];
            if (!character || !character.name) return;
            characterNames.push(`"${character.name}"`);
            
            // Xây dựng chi tiết cho từng nhân vật - Sử dụng dấu phẩy thay vì xuống dòng
            characterDetails += ` Name: ${character.name},`;
            if (character.stylePrompt) {
                 characterDetails += ` Appearance: ${character.stylePrompt},`;
            } else {
                 characterDetails += ` Appearance: same as reference image,`;
            }
        });
        characterDetails += ` REQUIREMENT: Copy exact face and identity from reference image of [${characterNames.join(', ')}].`;
    } else if (isRandomCharacter) { 
        // Trường hợp Random
        characterDetails = "Create random character fitting the context. DO NOT copy character from reference image.";
    } else { 
        // Trường hợp không chọn nhân vật -> Focus on Scene/Crowd
        characterDetails = "No specific character. Focus on environment, context, or generic crowd if script requires.";
    }

    // Thực hiện thay thế vào template
    // Lưu ý: Template Scene mới dùng [CHARACTER_STYLE based on script] nên ta thay thế cả cụm này
    basePrompt = basePrompt.replace('[CHARACTER_STYLE]', characterDetails);
    basePrompt = basePrompt.replace('[CHARACTER_STYLE based on script]', characterDetails);
    
    // Thay thế [A] hoặc [A based on script] bằng Context Prompt
    basePrompt = basePrompt.replace('[A]', row.contextPrompt);
    basePrompt = basePrompt.replace('[A based on script]', row.contextPrompt);

    // QUAN TRỌNG: Thay thế toàn bộ ký tự xuống dòng bằng khoảng trắng để tạo thành 1 dòng duy nhất
    return basePrompt.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
};

export const getPromptAndPartsForRow = ({ row, rowIndex, tableData, selectedStyle, characters, defaultCharacterIndices, adjustments }: any): { prompt: string; parts: any[] } => {
    let prompt = row.imagePrompt && row.imagePrompt.trim() !== '' ? row.imagePrompt : getPromptForRow(row, selectedStyle, characters);
    
    // Đảm bảo prompt đầu vào cũng là 1 line
    prompt = prompt.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

    const parts: any[] = [];
    const selectedCharIndices = row.selectedCharacterIndices;
    const hasSpecificCharacter = selectedCharIndices.length > 0 && selectedCharIndices[0] >= 0;
    
    // CHỈ gửi ảnh tham chiếu nếu CÓ chọn nhân vật cụ thể
    if (hasSpecificCharacter) {
        parts.push({ text: "**REFERENCE MATERIAL:** " }); 
        selectedCharIndices.forEach((charIndex: number) => {
            const character = characters[charIndex];
            if (character && character.images.length > 0) {
                parts.push({ text: ` [REFERENCE IMAGE FOR: "${character.name}"] ` });
                character.images.forEach((imgDataUrl: string) => {
                    const [header, base64Data] = imgDataUrl.split(',');
                    const mimeType = header.match(/data:(.*);base64/)?.[1] || 'image/png';
                    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
                });
            }
        });
        parts.push({ text: " **END OF REFERENCES.** " }); 
    } 
    // Nếu KHÔNG chọn nhân vật, ta KHÔNG gửi ảnh style reference mặc định nữa để tránh AI lấy nhầm nhân vật từ style ref.
    // Logic cũ: else { ... gửi style ref ... } -> Đã xóa để fix lỗi hallucination.

    if (adjustments) {
        let adjustmentText = " **ADJUSTMENTS:** Based on feedback, apply the following changes:";
        if (adjustments.options.length > 0) adjustmentText += " Apply selected adjustments logic.";
        if (adjustments.manualPrompt) {
            adjustmentText += ` User Manual Request: ${adjustments.manualPrompt}`;
            const sceneMatches = adjustments.manualPrompt.match(/\[scene_([\w.-]+)\]/g);
            if (sceneMatches) {
                adjustmentText += ` Visual References provided from other scenes:`;
                sceneMatches.forEach((match: string) => {
                    const sceneId = match.match(/\[scene_([\w.-]+)\]/)?.[1];
                    if (sceneId) {
                        const referencedRow = tableData.find((r: any) => String(r.originalRow[0]) === sceneId);
                        if (referencedRow) {
                            const mainIndex = referencedRow.mainImageIndex > -1 ? referencedRow.mainImageIndex : (referencedRow.generatedImages.length > 0 ? referencedRow.generatedImages.length - 1 : -1);
                            const mainAsset = mainIndex !== -1 ? referencedRow.generatedImages[mainIndex] : null;
                            if (mainAsset && mainAsset.startsWith('data:image')) {
                                const [header, base64Data] = mainAsset.split(',');
                                const mimeType = header.match(/data:(.*);base64/)?.[1] || 'image/png';
                                parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
                                adjustmentText += ` (Image included for Scene ${sceneId})`;
                            }
                        }
                    }
                });
            }
        }
        // Nối adjustment vào prompt chính, cũng đảm bảo 1 dòng
        prompt += adjustmentText.replace(/[\r\n]+/g, ' ');
    }
    
    parts.push({ text: prompt });
    return { prompt, parts };
};

const addTimestampToFilename = (filename: string): string => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex === -1) return `${filename}_${timestamp}`;
    return `${filename.substring(0, dotIndex)}_${timestamp}${filename.substring(dotIndex)}`;
};

const downloadFile = (blob: Blob, filename: string) => {
    const finalFilename = addTimestampToFilename(filename);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const exportCleanScriptToTxt = (tableData: TableRowData[], filename: string): boolean => {
    const lines = tableData
        .map(row => {
            // SỬA: Lấy cột Kịch bản gốc (index 1) làm kịch bản sạch theo yêu cầu
            const content = String(row.originalRow[1] || '').trim();
            if (!content) return null;
            // Xóa tất cả dấu xuống dòng trong cùng 1 đoạn để đảm bảo 1 đoạn là 1 dòng
            return content.replace(/[\r\n]+/g, ' ');
        })
        .filter((line): line is string => line !== null && line.length > 0);

    if (lines.length === 0) return false;

    const textContent = lines.join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, filename);
    return true;
};

export const convertSavedSessionToTableData = (savedRows: SavedSessionRow[]): TableRowData[] => {
    return savedRows.map((row, index) => ({
        id: index + 1,
        originalRow: [row.stt, row.original, row.vietnamese, '', ''],
        contextPrompt: '', // Không lưu context prompt trong saved session để tối ưu, hoặc cần lưu nếu muốn export chuẩn
        imagePrompt: row.imagePrompt,
        videoPrompt: row.videoPrompt,
        selectedCharacterIndices: [],
        generatedImages: [],
        mainImageIndex: -1,
        isGenerating: false,
        error: null,
        isGeneratingPrompt: false
    }));
};

export const exportVideoPromptsToExcel = (tableData: TableRowData[], filename: string): boolean => {
    const rows = tableData
        .filter(row => row.videoPrompt && row.videoPrompt.trim())
        .map(row => [row.originalRow[0], row.videoPrompt!.trim().replace(/[\r\n]+/g, ' ')]);

    if (rows.length === 0) return false;

    const header = ['Scene', 'Prompt'];
    const data = [header, ...rows];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Video Prompts");
    
    const finalFilename = addTimestampToFilename(filename);
    XLSX.writeFile(workbook, finalFilename);
    return true;
};

export const exportImagePromptsToExcel = (tableData: TableRowData[], filename: string): boolean => {
    const rows = tableData
        .map(row => {
            const stt = row.originalRow[0];
            const promptContent = row.imagePrompt || row.contextPrompt;
            if (!promptContent || !promptContent.trim()) return null;
            return [stt, promptContent.trim().replace(/[\r\n]+/g, ' ')];
        })
        .filter(r => r !== null);

    if (rows.length === 0) return false;

    const header = ['Scene', 'Prompt'];
    const data = [header, ...rows];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Image Prompts");
    
    const finalFilename = addTimestampToFilename(filename);
    XLSX.writeFile(workbook, finalFilename);
    return true;
};

const getValidRowsForJsonExport = (tableData: TableRowData[]) => {
  return tableData
    .map(row => {
      if (row.generatedImages.length > 0) {
        const mainIndex = row.mainImageIndex > -1 ? row.mainImageIndex : row.generatedImages.length - 1;
        const mainAsset = row.generatedImages[mainIndex];
        if (!mainAsset || !mainAsset.startsWith('data:image')) return null;

        return {
          asset: mainAsset,
          videoPrompt: (row.videoPrompt || "").replace(/[\r\n]+/g, ' '),
        };
      }
      return null;
    })
    .filter((row): row is { asset: string; videoPrompt: string } => row !== null);
};

export const createFramesJsonWithImgAndPrompt = (tableData: TableRowData[], filename: string): boolean => {
    const validRows = getValidRowsForJsonExport(tableData);
    if (validRows.length === 0) return false;

    const frames = validRows.map((row, index, arr) => {
        const extension = getExtensionFromDataUrl(row.asset);
        const startFrameName = `${index + 1}${extension}`;
        const nextRow = arr[index + 1];
        const endFrameName = nextRow ? `${index + 2}${getExtensionFromDataUrl(nextRow.asset)}` : "";
        return {
            startFrameName,
            endFrameName,
            prompt: row.videoPrompt,
            base64Data: row.asset,
        };
    });

    const jsonData = { frames };
    const dataStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(blob, filename);
    return true;
};

export const createProjectAssetsZip = (tableData: TableRowData[], filename: string): boolean => {
    const zip = new JSZip();
    let assetCount = 0;

    tableData.forEach(row => {
        if (row.generatedImages.length > 0) {
            const mainIndex = row.mainImageIndex ?? row.generatedImages.length - 1;
            const mainAsset = row.generatedImages[mainIndex];
            if (!mainAsset) return;
            const [header, base64Data] = mainAsset.split(',');
            let extension = '.png'; 
            if (header.includes('image/jpeg')) extension = '.jpeg';
            if (header.includes('video/mp4')) extension = '.mp4';
            const stt = String(row.originalRow[0] || `row_${row.id}`);
            const assetName = `${stt}${extension}`;
            zip.file(assetName, base64Data, { base64: true });
            assetCount++;
        }
    });

    if (assetCount === 0) return false;

    zip.generateAsync({ type: 'blob' }).then((content: any) => {
        downloadFile(content, filename);
    });
    return true;
};

export const createRowAssetsZip = (row: TableRowData, filename: string): boolean => {
    const zip = new JSZip();
    if (row.generatedImages.length === 0) return false;
    
    row.generatedImages.forEach((asset, index) => {
        const [header, base64Data] = asset.split(',');
        let extension = '.png';
        if (header.includes('image/jpeg')) extension = '.jpeg';
        if (header.includes('video/mp4')) extension = '.mp4';
        const assetName = `Asset_${row.id}_v${index + 1}${extension}`;
        zip.file(assetName, base64Data, { base64: true });
    });

    zip.generateAsync({ type: 'blob' }).then((content: any) => {
        downloadFile(content, filename);
    });
    return true;
};

export const parseMarkdownTables = (text: string): string[][] => {
    const allRows: string[][] = [];
    const lines = text.split('\n');
    let inTable = false;
    for (const line of lines) {
        const trimmedLine = line.trim();
        const isSeparator = trimmedLine.startsWith('|') && /\|.*---.*\|/.test(trimmedLine);
        if (isSeparator) {
            inTable = true;
            continue; 
        }
        if (inTable) {
            if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
                const cells = trimmedLine.slice(1, -1).split('|').map(cell => cell.trim());
                const isAnotherSeparator = cells.every(c => /^-+:?-+$/.test(c));
                if (!isAnotherSeparator && cells.some(c => c.length > 0)) {
                    allRows.push(cells);
                }
            } else {
                inTable = false;
            }
        }
    }
    return allRows;
};
