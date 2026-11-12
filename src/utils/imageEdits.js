/**
 * Image Editing Utilities & Presets for Picnito PDF
 * Handles rotation, flipping, filters, cropping, and dimension calculation.
 */

export const EDIT_FILTERS = [
  { id: 'none', name: 'Original', desc: 'Natural color and contrast' },
  { id: 'document', name: 'Clean Document', desc: 'High-contrast text on white paper for scans/notes' },
  { id: 'grayscale', name: 'Grayscale', desc: 'Clean monochrome tones, reduces PDF size' },
  { id: 'invert', name: 'Invert (Night)', desc: 'Negative inversion for dark/inverted scans' },
];

export const CROP_PRESETS = [
  { id: 'free', name: 'Freeform', ratio: null },
  { id: 'original', name: 'Original Ratio', ratio: 'original' },
  { id: 'a4', name: 'A4 Paper (1:1.414)', ratio: 1 / 1.414 },
  { id: 'letter', name: 'US Letter (8.5:11)', ratio: 8.5 / 11 },
  { id: '1:1', name: '1:1 Square', ratio: 1 },
  { id: '4:3', name: '4:3 Standard', ratio: 4 / 3 },
  { id: '16:9', name: '16:9 Widescreen', ratio: 16 / 9 },
];

export const DEFAULT_EDITS = {
  rotation: 0, // 0, 90, 180, 270
  flipH: false,
  flipV: false,
  brightness: 100, // 20 - 200
  contrast: 100, // 20 - 200
  filter: 'none', // 'none' | 'document' | 'grayscale' | 'invert'
  crop: null, // { x: %, y: %, width: %, height: % }
};

/**
 * Calculates effective dimensions after rotation & crop
 */
export function getEffectiveImageDimensions(image) {
  if (!image) return { width: 800, height: 600 };
  let w = image.width || 800;
  let h = image.height || 600;

  const edits = image.edits || {};

  // Apply crop factor
  if (edits.crop && edits.crop.width > 0 && edits.crop.height > 0) {
    w = Math.round((edits.crop.width / 100) * w);
    h = Math.round((edits.crop.height / 100) * h);
  }

  // Swap width & height if rotated 90 or 270
  if (edits.rotation === 90 || edits.rotation === 270) {
    const temp = w;
    w = h;
    h = temp;
  }

  return { width: Math.max(10, w), height: Math.max(10, h) };
}

/**
 * Checks if an image has any active edits applied
 */
export function hasActiveEdits(edits) {
  if (!edits) return false;
  return (
    (edits.rotation && edits.rotation !== 0) ||
    edits.flipH ||
    edits.flipV ||
    (edits.brightness && edits.brightness !== 100) ||
    (edits.contrast && edits.contrast !== 100) ||
    (edits.filter && edits.filter !== 'none') ||
    !!edits.crop
  );
}

/**
 * Computes CSS filter and transform styles for an edited image
 */
export function getImageEditStyles(edits) {
  if (!edits) return { filter: 'none', transform: 'none' };

  const rotation = edits.rotation || 0;
  const flipH = edits.flipH || false;
  const flipV = edits.flipV || false;
  const brightness = edits.brightness !== undefined ? edits.brightness : 100;
  const contrast = edits.contrast !== undefined ? edits.contrast : 100;
  const filter = edits.filter || 'none';

  let filterStr = `brightness(${brightness}%) contrast(${contrast}%)`;
  if (filter === 'grayscale') {
    filterStr += ' grayscale(100%)';
  } else if (filter === 'document') {
    filterStr += ' grayscale(100%) contrast(180%) brightness(110%)';
  } else if (filter === 'invert') {
    filterStr += ' invert(100%)';
  }

  let transformStr = '';
  if (rotation !== 0) {
    transformStr += ` rotate(${rotation}deg)`;
  }
  if (flipH) {
    transformStr += ' scaleX(-1)';
  }
  if (flipV) {
    transformStr += ' scaleY(-1)';
  }

  return {
    filter: filterStr.trim(),
    transform: transformStr.trim() || undefined,
  };
}
