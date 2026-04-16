import { useState, useMemo } from 'react';
import { PAGE_SIZE } from '../utils/constants';

export function usePagination(items, pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const currentItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const goToPage = (n) => setPage(Math.max(1, Math.min(n, totalPages)));

  // Reset to page 1 when items change
  useMemo(() => {
    if (page > totalPages) setPage(1);
  }, [items.length]);

  return { page, totalPages, currentItems, nextPage, prevPage, goToPage, totalItems: items.length };
}
