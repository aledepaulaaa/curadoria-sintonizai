import React from 'react';
import Cropper from 'react-easy-crop';
import { Maximize2, ZoomIn, ZoomOut, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useImageEditor } from '@/src/hooks/useImageEditor';

interface ImageEditorProps {
  imageSrc: string;
  aspectRatio?: number; // Ex: 16/9 ou 1
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  imageSrc,
  aspectRatio = 16 / 9,
  onConfirm,
  onCancel,
}) => {
  const {
    crop,
    setCrop,
    zoom,
    setZoom,
    croppedAreaPixels,
    onCropComplete,
    getCroppedImg,
  } = useImageEditor();

  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    
    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBlob) {
        onConfirm(croppedBlob);
      }
    } catch (error) {
      console.error('Erro ao recortar imagem:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
    >
      <div className="bg-zinc-900 w-full max-w-4xl rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Maximize2 size={18} />
            </div>
            <div>
              <h3 className="text-white font-medium">Ajustar Imagem</h3>
              <p className="text-xs text-zinc-500">Arraste para posicionar e use o zoom para enquadrar</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-white/5 rounded-full text-zinc-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Editor Area */}
        <div className="relative flex-1 bg-black min-h-[300px] md:min-h-[500px]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            classes={{
              containerClassName: "bg-black",
              mediaClassName: "max-w-none",
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-6 bg-zinc-900/80 space-y-6">
          <div className="flex items-center gap-4">
            <ZoomOut size={18} className="text-zinc-500" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <ZoomIn size={18} className="text-zinc-500" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl text-zinc-400 font-medium hover:bg-white/5 transition-colors border border-zinc-800"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`
                flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all
                ${isProcessing 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20'}
              `}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Confirmar Ajuste</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
