import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { ImageDisplay } from './components/ImageDisplay';
import { generateImage, editImage } from './services/geminiService';
import { AppMode, AspectRatio, GenerateModel } from './types';
import { fileToBase64 } from './utils/file';

export interface ImageFile {
  file: File;
  url: string;
  base64: string;
  mimeType: string;
}

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATE);
  const [prompt, setPrompt] = useState<string>('');
  const [imagesToEdit, setImagesToEdit] = useState<ImageFile[]>([]);
  const [maskData, setMaskData] = useState<string | null>(null);
  
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (model: GenerateModel, aspectRatio: AspectRatio) => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    try {
      const imageUrl = await generateImage(prompt, model, aspectRatio);
      setGeneratedImageUrl(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const handleEdit = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt to describe the edit.');
      return;
    }
    if (imagesToEdit.length === 0) {
      setError('Please upload at least one image to edit.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    try {
      const imagePayloads = imagesToEdit.map(({ base64, mimeType }) => ({ base64, mimeType }));
      let maskPayload: { base64: string; mimeType: string } | null = null;
      if (maskData) {
        maskPayload = {
          base64: maskData.split(',')[1],
          mimeType: 'image/png',
        };
      }
      
      const imageUrl = await editImage(prompt, imagePayloads, maskPayload);
      setGeneratedImageUrl(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, imagesToEdit, maskData]);
  
  const handleFileChange = async (files: FileList | null) => {
    if (files) {
      try {
        const filePromises = Array.from(files).map(async (file) => {
          const { base64, mimeType } = await fileToBase64(file);
          return {
            file,
            url: URL.createObjectURL(file),
            base64,
            mimeType
          };
        });
        const newImages = await Promise.all(filePromises);
        setImagesToEdit(prev => [...prev, ...newImages]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to read file.');
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagesToEdit(prev => {
      const newImages = [...prev];
      const removedImage = newImages.splice(index, 1)[0];
      URL.revokeObjectURL(removedImage.url); // Clean up object URL
      return newImages;
    });
  };

  const resetEditState = () => {
    setImagesToEdit([]);
    setMaskData(null);
    setGeneratedImageUrl(null);
    setError(null);
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white font-sans">
      <div 
        className="fixed inset-0 bg-cover bg-center" 
        style={{backgroundImage: "url('https://picsum.photos/1920/1080?blur=10')"}}
      ></div>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-2xl"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row p-4 md:p-6 gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-[420px] lg:max-h-[calc(100vh-48px)] lg:sticky lg:top-6 flex-shrink-0 bg-black/20 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex flex-col">
          <div className="p-6 flex flex-col h-full">
            <Header />
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
              <ControlPanel
                mode={mode}
                setMode={(newMode) => {
                  if (newMode !== mode) {
                    resetEditState();
                  }
                  setMode(newMode);
                }}
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={handleGenerate}
                onEdit={handleEdit}
                onFileChange={handleFileChange}
                imagesToEdit={imagesToEdit}
                onRemoveImage={handleRemoveImage}
                isLoading={isLoading}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center min-h-0">
          <ImageDisplay
            mode={mode}
            imageUrl={generatedImageUrl}
            editImages={imagesToEdit}
            onMaskChange={setMaskData}
            isLoading={isLoading}
            error={error}
          />
        </main>
      </div>
    </div>
  );
}