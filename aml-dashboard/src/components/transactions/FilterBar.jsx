import { CURRENCIES } from '../../utils/constants';

export function FilterBar({ filters, setDateFrom, setDateTo, setFlaggedOnly, setCurrency, clearFilters }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-white border-b border-slate-200">
      <label className="flex items-center gap-1 text-xs text-slate-600">
        From
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border border-slate-300 rounded px-2 py-1 text-xs"
        />
      </label>
      <label className="flex items-center gap-1 text-xs text-slate-600">
        To
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border border-slate-300 rounded px-2 py-1 text-xs"
        />
      </label>
      <label className="flex items-center gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={filters.flaggedOnly}
          onChange={(e) => setFlaggedOnly(e.target.checked)}
          className="rounded border-slate-300"
        />
        Flagged only
      </label>
      <select
        value={filters.currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-600"
      >
        <option value="">All currencies</option>
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <button
        onClick={clearFilters}
        className="text-xs text-blue-600 hover:underline ml-auto"
      >
        Clear filters
      </button>
    </div>
  );
}
