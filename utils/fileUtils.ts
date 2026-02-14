
import type { ExcelRow, TableRowData, Style, Character, AdjustmentOptions } from './types';

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

/**
 * Reads an Excel file and extracts the first column as a list of strings (e.g., API keys).
 * Added to resolve the missing export error in ApiKeyManager.tsx.
 */
export const readKeysFromExcel = async (file: File): Promise<string[]> => {
    try {
        const excelData = await readExcelFile(file);
        if (!excelData || excelData.length < 1) return [];
        
        // Extract first column, skip header if it looks like one (e.g. contains "key")
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
            case 'image/jpeg':
                return '.jpg';
            case 'image/png':
                return '.png';
            default:
                const extension = mimeType[1].split('/')[1];
                return extension ? `.${extension}` : '.png';
        }
    }
    return '.png';
};

export const getPromptForRow = (row: TableRowData, selectedStyle: Style, characters: Character[]): string => {
    if (!selectedStyle?.promptTemplate) return row.contextPrompt || "";

    const selectedCharIndices = row.selectedCharacterIndices;
    let basePrompt = '';
    const originalTemplate = selectedStyle.promptTemplate;

    if (selectedCharIndices.length > 0 && selectedCharIndices[0] >= 0) { 
        let characterDetails = '';
        const characterNames: string[] = [];

        selectedCharIndices.forEach((charIndex) => {
            const character = characters[charIndex];
            if (!character || !character.name) return;
            
            characterNames.push(`"${character.name}"`);
            
            if (character.stylePrompt) {
                characterDetails += `+ ${character.name}: ${character.stylePrompt}\n`;
            }
        });
        
        let template = originalTemplate;
        if (characterNames.length > 0) {
             const multiCharacterInstruction = `**STRICT REFERENCE REQUIRED:** 
I have provided reference images for the following characters: ${characterNames.join(', ')}. 
You MUST adhere strictly to their facial features, hair, age, body type, and clothing from the provided images. 
DO NOT hallucinate new appearances. DO NOT copy the background from reference images.
Only use the reference images for character consistency.
Create the scene context described below.

${characterDetails}`;
            
            // Replace the generic intro with our strong reference instruction
            const introRegex = /^\*\*YÊU CẦU QUAN TRỌNG:[\s\S]*?Vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách sau/s;
            // If the template has the Vietnamese intro, replace it. Otherwise, prepend.
            if (introRegex.test(template)) {
                template = template.replace(introRegex, multiCharacterInstruction);
            } else {
                template = multiCharacterInstruction + "\n" + template;
            }
        }

        basePrompt = template.replace('[CHARACTER_STYLE]', '').replace('[A]', row.contextPrompt);

    } else if (selectedCharIndices.length === 1 && selectedCharIndices[0] === -2) { 
        const randomCharacterInstruction = `**CREATIVE CHARACTER GENERATION:**
Use the provided image purely for ART STYLE reference (lighting, texture, color palette).
DO NOT copy the character in the reference image.
CREATE A NEW CHARACTER based on the scene description below.
Pay attention to age, gender, ethnicity, and clothing described in the prompt.`;
        
        let template = originalTemplate;
        template = template.replace(
            /^\*\*YÊU CẦU QUAN TRỌNG:[\s\S]*?Vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách sau/s,
            randomCharacterInstruction
        );
        template = template.replace('[CHARACTER_STYLE]', '');
        basePrompt = template.replace('[A]', row.contextPrompt);
    } else { 
        const nonCharacterInstruction = `\n\n**SCENE GENERATION:** No specific main characters. Use provided images for ART STYLE consistency only.`;
        const refCharacterIndex = characters.findIndex(c => c && c.images.length > 0);
        let sceneTemplate;

        if (refCharacterIndex === -1) {
             // No reference images at all
            sceneTemplate = originalTemplate.replace(/^\*\*YÊU CẦU QUAN TRỌNG:[\s\S]*?Vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách sau/s, 'Create an image with consistent art style.');
        } else {
             // Has reference images but no character selected for this row
            sceneTemplate = originalTemplate.replace(/^\*\*YÊU CẦU QUAN TRỌNG:[\s\S]*?Vẽ lại nhân vật tôi gửi, với chính xác ngoại hình, trang phục nhưng customize theo phong cách sau/s, `**STYLE REFERENCE ONLY:** Use the provided images for ART STYLE reference (lighting, texture, color palette) ONLY. DO NOT include the characters from the reference images.`);
        }
        sceneTemplate = sceneTemplate.replace(/Chi tiết nhân vật:[\s\S]*?\+ Phong cách vẽ bối cảnh:/s, '+ Phong cách vẽ bối cảnh:');
        sceneTemplate = sceneTemplate.replace('[CHARACTER_STYLE]', '');
        basePrompt = sceneTemplate.replace('[A]', row.contextPrompt) + nonCharacterInstruction;
    }
    return basePrompt.trim();
};

export const getPromptAndPartsForRow = ({
    row,
    rowIndex,
    tableData,
    selectedStyle,
    characters,
    defaultCharacterIndices,
    adjustments,
}: {
    row: TableRowData;
    rowIndex: number;
    tableData: TableRowData[];
    selectedStyle: Style;
    characters: Character[];
    defaultCharacterIndices: number[];
    adjustments?: AdjustmentOptions;
}): { prompt: string; parts: any[] } => {
    let prompt = getPromptForRow(row, selectedStyle, characters);
    const parts: any[] = [];

    const selectedCharIndices = row.selectedCharacterIndices;
    
    // Add Character Reference Images
    if (selectedCharIndices.length > 0 && selectedCharIndices[0] >= 0) { 
        selectedCharIndices.forEach((charIndex) => {
            const character = characters[charIndex];
            if (character && character.images.length > 0) {
                character.images.forEach((imgDataUrl) => {
                    const [header, base64Data] = imgDataUrl.split(',');
                    const mimeType = header.match(/data:(.*);base64/)?.[1] || 'image/png';
                    parts.push({
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType,
                        },
                    });
                });
            }
        });
    } else { 
        // Add Style Reference Image if no character is selected
        const refCharacter = characters.find((c) => c && c.images.length > 0);
        if (refCharacter && refCharacter.images.length > 0) {
            const imgDataUrl = refCharacter.images[0]; 
            const [header, base64Data] = imgDataUrl.split(',');
            const mimeType = header.match(/data:(.*);base64/)?.[1] || 'image/png';
            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            });
        }
    }

    if (adjustments) {
        const ADJUSTMENT_OPTIONS = {
            RE_EVALUATE_LOGIC: 'Logic check: Re-read the scene to ensure logical consistency.',
            BYPASS_POLICY: 'Policy Compliance: Ensure the image adheres to safety guidelines while maintaining the scene\'s intent.',
            STYLE_CONSISTENCY: 'Style Consistency: Match the art style of previous successful images.',
            CHARACTER_STYLE: 'Character Fidelity: Strictly adhere to the character description and reference.',
            CHARACTER_CONSISTENCY: 'Character Consistency: Ensure the character looks the same as in the reference.',
            COSTUME_CONSISTENCY: 'Costume Consistency: Keep the clothing consistent with the scene context.',
            CAMERA_POSITION: 'Camera Angle: Change the camera angle (e.g., from high to low or vice versa).',
            CHARACTER_ANGLE: 'Character Angle: Show the character from a different perspective (e.g., side view, back view).',
            MATCH_ASPECT_RATIO: 'Aspect Ratio: Maintain the aspect ratio of the previous image.',
        };

        let adjustmentText = "\n\n**ADJUSTMENTS:** Based on feedback, apply the following changes:";
        
        adjustments.options.forEach((opt) => {
            const description = ADJUSTMENT_OPTIONS[opt as keyof typeof ADJUSTMENT_OPTIONS];
            if (description) {
                adjustmentText += `\n- ${description}`;
            }
        });

        if (adjustments.manualPrompt) {
            adjustmentText += `\n- User Manual Request: ${adjustments.manualPrompt}`;
            
            const sceneMatches = adjustments.manualPrompt.match(/\[scene_([\w.-]+)\]/g);
            if (sceneMatches) {
                adjustmentText += `\n- Visual References provided from other scenes:`;
                sceneMatches.forEach((match) => {
                    const sceneId = match.match(/\[scene_([\w.-]+)\]/)?.[1];
                    if (sceneId) {
                        const referencedRow = tableData.find((r) => String(r.originalRow[0]) === sceneId);
                        if (referencedRow) {
                            const mainIndex = referencedRow.mainImageIndex > -1 ? referencedRow.mainImageIndex : (referencedRow.generatedImages.length > 0 ? referencedRow.generatedImages.length - 1 : -1);
                            const mainAsset = mainIndex !== -1 ? referencedRow.generatedImages[mainIndex] : null;

                            if (mainAsset && mainAsset.startsWith('data:image')) {
                                const [header, base64Data] = mainAsset.split(',');
                                const mimeType = header.match(/data:(.*);base64/)?.[1] || 'image/png';
                                parts.push({
                                    inlineData: {
                                        data: base64Data,
                                        mimeType: mimeType,
                                    },
                                });
                                adjustmentText += ` (Image included for Scene ${sceneId})`;
                            }
                        }
                    }
                });
            }
        }
        
        if (adjustments.options.length > 0 || adjustments.manualPrompt) {
            prompt += adjustmentText;
        }
    }

    parts.push({ text: prompt });

    return { prompt, parts };
};

const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const exportPromptsToTxt = (tableData: TableRowData[], filename: string) => {
    const prompts = tableData
        .filter(row => row.videoPrompt && row.videoPrompt.trim())
        .map(row => row.videoPrompt!.trim());

    if (prompts.length === 0) {
        alert('Không có prompt video nào được tạo để xuất.');
        return;
    }

    const content = prompts.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, filename);
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
          videoPrompt: row.videoPrompt || "",
        };
      }
      return null;
    })
    .filter((row): row is { asset: string; videoPrompt: string } => row !== null);
};

export const createFramesJsonWithImgAndPrompt = (tableData: TableRowData[], filename: string) => {
    const validRows = getValidRowsForJsonExport(tableData);

    if (validRows.length === 0) {
        alert('Không có ảnh nào được tạo để xuất ra JSON.');
        return;
    }

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
};


export const createProjectAssetsZip = (tableData: TableRowData[], filename: string) => {
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

    if (assetCount === 0) {
        alert('No generated assets to download.');
        return;
    }

    zip.generateAsync({ type: 'blob' }).then(content => {
        downloadFile(content, filename);
    });
};

export const createRowAssetsZip = (row: TableRowData, filename: string) => {
    const zip = new JSZip();
    
    if (row.generatedImages.length === 0) {
        alert('No assets to download for this row.');
        return;
    }
    
    row.generatedImages.forEach((asset, index) => {
        const [header, base64Data] = asset.split(',');
        let extension = '.png';
        if (header.includes('image/jpeg')) extension = '.jpeg';
        if (header.includes('video/mp4')) extension = '.mp4';
        
        const assetName = `Asset_${row.id}_v${index + 1}${extension}`;
        zip.file(assetName, base64Data, { base64: true });
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
        downloadFile(content, filename);
    });
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
                const cells = trimmedLine
                    .slice(1, -1) 
                    .split('|')
                    .map(cell => cell.trim());
                
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
