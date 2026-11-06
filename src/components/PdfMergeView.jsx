import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Layers,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { formatFileSize } from '../utils/formatters';

export function PdfMergeView({
  pdfFiles,
  onAddPdfs,
  onRemovePdf,
  onMovePdf,
  onMoveOffset,
  onMoveToFirst,
  onMoveToLast,
  totalPages,
  totalSize,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

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

    const validPaths = files
      .map((f) => f.path)
      .filter((p) => p && p.toLowerCase().endsWith('.pdf'));

    if (validPaths.length && window.electronAPI?.getPdfDetails) {
      const details = await window.electronAPI.getPdfDetails(validPaths);
      onAddPdfs(details.filter((d) => d.success));
    }
  };

  const handleSelectPdfFiles = async () => {
    if (window.electronAPI?.selectPdfFiles) {
      const paths = await window.electronAPI.selectPdfFiles();
      if (paths && paths.length) {
        const details = await window.electronAPI.getPdfDetails(paths);
        onAddPdfs(details.filter((d) => d.success));
      }
    }
  };

  // Drag and drop reordering
  const handleItemDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleItemDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleItemDrop = (e, targetIndex) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== targetIndex) {
      onMovePdf(dragIndex, targetIndex);
    }
    setDragIndex(null);
  };

  if (pdfFiles.length === 0) {
    // Empty state dropzone
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`h-full flex flex-col items-center justify-center p-8 transition-all duration-200 ${
          isDragOver
            ? 'border-2 border-dashed border-[#6266f0] bg-[#6266f0]/5'
            : 'border-2 border-dashed border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700'
        } rounded-2xl m-6`}
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-[#0cb1d6] via-[#6266f0] to-[#a356f6] p-0.5 mb-6 shadow-xl shadow-[#6266f0]/20">
          <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-white">
            <Layers className="w-10 h-10 text-[#0cb1d6] stroke-[1.5]" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-zinc-100 mb-2">
          Combine 2 or more PDF files into one document
        </h2>
        <p className="text-sm text-zinc-400 max-w-md text-center mb-8">
          Merge reports, scanned booklets, lecture slides, or contracts. Easily arrange which PDF comes first, second, and so on.
        </p>

        <button
          onClick={handleSelectPdfFiles}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0cb1d6] via-[#6266f0] to-[#a356f6] hover:brightness-110 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#6266f0]/30 transition transform"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Select PDF Files to Merge
        </button>

        <div className="mt-6 flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 px-4 py-2 rounded-full border border-zinc-800">
          <span className="font-medium text-zinc-400">Supported input:</span>
          <span className="text-zinc-300">Standard PDF documents (.pdf)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
      {/* Top action toolbar */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex items-center justify-between px-6 py-2.5 bg-zinc-900/60 border-b transition ${
          isDragOver ? 'border-[#6266f0] bg-[#6266f0]/10' : 'border-zinc-800/80'
        }`}
      >
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-zinc-200">
            <Layers className="w-4 h-4 text-[#0cb1d6]" />
            <span>
              <strong>{pdfFiles.length}</strong> PDF {pdfFiles.length === 1 ? 'file' : 'files'}
            </span>
          </div>
          <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
          <span>
            Combined: <strong className="text-zinc-200">{totalPages}</strong> pages
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
          <span>
            Total size: <strong className="text-zinc-200">{totalSize}</strong>
          </span>
        </div>

        <button
          onClick={handleSelectPdfFiles}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700/60 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-[#0cb1d6]" />
          Add More PDFs
        </button>
      </div>

      {/* Info Notice when only 1 PDF is added */}
      {pdfFiles.length === 1 && (
        <div className="mx-6 mt-4 p-3 bg-[#6266f0]/10 border border-[#6266f0]/30 rounded-xl flex items-center gap-2.5 text-xs text-zinc-200">
          <AlertCircle className="w-4 h-4 text-[#0cb1d6] shrink-0" />
          <span>
            Add at least <strong>1 more PDF file</strong> to merge them together into a single PDF document.
          </span>
        </div>
      )}

      {/* Reorderable List of PDF Files */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {pdfFiles.map((file, index) => (
          <div
            key={file.id}
            draggable
            onDragStart={(e) => handleItemDragStart(e, index)}
            onDragOver={handleItemDragOver}
            onDrop={(e) => handleItemDrop(e, index)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-150 select-none bg-zinc-900/80 ${
              dragIndex === index
                ? 'opacity-30 border-[#6266f0]'
                : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
            }`}
          >
            {/* Left: Sequence Number & File Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
              <div
                title={`Part #${index + 1} in the merged output PDF`}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#0cb1d6] to-[#a356f6] flex items-center justify-center font-bold text-sm text-white shadow-md shadow-[#6266f0]/25 shrink-0"
              >
                #{index + 1}
              </div>

              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[#a356f6] shrink-0">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-zinc-100 truncate" title={file.name}>
                    {file.name}
                  </h4>
                  <div className="flex items-center gap-2.5 text-xs text-zinc-400 mt-0.5 font-mono">
                    <span className="text-[#0cb1d6] font-semibold bg-[#0cb1d6]/10 px-2 py-0.5 rounded border border-[#0cb1d6]/20">
                      {file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                    <span className="hidden md:inline text-zinc-500">•</span>
                    <span className="hidden md:inline truncate text-zinc-500 max-w-sm" title={file.path}>
                      {file.path}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Sequence Controls & Remove */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Position Ordering Controls */}
              <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
                <button
                  onClick={() => onMoveToFirst(index)}
                  disabled={index === 0}
                  title="Move to first position"
                  className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition"
                >
                  <ChevronsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMoveOffset(index, -1)}
                  disabled={index === 0}
                  title="Move up one position"
                  className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-zinc-800 mx-0.5"></div>
                <button
                  onClick={() => onMoveOffset(index, 1)}
                  disabled={index === pdfFiles.length - 1}
                  title="Move down one position"
                  className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMoveToLast(index)}
                  disabled={index === pdfFiles.length - 1}
                  title="Move to last position"
                  className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition"
                >
                  <ChevronsDown className="w-4 h-4" />
                </button>
              </div>

              {/* Remove PDF from list */}
              <button
                onClick={() => onRemovePdf(file.id)}
                title="Remove from merge list"
                className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
