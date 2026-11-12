import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Check,
  Maximize2,
  Eye,
  RotateCw,
  Wand2,
  Image as ImageIcon
} from 'lucide-react';
import { formatFileSize, formatDimensions } from '../utils/formatters';
import { getImageEditStyles, hasActiveEdits } from '../utils/imageEdits';

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
  onOpenPreview,
  onOpenPagePreview,
  onOpenEditor,
  onRotate,
}) {
  const [imageError, setImageError] = useState(false);

  const imgSrc =
    image.thumbnailUrl ||
    image.previewUrl ||
    (image.path ? `picnito-media://media/?path=${encodeURIComponent(image.path)}` : null);

  const fallbackSrc = image.thumbnailUrl || image.previewUrl;

  const handleOpenPage = (e) => {
    e?.stopPropagation();
    onSelect(image.id, index, e || {});
    if (onOpenPagePreview) {
      onOpenPagePreview(index);
    } else if (onOpenPreview) {
      onOpenPreview(index);
    }
  };

  const edits = image.edits || {};
  const editStyles = getImageEditStyles(edits);
  const isEdited = hasActiveEdits(edits);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onClick={(e) => onSelect(image.id, index, e)}
      onDoubleClick={handleOpenPage}
      className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-150 select-none cursor-grab active:cursor-grabbing bg-zinc-900/80 ${
        isSelected
          ? 'border-[#6266f0] ring-2 ring-[#6266f0]/40 shadow-lg shadow-[#6266f0]/15'
          : 'border-zinc-800 hover:border-zinc-700 hover:shadow-md'
      } ${isDragging ? 'opacity-30 scale-95' : 'opacity-100'}`}
    >
      {/* Sequence & Edited Badges (Top Left) */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
        <div
          title={`Page ${index + 1} in generated PDF`}
          className={`flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded-md shadow-md backdrop-blur transition ${
            isSelected
              ? 'bg-gradient-to-r from-[#0cb1d6] to-[#a356f6] text-white font-extrabold shadow-md shadow-[#6266f0]/30'
              : 'bg-zinc-950/80 text-[#0cb1d6] border border-[#328fe1]/30 group-hover:bg-zinc-950'
          }`}
        >
          #{index + 1}
        </div>

        {isEdited && (
          <div
            title="Image adjustments applied"
            className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#0cb1d6] to-[#6266f0] text-white shadow-sm"
          >
            <Wand2 className="w-2.5 h-2.5" />
            <span>EDITED</span>
          </div>
        )}
      </div>

      {/* Action Buttons (Top Right): Quick Rotate, Edit, Preview, Zoom, Select, Remove */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
        {/* Quick Rotate Button */}
        {onRotate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotate(image.id, 90);
            }}
            title="Rotate 90° Clockwise"
            className="w-6 h-6 rounded-md bg-zinc-950/80 border border-zinc-700/80 text-zinc-300 hover:text-[#0cb1d6] hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Full Editor Modal Button */}
        {onOpenEditor && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenEditor(image, index);
            }}
            title="Edit & Enhance image (Crop, Rotate, B&W Filter)"
            className="w-6 h-6 rounded-md bg-zinc-950/80 border border-zinc-700/80 text-zinc-300 hover:text-[#a356f6] hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* PDF Page Layout Preview Button */}
        <button
          onClick={handleOpenPage}
          title="Preview on PDF page"
          className="w-6 h-6 rounded-md bg-zinc-950/80 border border-zinc-700/80 text-zinc-300 hover:text-[#0cb1d6] hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Fullsize Zoom / Lightbox Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenPreview(index);
          }}
          title="Zoom & inspect full image"
          className="w-6 h-6 rounded-md bg-zinc-950/80 border border-zinc-700/80 text-zinc-400 hover:text-white hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur shadow-sm"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Checkbox for Multi-Selection */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(image.id, index, { ctrlKey: true });
          }}
          title="Select image"
          className={`w-6 h-6 rounded-md flex items-center justify-center transition backdrop-blur ${
            isSelected
              ? 'bg-gradient-to-r from-[#0cb1d6] to-[#6266f0] text-white'
              : 'bg-zinc-950/80 border border-zinc-700/80 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
          title="Remove from PDF"
          className="w-6 h-6 rounded-md bg-zinc-950/80 border border-zinc-700/80 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur shadow-sm"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Thumbnail Container — Reflects Live Edits */}
      <div
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey || e.shiftKey) {
            onSelect(image.id, index, e);
            return;
          }
          handleOpenPage(e);
        }}
        className="relative aspect-[4/3] bg-zinc-950 flex items-center justify-center overflow-hidden cursor-pointer group/thumb"
        title="Click to preview on PDF page"
      >
        {imgSrc && !imageError ? (
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={{ filter: editStyles.filter }}
          >
            <img
              src={imgSrc}
              alt={image.name}
              onError={(e) => {
                if (fallbackSrc && e.target.src !== fallbackSrc) {
                  e.target.src = fallbackSrc;
                } else {
                  setImageError(true);
                }
              }}
              style={{
                transform: editStyles.transform,
              }}
              className="w-full h-full object-contain pointer-events-none transition-all duration-200 group-hover/thumb:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-500 p-3 text-center">
            <ImageIcon className="w-6 h-6 mb-1 stroke-1" />
            <span className="text-[11px] leading-tight">Preview not available</span>
          </div>
        )}

        {/* Hover Hint Overlay to tell user clicking opens page preview */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-zinc-900/95 border border-zinc-700/80 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-xl backdrop-blur transform group-hover/thumb:scale-105 transition-transform">
            <Eye className="w-3 h-3 text-[#0cb1d6]" />
            <span>Click to preview page</span>
          </div>
        </div>

        {/* Quick Position Controls on hover */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/70 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between z-10">
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
