import React from 'react';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ListOrdered,
  Calendar,
  Clock,
  HardDrive,
  Maximize2,
  RotateCcw,
  X
} from 'lucide-react';

export function SortModal({
  isOpen,
  onClose,
  onApplySort,
  onRestoreOriginal,
}) {
  if (!isOpen) return null;

  const sortOptions = [
    {
      id: 'natural',
      title: 'Natural Filename Sorting (Recommended)',
      desc: 'Smart ordering for page numbers (e.g. page-1, page-2, page-10)',
      icon: ListOrdered,
      badge: 'Smart',
    },
    {
      id: 'name-asc',
      title: 'Filename (A to Z)',
      desc: 'Standard alphabetical ascending order',
      icon: ArrowDownAZ,
    },
    {
      id: 'name-desc',
      title: 'Filename (Z to A)',
      desc: 'Standard alphabetical descending order',
      icon: ArrowUpAZ,
    },
    {
      id: 'date-created',
      title: 'Date Created (Oldest First)',
      desc: 'Based on original file creation timestamp',
      icon: Calendar,
    },
    {
      id: 'date-modified',
      title: 'Date Modified (Oldest First)',
      desc: 'Based on last modified timestamp',
      icon: Clock,
    },
    {
      id: 'size',
      title: 'File Size (Smallest First)',
      desc: 'Order by input file size in bytes',
      icon: HardDrive,
    },
    {
      id: 'dimensions',
      title: 'Dimensions (Smallest First)',
      desc: 'Order by image resolution (width × height)',
      icon: Maximize2,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">
              Sort Image Sequence
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select an automated ordering rule or restore the initial import sequence
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 max-h-[420px] overflow-y-auto space-y-1.5">
          {/* Restore Original Order Button */}
          <button
            onClick={() => {
              onRestoreOriginal();
              onClose();
            }}
            className="w-full p-3 rounded-xl border border-dashed border-[#6266f0]/50 bg-[#6266f0]/10 hover:bg-[#6266f0]/15 text-left flex items-start gap-3 transition"
          >
            <RotateCcw className="w-4 h-4 text-[#0cb1d6] mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-[#a356f6]">
                Restore Original Import Order
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Reset sequence to the exact order when images were first selected
              </div>
            </div>
          </button>

          <div className="py-1">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-2">
              Automated Sorting Rules
            </span>
          </div>

          {sortOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  onApplySort(opt.id);
                  onClose();
                }}
                className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-[#6266f0]/60 hover:bg-zinc-900 text-left flex items-start gap-3 transition"
              >
                <Icon className="w-4 h-4 text-[#328fe1] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-200">
                      {opt.title}
                    </span>
                    {opt.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#0cb1d6]/10 text-[#0cb1d6] border border-[#0cb1d6]/30 rounded">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {opt.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
