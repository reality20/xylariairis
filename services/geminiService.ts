import { GoogleGenAI, Modality } from "@google/genai";
import { GenerateModel, AspectRatio } from '../types';

if (!process.env.API_KEY) {
    // In a real app, you would handle this more gracefully.
    // For this environment, we assume the key is set.
    console.warn("API_KEY environment variable not set. Using a placeholder.");
    process.env.API_KEY = "YOUR_API_KEY_HERE"; 
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GENERATE_MODEL_NAME = 'imagen-4.0-generate-001';
const EDIT_MODEL_NAME = 'gemini-2.5-flash-image-preview';

export const generateImage = async (
    prompt: string,
    model: GenerateModel,
    aspectRatio: AspectRatio,
): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: GENERATE_MODEL_NAME,
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("Image generation failed: No images returned.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please check your prompt and API key.");
    }
};

export const editImage = async (
    prompt: string,
    images: { base64: string; mimeType: string }[],
    mask: { base64: string; mimeType: string } | null,
): Promise<string> => {
    try {
        const imageParts = images.map(image => ({
            inlineData: {
                data: image.base64,
                mimeType: image.mimeType,
            },
        }));

        // FIX: Explicitly type `allParts` to allow the array to hold both image and text part objects.
        const allParts: ({ inlineData: { data: string; mimeType: string; } } | { text: string })[] = [...imageParts];
        if (mask) {
            allParts.push({
                inlineData: {
                    data: mask.base64,
                    mimeType: mask.mimeType,
                }
            });
        }
        allParts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: EDIT_MODEL_NAME,
            contents: {
                parts: allParts,
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            const base64ImageBytes: string = imagePart.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("Image editing failed: No image data in response.");
        }
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image. The model may not have been able to fulfill the request.");
    }
};