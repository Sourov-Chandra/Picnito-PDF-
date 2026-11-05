import React, { useState } from 'react';
import { UploadCloud, FolderPlus, Plus, Image as ImageIcon } from 'lucide-react';

export function DropZone({ onFilesSelected, onFolderSelected, hasImages }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;

    // Filter image files by extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.tif'];
    const validPaths = files
      .map((f) => f.path)
      .filter((p) => p && imageExtensions.some((ext) => p.toLowerCase().endsWith(ext)));

    if (validPaths.length && window.electronAPI?.getImageDetails) {
      const details = await window.electronAPI.getImageDetails(validPaths);
      onFilesSelected(details.filter((d) => d.success));
    }
  };

  const handleChooseFiles = async () => {
    if (!window.electronAPI?.selectFiles) return;
    const paths = await window.electronAPI.selectFiles();
    if (paths && paths.length) {
      const details = await window.electronAPI.getImageDetails(paths);
      onFilesSelected(details.filter((d) => d.success));
    }
  };

  const handleChooseFolder = async () => {
    if (!window.electronAPI?.selectFolder) return;
    const paths = await window.electronAPI.selectFolder();
    if (paths && paths.length) {
      const details = await window.electronAPI.getImageDetails(paths);
      onFilesSelected(details.filter((d) => d.success));
    }
  };

  if (hasImages) {
    // Compact Add Bar when images already exist
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex items-center justify-between px-6 py-2.5 bg-zinc-900/60 border-b transition ${
          isDragOver ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800/80'
        }`}
      >
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <UploadCloud className="w-4 h-4 text-emerald-400" />
          <span>Drag and drop more images here, or add via:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleChooseFiles}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700/60 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            Add Images
          </button>
          <button
            onClick={handleChooseFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700/60 transition shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
            Add Entire Folder
          </button>
        </div>
      </div>
    );
  }

  // Full Empty State Hero Dropzone
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-full flex flex-col items-center justify-center p-8 transition-all duration-200 ${
        isDragOver
          ? 'border-2 border-dashed border-emerald-500 bg-emerald-500/5'
          : 'border-2 border-dashed border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700'
      } rounded-2xl m-6`}
    >
      <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl text-emerald-400">
        <UploadCloud className="w-10 h-10 stroke-[1.5]" />
      </div>

      <h2 className="text-xl font-semibold text-zinc-100 mb-2">
        Drop images here to start building your PDF
      </h2>
      <p className="text-sm text-zinc-400 max-w-md text-center mb-8">
        Import textbook scans, document photos, or pictures. Picnito PDF preserves your exact sequence and processes hundreds of pages locally with zero RAM overload.
      </p>

      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={handleChooseFiles}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
        >
          <ImageIcon className="w-4 h-4 stroke-[2.5]" />
          Select Images
        </button>

        <button
          onClick={handleChooseFolder}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-800 text-zinc-200 font-medium text-sm rounded-xl border border-zinc-700 transition"
        >
          <FolderPlus className="w-4 h-4 text-emerald-400" />
          Select Folder
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 px-4 py-2 rounded-full border border-zinc-800">
        <span className="font-medium text-zinc-400">Supported formats:</span>
        <span className="text-zinc-300">JPG, PNG, WEBP, BMP, TIFF</span>
      </div>
    </div>
  );
}
