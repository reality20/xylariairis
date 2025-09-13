import React, { useState } from 'react';
import { ImageIcon, WarningIcon, DownloadIcon, FullscreenIcon } from './Icons';
import { ImageEditorCanvas } from './ImageEditorCanvas';
// FIX: Import AppMode as a value, not just a type, as it's used for runtime checks.
import { AppMode } from '../types';
import type { ImageFile } from '../App';
import { FullscreenImageViewer } from './FullscreenImageViewer';

interface ImageDisplayProps {
  mode: AppMode;
  imageUrl: string | null;
  editImages: ImageFile[];
  onMaskChange: (dataUrl: string | null) => void;
  isLoading: boolean;
  error: string | null;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ mode, imageUrl, editImages, onMaskChange, isLoading, error }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `xylaria-iris-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenFullscreen = () => {
    if (imageUrl) {
        setIsFullscreen(true);
    }
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  const containerClasses = "relative w-full h-full bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl flex items-center justify-center p-4 overflow-hidden group";

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-gray-300">
          <div className="animate-pulse">
            <ImageIcon />
          </div>
          <p className="mt-4 font-semibold">{mode === AppMode.EDIT ? 'Applying your edits...' : 'Generating your vision...'}</p>
          <p className="text-sm text-gray-400">The AI is working, please wait.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-400">
          <WarningIcon />
          <p className="mt-4 font-semibold">An Error Occurred</p>
          <p className="text-sm text-red-300 max-w-sm">{error}</p>
        </div>
      );
    }

    if (imageUrl) {
      return (
        <img src={imageUrl} alt="Generated output" className="max-w-full max-h-full object-contain rounded-lg" />
      );
    }

    if (mode === AppMode.EDIT && editImages.length > 0) {
        return <ImageEditorCanvas imageUrl={editImages[0].url} onMaskChange={onMaskChange} />;
    }

    return (
      <div className="text-center text-gray-400">
        <ImageIcon />
        <p className="mt-4 font-semibold">Your masterpiece awaits</p>
        <p className="text-sm text-gray-500">{mode === AppMode.EDIT ? 'Upload an image to start editing.' : 'The generated image will appear here.'}</p>
      </div>
    );
  };
  
  return (
    <div className={containerClasses}>
      {renderContent()}

      {imageUrl && !isLoading && !error && (
        <>
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button 
                    onClick={handleOpenFullscreen}
                    className="bg-black/50 text-white backdrop-blur-md border border-white/20 py-2 px-4 rounded-lg flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label="View Fullscreen"
                >
                    <FullscreenIcon />
                    Fullscreen
                </button>
                <button 
                    onClick={handleDownload}
                    className="bg-black/50 text-white backdrop-blur-md border border-white/20 py-2 px-4 rounded-lg flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    aria-label="Download Image"
                >
                    <DownloadIcon />
                    Download
                </button>
            </div>
            {isFullscreen && <FullscreenImageViewer imageUrl={imageUrl} onClose={handleCloseFullscreen} />}
        </>
      )}
    </div>
  );
};