import { GoogleGenAI } from "@google/genai";

export function createProxyClient(apiKey: string, baseUrl: string, format: 'gemini' | 'openai' = 'gemini') {
    const translateContentsToMessages = (contents: any) => {
        const messages: any[] = [];
        if (typeof contents === 'string') {
            messages.push({ role: 'user', content: contents });
        } else if (Array.isArray(contents)) {
            contents.forEach((c: any) => {
                const role = c.role === 'model' ? 'assistant' : (c.role || 'user');
                const content = Array.isArray(c.parts) ? c.parts.map((p: any) => p.text).join('') : (c.text || '');
                messages.push({ role, content });
            });
        } else if (contents && contents.parts) {
            messages.push({ role: 'user', content: contents.parts.map((p: any) => p.text).join('') });
        }
        return messages;
    };

    return {
        models: {
            generateContent: async (params: any) => {
                const model = params.model.replace('models/', '');
                
                if (format === 'openai') {
                    const messages = translateContentsToMessages(params.contents);
                    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: messages,
                            stream: false,
                            temperature: params.config?.temperature ?? 0.7,
                            max_tokens: params.config?.maxOutputTokens,
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error?.message || `Key4U API Error: ${response.status}`);
                    }

                    const data = await response.json();
                    const textContent = data.choices[0].message.content;
                    
                    return {
                        text: textContent,
                        candidates: [{ content: { parts: [{ text: textContent }] } }]
                    };
                } else {
                    // Gemini native format via proxy
                    const response = await fetch(`${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            contents: Array.isArray(params.contents) ? params.contents : [params.contents],
                            generationConfig: params.config
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error?.message || `Gemini Proxy Error: ${response.status}`);
                    }

                    const data = await response.json();
                    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    
                    return {
                        text: textContent,
                        candidates: data.candidates
                    };
                }
            },
            generateContentStream: async function* (params: any) {
                const model = params.model.replace('models/', '');
                
                if (format === 'openai') {
                    const messages = translateContentsToMessages(params.contents);
                    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: messages,
                            stream: true,
                            temperature: params.config?.temperature ?? 0.7,
                            max_tokens: params.config?.maxOutputTokens,
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error?.message || `Key4U API Error: ${response.status}`);
                    }

                    const reader = response.body?.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

                    if (reader) {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            
                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split('\n');
                            buffer = lines.pop() || '';

                            for (const line of lines) {
                                const trimmedLine = line.trim();
                                if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
                                if (trimmedLine.startsWith('data: ')) {
                                    try {
                                        const data = JSON.parse(trimmedLine.slice(6));
                                        const content = data.choices[0]?.delta?.content || '';
                                        if (content) {
                                            yield {
                                                text: content,
                                                candidates: [{ content: { parts: [{ text: content }] } }]
                                            };
                                        }
                                    } catch (e) {
                                        console.error('Error parsing stream chunk', e);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // Gemini native format streaming via proxy
                    const response = await fetch(`${baseUrl}/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            contents: Array.isArray(params.contents) ? params.contents : [params.contents],
                            generationConfig: params.config
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error?.message || `Gemini Proxy Error: ${response.status}`);
                    }

                    const reader = response.body?.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

                    if (reader) {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            
                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split('\n');
                            buffer = lines.pop() || '';

                            for (const line of lines) {
                                const trimmedLine = line.trim();
                                if (!trimmedLine) continue;
                                // Gemini stream is an array of objects
                                try {
                                    const cleanedLine = trimmedLine.replace(/^\[/, '').replace(/,$/, '').replace(/\]$/, '');
                                    if (!cleanedLine) continue;
                                    const data = JSON.parse(cleanedLine);
                                    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                                    if (content) {
                                        yield {
                                            text: content,
                                            candidates: data.candidates
                                        };
                                    }
                                } catch (e) {
                                    // Sometimes multiple objects in one line or partial JSON
                                }
                            }
                        }
                    }
                }
            }
        },
        chats: {
            create: (config: any) => {
                let history: any[] = [];
                return {
                    sendMessage: async (params: any) => {
                        const message = typeof params === 'string' ? params : params.message;
                        history.push({ role: 'user', parts: [{ text: message }] });
                        const response = await createProxyClient(apiKey, baseUrl, format).models.generateContent({
                            model: config.model,
                            contents: history,
                            config: config.config
                        });
                        history.push({ role: 'model', parts: [{ text: response.text }] });
                        return response;
                    },
                    sendMessageStream: async function* (params: any) {
                        const message = typeof params === 'string' ? params : params.message;
                        history.push({ role: 'user', parts: [{ text: message }] });
                        const stream = createProxyClient(apiKey, baseUrl, format).models.generateContentStream({
                            model: config.model,
                            contents: history,
                            config: config.config
                        });
                        let fullText = '';
                        for await (const chunk of stream) {
                            fullText += chunk.text;
                            yield chunk;
                        }
                        history.push({ role: 'model', parts: [{ text: fullText }] });
                    }
                };
            }
        }
    };
}
