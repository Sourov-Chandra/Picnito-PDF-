import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize,
  Sliders,
  FileCheck,
  Eye,
  Maximize,
  StretchHorizontal,
  Check,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  PAPER_SIZES,
  MARGIN_PRESETS,
  getPageDimensions
} from '../utils/paperSizes';
import { PdfPaper } from './PdfPaper';

export function PdfLayoutPreviewModal({
  isOpen,
  images,
  initialIndex = 0,
  settings,
  onUpdateSettings,
  onClose,
  onGeneratePdf,
}) {
  const [currentPageIndex, setCurrentPageIndex] = useState(initialIndex);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Sync initialIndex whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPageIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
    }
  }, [isOpen, initialIndex, images.length]);

  // Keep index in bounds if collection changes
  useEffect(() => {
    if (currentPageIndex >= images.length) {
      setCurrentPageIndex(Math.max(0, images.length - 1));
    }
  }, [images.length, currentPageIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentPageIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentPageIndex((prev) => Math.min(images.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentPageIndex] || images[0];

  const { effectiveOrientation } = getPageDimensions({
    paperSize: settings.paperSize,
    customDimensions: settings.customDimensions,
    orientation: settings.orientation,
    imgWidth: currentImage?.width || 800,
    imgHeight: currentImage?.height || 600,
  });

  const handleSettingChange = (key, value) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleMarginPresetChange = (presetId) => {
    const preset = MARGIN_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onUpdateSettings({
      ...settings,
      marginPreset: presetId,
      margins: {
        top: preset.top,
        right: preset.right,
        bottom: preset.bottom,
        left: preset.left,
      },
    });
  };

  const paperSizeName =
    settings.paperSize === 'custom'
      ? `Custom (${settings.customDimensions?.width || 0}×${settings.customDimensions?.height || 0} ${settings.customDimensions?.unit || 'mm'})`
      : settings.paperSize === 'original'
      ? 'Original Dimensions'
      : settings.paperSize;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="h-16 px-6 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between z-30 shrink-0">
        {/* Left: Sequence & Filename */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#0cb1d6] to-[#a356f6] rounded-xl shadow-md shadow-[#6266f0]/20 text-white font-bold text-xs">
            <Eye className="w-3.5 h-3.5" />
            <span>PDF Print Preview</span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-zinc-400">Page:</span>
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="p-0.5 rounded hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-zinc-100 font-semibold">
              {currentPageIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.min(images.length - 1, prev + 1))}
              disabled={currentPageIndex === images.length - 1}
              className="p-0.5 rounded hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-xs text-zinc-300 font-medium truncate max-w-xs" title={currentImage?.name}>
            {currentImage?.name}
          </span>
        </div>

        {/* Center: Guidelines and Controls Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg hover:border-zinc-700 transition">
            <input
              type="checkbox"
              checked={showGuidelines}
              onChange={(e) => setShowGuidelines(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-indigo-500 accent-[#6266f0]"
            />
            <span>Show Margins</span>
          </label>

          <button
            onClick={() => setShowControls((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              showControls
                ? 'bg-zinc-800 text-[#0cb1d6] border-[#328fe1]/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showControls ? 'Hide Controls' : 'Quick Layout Bar'}</span>
          </button>
        </div>

        {/* Right: Generate PDF & Close */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onGeneratePdf();
            }}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#0cb1d6] via-[#6266f0] to-[#a356f6] hover:brightness-110 active:scale-95 text-white font-semibold text-xs tracking-wide rounded-xl shadow-lg shadow-[#6266f0]/30 transition transform"
          >
            <FileCheck className="w-4 h-4 stroke-[2.5]" />
            <span>Looks Good — Generate PDF</span>
          </button>

          <button
            onClick={onClose}
            title="Close Preview (Esc)"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Preview Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Virtual Canvas Display Area */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative bg-zinc-950/70">
          {/* Navigation Chevron Left */}
          <button
            onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentPageIndex === 0}
            className="absolute left-6 z-20 p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/60 backdrop-blur shadow-2xl disabled:opacity-20 disabled:pointer-events-none transition"
            title="Previous Page (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Virtual Sheet of Paper Container */}
          <PdfPaper
            image={currentImage}
            pageIndex={currentPageIndex}
            totalPages={images.length}
            settings={settings}
            showGuidelines={showGuidelines}
          />

          {/* Navigation Chevron Right */}
          <button
            onClick={() => setCurrentPageIndex((prev) => Math.min(images.length - 1, prev + 1))}
            disabled={currentPageIndex === images.length - 1}
            className="absolute right-6 z-20 p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/60 backdrop-blur shadow-2xl disabled:opacity-20 disabled:pointer-events-none transition"
            title="Next Page (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Status Badge Over Sheet */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-zinc-900/90 border border-zinc-800 px-4 py-1.5 rounded-full text-xs text-zinc-300 backdrop-blur flex items-center gap-3 font-mono shadow-xl z-20">
            <span className="text-[#0cb1d6] font-semibold">{paperSizeName}</span>
            <span>•</span>
            <span className="capitalize">{effectiveOrientation}</span>
            <span>•</span>
            <span className="uppercase text-[#a356f6] font-semibold">{settings.placement}</span>
            <span>•</span>
            <span>
              Margins: {settings.marginPreset === 'none' ? '0 pt' : `${settings.margins.top} pt`}
            </span>
          </div>
        </div>

        {/* Right Quick Layout Control Panel */}
        {showControls && (
          <aside className="w-72 border-l border-zinc-800 bg-zinc-900/95 flex flex-col p-4 space-y-4 text-xs overflow-y-auto shrink-0 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#0cb1d6]" />
                Live Page Tweaks
              </span>
              <span className="text-[10px] text-[#0cb1d6] font-mono">Updates Instantly</span>
            </div>

            {/* Paper Size Quick Selector */}
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Paper Size</label>
              <select
                value={settings.paperSize}
                onChange={(e) => handleSettingChange('paperSize', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-[#6266f0]"
              >
                {PAPER_SIZES.filter((p) => !['original', 'custom'].includes(p.id)).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                <option value="original">Original Image Dimensions</option>
              </select>
            </div>

            {/* Orientation Selector */}
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Orientation</label>
              <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {[
                  { id: 'portrait', label: 'Port' },
                  { id: 'landscape', label: 'Land' },
                  { id: 'auto', label: 'Auto' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSettingChange('orientation', opt.id)}
                    className={`py-1.5 text-center rounded text-[11px] font-medium transition ${
                      settings.orientation === opt.id
                        ? 'bg-zinc-800 text-[#0cb1d6] font-bold border border-[#328fe1]/40'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Placement Mode */}
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Image Placement</label>
              <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {[
                  { id: 'fit', label: 'Fit', icon: Minimize },
                  { id: 'fill', label: 'Fill', icon: Maximize },
                  { id: 'stretch', label: 'Stretch', icon: StretchHorizontal },
                ].map((p) => {
                  const Icon = p.icon;
                  const isSelected = settings.placement === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSettingChange('placement', p.id)}
                      className={`flex flex-col items-center py-2 px-1 rounded text-[11px] font-medium transition ${
                        isSelected
                          ? 'bg-zinc-800 text-[#a356f6] font-bold border border-[#6266f0]/40'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-1" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Margins */}
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Margins</label>
              <div className="grid grid-cols-2 gap-1.5">
                {MARGIN_PRESETS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleMarginPresetChange(m.id)}
                    className={`py-1.5 px-2 text-center rounded-lg border text-[11px] font-medium transition ${
                      settings.marginPreset === m.id
                        ? 'bg-zinc-800 text-[#865df4] border-[#6266f0]/50 font-semibold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {m.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Background */}
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Page Background</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSettingChange('backgroundColor', '#ffffff')}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                    settings.backgroundColor === '#ffffff'
                      ? 'bg-zinc-800 text-white border-[#6266f0]'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-white border border-zinc-400"></div>
                  White
                </button>
                <button
                  type="button"
                  onClick={() => handleSettingChange('backgroundColor', '#000000')}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                    settings.backgroundColor === '#000000'
                      ? 'bg-zinc-800 text-white border-[#6266f0]'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-black border border-zinc-700"></div>
                  Black
                </button>
                <input
                  type="color"
                  value={settings.backgroundColor || '#ffffff'}
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                  title="Choose custom background color"
                />
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Thumbnail Filmstrip */}
      <footer className="h-20 bg-zinc-950/90 border-t border-zinc-800 px-6 flex items-center gap-3 overflow-x-auto shrink-0 z-30">
        <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider shrink-0 pr-2">
          Page Sequence:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {images.map((img, idx) => {
            const isSelected = idx === currentPageIndex;
            const thumbSrc =
              img.thumbnailUrl ||
              img.previewUrl ||
              (img.path ? `picnito-media://media/?path=${encodeURIComponent(img.path)}` : null);

            return (
              <button
                key={img.id || idx}
                onClick={() => setCurrentPageIndex(idx)}
                className={`group relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border transition-all ${
                  isSelected
                    ? 'border-[#6266f0] ring-2 ring-[#6266f0]/50 scale-105 shadow-md shadow-[#6266f0]/20'
                    : 'border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600'
                }`}
                title={`Page ${idx + 1}: ${img.name}`}
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
      </footer>
    </div>
  );
}
