import { useApp } from '../../context/AppContext';
import { RISK_COLORS } from '../../utils/constants';

export function Sidebar({ collapsed, onToggle }) {
  const { accounts, selectedAccountId, setSelectedAccountId, flags } = useApp();

  function getFlagCount(accountId) {
    return flags.filter((f) => f.accountId === accountId).length;
  }

  function getInitials(name) {
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }

  if (collapsed) {
    return (
      <aside className="w-12 bg-slate-50 border-r border-slate-200 flex flex-col items-center pt-3 flex-shrink-0">
        <button onClick={onToggle} className="p-1.5 rounded hover:bg-slate-200" aria-label="Expand sidebar">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Accounts ({accounts.length})</h2>
        <button onClick={onToggle} className="p-1 rounded hover:bg-slate-200" aria-label="Collapse sidebar">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto flex-1">
        {accounts.map((account) => {
          const flagCount = getFlagCount(account.accountId);
          const risk = RISK_COLORS[account.riskRating] || RISK_COLORS.LOW;
          const isSelected = account.accountId === selectedAccountId;
          return (
            <button
              key={account.accountId}
              onClick={() => setSelectedAccountId(account.accountId)}
              className={`w-full text-left px-4 py-2.5 border-b border-slate-100 flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                isSelected ? 'bg-blue-50 border-l-3 border-l-blue-600' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${risk.bg} ${risk.text} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                {getInitials(account.customerName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{account.customerName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{account.accountType}</span>
                  <span className={`text-[10px] ${risk.bg} ${risk.text} px-1.5 py-0.5 rounded`}>{account.riskRating}</span>
                </div>
              </div>
              {flagCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {flagCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
