import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Check,
  Maximize2
} from 'lucide-react';
import { formatFileSize, formatDimensions } from '../utils/formatters';

export function ImageCard({
  image,
  index,
  total,
  isSelected,
  onSelect,
  onRemove,
  onMoveOffset,
  onMoveToFirst,
  onMoveToLast,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
}) {
  const [imageError, setImageError] = useState(false);

  // Encode path for custom protocol: picnito-media://
  const mediaUrl = `picnito-media://${encodeURIComponent(image.path)}`;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onClick={(e) => onSelect(image.id, index, e)}
      className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-150 select-none cursor-grab active:cursor-grabbing bg-zinc-900/80 ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
          : 'border-zinc-800 hover:border-zinc-700 hover:shadow-md'
      } ${isDragging ? 'opacity-30 scale-95' : 'opacity-100'}`}
    >
      {/* Sequence Badge (Top Left) — Core requirement from PRD */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
        <div
          title={`Page ${index + 1} in generated PDF`}
          className={`flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded-md shadow-md backdrop-blur transition ${
            isSelected
              ? 'bg-emerald-500 text-zinc-950 font-extrabold'
              : 'bg-zinc-950/80 text-emerald-400 border border-zinc-700/80 group-hover:bg-zinc-950'
          }`}
        >
          #{index + 1}
        </div>
      </div>

      {/* Select Checkbox & Remove Button (Top Right) */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(image.id, index, { ctrlKey: true });
          }}
          className={`w-6 h-6 rounded-md flex items-center justify-center transition backdrop-blur ${
            isSelected
              ? 'bg-emerald-500 text-zinc-950'
              : 'bg-zinc-950/70 border border-zinc-700/80 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
          title="Remove from PDF"
          className="w-6 h-6 rounded-md bg-zinc-950/70 border border-zinc-700/80 text-zinc-400 hover:text-rose-400 hover:bg-zinc-950 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] bg-zinc-950 flex items-center justify-center overflow-hidden">
        {!imageError ? (
          <img
            src={mediaUrl}
            alt={image.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain pointer-events-none transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-zinc-400 text-xs text-center p-3">
            Unable to load preview
          </div>
        )}

        {/* Quick Position Controls on hover */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/60 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveToFirst(index);
              }}
              disabled={index === 0}
              title="Move to first page"
              className="p-1 rounded bg-zinc-800/90 text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveOffset(index, -1);
              }}
              disabled={index === 0}
              title="Move up one position"
              className="p-1 rounded bg-zinc-800/90 text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveOffset(index, 1);
              }}
              disabled={index === total - 1}
              title="Move down one position"
              className="p-1 rounded bg-zinc-800/90 text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveToLast(index);
              }}
              disabled={index === total - 1}
              title="Move to last page"
              className="p-1 rounded bg-zinc-800/90 text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-20 disabled:pointer-events-none"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="p-2.5 bg-zinc-900 border-t border-zinc-800/80 flex flex-col gap-1">
        <span
          title={image.name}
          className="text-xs font-medium text-zinc-200 truncate"
        >
          {image.name}
        </span>
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>{formatDimensions(image.width, image.height)}</span>
          <span>{formatFileSize(image.size)}</span>
        </div>
      </div>
    </div>
  );
}
