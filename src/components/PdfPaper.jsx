import React, { useState, useEffect, useRef } from 'react';
import { getPageDimensions } from '../utils/paperSizes';

/**
 * PdfPaper Component
 * Renders an accurate, scale-preserved virtual paper sheet representing
 * the exact PDF page output with active margins, page size, orientation,
 * background color, and image placement.
 */
export function PdfPaper({
  image,
  pageIndex = 0,
  totalPages = 1,
  settings,
  showGuidelines = true,
  maxAvailableHeight = null,
  className = '',
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 420, height: 594 });
  const [imageError, setImageError] = useState(false);

  // Compute paper points and aspect ratio from settings
  const { widthPt, heightPt, effectiveOrientation } = getPageDimensions({
    paperSize: settings.paperSize,
    customDimensions: settings.customDimensions,
    orientation: settings.orientation,
    imgWidth: image?.width || 800,
    imgHeight: image?.height || 600,
  });

  const aspectRatio = widthPt / heightPt;

  // Margin percentages relative to total page dimensions
  const mTopPct = (settings.margins.top / heightPt) * 100;
  const mBottomPct = (settings.margins.bottom / heightPt) * 100;
  const mLeftPct = (settings.margins.left / widthPt) * 100;
  const mRightPct = (settings.margins.right / widthPt) * 100;

  // Responsive fit within container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const computeSize = () => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const padX = 32;
      const padY = 32;
      const availW = Math.max(120, rect.width - padX);
      const availH = Math.max(120, (maxAvailableHeight || rect.height) - padY);

      let w, h;
      if (availW / availH > aspectRatio) {
        // Constrained by container height
        h = availH;
        w = availH * aspectRatio;
      } else {
        // Constrained by container width
        w = availW;
        h = availW / aspectRatio;
      }

      setDimensions({
        width: Math.floor(w),
        height: Math.floor(h),
      });
    };

    computeSize();
    const ro = new ResizeObserver(computeSize);
    ro.observe(container);
    window.addEventListener('resize', computeSize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', computeSize);
    };
  }, [aspectRatio, maxAvailableHeight]);

  // Object-fit property based on placement
  let objectFitClass = 'object-contain';
  if (settings.placement === 'fill') objectFitClass = 'object-cover';
  if (settings.placement === 'stretch') objectFitClass = 'object-fill';

  // Primary image source with full resolution fallback
  const imgSrc =
    image?.fullMediaUrl ||
    image?.previewUrl ||
    (image?.path ? `picnito-media://media/?path=${encodeURIComponent(image.path)}` : image?.thumbnailUrl);

  const fallbackSrc = image?.thumbnailUrl || image?.previewUrl;

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center p-4 relative overflow-hidden ${className}`}
    >
      {/* The Virtual Sheet of Paper */}
      <div
        className="relative transition-all duration-200 shadow-[0_15px_45px_rgba(0,0,0,0.85)] border border-zinc-700/60 rounded-sm overflow-hidden flex items-center justify-center"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          minWidth: `${dimensions.width}px`,
          minHeight: `${dimensions.height}px`,
          backgroundColor: settings.backgroundColor || '#ffffff',
        }}
      >
        {/* Printable Area inside Margins */}
        <div
          className={`absolute overflow-hidden transition-all duration-200 ${
            showGuidelines && (settings.margins.top > 0 || settings.margins.left > 0)
              ? 'border border-dashed border-[#6266f0]/60 bg-[#6266f0]/[0.02]'
              : ''
          }`}
          style={{
            top: `${mTopPct}%`,
            bottom: `${mBottomPct}%`,
            left: `${mLeftPct}%`,
            right: `${mRightPct}%`,
          }}
        >
          {imgSrc && !imageError ? (
            <img
              src={imgSrc}
              alt={image?.name || `Page ${pageIndex + 1}`}
              onError={(e) => {
                if (fallbackSrc && e.target.src !== fallbackSrc) {
                  e.target.src = fallbackSrc;
                } else {
                  setImageError(true);
                }
              }}
              className={`w-full h-full ${objectFitClass} select-none pointer-events-none transition-all duration-150`}
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 p-4 text-center">
              <span className="text-xs font-medium">Image preview not available</span>
            </div>
          )}
        </div>

        {/* Small Page Number Watermark on Sheet */}
        <div className="absolute bottom-2 right-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-white/90 backdrop-blur pointer-events-none">
          {pageIndex + 1}
        </div>
      </div>
    </div>
  );
}
