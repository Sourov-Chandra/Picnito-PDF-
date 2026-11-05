import React from 'react';
import {
  FileText,
  RotateCcw,
  RotateCw,
  Trash2,
  ArrowUpDown,
  FileCheck,
  Image as ImageIcon
} from 'lucide-react';

export function Header({
  imageCount,
  totalSize,
  selectedCount,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearAll,
  onSelectAll,
  onClearSelection,
  onRemoveSelected,
  onOpenSortMenu,
  onGeneratePdf,
  isGenerating,
}) {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-6 flex items-center justify-between z-20 shrink-0">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0cb1d6] via-[#6266f0] to-[#a356f6] flex items-center justify-center shadow-lg shadow-[#6266f0]/30 text-white font-bold transition transform hover:scale-105">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-zinc-100">
              Picnito{' '}
              <span className="bg-gradient-to-r from-[#0cb1d6] via-[#6266f0] to-[#a356f6] bg-clip-text text-transparent">
                PDF
              </span>
            </h1>
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#0cb1d6]/10 text-[#0cb1d6] border border-[#0cb1d6]/30">
              Offline
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-normal">
            Precision Image Sequencing & PDF Builder
          </p>
        </div>
      </div>

      {/* Stats and Collection Actions */}
      <div className="flex items-center gap-4">
        {imageCount > 0 && (
          <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 px-3.5 py-1.5 rounded-xl text-xs shadow-sm">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <ImageIcon className="w-3.5 h-3.5 text-[#0cb1d6]" />
              <span>
                <strong className="text-zinc-100">{imageCount}</strong> {imageCount === 1 ? 'image' : 'images'}
              </span>
            </div>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <div className="text-zinc-400">
              Total: <strong className="text-zinc-200">{totalSize}</strong>
            </div>

            {selectedCount > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                <div className="text-[#a356f6] font-semibold">
                  {selectedCount} selected
                </div>
              </>
            )}
          </div>
        )}

        {/* Undo / Redo */}
        <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-lg p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo reorder (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Items Batch Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={onClearSelection}
              title="Clear selection (Esc)"
              className="px-2 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded transition"
            >
              Deselect
            </button>
            <button
              onClick={onRemoveSelected}
              title="Remove selected images (Del)"
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove ({selectedCount})
            </button>
          </div>
        )}

        {/* Sort & Clear Actions */}
        {imageCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSortMenu}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700/60 transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#328fe1]" />
              Sort Sequence
            </button>

            <button
              onClick={onClearAll}
              title="Remove all images"
              className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main CTA Button: Styled with the Gradient from the attached image */}
        <button
          onClick={onGeneratePdf}
          disabled={imageCount === 0 || isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0cb1d6] via-[#6266f0] to-[#a356f6] hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs tracking-wide rounded-xl shadow-lg shadow-[#6266f0]/30 transition transform"
        >
          <FileCheck className="w-4 h-4 stroke-[2.5]" />
          <span>{isGenerating ? 'Generating...' : 'Generate PDF'}</span>
        </button>
      </div>
    </header>
  );
}
