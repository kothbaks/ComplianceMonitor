/**
 * Pagination hook for managing paginated lists.
 * Automatically resets to page 1 when items array changes.
 */

import { useState, useMemo, useEffect } from 'react';
import { PAGE_SIZE } from '../utils/constants';

/**
 * Custom hook for client-side pagination of an array.
 * Provides page navigation controls and current page slice.
 * 
 * @param {Array} items - The full array of items to paginate.
 * @param {number} pageSize - Items per page (default: 30 from PAGE_SIZE constant).
 * @returns {Object} Pagination state and controls:
 *   - page: Current page number (1-indexed)
 *   - totalPages: Total number of pages
 *   - currentItems: Array slice for current page
 *   - nextPage: Function to advance to next page
 *   - prevPage: Function to go to previous page
 *   - goToPage: Function to jump to specific page (1-indexed)
 *   - totalItems: Total count of items
 */
export function usePagination(items, pageSize = PAGE_SIZE) {
  // Validate inputs
  if (!Array.isArray(items)) {
    throw new TypeError('items must be an array');
  }
  if (typeof pageSize !== 'number' || pageSize <= 0) {
    throw new TypeError('pageSize must be a positive number');
  }

  const [page, setPage] = useState(1);
  
  // Calculate total pages (minimum 1 to avoid division issues)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Slice items for current page using useMemo for performance
  const currentItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [items, page, pageSize]);

  // Navigation functions with boundary checking
  const nextPage = () => {
    setPage((current) => Math.min(current + 1, totalPages));
  };

  const prevPage = () => {
    setPage((current) => Math.max(current - 1, 1));
  };

  const goToPage = (targetPage) => {
    if (typeof targetPage !== 'number') {
      return;
    }
    setPage(Math.max(1, Math.min(targetPage, totalPages)));
  };

  // Reset to page 1 when items array changes (e.g., after filtering)
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [items.length, totalPages]);

  return { 
    page, 
    totalPages, 
    currentItems, 
    nextPage, 
    prevPage, 
    goToPage, 
    totalItems: items.length 
  };
}
