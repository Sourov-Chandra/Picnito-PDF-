import React from 'react';
import {
  FileCheck,
  FolderOpen,
  ExternalLink,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { formatDuration } from '../utils/formatters';

export function ProgressModal({
  isOpen,
  isGenerating,
  progress,
  result,
  error,
  onCancel,
  onClose,
  onRevealFolder,
  onOpenFile,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Active Generation State */}
        {isGenerating && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#6266f0]/10 border border-[#6266f0]/30 flex items-center justify-center text-[#0cb1d6]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">
                    Generating PDF...
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Processing images sequentially with zero memory overhead
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 my-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium truncate max-w-[260px]">
                  {progress.currentFilename || 'Processing...'}
                </span>
                <span className="text-[#0cb1d6] font-mono font-bold">
                  {progress.percentage}%
                </span>
              </div>

              <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-[#0cb1d6] via-[#6266f0] to-[#a356f6] transition-all duration-200 rounded-full"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>
                  Processed <strong>{progress.current}</strong> of <strong>{progress.total}</strong> pages
                </span>
                <span>
                  {progress.estimatedRemainingSeconds
                    ? `Est. remaining: ${formatDuration(progress.estimatedRemainingSeconds)}`
                    : 'Calculating time...'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg border border-zinc-700 transition"
              >
                Cancel Conversion
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!isGenerating && result && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0cb1d6] via-[#6266f0] to-[#a356f6] flex items-center justify-center text-white shadow-lg shadow-[#6266f0]/30">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">
                  PDF Generated Successfully!
                </h3>
                <p className="text-xs text-zinc-400">
                  {result.totalImages} pages assembled in {result.elapsedSeconds?.toFixed(1)}s
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 my-4 text-xs">
              <span className="text-zinc-400 block mb-1 font-medium">Output Location:</span>
              <p className="font-mono text-zinc-200 break-all select-text">
                {result.outputPath}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => onOpenFile(result.outputPath)}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#0cb1d6] via-[#6266f0] to-[#a356f6] hover:brightness-110 text-white font-semibold text-xs rounded-xl shadow-lg shadow-[#6266f0]/30 transition"
              >
                <ExternalLink className="w-4 h-4" />
                Open PDF
              </button>

              <button
                onClick={() => onRevealFolder(result.outputPath)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs rounded-xl border border-zinc-700 transition"
              >
                <FolderOpen className="w-4 h-4 text-[#0cb1d6]" />
                Show in Folder
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium text-xs rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isGenerating && error && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">
                  Conversion Issue
                </h3>
                <p className="text-xs text-rose-400/90 font-medium">
                  The operation could not be completed
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl my-4 text-xs text-rose-200 break-words font-mono">
              {error}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
