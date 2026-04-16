import { useApp } from '../../context/AppContext';

export function Header() {
  const { accounts, setSelectedAccountId } = useApp();

  function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (!query) { setSelectedAccountId(null); return; }
    const match = accounts.find(
      (a) => a.customerName.toLowerCase().includes(query) || a.iban.toLowerCase().includes(query)
    );
    if (match) setSelectedAccountId(match.accountId);
  }

  return (
    <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 rounded-lg p-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold tracking-tight">AML Compliance Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search accounts..."
            onChange={handleSearch}
            className="bg-slate-800 text-sm text-slate-200 placeholder-slate-400 rounded-lg px-3 py-1.5 pl-8 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span className="text-xs text-slate-400">Last updated: April 16, 2026</span>
      </div>
    </header>
  );
}
