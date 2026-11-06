import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Folder,
  FolderOpen,
  FileText,
  Check,
  Layers,
  FileCheck2,
  Info
} from 'lucide-react';

export function MergeSettingsPanel({
  settings,
  onUpdateSettings,
  totalFiles,
  totalPages,
  totalSize,
}) {
  const [defaultPaths, setDefaultPaths] = useState({
    desktop: '',
    documents: '',
    downloads: '',
  });

  useEffect(() => {
    if (window.electronAPI?.getDefaultPaths) {
      window.electronAPI.getDefaultPaths().then((paths) => {
        if (paths) {
          setDefaultPaths(paths);
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
    }
  };

  return (
    <aside className="w-84 border-l border-zinc-800 bg-zinc-900/95 flex flex-col h-full shrink-0 select-none">
      {/* Header */}
      <div className="h-16 border-b border-zinc-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#0cb1d6] to-[#a356f6] flex items-center justify-center p-0.5 shadow-md shadow-[#6266f0]/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-zinc-100">
            Merge Settings
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* Output Destination Folder */}
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

          {/* Ask Each Time Checkbox Mark Selection */}
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
              Merged Filename:
            </span>
            <div className="flex items-center bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 focus-within:border-[#6266f0] transition">
              <FileText className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
              <input
                type="text"
                value={settings.outputFilename || 'Merged_Picnito.pdf'}
                onChange={(e) => handleChange('outputFilename', e.target.value)}
                placeholder="Merged_Picnito.pdf"
                className="bg-transparent w-full text-zinc-100 text-xs focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Merge Summary Overview */}
        <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-3">
          <span className="text-zinc-300 font-semibold text-xs block">
            Merge Summary
          </span>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span>PDF Files to Combine:</span>
              <span className="text-zinc-200 font-semibold font-mono">{totalFiles}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Total Output Pages:</span>
              <span className="text-[#0cb1d6] font-semibold font-mono">{totalPages}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Combined Source Size:</span>
              <span className="text-zinc-200 font-semibold font-mono">{totalSize}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-[#328fe1] mt-0.5 shrink-0" />
            <span>
              The output PDF will contain all pages from each file in the exact order shown on the left (#1, #2, etc.).
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
