import { useState, useCallback, useRef } from 'react';
import { sortImages } from '../utils/naturalSort';
import { formatFileSize } from '../utils/formatters';

export function useImageCollection() {
  const [images, setImages] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [originalOrder, setOriginalOrder] = useState([]);

  // Undo/Redo stacks
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const lastSelectedIndexRef = useRef(null);

  // Push new state to undo/redo history
  const pushHistory = useCallback((newImages) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, newImages];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Set images and record history if requested
  const updateImages = useCallback((newImages, recordHistory = true) => {
    setImages(newImages);
    if (recordHistory) {
      pushHistory(newImages);
    }
  }, [pushHistory]);

  // Import images
  const addImages = useCallback((newItems) => {
    if (!newItems || newItems.length === 0) return;

    setImages((prev) => {
      // Create new items with unique IDs
      const mapped = newItems.map((item, idx) => ({
        ...item,
        id: `${item.path}_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      }));

      const combined = [...prev, ...mapped];

      // Save initial original order if first import, or append to original order
      setOriginalOrder((orig) => [...orig, ...mapped]);

      // Initialize or push to history
      setHistory((h) => [...h, combined]);
      setHistoryIndex((idx) => idx + 1);

      return combined;
    });
  }, []);

  // Remove single image
  const removeImage = useCallback((id) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      pushHistory(next);
      return next;
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [pushHistory]);

  // Remove selected images
  const removeSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    setImages((prev) => {
      const next = prev.filter((img) => !selectedIds.has(img.id));
      pushHistory(next);
      return next;
    });
    setSelectedIds(new Set());
    lastSelectedIndexRef.current = null;
  }, [selectedIds, pushHistory]);

  // Clear all images
  const clearAll = useCallback(() => {
    setImages([]);
    setSelectedIds(new Set());
    setOriginalOrder([]);
    setHistory([]);
    setHistoryIndex(-1);
    lastSelectedIndexRef.current = null;
  }, []);

  // Move single item from one index to another (drag and drop)
  const moveItem = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setImages((prev) => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      pushHistory(result);
      return result;
    });
  }, [pushHistory]);

  // Move item to first or last
  const moveToFirst = useCallback((index) => {
    if (index === 0) return;
    moveItem(index, 0);
  }, [moveItem]);

  const moveToLast = useCallback((index) => {
    setImages((prev) => {
      if (index === prev.length - 1) return prev;
      const result = [...prev];
      const [removed] = result.splice(index, 1);
      result.push(removed);
      pushHistory(result);
      return result;
    });
  }, [pushHistory]);

  // Move item up / down by 1
  const moveItemOffset = useCallback((index, offset) => {
    const target = index + offset;
    setImages((prev) => {
      if (target < 0 || target >= prev.length) return prev;
      const result = [...prev];
      const [removed] = result.splice(index, 1);
      result.splice(target, 0, removed);
      pushHistory(result);
      return result;
    });
  }, [pushHistory]);

  // Automatic sorting
  const applySort = useCallback((sortType) => {
    setImages((prev) => {
      const sorted = sortImages(prev, sortType);
      pushHistory(sorted);
      return sorted;
    });
  }, [pushHistory]);

  // Restore original import order
  const restoreOriginalOrder = useCallback(() => {
    if (originalOrder.length === 0) return;
    // Keep only images that are still in current set, sorted by original order
    const origMap = new Map(originalOrder.map((img, idx) => [img.id, idx]));
    setImages((prev) => {
      const restored = [...prev].sort((a, b) => {
        const orderA = origMap.has(a.id) ? origMap.get(a.id) : 999999;
        const orderB = origMap.has(b.id) ? origMap.get(b.id) : 999999;
        return orderA - orderB;
      });
      pushHistory(restored);
      return restored;
    });
  }, [originalOrder, pushHistory]);

  // Selection handlers
  const toggleSelect = useCallback((id, index, event = {}) => {
    const { ctrlKey, metaKey, shiftKey } = event;
    const isMultiKey = ctrlKey || metaKey;

    if (shiftKey && lastSelectedIndexRef.current !== null) {
      // Range selection
      const start = Math.min(lastSelectedIndexRef.current, index);
      const end = Math.max(lastSelectedIndexRef.current, index);
      setImages((currImages) => {
        const rangeIds = currImages.slice(start, end + 1).map((img) => img.id);
        setSelectedIds((prev) => new Set([...prev, ...rangeIds]));
        return currImages;
      });
    } else if (isMultiKey) {
      // Toggle single item in multi-select
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      lastSelectedIndexRef.current = index;
    } else {
      // Single selection
      setSelectedIds(new Set([id]));
      lastSelectedIndexRef.current = index;
    }
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(images.map((img) => img.id)));
  }, [images]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastSelectedIndexRef.current = null;
  }, []);

  // Undo / Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (!canUndo) return;
    const newIdx = historyIndex - 1;
    setHistoryIndex(newIdx);
    setImages(history[newIdx]);
  }, [canUndo, historyIndex, history]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const newIdx = historyIndex + 1;
    setHistoryIndex(newIdx);
    setImages(history[newIdx]);
  }, [canRedo, historyIndex, history]);

  // Totals
  const totalCount = images.length;
  const totalBytes = images.reduce((sum, img) => sum + (img.size || 0), 0);
  const formattedTotalSize = formatFileSize(totalBytes);

  return {
    images,
    selectedIds,
    addImages,
    removeImage,
    removeSelected,
    clearAll,
    moveItem,
    moveToFirst,
    moveToLast,
    moveItemOffset,
    applySort,
    restoreOriginalOrder,
    toggleSelect,
    selectAll,
    clearSelection,
    undo,
    redo,
    canUndo,
    canRedo,
    totalCount,
    totalBytes,
    formattedTotalSize,
  };
}
