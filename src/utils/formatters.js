/**
 * Formatting helpers for file size, dimensions, and time
 */

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDimensions(width, height) {
  if (!width || !height) return '';
  return `${width} × ${height} px`;
}

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return 'calculating...';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}
