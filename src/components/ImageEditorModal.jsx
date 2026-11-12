import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Wand2,
  Crop,
  Sun,
  Contrast,
  RotateCcw as ResetIcon,
  Check,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import {
  EDIT_FILTERS,
  CROP_PRESETS,
  DEFAULT_EDITS,
  getImageEditStyles,
  hasActiveEdits
} from '../utils/imageEdits';
import { formatDimensions, formatFileSize } from '../utils/formatters';

export function ImageEditorModal({
  isOpen,
  image,
  index = 0,
  total = 1,
  selectedCount = 0,
  onClose,
  onSaveEdits,
}) {
  const [edits, setEdits] = useState(DEFAULT_EDITS);
  const [activeCropPreset, setActiveCropPreset] = useState('free');
  const [isCropping, setIsCropping] = useState(false);
  const [applyToAllSelected, setApplyToAllSelected] = useState(false);

  // Initialize edits when opened
  useEffect(() => {
    if (isOpen && image) {
      setEdits(image.edits || { ...DEFAULT_EDITS });
      setIsCropping(!!image.edits?.crop);
      setApplyToAllSelected(false);
    }
  }, [isOpen, image]);

  if (!isOpen || !image) return null;

  const imgSrc =
    image.fullMediaUrl ||
    image.previewUrl ||
    (image.path ? `picnito-media://media/?path=${encodeURIComponent(image.path)}` : image.thumbnailUrl);

  const fallbackSrc = image.thumbnailUrl || image.previewUrl;

  // Handlers for adjustments
  const handleRotate = (delta) => {
    setEdits((prev) => ({
      ...prev,
      rotation: (((prev.rotation || 0) + delta) % 360 + 360) % 360,
    }));
  };

  const handleFlipH = () => {
    setEdits((prev) => ({ ...prev, flipH: !prev.flipH }));
  };

  const handleFlipV = () => {
    setEdits((prev) => ({ ...prev, flipV: !prev.flipV }));
  };

  const handleFilterChange = (filterId) => {
    setEdits((prev) => ({ ...prev, filter: filterId }));
  };

  const handleBrightnessChange = (val) => {
    setEdits((prev) => ({ ...prev, brightness: parseInt(val, 10) }));
  };

  const handleContrastChange = (val) => {
    setEdits((prev) => ({ ...prev, contrast: parseInt(val, 10) }));
  };

  const handleReset = () => {
    setEdits({ ...DEFAULT_EDITS });
    setIsCropping(false);
  };

  const handleApplyPresetCrop = (presetId) => {
    setActiveCropPreset(presetId);
    setIsCropping(true);

    if (presetId === 'free') {
      // 80% centered crop
      setEdits((prev) => ({
        ...prev,
        crop: { x: 10, y: 10, width: 80, height: 80 },
      }));
    } else if (presetId === 'original') {
      setEdits((prev) => ({ ...prev, crop: null }));
      setIsCropping(false);
    } else {
      const preset = CROP_PRESETS.find((p) => p.id === presetId);
      if (preset && typeof preset.ratio === 'number') {
        const ratio = preset.ratio;
        // Calculate crop bounds to fit inside 80% box
        let cropW = 80;
        let cropH = 80;
        const imgAspect = (image.width || 800) / (image.height || 600);

        if (ratio > imgAspect) {
          cropW = 80;
          cropH = Math.min(80, (80 * imgAspect) / ratio);
        } else {
          cropH = 80;
          cropW = Math.min(80, (80 * ratio) / imgAspect);
        }

        setEdits((prev) => ({
          ...prev,
          crop: {
            x: Math.round((100 - cropW) / 2),
            y: Math.round((100 - cropH) / 2),
            width: Math.round(cropW),
            height: Math.round(cropH),
          },
        }));
      }
    }
  };

  const handleSave = () => {
    const finalEdits = hasActiveEdits(edits) ? edits : null;
    onSaveEdits(image.id, finalEdits, applyToAllSelected);
    onClose();
  };

  // Keyboard shortcut support
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const editStyles = getImageEditStyles(edits);

  return (
    <div
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <header className="h-16 px-6 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#0cb1d6] to-[#a356f6] rounded-xl shadow-md shadow-[#6266f0]/20 text-white font-bold text-xs">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Image Editor & Document Enhancer</span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-mono">
            <span className="text-zinc-400">Page:</span>
            <span className="text-[#0cb1d6] font-bold">#{index + 1}</span>
            <span className="text-zinc-500">of {total}</span>
          </div>

          <span className="text-xs text-zinc-300 font-medium truncate max-w-xs" title={image.name}>
            {image.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={!hasActiveEdits(edits)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Reset all edits to original image"
          >
            <ResetIcon className="w-3.5 h-3.5" />
            <span>Reset Edits</span>
          </button>

          <button
            onClick={onClose}
            title="Cancel & Close (Esc)"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace (Canvas + Controls Sidebar) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visual Preview Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden relative bg-zinc-950/80">
          <div className="relative max-w-full max-h-[72vh] flex items-center justify-center">
            {/* Image Container with Live Rotation and Filters */}
            <div
              className="relative transition-all duration-200 rounded-lg shadow-2xl overflow-hidden border border-zinc-800 flex items-center justify-center bg-black"
              style={{
                filter: editStyles.filter,
              }}
            >
              <img
                src={imgSrc}
                alt={image.name}
                onError={(e) => {
                  if (fallbackSrc && e.target.src !== fallbackSrc) e.target.src = fallbackSrc;
                }}
                className="max-h-[68vh] max-w-[55vw] object-contain select-none transition-transform duration-200 pointer-events-none"
                style={{
                  transform: editStyles.transform,
                }}
                draggable={false}
              />

              {/* Crop Boundary Visual Overlay */}
              {isCropping && edits.crop && (
                <div
                  className="absolute border-2 border-[#0cb1d6] shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] pointer-events-none"
                  style={{
                    top: `${edits.crop.y}%`,
                    left: `${edits.crop.x}%`,
                    width: `${edits.crop.width}%`,
                    height: `${edits.crop.height}%`,
                  }}
                >
                  {/* Grid Lines (Rule of Thirds) */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40 pointer-events-none">
                    <div className="border-r border-b border-[#0cb1d6]/60"></div>
                    <div className="border-r border-b border-[#0cb1d6]/60"></div>
                    <div className="border-b border-[#0cb1d6]/60"></div>
                    <div className="border-r border-b border-[#0cb1d6]/60"></div>
                    <div className="border-r border-b border-[#0cb1d6]/60"></div>
                    <div className="border-b border-[#0cb1d6]/60"></div>
                    <div className="border-r border-[#0cb1d6]/60"></div>
                    <div className="border-r border-[#0cb1d6]/60"></div>
                    <div></div>
                  </div>

                  {/* Corner Handles */}
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#0cb1d6] rounded-sm"></div>
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#0cb1d6] rounded-sm"></div>
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#0cb1d6] rounded-sm"></div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#0cb1d6] rounded-sm"></div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Transform Pill under Image */}
          <div className="mt-4 flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-xl shadow-lg backdrop-blur">
            <button
              onClick={() => handleRotate(-90)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
              title="Rotate 90° Counter-Clockwise"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#0cb1d6]" />
              <span>Rotate Left</span>
            </button>

            <button
              onClick={() => handleRotate(90)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#0cb1d6]" />
              <span>Rotate Right</span>
            </button>

            <div className="w-[1px] h-4 bg-zinc-800 mx-1"></div>

            <button
              onClick={handleFlipH}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                edits.flipH
                  ? 'bg-zinc-800 text-[#a356f6] font-semibold border border-[#6266f0]/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title="Flip Horizontally"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Flip H</span>
            </button>

            <button
              onClick={handleFlipV}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                edits.flipV
                  ? 'bg-zinc-800 text-[#a356f6] font-semibold border border-[#6266f0]/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title="Flip Vertically"
            >
              <FlipVertical className="w-3.5 h-3.5" />
              <span>Flip V</span>
            </button>
          </div>
        </div>

        {/* Right Tools & Adjustments Sidebar */}
        <aside className="w-80 border-l border-zinc-800 bg-zinc-900/95 flex flex-col p-5 space-y-5 text-xs overflow-y-auto shrink-0 select-none">
          {/* Section: Document & Color Filters */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-zinc-200 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0cb1d6]" />
                Document & Color Filters
              </label>
              <span className="text-[10px] text-[#0cb1d6] font-mono">1-Click</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {EDIT_FILTERS.map((f) => {
                const isSelected = edits.filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFilterChange(f.id)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#0cb1d6]/15 to-[#a356f6]/15 border-[#6266f0] ring-1 ring-[#6266f0]/40 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-xs text-zinc-100">{f.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-[#0cb1d6] stroke-[3]" />}
                    </div>
                    <span className="text-[10px] text-zinc-400 leading-tight">{f.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Brightness & Contrast Sliders */}
          <div className="space-y-4 p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl">
            {/* Brightness */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Brightness
                </span>
                <span className="font-mono text-zinc-400">{edits.brightness || 100}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="180"
                value={edits.brightness || 100}
                onChange={(e) => handleBrightnessChange(e.target.value)}
                className="w-full accent-[#0cb1d6] cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-[#a356f6]" />
                  Contrast
                </span>
                <span className="font-mono text-zinc-400">{edits.contrast || 100}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="180"
                value={edits.contrast || 100}
                onChange={(e) => handleContrastChange(e.target.value)}
                className="w-full accent-[#a356f6] cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Crop & Framing */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-zinc-200 font-semibold flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-[#328fe1]" />
                Crop & Frame Bounds
              </label>
              {isCropping && (
                <button
                  onClick={() => handleApplyPresetCrop('original')}
                  className="text-[10px] text-rose-400 hover:underline"
                >
                  Clear Crop
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {CROP_PRESETS.map((p) => {
                const isSelected = activeCropPreset === p.id && isCropping;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPresetCrop(p.id)}
                    className={`py-1.5 px-2.5 rounded-lg border text-center text-xs font-medium transition ${
                      isSelected
                        ? 'bg-zinc-800 text-[#0cb1d6] border-[#328fe1]/50 font-semibold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Batch Option for Multi-Selected Items */}
          {selectedCount > 1 && (
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-200 font-medium">
                <input
                  type="checkbox"
                  checked={applyToAllSelected}
                  onChange={(e) => setApplyToAllSelected(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-500 accent-[#6266f0]"
                />
                <span>Apply to all {selectedCount} selected images</span>
              </label>
              <p className="text-[10px] text-zinc-400 pl-6 leading-tight">
                Applies the same rotation, filter, and color adjustments across the entire batch.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 border-t border-zinc-800 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-700/80 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-medium transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0cb1d6] via-[#6266f0] to-[#a356f6] hover:brightness-110 active:scale-98 text-white font-semibold text-xs tracking-wide shadow-lg shadow-[#6266f0]/30 transition transform flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Apply Changes</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
