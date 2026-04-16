import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { rankAccounts } from '../../services/amlDetection';
import { RISK_COLORS } from '../../utils/constants';
import { ActionBadge } from './ActionBadge';
import { EmptyState } from '../common/EmptyState';

export function PriorityQueue() {
  const { accounts, edges, flags, setSelectedAccountId, setActiveTab } = useApp();

  const ranked = useMemo(() => rankAccounts(accounts, edges, flags), [accounts, edges, flags]);

  if (ranked.length === 0) {
    return <EmptyState message="No accounts requiring action" />;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">
          Compliance Priority Queue ({ranked.length} accounts)
        </h3>
      </div>
      <div className="space-y-2">
        {ranked.map((account, idx) => {
          const risk = RISK_COLORS[account.riskRating] || RISK_COLORS.LOW;
          const topAction = account.flags[0]?.recommendedAction;
          return (
            <div
              key={account.accountId}
              className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-4 hover:border-blue-300 transition-colors"
            >
              <span className="text-lg font-bold text-slate-300 w-8 text-center">#{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">{account.customerName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${risk.bg} ${risk.text}`}>
                    {account.riskRating}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-slate-500">{account.flagCount} flag{account.flagCount !== 1 ? 's' : ''}</span>
                  <span className="text-[10px] text-slate-500">Risk score: <span className="font-bold">{account.riskScore}</span></span>
                  {topAction && <ActionBadge action={topAction} />}
                </div>
              </div>
              <button
                onClick={() => { setSelectedAccountId(account.accountId); setActiveTab('aml'); }}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                Review
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
