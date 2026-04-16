import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getThresholdBreaches } from '../../services/amlDetection';
import { THRESHOLD_AMOUNT } from '../../utils/constants';

export function ThresholdBreachAlert() {
  const { edges, accounts } = useApp();
  const [dismissed, setDismissed] = useState(new Set());

  const breaches = useMemo(() => getThresholdBreaches(edges), [edges]);

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.accountId, a])), [accounts]);

  const visible = breaches.filter((b) => !dismissed.has(b.accountId + b.day));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 px-4 py-2">
      {visible.map((breach) => {
        const name = accountMap.get(breach.accountId)?.customerName || breach.accountId;
        return (
          <div
            key={breach.accountId + breach.day}
            className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-red-700">
                <span className="font-bold">{name}</span> exceeded €{THRESHOLD_AMOUNT.toLocaleString()} threshold on {breach.day}
                {' '}(€{breach.total.toLocaleString()} across {breach.edges.length} transactions)
              </span>
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set([...prev, breach.accountId + breach.day]))}
              className="text-red-400 hover:text-red-600 text-sm ml-2"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
