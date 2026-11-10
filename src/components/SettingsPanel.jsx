import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Maximize,
  Minimize,
  StretchHorizontal,
  Folder,
  FolderOpen,
  FileText,
  Check,
  CheckSquare,
  Square,
  Eye
} from 'lucide-react';
import {
  PAPER_SIZES,
  MARGIN_PRESETS,
  QUALITY_PRESETS,
  convertToPoints
} from '../utils/paperSizes';

export function SettingsPanel({
  settings,
  onUpdateSettings,
  isOpen,
  onToggleOpen,
  onOpenLayoutPreview,
  hasImages = false,
}) {
  const [defaultPaths, setDefaultPaths] = useState({
    desktop: '',
    documents: '',
    downloads: '',
  });

  // Fetch OS default paths (Desktop, Documents, Downloads) on mount
  useEffect(() => {
    if (window.electronAPI?.getDefaultPaths) {
      window.electronAPI.getDefaultPaths().then((paths) => {
        if (paths) {
          setDefaultPaths(paths);
          // If no output folder is set yet, default to Desktop
          if (!settings.outputFolder && paths.desktop) {
            onUpdateSettings({ ...settings, outputFolder: paths.desktop });
          }
        }
      });
    }
  }, []);

  const handleChange = (key, value) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleChooseOutputFolder = async () => {
    if (window.electronAPI?.selectOutputFolder) {
      const selected = await window.electronAPI.selectOutputFolder();
      if (selected) {
        onUpdateSettings({
          ...settings,
          outputFolder: selected,
        });
      }
    } else {
      alert('Folder selection is available in the Picnito PDF desktop app.');
    }
  };

  const handleCustomDimensionChange = (field, val) => {
    const nextCustom = { ...settings.customDimensions, [field]: val };
    const widthPt = convertToPoints(nextCustom.width, nextCustom.unit);
    const heightPt = convertToPoints(nextCustom.height, nextCustom.unit);
    onUpdateSettings({
      ...settings,
      customDimensions: {
        ...nextCustom,
        widthPt,
        heightPt,
      },
    });
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

  const handleCustomMarginChange = (side, val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    onUpdateSettings({
      ...settings,
      marginPreset: 'custom',
      margins: {
        ...settings.margins,
        [side]: num,
      },
    });
  };

  return (
    <aside className="w-84 border-l border-zinc-800 bg-zinc-900/95 flex flex-col h-full shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="h-16 border-b border-zinc-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#0cb1d6] to-[#a356f6] flex items-center justify-center p-0.5 shadow-md shadow-[#6266f0]/20">
            <Sliders className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-zinc-100">
            Output & PDF Settings
          </span>
        </div>
      </div>

      {/* Settings Form Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* Preview PDF Layout Button */}
        <button
          type="button"
          onClick={onOpenLayoutPreview}
          disabled={!hasImages}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-[#0cb1d6]/10 via-[#6266f0]/10 to-[#a356f6]/10 hover:from-[#0cb1d6]/20 hover:to-[#a356f6]/20 active:scale-98 text-zinc-100 font-semibold rounded-xl border border-[#6266f0]/40 transition disabled:opacity-40 disabled:pointer-events-none group shadow-sm"
        >
          <Eye className="w-4 h-4 text-[#0cb1d6] group-hover:scale-110 transition-transform" />
          <span>Preview PDF Page Layout</span>
        </button>

        {/* ========================================================
            0. Output Folder & Checkbox Mark Selection (Updated UI)
            ======================================================== */}
        <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <label className="text-zinc-200 font-semibold flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-[#328fe1]" />
              Output Destination
            </label>
            <span className="text-[10px] text-[#328fe1] font-medium bg-[#328fe1]/10 px-2 py-0.5 rounded-full border border-[#328fe1]/20">
              Save Folder
            </span>
          </div>

          {/* Folder Path and Browse Button */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                title={settings.outputFolder || 'No folder selected'}
                className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-2 text-zinc-200 text-[11px] truncate font-mono"
              >
                {settings.outputFolder || 'Select a folder below...'}
              </div>
              <button
                type="button"
                onClick={handleChooseOutputFolder}
                className="px-3 py-2 bg-gradient-to-r from-[#0cb1d6] to-[#6266f0] hover:brightness-110 active:scale-95 text-white font-semibold rounded-lg transition shadow-md shadow-[#6266f0]/20 flex items-center gap-1.5 shrink-0"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Browse
              </button>
            </div>

            {/* Quick Folder Preset Shortcuts (Desktop, Documents, Downloads) */}
            {defaultPaths.desktop && (
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-zinc-500">Quick set:</span>
                <button
                  type="button"
                  onClick={() => handleChange('outputFolder', defaultPaths.desktop)}
                  className={`px-2 py-0.5 rounded text-[10px] transition border ${
                    settings.outputFolder === defaultPaths.desktop
                      ? 'bg-[#6266f0]/20 text-[#865df4] border-[#6266f0]/50 font-medium'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  Desktop
                </button>
                {defaultPaths.documents && (
                  <button
                    type="button"
                    onClick={() => handleChange('outputFolder', defaultPaths.documents)}
                    className={`px-2 py-0.5 rounded text-[10px] transition border ${
                      settings.outputFolder === defaultPaths.documents
                        ? 'bg-[#6266f0]/20 text-[#865df4] border-[#6266f0]/50 font-medium'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    Documents
                  </button>
                )}
                {defaultPaths.downloads && (
                  <button
                    type="button"
                    onClick={() => handleChange('outputFolder', defaultPaths.downloads)}
                    className={`px-2 py-0.5 rounded text-[10px] transition border ${
                      settings.outputFolder === defaultPaths.downloads
                        ? 'bg-[#6266f0]/20 text-[#865df4] border-[#6266f0]/50 font-medium'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    Downloads
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Ask Each Time as a Checkbox / Mark Selection */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-2 mt-1 border-t border-zinc-800/80 group">
            <div className="mt-0.5 relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={!!settings.askEachTime}
                onChange={(e) => handleChange('askEachTime', e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border transition flex items-center justify-center ${
                  settings.askEachTime
                    ? 'bg-gradient-to-r from-[#0cb1d6] to-[#6266f0] border-transparent shadow-sm'
                    : 'bg-zinc-900 border-zinc-700 group-hover:border-zinc-500'
                }`}
              >
                {settings.askEachTime && (
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                )}
              </div>
            </div>
            <div className="flex flex-col select-none">
              <span className="text-zinc-200 font-medium text-xs group-hover:text-white transition">
                Always ask where to save each time
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">
                {settings.askEachTime
                  ? 'Prompts with Windows Save dialog before generating'
                  : 'Directly saves to the output folder without prompt'}
              </span>
            </div>
          </label>

          {/* PDF Filename Input */}
          <div className="pt-2 border-t border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 block mb-1">
              PDF Filename:
            </span>
            <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 focus-within:border-[#6266f0] transition">
              <FileText className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
              <input
                type="text"
                value={settings.outputFilename || 'Picnito_Document.pdf'}
                onChange={(e) => handleChange('outputFilename', e.target.value)}
                placeholder="Picnito_Document.pdf"
                className="bg-transparent w-full text-zinc-100 text-xs focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* 1. Paper Size */}
        <div>
          <label className="block text-zinc-300 font-medium mb-2">
            Paper Size
          </label>
          <select
            value={settings.paperSize}
            onChange={(e) => handleChange('paperSize', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-[#6266f0] font-medium transition"
          >
            <optgroup label="International / Standard">
              {PAPER_SIZES.filter((p) => p.category === 'ISO Standard').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.widthMm} × {p.heightMm} mm)
                </option>
              ))}
            </optgroup>
            <optgroup label="ISO B Series">
              {PAPER_SIZES.filter((p) => p.category === 'ISO B Series').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.widthMm} × {p.heightMm} mm)
                </option>
              ))}
            </optgroup>
            <optgroup label="North American">
              {PAPER_SIZES.filter((p) => p.category === 'North American').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.widthIn} × {p.heightIn} in)
                </option>
              ))}
            </optgroup>
            <optgroup label="Special Options">
              <option value="original">Original Image Dimensions</option>
              <option value="custom">Custom Dimensions</option>
            </optgroup>
          </select>

          {/* Custom Paper Size Inputs */}
          {settings.paperSize === 'custom' && (
            <div className="mt-3 p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Width</span>
                  <input
                    type="number"
                    min="10"
                    step="0.1"
                    value={settings.customDimensions.width}
                    onChange={(e) => handleCustomDimensionChange('width', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:outline-none focus:border-[#6266f0]"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">Height</span>
                  <input
                    type="number"
                    min="10"
                    step="0.1"
                    value={settings.customDimensions.height}
                    onChange={(e) => handleCustomDimensionChange('height', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:outline-none focus:border-[#6266f0]"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Unit</span>
                <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-800">
                  {['mm', 'cm', 'in'].map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleCustomDimensionChange('unit', unit)}
                      className={`py-1 text-center font-medium rounded transition ${
                        settings.customDimensions.unit === unit
                          ? 'bg-gradient-to-r from-[#0cb1d6] to-[#6266f0] text-white font-bold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Orientation */}
        <div>
          <label className="block text-zinc-300 font-medium mb-2">
            Page Orientation
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            {[
              { id: 'portrait', label: 'Portrait' },
              { id: 'landscape', label: 'Landscape' },
              { id: 'auto', label: 'Auto (Per Image)' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleChange('orientation', opt.id)}
                className={`py-2 px-1 text-center rounded-md font-medium transition ${
                  settings.orientation === opt.id
                    ? 'bg-zinc-800 text-[#0cb1d6] border border-[#328fe1]/40 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Image Placement */}
        <div>
          <label className="block text-zinc-300 font-medium mb-2">
            Image Placement
          </label>
          <div className="space-y-1.5">
            {[
              {
                id: 'fit',
                title: 'Fit to Page',
                desc: 'Preserve whole image and aspect ratio (leaves border space if needed)',
                icon: Minimize,
              },
              {
                id: 'fill',
                title: 'Fill Page',
                desc: 'Fill entire printable area (aspect ratio preserved, excess clipped)',
                icon: Maximize,
              },
              {
                id: 'stretch',
                title: 'Stretch to Page',
                desc: 'Fill exact printable bounds (aspect ratio distorted)',
                icon: StretchHorizontal,
              },
            ].map((p) => {
              const Icon = p.icon;
              const isSelected = settings.placement === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleChange('placement', p.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition flex items-start gap-2.5 ${
                    isSelected
                      ? 'border-[#6266f0]/80 bg-[#6266f0]/10 text-zinc-100 shadow-sm'
                      : 'border-zinc-800/80 hover:border-zinc-700 bg-zinc-950/40 text-zinc-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#0cb1d6]' : 'text-zinc-500'}`} />
                  <div>
                    <div className={`font-semibold ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>
                      {p.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                      {p.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Page Margins */}
        <div>
          <label className="block text-zinc-300 font-medium mb-2">
            Page Margins
          </label>
          <div className="grid grid-cols-2 gap-1.5 mb-2.5">
            {MARGIN_PRESETS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleMarginPresetChange(m.id)}
                className={`py-1.5 px-2 text-center rounded-lg border text-xs font-medium transition ${
                  settings.marginPreset === m.id
                    ? 'bg-zinc-800 text-[#865df4] border-[#6266f0]/50 font-semibold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m.name.split(' (')[0]}
              </button>
            ))}
          </div>

          {/* Custom Margins Inputs */}
          {settings.marginPreset === 'custom' && (
            <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-zinc-400 block mb-0.5">Top (pt)</span>
                <input
                  type="number"
                  min="0"
                  value={settings.margins.top}
                  onChange={(e) => handleCustomMarginChange('top', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2 py-1 text-zinc-100 font-mono text-xs focus:border-[#6266f0]"
                />
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Bottom (pt)</span>
                <input
                  type="number"
                  min="0"
                  value={settings.margins.bottom}
                  onChange={(e) => handleCustomMarginChange('bottom', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2 py-1 text-zinc-100 font-mono text-xs focus:border-[#6266f0]"
                />
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Left (pt)</span>
                <input
                  type="number"
                  min="0"
                  value={settings.margins.left}
                  onChange={(e) => handleCustomMarginChange('left', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2 py-1 text-zinc-100 font-mono text-xs focus:border-[#6266f0]"
                />
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Right (pt)</span>
                <input
                  type="number"
                  min="0"
                  value={settings.margins.right}
                  onChange={(e) => handleCustomMarginChange('right', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2 py-1 text-zinc-100 font-mono text-xs focus:border-[#6266f0]"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. Page Background */}
        <div>
          <label className="block text-zinc-300 font-medium mb-2">
            Page Background Color
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleChange('backgroundColor', '#ffffff')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                settings.backgroundColor === '#ffffff'
                  ? 'bg-zinc-800 text-white border-[#6266f0]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white border border-zinc-400"></div>
              White
            </button>
            <button
              type="button"
              onClick={() => handleChange('backgroundColor', '#000000')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                settings.backgroundColor === '#000000'
                  ? 'bg-zinc-800 text-white border-[#6266f0]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-zinc-700"></div>
              Black
            </button>
            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        </div>

        {/* 6. Image Quality Presets */}
        <div>
          <label className="block text-zinc-300 font-medium mb-2">
            Image Quality & Compression
          </label>
          <div className="space-y-1.5">
            {QUALITY_PRESETS.map((q) => {
              const isSelected = settings.qualityPreset === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => handleChange('qualityPreset', q.id)}
                  className={`p-2 rounded-lg border cursor-pointer transition ${
                    isSelected
                      ? 'border-[#6266f0]/80 bg-[#6266f0]/10'
                      : 'border-zinc-800/80 hover:border-zinc-700 bg-zinc-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isSelected ? 'text-[#a356f6]' : 'text-zinc-200'}`}>
                      {q.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Q: {q.quality}%
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {q.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
