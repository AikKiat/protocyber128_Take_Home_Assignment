import { format } from 'date-fns';

/**
 * Format file size in bytes to human-readable format
 */
export const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return 'Unknown';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

/**
 * Format Unix timestamp to readable date
 */
export const formatDate = (timestamp: number | undefined): string => {
  if (!timestamp) return 'Unknown';

  try {
    return format(new Date(timestamp * 1000), 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format Unix timestamp to date and time
 */
export const formatDateTime = (timestamp: number | undefined): string => {
  if (!timestamp) return 'Unknown';

  try {
    return format(new Date(timestamp * 1000), 'MMM d, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};
