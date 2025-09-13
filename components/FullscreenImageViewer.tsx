import React, { useEffect, useCallback } from 'react';
import { CloseIcon } from './Icons';

interface FullscreenImageViewerProps {
  imageUrl: string;
  onClose: () => void;
}

export const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({ imageUrl, onClose }) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    // Prevent background scrolling while the viewer is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Close fullscreen view"
      >
        <CloseIcon />
      </button>
      
      {/* Stop propagation so clicking the image itself doesn't close the modal */}
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <img 
          src={imageUrl} 
          alt="Fullscreen view" 
          className="block max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl" 
        />
      </div>
    </div>
  );
};
