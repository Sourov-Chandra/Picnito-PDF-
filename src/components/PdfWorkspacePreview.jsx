import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Eye,
  Sliders,
  LayoutGrid,
  FileCheck
} from 'lucide-react';
import { PdfPaper } from './PdfPaper';
import { PAPER_SIZES, getPageDimensions } from '../utils/paperSizes';

export function PdfWorkspacePreview({
  images = [],
  settings,
  activeIndex = 0,
  onChangeActiveIndex,
  onSwitchToGrid,
  onOpenFullscreenPreview,
  onGeneratePdf,
  isGenerating = false,
}) {
  const [showGuidelines, setShowGuidelines] = useState(true);

  const total = images.length;
  const currentIndex = Math.max(0, Math.min(activeIndex, total - 1));
  const currentImage = images[currentIndex] || images[0];

  const handlePrev = () => {
    if (currentIndex > 0) onChangeActiveIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < total - 1) onChangeActiveIndex(currentIndex + 1);
  };

  // Keyboard navigation within preview mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, total]);

  if (total === 0 || !currentImage) return null;

  const { widthPt, heightPt, effectiveOrientation } = getPageDimensions({
    paperSize: settings.paperSize,
    customDimensions: settings.customDimensions,
    orientation: settings.orientation,
    imgWidth: currentImage.width || 800,
    imgHeight: currentImage.height || 600,
  });

  const paperSizeName =
    settings.paperSize === 'custom'
      ? `Custom (${settings.customDimensions?.width || 0}×${settings.customDimensions?.height || 0} ${settings.customDimensions?.unit || 'mm'})`
      : settings.paperSize === 'original'
      ? 'Original Dimensions'
      : settings.paperSize;

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden select-none">
      {/* Top Workspace Toolbar */}
      <div className="h-14 px-5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between shrink-0 z-10 backdrop-blur">
        {/* Left: View Switcher & Page Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToGrid}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition"
            title="Return to Image Grid"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#0cb1d6]" />
            <span>Grid View</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0cb1d6]/15 to-[#a356f6]/15 border border-[#6266f0]/30 text-xs font-semibold text-white">
            <Eye className="w-3.5 h-3.5 text-[#0cb1d6]" />
            <span>Live PDF Page Preview</span>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-zinc-400">Page:</span>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-0.5 rounded hover:bg-zinc-800 text-zinc-300 disabled:opacity-25 transition"
              title="Previous Page (←)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-zinc-100 font-bold px-1">
              {currentIndex + 1} / {total}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === total - 1}
              className="p-0.5 rounded hover:bg-zinc-800 text-zinc-300 disabled:opacity-25 transition"
              title="Next Page (→)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-xs text-zinc-400 font-medium truncate max-w-xs" title={currentImage.name}>
            {currentImage.name}
          </span>
        </div>

        {/* Right: Margins toggle, Fullscreen & Generate */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer bg-zinc-950/70 border border-zinc-800 px-3 py-1.5 rounded-lg hover:border-zinc-700 transition">
            <input
              type="checkbox"
              checked={showGuidelines}
              onChange={(e) => setShowGuidelines(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-500 accent-[#6266f0]"
            />
            <span>Show Margins</span>
          </label>

          <button
            onClick={onOpenFullscreenPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
            title="Expand to Fullscreen Preview"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#0cb1d6]" />
            <span>Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Main Canvas: Displays the Big Virtual Paper */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden bg-zinc-950/80">
        {/* Navigation Chevron Left */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="absolute left-6 z-20 p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/60 backdrop-blur shadow-2xl disabled:opacity-15 disabled:pointer-events-none transition transform hover:scale-105"
          title="Previous Page (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Paper Sheet Component */}
        <PdfPaper
          image={currentImage}
          pageIndex={currentIndex}
          totalPages={total}
          settings={settings}
          showGuidelines={showGuidelines}
        />

        {/* Navigation Chevron Right */}
        <button
          onClick={handleNext}
          disabled={currentIndex === total - 1}
          className="absolute right-6 z-20 p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/60 backdrop-blur shadow-2xl disabled:opacity-15 disabled:pointer-events-none transition transform hover:scale-105"
          title="Next Page (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Live Spec Badge at bottom center of canvas */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-zinc-900/90 border border-zinc-800 px-4 py-1.5 rounded-full text-xs text-zinc-300 backdrop-blur flex items-center gap-3 font-mono shadow-xl z-10">
          <span className="text-[#0cb1d6] font-semibold">{paperSizeName}</span>
          <span>•</span>
          <span className="capitalize">{effectiveOrientation}</span>
          <span>•</span>
          <span className="uppercase text-[#a356f6] font-semibold">{settings.placement}</span>
          <span>•</span>
          <span>Margins: {settings.marginPreset === 'none' ? '0 pt' : `${settings.margins.top} pt`}</span>
        </div>
      </div>

      {/* Bottom Sequence Filmstrip */}
      <div className="h-20 bg-zinc-900/95 border-t border-zinc-800 px-6 flex items-center gap-3 overflow-x-auto shrink-0 z-10">
        <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider shrink-0 pr-2">
          Pages:
        </span>
        <div className="flex items-center gap-2.5 overflow-x-auto py-1">
          {images.map((img, idx) => {
            const isSelected = idx === currentIndex;
            const thumbSrc =
              img.thumbnailUrl ||
              img.previewUrl ||
              (img.path ? `picnito-media://media/?path=${encodeURIComponent(img.path)}` : null);

            return (
              <button
                key={img.id || idx}
                onClick={() => onChangeActiveIndex(idx)}
                className={`group relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border transition-all ${
                  isSelected
                    ? 'border-[#6266f0] ring-2 ring-[#6266f0]/50 scale-105 shadow-md shadow-[#6266f0]/20'
                    : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                }`}
                title={`Jump to Page ${idx + 1}: ${img.name}`}
              >
                {thumbSrc ? (
                  <img src={thumbSrc} alt={img.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500 text-[10px]">
                    #{idx + 1}
                  </div>
                )}
                <div
                  className={`absolute top-0.5 left-0.5 px-1 py-0.2 rounded text-[9px] font-bold ${
                    isSelected ? 'bg-gradient-to-r from-[#0cb1d6] to-[#a356f6] text-white' : 'bg-black/70 text-zinc-300'
                  }`}
                >
                  #{idx + 1}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
