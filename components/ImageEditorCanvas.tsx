import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrushIcon, UndoIcon, ClearIcon } from './Icons';

interface ImageEditorCanvasProps {
  imageUrl: string;
  onMaskChange: (dataUrl: string | null) => void;
}

const ToolButton: React.FC<{ onClick: () => void; children: React.ReactNode; 'aria-label': string, disabled?: boolean }> = ({ onClick, children, 'aria-label': ariaLabel, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        className="bg-black/40 text-white backdrop-blur-md border border-white/20 p-2.5 rounded-lg transition-colors hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {children}
    </button>
);

export const ImageEditorCanvas: React.FC<ImageEditorCanvasProps> = ({ imageUrl, onMaskChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number, y: number } | null>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [history, setHistory] = useState<ImageData[]>([]);

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (canvas && image && image.complete) {
      canvas.width = image.clientWidth;
      canvas.height = image.clientHeight;
      const ctx = getCanvasContext();
      if(ctx && history.length > 0) {
        ctx.putImageData(history[history.length - 1], 0, 0);
      }
    }
  }, [getCanvasContext, history]);

  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      image.onload = resizeCanvas;
      if (image.complete) {
        resizeCanvas();
      }
    }
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [imageUrl, resizeCanvas]);

  const saveToHistory = useCallback(() => {
    const ctx = getCanvasContext();
    if (ctx && canvasRef.current) {
      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistory(prev => [...prev, imageData]);
    }
  }, [getCanvasContext]);

  const handleUndo = () => {
    if (history.length > 1) { // keep the initial blank state
      setHistory(prev => {
        const newHistory = prev.slice(0, -1);
        const ctx = getCanvasContext();
        if (ctx) {
          ctx.putImageData(newHistory[newHistory.length-1], 0, 0);
          updateMaskOutput();
        }
        return newHistory;
      });
    } else {
        handleClear();
    }
  };

  const handleClear = useCallback(() => {
    const ctx = getCanvasContext();
    if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setHistory([]);
        onMaskChange(null);
    }
  }, [getCanvasContext, onMaskChange]);

  const updateMaskOutput = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        onMaskChange(canvas.toDataURL('image/png'));
    }
  }, [onMaskChange]);

  const getPointInCanvas = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const drawLine = (p1: {x:number, y:number}, p2: {x:number, y:number}) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.7)';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastPoint.current = getPointInCanvas(clientX, clientY);
    saveToHistory();
  }, [saveToHistory]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const currentPoint = getPointInCanvas(clientX, clientY);
    if (lastPoint.current && currentPoint) {
      drawLine(lastPoint.current, currentPoint);
      lastPoint.current = currentPoint;
    }
  }, [drawLine, brushSize]);

  const stopDrawing = useCallback(() => {
    isDrawing.current = false;
    lastPoint.current = null;
    updateMaskOutput();
  }, [updateMaskOutput]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="relative w-full h-full">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Image to edit"
          className="w-full h-full object-contain pointer-events-none rounded-lg select-none"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="absolute top-2 left-2 flex flex-col gap-2 p-2 bg-black/30 backdrop-blur-md rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
            <BrushIcon />
            <input
                type="range"
                min="5"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
        </div>
        <div className="flex items-center justify-center gap-2">
            <ToolButton onClick={handleUndo} aria-label="Undo mask stroke" disabled={history.length === 0}><UndoIcon /></ToolButton>
            <ToolButton onClick={handleClear} aria-label="Clear mask" disabled={history.length === 0}><ClearIcon /></ToolButton>
        </div>
      </div>
    </div>
  );
};