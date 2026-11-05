import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { ImageGrid } from './components/ImageGrid';
import { SettingsPanel } from './components/SettingsPanel';
import { ProgressModal } from './components/ProgressModal';
import { SortModal } from './components/SortModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { useImageCollection } from './hooks/useImageCollection';
import { usePdfGenerator } from './hooks/usePdfGenerator';

export default function App() {
  const collection = useImageCollection();
  const generator = usePdfGenerator();

  // Settings State
  const [settings, setSettings] = useState({
    askEachTime: false, // Checkbox mark selection
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

  // Modal states
  const [isSortOpen, setIsSortOpen] = useState(false);
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
      // Don't intercept if typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      // If big preview is open, let ImagePreviewModal handle its own keys
      if (previewState.isOpen) return;

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
        // Space or Enter opens preview for first selected image
        if (collection.selectedIds.size > 0) {
          const firstSelectedId = Array.from(collection.selectedIds)[0];
          const foundIdx = collection.images.findIndex((img) => img.id === firstSelectedId);
          if (foundIdx !== -1) {
            e.preventDefault();
            setPreviewState({ isOpen: true, index: foundIdx });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collection, previewState.isOpen]);

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

  const currentPreviewImage = collection.images[previewState.index] || null;

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* App Header */}
      <Header
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
        onGeneratePdf={handleStartPdfGeneration}
        isGenerating={generator.isGenerating}
      />

      {/* Main Workspace (Split: Left = Grid/Dropzone, Right = Settings) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center Area */}
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

        {/* Right Settings Sidebar */}
        <SettingsPanel
          settings={settings}
          onUpdateSettings={setSettings}
        />
      </div>

      {/* Big Image Preview Lightbox Modal (New Feature) */}
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

      {/* Conversion Progress / Result / Error Modal */}
      <ProgressModal
        isOpen={generator.isGenerating || !!generator.result || !!generator.error}
        isGenerating={generator.isGenerating}
        progress={generator.progress}
        result={generator.result}
        error={generator.error}
        onCancel={generator.cancel}
        onClose={generator.resetState}
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
        onCancel={confirmModal.onCancel}
      />
    </div>
  );
}
