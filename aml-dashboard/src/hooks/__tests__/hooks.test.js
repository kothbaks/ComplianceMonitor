import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters } from '../useFilters';
import { usePagination } from '../usePagination';

// ---------------------------------------------------------------------------
// useFilters
// ---------------------------------------------------------------------------

function makeEdge(overrides = {}) {
  return {
    edgeId: 'e1',
    fromAccountId: 'acc-1',
    toAccountId: 'acc-2',
    amount: 5000,
    currency: 'EUR',
    hops: 1,
    timestamp: '2024-01-15T10:00:00Z',
    isFlagged: false,
    ...overrides,
  };
}

describe('useFilters', () => {
  it('should return all edges when no filters are applied', () => {
    const edges = [makeEdge({ edgeId: 'e1' }), makeEdge({ edgeId: 'e2' })];
    const { result } = renderHook(() => useFilters(edges));
    expect(result.current.filteredEdges).toHaveLength(2);
  });

  it('should filter by dateFrom (ISO 8601)', () => {
    const edges = [
      makeEdge({ edgeId: 'e1', timestamp: '2024-01-10T00:00:00Z' }),
      makeEdge({ edgeId: 'e2', timestamp: '2024-01-20T00:00:00Z' }),
    ];
    const { result } = renderHook(() => useFilters(edges));
    act(() => result.current.setDateFrom('2024-01-15'));
    expect(result.current.filteredEdges).toHaveLength(1);
    expect(result.current.filteredEdges[0].edgeId).toBe('e2');
  });

  it('should filter by dateTo (ISO 8601)', () => {
    const edges = [
      makeEdge({ edgeId: 'e1', timestamp: '2024-01-10T00:00:00Z' }),
      makeEdge({ edgeId: 'e2', timestamp: '2024-01-20T00:00:00Z' }),
    ];
    const { result } = renderHook(() => useFilters(edges));
    act(() => result.current.setDateTo('2024-01-15'));
    expect(result.current.filteredEdges).toHaveLength(1);
    expect(result.current.filteredEdges[0].edgeId).toBe('e1');
  });

  it('should filter by currency', () => {
    const edges = [
      makeEdge({ edgeId: 'e1', currency: 'EUR' }),
      makeEdge({ edgeId: 'e2', currency: 'USD' }),
    ];
    const { result } = renderHook(() => useFilters(edges));
    act(() => result.current.setCurrency('USD'));
    expect(result.current.filteredEdges).toHaveLength(1);
    expect(result.current.filteredEdges[0].edgeId).toBe('e2');
  });

  it('should filter by flaggedOnly', () => {
    const edges = [
      makeEdge({ edgeId: 'e1', isFlagged: false }),
      makeEdge({ edgeId: 'e2', isFlagged: true }),
    ];
    const { result } = renderHook(() => useFilters(edges));
    act(() => result.current.setFlaggedOnly(true));
    expect(result.current.filteredEdges).toHaveLength(1);
    expect(result.current.filteredEdges[0].edgeId).toBe('e2');
  });

  it('should apply date range and currency filters together', () => {
    const edges = [
      makeEdge({ edgeId: 'e1', timestamp: '2024-01-05T00:00:00Z', currency: 'EUR' }),
      makeEdge({ edgeId: 'e2', timestamp: '2024-01-20T00:00:00Z', currency: 'USD' }),
      makeEdge({ edgeId: 'e3', timestamp: '2024-01-20T00:00:00Z', currency: 'EUR' }),
    ];
    const { result } = renderHook(() => useFilters(edges));
    act(() => {
      result.current.setDateFrom('2024-01-15');
      result.current.setCurrency('EUR');
    });
    expect(result.current.filteredEdges).toHaveLength(1);
    expect(result.current.filteredEdges[0].edgeId).toBe('e3');
  });

  it('should apply flaggedOnly and currency together', () => {
    const edges = [
      makeEdge({ edgeId: 'e1', isFlagged: true, currency: 'EUR' }),
      makeEdge({ edgeId: 'e2', isFlagged: true, currency: 'USD' }),
      makeEdge({ edgeId: 'e3', isFlagged: false, currency: 'EUR' }),
    ];
    const { result } = renderHook(() => useFilters(edges));
    act(() => {
      result.current.setFlaggedOnly(true);
      result.current.setCurrency('EUR');
    });
    expect(result.current.filteredEdges).toHaveLength(1);
    expect(result.current.filteredEdges[0].edgeId).toBe('e1');
  });

  it('should return empty array when all edges are filtered out', () => {
    const edges = [makeEdge({ edgeId: 'e1', currency: 'EUR' })];
    const { result } = renderHook(() => useFilters(edges));
    act(() => result.current.setCurrency('USD'));
    expect(result.current.filteredEdges).toHaveLength(0);
  });

  it('should restore all edges after clearFilters is called', () => {
    const edges = [makeEdge({ edgeId: 'e1' }), makeEdge({ edgeId: 'e2' })];
    const { result } = renderHook(() => useFilters(edges));
    act(() => result.current.setCurrency('USD'));
    expect(result.current.filteredEdges).toHaveLength(0);
    act(() => result.current.clearFilters());
    expect(result.current.filteredEdges).toHaveLength(2);
  });

  it('should expose filter state that reflects current values', () => {
    const edges = [];
    const { result } = renderHook(() => useFilters(edges));
    act(() => {
      result.current.setDateFrom('2024-01-01');
      result.current.setCurrency('GBP');
      result.current.setFlaggedOnly(true);
    });
    expect(result.current.filters.dateFrom).toBe('2024-01-01');
    expect(result.current.filters.currency).toBe('GBP');
    expect(result.current.filters.flaggedOnly).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// usePagination
// ---------------------------------------------------------------------------

function makeItems(count) {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1 }));
}

describe('usePagination', () => {
  it('should default to page 1', () => {
    const { result } = renderHook(() => usePagination(makeItems(100)));
    expect(result.current.page).toBe(1);
  });

  it('should default to PAGE_SIZE (30) items per page', () => {
    const { result } = renderHook(() => usePagination(makeItems(100)));
    expect(result.current.currentItems).toHaveLength(30);
  });

  it('should compute totalPages correctly', () => {
    const { result } = renderHook(() => usePagination(makeItems(61)));
    expect(result.current.totalPages).toBe(3);
  });

  it('should return 1 total page for empty items', () => {
    const { result } = renderHook(() => usePagination([]));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.currentItems).toHaveLength(0);
  });

  it('should advance to the next page', () => {
    const { result } = renderHook(() => usePagination(makeItems(60)));
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(2);
    expect(result.current.currentItems[0].id).toBe(31);
  });

  it('should not advance past the last page', () => {
    const { result } = renderHook(() => usePagination(makeItems(30)));
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(1);
  });

  it('should go to the previous page', () => {
    const { result } = renderHook(() => usePagination(makeItems(60)));
    act(() => result.current.nextPage());
    act(() => result.current.prevPage());
    expect(result.current.page).toBe(1);
  });

  it('should not go below page 1', () => {
    const { result } = renderHook(() => usePagination(makeItems(30)));
    act(() => result.current.prevPage());
    expect(result.current.page).toBe(1);
  });

  it('should go to an arbitrary page with goToPage', () => {
    const { result } = renderHook(() => usePagination(makeItems(90)));
    act(() => result.current.goToPage(3));
    expect(result.current.page).toBe(3);
  });

  it('should clamp goToPage below 1 to page 1', () => {
    const { result } = renderHook(() => usePagination(makeItems(90)));
    act(() => result.current.goToPage(0));
    expect(result.current.page).toBe(1);
  });

  it('should clamp goToPage above totalPages to the last page', () => {
    const { result } = renderHook(() => usePagination(makeItems(30)));
    act(() => result.current.goToPage(99));
    expect(result.current.page).toBe(1);
  });

  it('should show the partial last page correctly (31 items → last page has 1)', () => {
    const { result } = renderHook(() => usePagination(makeItems(31)));
    act(() => result.current.goToPage(2));
    expect(result.current.currentItems).toHaveLength(1);
    expect(result.current.currentItems[0].id).toBe(31);
  });

  it('should accept a custom page size', () => {
    const { result } = renderHook(() => usePagination(makeItems(20), 5));
    expect(result.current.totalPages).toBe(4);
    expect(result.current.currentItems).toHaveLength(5);
  });

  it('should expose totalItems', () => {
    const { result } = renderHook(() => usePagination(makeItems(42)));
    expect(result.current.totalItems).toBe(42);
  });

  it('should reset to page 1 when the dataset shrinks below the current page', () => {
    let items = makeItems(60);
    const { result, rerender } = renderHook(({ data }) => usePagination(data), {
      initialProps: { data: items },
    });
    act(() => result.current.goToPage(2));
    expect(result.current.page).toBe(2);

    // Shrink to fewer than 30 items — page 2 no longer exists
    items = makeItems(10);
    rerender({ data: items });
    expect(result.current.page).toBe(1);
  });
});
