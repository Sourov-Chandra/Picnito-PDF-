/**
 * Paper Size Definitions and Conversion Utilities
 * Dimensions in points (1 pt = 1/72 inch, 1 inch = 25.4 mm)
 */

export const MM_TO_PT = 72 / 25.4;
export const CM_TO_PT = 72 / 2.54;
export const INCH_TO_PT = 72;

export const PAPER_SIZES = [
  { id: 'A4', name: 'A4', category: 'ISO Standard', widthMm: 210, heightMm: 297, widthPt: 595.28, heightPt: 841.89 },
  { id: 'A3', name: 'A3', category: 'ISO Standard', widthMm: 297, heightMm: 420, widthPt: 841.89, heightPt: 1190.55 },
  { id: 'A5', name: 'A5', category: 'ISO Standard', widthMm: 148, heightMm: 210, widthPt: 419.53, heightPt: 595.28 },
  { id: 'A0', name: 'A0', category: 'ISO Standard', widthMm: 841, heightMm: 1189, widthPt: 2383.94, heightPt: 3370.39 },
  { id: 'A1', name: 'A1', category: 'ISO Standard', widthMm: 594, heightMm: 841, widthPt: 1683.78, heightPt: 2383.94 },
  { id: 'A2', name: 'A2', category: 'ISO Standard', widthMm: 420, heightMm: 594, widthPt: 1190.55, heightPt: 1683.78 },
  { id: 'A6', name: 'A6', category: 'ISO Standard', widthMm: 105, heightMm: 148, widthPt: 297.64, heightPt: 419.53 },
  { id: 'B4', name: 'B4', category: 'ISO B Series', widthMm: 250, heightMm: 353, widthPt: 708.66, heightPt: 1000.63 },
  { id: 'B5', name: 'B5', category: 'ISO B Series', widthMm: 176, heightMm: 250, widthPt: 498.90, heightPt: 708.66 },
  { id: 'Letter', name: 'US Letter', category: 'North American', widthIn: 8.5, heightIn: 11, widthPt: 612, heightPt: 792 },
  { id: 'Legal', name: 'US Legal', category: 'North American', widthIn: 8.5, heightIn: 14, widthPt: 612, heightPt: 1008 },
  { id: 'Tabloid', name: 'Tabloid', category: 'North American', widthIn: 11, heightIn: 17, widthPt: 792, heightPt: 1224 },
  { id: 'Executive', name: 'Executive', category: 'North American', widthIn: 7.25, heightIn: 10.5, widthPt: 522, heightPt: 756 },
  { id: 'original', name: 'Original Image Dimensions', category: 'Special', widthPt: 0, heightPt: 0 },
  { id: 'custom', name: 'Custom Page Size', category: 'Special', widthPt: 0, heightPt: 0 },
];

export const MARGIN_PRESETS = [
  { id: 'none', name: 'No Margins (0 pt)', top: 0, right: 0, bottom: 0, left: 0 },
  { id: 'small', name: 'Small Margins (18 pt / ~6 mm)', top: 18, right: 18, bottom: 18, left: 18 },
  { id: 'medium', name: 'Medium Margins (36 pt / ~12 mm)', top: 36, right: 36, bottom: 36, left: 36 },
  { id: 'custom', name: 'Custom Margins', top: 36, right: 36, bottom: 36, left: 36 },
];

export const QUALITY_PRESETS = [
  { id: 'high', name: 'High Quality', desc: 'Preserves fine detail with minimal compression', quality: 95, maxDimension: 4000 },
  { id: 'balanced', name: 'Balanced', desc: 'Optimal trade-off between clarity and file size', quality: 82, maxDimension: 2500 },
  { id: 'compressed', name: 'Compressed', desc: 'Smaller PDF size for quick sharing and email', quality: 65, maxDimension: 1800 },
];

export function convertToPoints(value, unit) {
  const num = parseFloat(value) || 0;
  switch (unit) {
    case 'mm': return num * MM_TO_PT;
    case 'cm': return num * CM_TO_PT;
    case 'in':
    case 'inches': return num * INCH_TO_PT;
    case 'pt':
    default: return num;
  }
}
