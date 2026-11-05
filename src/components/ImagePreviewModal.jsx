import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { formatFileSize, formatDimensions } from '../utils/formatters';

export function ImagePreviewModal({
  isOpen,
  image,
  currentIndex,
  totalImages,
  onClose,
  onNext,
  onPrev,
  onRemove,
  onMoveOffset,
}) {
  const [zoom, setZoom] = useState(1);
  const [fitMode, setFitMode] = useState('contain'); // contain or natural

  // Reset zoom whenever viewing a different image
  useEffect(() => {
    setZoom(1);
    setFitMode('contain');
  }, [image?.id]);

  // Keyboard navigation within the modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) onPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < totalImages - 1) onNext();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, totalImages, onPrev, onNext, onClose]);

  if (!isOpen || !image) return null;

  // Determine full resolution source (custom protocol, browser previewUrl, or thumbnail)
  const fullSrc =
    image.fullMediaUrl ||
    image.previewUrl ||
    (image.path ? `picnito-media://media/?path=${encodeURIComponent(image.path)}` : image.thumbnailUrl);

  const handleZoomIn = () => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
  const handleResetZoom = () => setZoom(1);

  const toggleFitMode = () => {
    setFitMode((m) => (m === 'contain' ? 'natural' : 'contain'));
    setZoom(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-150">
      {/* Top Header Bar */}
      <div className="h-16 px-6 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between z-20 shrink-0">
        {/* Left: Sequence Badge & Filename */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <span className="text-xs font-bold text-emerald-400">
              Page #{currentIndex + 1}
            </span>
            <span className="text-[11px] text-zinc-500">of {totalImages}</span>
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-zinc-100 max-w-md truncate">
              {image.name}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <span>{formatDimensions(image.width, image.height)}</span>
              <span>•</span>
              <span>{formatFileSize(image.size)}</span>
              <span>•</span>
              <span className="uppercase">{image.format}</span>
            </div>
          </div>
        </div>

        {/* Center: Zoom & View Controls */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            title="Zoom Out (-)"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-mono text-zinc-300 px-2 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            title="Zoom In (+)"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-zinc-800 mx-1"></div>

          <button
            onClick={handleResetZoom}
            title="Reset Zoom (0)"
            className="px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
          >
            Reset
          </button>

          <button
            onClick={toggleFitMode}
            title="Toggle Fit / 100% Size"
            className="px-2 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/10 rounded transition"
          >
            {fitMode === 'contain' ? '1:1 Size' : 'Fit to Screen'}
          </button>
        </div>

        {/* Right: Sequence Reorder, Delete, Close */}
        <div className="flex items-center gap-2">
          {/* Quick reorder buttons */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => onMoveOffset(currentIndex, -1)}
              disabled={currentIndex === 0}
              title="Move Earlier in Sequence (Page Up)"
              className="px-2 py-1 flex items-center gap-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Earlier</span>
            </button>
            <div className="w-[1px] h-4 bg-zinc-800"></div>
            <button
              onClick={() => onMoveOffset(currentIndex, 1)}
              disabled={currentIndex === totalImages - 1}
              title="Move Later in Sequence (Page Down)"
              className="px-2 py-1 flex items-center gap-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <span>Later</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Delete current image */}
          <button
            onClick={() => onRemove(image.id)}
            title="Remove image from PDF"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            title="Close Preview (Esc)"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Display Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-auto p-4 bg-zinc-950/60">
        {/* Previous Image Chevron */}
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          title="Previous Image (Left Arrow)"
          className="absolute left-6 z-30 p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/60 backdrop-blur shadow-2xl disabled:opacity-20 disabled:pointer-events-none transition transform active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* The Big Image */}
        <div
          className={`flex items-center justify-center transition-transform duration-150 ${
            fitMode === 'contain' ? 'h-full w-full' : ''
          }`}
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={fullSrc}
            alt={image.name}
            className={`rounded-lg shadow-2xl object-contain transition-all select-none ${
              fitMode === 'contain'
                ? 'max-h-[82vh] max-w-[85vw]'
                : 'max-w-none'
            }`}
          />
        </div>

        {/* Next Image Chevron */}
        <button
          onClick={onNext}
          disabled={currentIndex === totalImages - 1}
          title="Next Image (Right Arrow)"
          className="absolute right-6 z-30 p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/60 backdrop-blur shadow-2xl disabled:opacity-20 disabled:pointer-events-none transition transform active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Sequence Bar Indicator */}
      <div className="h-10 px-6 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">→</kbd>
          <span>to navigate</span>
          <span className="mx-2">•</span>
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">+</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">-</kbd>
          <span>to zoom</span>
          <span className="mx-2">•</span>
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">Esc</kbd>
          <span>to close</span>
        </span>

        <span className="text-zinc-500 font-mono">
          File path: {image.path}
        </span>
      </div>
    </div>
  );
}
