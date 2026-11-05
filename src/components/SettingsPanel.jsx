import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Maximize,
  Minimize,
  StretchHorizontal,
  Folder,
  FolderOpen,
  FileText,
  Monitor,
  HardDrive,
  Check
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
          saveMode: 'folder',
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
      <div className="h-14 border-b border-zinc-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Output & PDF Settings</span>
        </div>
      </div>

      {/* Settings Form Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* =========================================
            0. Output Folder & Destination (Requested by user)
            ========================================= */}
        <div className="p-3.5 bg-zinc-950/80 border border-emerald-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-zinc-200 font-semibold flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-emerald-400" />
              Save Destination
            </label>
            <span className="text-[10px] text-emerald-400/90 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Preferable Folder
            </span>
          </div>

          {/* Mode Switch: Save Directly to Folder vs Ask Every Time */}
          <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => handleChange('saveMode', 'folder')}
              className={`py-1.5 px-2 rounded-md font-medium transition text-center ${
                settings.saveMode === 'folder'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Custom Folder
            </button>
            <button
              type="button"
              onClick={() => handleChange('saveMode', 'prompt')}
              className={`py-1.5 px-2 rounded-md font-medium transition text-center ${
                settings.saveMode === 'prompt'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Ask Each Time
            </button>
          </div>

          {/* Destination Folder Selector */}
          {settings.saveMode === 'folder' ? (
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
                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg transition flex items-center gap-1 shrink-0"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Browse
                </button>
              </div>

              {/* Quick Preset Buttons (Desktop, Documents, Downloads) */}
              {defaultPaths.desktop && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-zinc-500">Quick set:</span>
                  <button
                    type="button"
                    onClick={() => handleChange('outputFolder', defaultPaths.desktop)}
                    className={`px-2 py-0.5 rounded text-[10px] transition border ${
                      settings.outputFolder === defaultPaths.desktop
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
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
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
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
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      Downloads
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-zinc-400 italic">
              A standard Windows save dialog will prompt you to choose folder & file name on generation.
            </p>
          )}

          {/* Filename Input */}
          <div className="pt-1">
            <span className="text-[11px] text-zinc-400 block mb-1">
              Default PDF Filename:
            </span>
            <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
              <input
                type="text"
                value={settings.outputFilename || 'Picnito_Document.pdf'}
                onChange={(e) => handleChange('outputFilename', e.target.value)}
                placeholder="document.pdf"
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
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500 font-medium"
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
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
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
                      className={`py-1 text-center font-medium rounded ${
                        settings.customDimensions.unit === unit
                          ? 'bg-emerald-500 text-zinc-950 font-bold'
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
                    ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm font-semibold'
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
                      ? 'border-emerald-500/80 bg-emerald-500/5 text-zinc-100'
                      : 'border-zinc-800/80 hover:border-zinc-700 bg-zinc-950/40 text-zinc-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
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
                    ? 'bg-zinc-800 text-emerald-400 border-emerald-500/50'
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
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2 py-1 text-zinc-100 font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Bottom (pt)</span>
                <input
                  type="number"
                  min="0"
                  value={settings.margins.bottom}
                  onChange={(e) => handleCustomMarginChange('bottom', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2 py-1 text-zinc-100 font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Left (pt)</span>
                <input
                  type="number"
                  min="0"
                  value={settings.margins.left}
                  onChange={(e) => handleCustomMarginChange('left', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2 py-1 text-zinc-100 font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Right (pt)</span>
                <input
                  type="number"
                  min="0"
                  value={settings.margins.right}
                  onChange={(e) => handleCustomMarginChange('right', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded px-2 py-1 text-zinc-100 font-mono text-xs"
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
                  ? 'bg-zinc-800 text-white border-emerald-500'
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
                  ? 'bg-zinc-800 text-white border-emerald-500'
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
                      ? 'border-emerald-500/80 bg-emerald-500/5'
                      : 'border-zinc-800/80 hover:border-zinc-700 bg-zinc-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isSelected ? 'text-emerald-400' : 'text-zinc-200'}`}>
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
