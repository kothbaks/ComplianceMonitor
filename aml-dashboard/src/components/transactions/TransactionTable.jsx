import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useFilters } from '../../hooks/useFilters';
import { usePagination } from '../../hooks/usePagination';
import { HopBadge } from '../graph/HopBadge';
import { FilterBar } from './FilterBar';
import { TransactionDetail } from './TransactionDetail';
import { EmptyState } from '../common/EmptyState';
import { exportToCsv } from '../../utils/exportCsv';

export function TransactionTable() {
  const { edges, accounts, flags, selectedAccountId } = useApp();
  const [selectedEdge, setSelectedEdge] = useState(null);

  const accountEdges = useMemo(() => {
    if (!selectedAccountId) return edges;
    return edges.filter(
      (e) => e.fromAccountId === selectedAccountId || e.toAccountId === selectedAccountId
    );
  }, [edges, selectedAccountId]);

  const { filters, filteredEdges, ...filterActions } = useFilters(accounts, accountEdges, flags);
  const sorted = useMemo(
    () => [...filteredEdges].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [filteredEdges]
  );
  const { page, totalPages, currentItems, nextPage, prevPage, totalItems } = usePagination(sorted);

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.accountId, a])), [accounts]);
  const getName = (id) => accountMap.get(id)?.customerName || id.slice(-8);

  function handleExport() {
    exportToCsv(sorted, [
      { label: 'Edge ID', accessor: 'edgeId' },
      { label: 'From', accessor: (r) => getName(r.fromAccountId) },
      { label: 'To', accessor: (r) => getName(r.toAccountId) },
      { label: 'Amount', accessor: 'amount' },
      { label: 'Currency', accessor: 'currency' },
      { label: 'Hops', accessor: 'hops' },
      { label: 'Timestamp', accessor: 'timestamp' },
      { label: 'Flagged', accessor: 'isFlagged' },
    ], 'transactions.csv');
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar filters={filters} {...filterActions} />
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
        <span className="text-xs text-slate-500">
          {totalItems} transaction{totalItems !== 1 ? 's' : ''}
          {selectedAccountId ? ' for selected account' : ' total'}
        </span>
        <button onClick={handleExport} className="text-xs text-blue-600 hover:underline">Export CSV</button>
      </div>

      {currentItems.length === 0 ? (
        <EmptyState message="No transactions match filters" />
      ) : (
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-left text-xs text-slate-500 uppercase">
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2">Hops</th>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Flagged</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((edge) => (
                <tr
                  key={edge.edgeId}
                  onClick={() => setSelectedEdge(edge)}
                  className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2 text-slate-700">{getName(edge.fromAccountId)}</td>
                  <td className="px-4 py-2 text-slate-700">{getName(edge.toAccountId)}</td>
                  <td className="px-4 py-2 text-right font-mono text-slate-800">
                    {edge.currency} {edge.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2"><HopBadge hops={edge.hops} /></td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {new Date(edge.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {edge.isFlagged ? (
                      <span className="text-red-600 font-bold text-xs">FLAGGED</span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-slate-200 text-xs text-slate-500">
          <button onClick={prevPage} disabled={page === 1} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40">
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={nextPage} disabled={page === totalPages} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40">
            Next
          </button>
        </div>
      )}

      {selectedEdge && (
        <TransactionDetail edge={selectedEdge} accounts={accounts} onClose={() => setSelectedEdge(null)} />
      )}
    </div>
  );
}
