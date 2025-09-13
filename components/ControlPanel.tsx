import React, { useState } from 'react';
import { AppMode, GenerateModel, AspectRatio } from '../types';
import { GenerateIcon, EditIcon, UploadIcon, LandscapeIcon, PortraitIcon, SquareIcon, CloseIcon } from './Icons';
import type { ImageFile } from '../App';

interface ControlPanelProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: (model: GenerateModel, aspectRatio: AspectRatio) => void;
  onEdit: () => void;
  onFileChange: (files: FileList | null) => void;
  imagesToEdit: ImageFile[];
  onRemoveImage: (index: number) => void;
  isLoading: boolean;
}

const ModeButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    type="button"
    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900/50 ${
      active ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/10 hover:bg-white/20 text-gray-200'
    }`}
  >
    {children}
  </button>
);


export const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  setMode,
  prompt,
  setPrompt,
  onGenerate,
  onEdit,
  onFileChange,
  imagesToEdit,
  onRemoveImage,
  isLoading,
}) => {
  const [selectedModel, setSelectedModel] = useState<GenerateModel>(GenerateModel.V4);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (mode === AppMode.GENERATE) {
        onGenerate(selectedModel, aspectRatio);
    } else {
        onEdit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <ModeButton active={mode === AppMode.GENERATE} onClick={() => setMode(AppMode.GENERATE)}>
            <GenerateIcon /> Generate
          </ModeButton>
          <ModeButton active={mode === AppMode.EDIT} onClick={() => setMode(AppMode.EDIT)}>
            <EditIcon /> Edit
          </ModeButton>
        </div>

        <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                {mode === AppMode.GENERATE ? "Describe your vision..." : "How should we change the image?"}
            </label>
            <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={mode === AppMode.EDIT ? "e.g., Add a futuristic helmet to the person in the masked area" : "e.g., A cinematic shot of a neon-lit cyberpunk city in the rain"}
            className="w-full h-28 p-3 bg-white/5 border border-white/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 transition-shadow text-white placeholder-gray-400"
            />
        </div>
        
        {mode === AppMode.GENERATE && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
              <div className="grid grid-cols-2 gap-3">
                <ModelButton modelName="Xylaria Iris v4" active={selectedModel === GenerateModel.V4} onClick={() => setSelectedModel(GenerateModel.V4)} />
                <ModelButton modelName="Xylaria Iris v4 Pro" pro onClick={() => setSelectedModel(GenerateModel.V4_PRO)} active={selectedModel === GenerateModel.V4_PRO} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-3">
                 <AspectButton label="1:1" active={aspectRatio === AspectRatio.SQUARE} onClick={() => setAspectRatio(AspectRatio.SQUARE)}><SquareIcon /></AspectButton>
                 <AspectButton label="16:9" active={aspectRatio === AspectRatio.LANDSCAPE} onClick={() => setAspectRatio(AspectRatio.LANDSCAPE)}><LandscapeIcon /></AspectButton>
                 <AspectButton label="9:16" active={aspectRatio === AspectRatio.PORTRAIT} onClick={() => setAspectRatio(AspectRatio.PORTRAIT)}><PortraitIcon /></AspectButton>
              </div>
            </div>
          </>
        )}

        {mode === AppMode.EDIT && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Upload Image(s)</label>
              <label htmlFor="file-upload" className="cursor-pointer group">
                <div className={`w-full p-4 border-2 border-dashed border-white/30 rounded-lg flex flex-col items-center justify-center transition-colors hover:border-purple-400 hover:bg-white/10`}>
                  <UploadIcon />
                  <p className="mt-2 text-sm text-gray-400">Click to upload or drag & drop</p>
                </div>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleFileChange} />
              </label>
            </div>

            {imagesToEdit.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {imagesToEdit.map((image, index) => (
                        <div key={image.url} className="relative group aspect-square">
                            <img src={image.url} alt={`upload preview ${index}`} className="w-full h-full object-cover rounded-md" />
                            <button
                                type="button"
                                onClick={() => onRemoveImage(index)}
                                className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                aria-label="Remove image"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <p className="text-xs text-center text-gray-400">Model: Xylaria Iris v4-edit</p>
          </div>
        )}
      </div>
      
      <div className="mt-auto pt-6">
        <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
        >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
                </>
            ) : (
                mode === AppMode.GENERATE ? 'Generate' : 'Apply Edit'
            )}
        </button>
      </div>
    </form>
  );
};

const ModelButton: React.FC<{ modelName: string; pro?: boolean; active: boolean; onClick: () => void; }> = ({ modelName, pro, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 text-left relative overflow-hidden group ${active ? 'bg-white/20 text-white ring-2 ring-purple-400' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
    >
        {modelName}
        {pro && <span className="absolute top-1 right-1 text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-full">PRO</span>}
        <div className={`absolute bottom-0 left-0 h-0.5 bg-purple-400 transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`}/>
    </button>
);

const AspectButton: React.FC<{ label: string; active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ label, active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-300 text-xs ${active ? 'bg-white/20 text-white ring-2 ring-purple-400' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
    >
        {children}
        {label}
    </button>
);