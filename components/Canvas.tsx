/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { RotateCcwIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';

interface CanvasProps {
  displayImageUrl: string | null;
  baseImageUrl?: string | null;
  onStartOver: () => void;
  isLoading: boolean;
  loadingMessage: string;
  onSelectPose?: (index: number) => void;
  poseInstructions?: string[];
  currentPoseIndex?: number;
  availablePoseKeys?: string[];
}

const Canvas: React.FC<CanvasProps> = ({ 
  displayImageUrl, 
  baseImageUrl, 
  onStartOver, 
  isLoading, 
  loadingMessage 
}) => {
  const [showBase, setShowBase] = useState(false);

  const currentImage = showBase && baseImageUrl ? baseImageUrl : displayImageUrl;

  const handleDownload = () => {
    if (!displayImageUrl) return;
    const a = document.createElement('a');
    a.href = displayImageUrl;
    a.download = `fitcheck-${Date.now()}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 relative animate-zoom-in group">
      {/* Botao Recomecar */}
      <button 
          onClick={onStartOver}
          className="absolute top-4 left-4 z-30 flex items-center justify-center text-center bg-white/80 border border-gray-300/80 text-gray-700 font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-white hover:border-gray-400 active:scale-95 text-sm backdrop-blur-sm shadow-sm"
      >
          <RotateCcwIcon className="w-4 h-4 mr-2" />
          Recomeçar
      </button>

      {/* Imagem do Provador */}
      <div className="relative w-full h-full flex items-center justify-center">
        {currentImage ? (
          <img
            key={currentImage}
            src={currentImage}
            alt="Modelo no Provador Virtual"
            className="max-w-full max-h-full object-contain transition-opacity duration-300 rounded-lg shadow-md"
          />
        ) : (
            <div className="w-[400px] h-[600px] bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center">
              <Spinner />
              <p className="text-md font-serif text-gray-600 mt-4">Carregando Modelo...</p>
            </div>
        )}
        
        <AnimatePresence>
          {isLoading && (
              <motion.div
                  className="absolute inset-0 bg-white/85 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                  <Spinner />
                  {loadingMessage && (
                      <p className="text-lg font-serif text-gray-800 mt-4 text-center px-4 font-medium">{loadingMessage}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Ajustando a peça ao corpo...</p>
              </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles Uteis no Rodape (Baixar e Comparar) */}
      {displayImageUrl && !isLoading && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 border border-gray-300 shadow-md">
          {baseImageUrl && baseImageUrl !== displayImageUrl && (
            <button
              onMouseDown={() => setShowBase(true)}
              onMouseUp={() => setShowBase(false)}
              onTouchStart={() => setShowBase(true)}
              onTouchEnd={() => setShowBase(false)}
              className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-all active:scale-95 select-none"
              title="Mantenha pressionado para ver a foto original"
            >
              👁️ {showBase ? 'Vendo Original' : 'Segure para Comparar'}
            </button>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center text-xs sm:text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 px-4 py-1.5 rounded-full transition-all active:scale-95 shadow-sm"
          >
            ⬇️ Baixar Foto
          </button>
        </div>
      )}
    </div>
  );
};

export default Canvas;
