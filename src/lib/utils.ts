import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generates a unique key for React list items
 * @param id The primary identifier
 * @param type The media type (movie/tv)
 * @param index The array index as a fallback
 * @returns A unique string key
 */
export function generateUniqueKey(id: number, type: string, index: number): string {
  // Combine multiple unique identifiers to ensure uniqueness
  return `${type}-${id}-${index}`;
}

/**
 * Validates if an array has duplicate IDs
 * @param items Array of items with ID property
 * @returns Array of duplicate IDs found
 */
export function findDuplicateIds<T extends { id: number }>(items: T[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();

  items.forEach(item => {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }
    seen.add(item.id);
  });

  return Array.from(duplicates);
}