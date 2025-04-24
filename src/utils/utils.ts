import { format } from "date-fns";

/**
 * Formats a date into a readable string
 * @param date - Date object or string to format
 * @returns Formatted date string or 'Invalid Date' if input is invalid
 */
export function formatDate(date: Date | string): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMM d, yyyy");
  } catch {
    return "Invalid Date";
  }
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length of the text
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trim() + "...";
}
