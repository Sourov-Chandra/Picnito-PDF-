import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { ImageGrid } from './components/ImageGrid';
import { SettingsPanel } from './components/SettingsPanel';
import { PdfMergeView } from './components/PdfMergeView';
import { MergeSettingsPanel } from './components/MergeSettingsPanel';
import { ProgressModal } from './components/ProgressModal';
import { SortModal } from './components/SortModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { PdfLayoutPreviewModal } from './components/PdfLayoutPreviewModal';
import { useImageCollection } from './hooks/useImageCollection';
import { usePdfGenerator } from './hooks/usePdfGenerator';
import { usePdfMerger } from './hooks/usePdfMerger';

export default function App() {
  const [activeMode, setActiveMode] = useState('images'); // 'images' | 'merge'

  // Image to PDF State & Hooks
  const collection = useImageCollection();
  const generator = usePdfGenerator();

  const [settings, setSettings] = useState({
    askEachTime: false,
    outputFolder: '',
    outputFilename: 'Picnito_Document.pdf',
    paperSize: 'A4',
    customDimensions: {
      width: 210,
      height: 297,
      unit: 'mm',
      widthPt: 595.28,
      heightPt: 841.89,
    },
    orientation: 'portrait',
    placement: 'fit',
    marginPreset: 'none',
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    backgroundColor: '#ffffff',
    qualityPreset: 'balanced',
  });

  // PDF Merge State & Hooks
  const merger = usePdfMerger();

  const [mergeSettings, setMergeSettings] = useState({
    askEachTime: false,
    outputFolder: '',
    outputFilename: 'Merged_Picnito.pdf',
  });

  // Modals state
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isLayoutPreviewOpen, setIsLayoutPreviewOpen] = useState(false);
  const [previewState, setPreviewState] = useState({
    isOpen: false,
    index: 0,
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    isDestructive: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (previewState.isOpen) return;

      if (activeMode === 'images') {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
          e.preventDefault();
          collection.selectAll();
        } else if (e.key === 'Escape') {
          collection.clearSelection();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          if (collection.selectedIds.size > 0) {
            e.preventDefault();
            collection.removeSelected();
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          if (e.shiftKey) {
            collection.redo();
          } else {
            collection.undo();
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          collection.redo();
        } else if (e.key === ' ' || e.key === 'Enter') {
          if (collection.selectedIds.size > 0) {
            const firstSelectedId = Array.from(collection.selectedIds)[0];
            const foundIdx = collection.images.findIndex((img) => img.id === firstSelectedId);
            if (foundIdx !== -1) {
              e.preventDefault();
              setPreviewState({ isOpen: true, index: foundIdx });
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collection, previewState.isOpen, activeMode]);

  // Preview Handlers
  const handleOpenPreview = (index) => {
    setPreviewState({ isOpen: true, index });
  };

  const handleClosePreview = () => {
    setPreviewState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleNextPreview = () => {
    setPreviewState((prev) => ({
      ...prev,
      index: Math.min(collection.images.length - 1, prev.index + 1),
    }));
  };

  const handlePrevPreview = () => {
    setPreviewState((prev) => ({
      ...prev,
      index: Math.max(0, prev.index - 1),
    }));
  };

  const handleRemoveFromPreview = (id) => {
    collection.removeImage(id);
    if (collection.images.length <= 1) {
      handleClosePreview();
    } else if (previewState.index >= collection.images.length - 1) {
      setPreviewState((prev) => ({ ...prev, index: Math.max(0, prev.index - 1) }));
    }
  };

  // Clear Confirmations
  const handleClearAllConfirm = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear All Images?',
      message: 'This will remove all currently loaded images and reset the sequence.',
      confirmLabel: 'Clear All',
      cancelLabel: 'Cancel',
      isDestructive: true,
      onConfirm: () => {
        collection.clearAll();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        handleClosePreview();
      },
      onCancel: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleClearAllPdfsConfirm = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear All PDF Files?',
      message: 'This will remove all PDF files from the merge list.',
      confirmLabel: 'Clear All',
      cancelLabel: 'Cancel',
      isDestructive: true,
      onConfirm: () => {
        merger.clearAllPdfs();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Generation & Merge Execution
  const handleStartPdfGeneration = () => {
    generator.generate(collection.images, settings, (targetPath) => {
      return new Promise((resolve) => {
        setConfirmModal({
          isOpen: true,
          title: 'File Already Exists',
          message: `"${targetPath}" already exists in your destination folder. Do you want to overwrite it?`,
          confirmLabel: 'Overwrite',
          cancelLabel: 'Cancel',
          isDestructive: true,
          onConfirm: () => {
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
          onCancel: () => {
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            resolve(false);
          },
        });
      });
    });
  };

  const handleStartPdfMerge = () => {
    merger.merge(mergeSettings, (targetPath) => {
      return new Promise((resolve) => {
        setConfirmModal({
          isOpen: true,
          title: 'File Already Exists',
          message: `"${targetPath}" already exists in your destination folder. Do you want to overwrite it?`,
          confirmLabel: 'Overwrite',
          cancelLabel: 'Cancel',
          isDestructive: true,
          onConfirm: () => {
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
          onCancel: () => {
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            resolve(false);
          },
        });
      });
    });
  };

  const currentPreviewImage = collection.images[previewState.index] || null;

  // Active operation status
  const isOperating = generator.isGenerating || merger.isMerging;
  const currentResult = activeMode === 'merge' ? merger.mergeResult : generator.result;
  const currentError = activeMode === 'merge' ? merger.mergeError : generator.error;
  const currentProgress = activeMode === 'merge' ? merger.mergeProgress : generator.progress;

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        activeMode={activeMode}
        onChangeMode={setActiveMode}
        // Images Mode
        imageCount={collection.totalCount}
        totalSize={collection.formattedTotalSize}
        selectedCount={collection.selectedIds.size}
        canUndo={collection.canUndo}
        canRedo={collection.canRedo}
        onUndo={collection.undo}
        onRedo={collection.redo}
        onClearAll={handleClearAllConfirm}
        onSelectAll={collection.selectAll}
        onClearSelection={collection.clearSelection}
        onRemoveSelected={collection.removeSelected}
        onOpenSortMenu={() => setIsSortOpen(true)}
        onOpenLayoutPreview={() => setIsLayoutPreviewOpen(true)}
        onGeneratePdf={handleStartPdfGeneration}
        isGenerating={generator.isGenerating}
        // Merge Mode
        pdfFileCount={merger.totalFiles}
        pdfTotalPages={merger.totalPages}
        pdfTotalSize={merger.formattedTotalSize}
        onClearAllPdfs={handleClearAllPdfsConfirm}
        onMergePdfs={handleStartPdfMerge}
        isMerging={merger.isMerging}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {activeMode === 'images' ? (
          <>
            {/* Images to PDF Mode */}
            <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
              <DropZone
                onFilesSelected={collection.addImages}
                onFolderSelected={collection.addImages}
                hasImages={collection.totalCount > 0}
              />

              {collection.totalCount > 0 && (
                <ImageGrid
                  images={collection.images}
                  selectedIds={collection.selectedIds}
                  onSelect={collection.toggleSelect}
                  onRemove={collection.removeImage}
                  onMoveItem={collection.moveItem}
                  onMoveOffset={collection.moveItemOffset}
                  onMoveToFirst={collection.moveToFirst}
                  onMoveToLast={collection.moveToLast}
                  onOpenPreview={handleOpenPreview}
                />
              )}
            </main>

            <SettingsPanel
              settings={settings}
              onUpdateSettings={setSettings}
              onOpenLayoutPreview={() => setIsLayoutPreviewOpen(true)}
              hasImages={collection.totalCount > 0}
            />
          </>
        ) : (
          <>
            {/* Merge PDFs Mode */}
            <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
              <PdfMergeView
                pdfFiles={merger.pdfFiles}
                onAddPdfs={merger.addPdfs}
                onRemovePdf={merger.removePdf}
                onMovePdf={merger.movePdf}
                onMoveOffset={merger.movePdfOffset}
                onMoveToFirst={merger.movePdfToFirst}
                onMoveToLast={merger.movePdfToLast}
                totalPages={merger.totalPages}
                totalSize={merger.formattedTotalSize}
              />
            </main>

            <MergeSettingsPanel
              settings={mergeSettings}
              onUpdateSettings={setMergeSettings}
              totalFiles={merger.totalFiles}
              totalPages={merger.totalPages}
              totalSize={merger.formattedTotalSize}
            />
          </>
        )}
      </div>

      {/* Big Image Preview Lightbox Modal */}
      <ImagePreviewModal
        isOpen={previewState.isOpen && !!currentPreviewImage}
        image={currentPreviewImage}
        currentIndex={previewState.index}
        totalImages={collection.images.length}
        onClose={handleClosePreview}
        onNext={handleNextPreview}
        onPrev={handlePrevPreview}
        onRemove={handleRemoveFromPreview}
        onMoveOffset={collection.moveItemOffset}
      />

      {/* PDF Page Layout Live Preview Modal (New Feature) */}
      <PdfLayoutPreviewModal
        isOpen={isLayoutPreviewOpen}
        images={collection.images}
        settings={settings}
        onUpdateSettings={setSettings}
        onClose={() => setIsLayoutPreviewOpen(false)}
        onGeneratePdf={handleStartPdfGeneration}
      />

      {/* Progress / Result / Error Modal */}
      <ProgressModal
        isOpen={isOperating || !!currentResult || !!currentError}
        isGenerating={isOperating}
        progress={currentProgress}
        result={currentResult}
        error={currentError}
        mode={activeMode}
        onCancel={activeMode === 'merge' ? merger.cancel : generator.cancel}
        onClose={activeMode === 'merge' ? merger.resetMergeState : generator.resetState}
        onRevealFolder={generator.revealResult}
        onOpenFile={generator.openPdf}
      />

      {/* Sort Menu Modal */}
      <SortModal
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        onApplySort={collection.applySort}
        onRestoreOriginal={collection.restoreOriginalOrder}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel={confirmModal.cancelLabel}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
