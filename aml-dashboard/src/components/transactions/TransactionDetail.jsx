import { HopBadge } from '../graph/HopBadge';

export function TransactionDetail({ edge, accounts, onClose }) {
  const accountMap = new Map(accounts.map((a) => [a.accountId, a]));
  const from = accountMap.get(edge.fromAccountId);
  const to = accountMap.get(edge.toAccountId);

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative w-96 bg-white shadow-xl h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">Transaction Detail</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <span className="text-[10px] uppercase text-slate-400">Edge ID</span>
            <p className="text-xs font-mono text-slate-600">{edge.edgeId}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase text-slate-400">From</span>
              <p className="text-sm font-medium text-slate-800">{from?.customerName || edge.fromAccountId}</p>
              <p className="text-[10px] text-slate-400">{from?.iban}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400">To</span>
              <p className="text-sm font-medium text-slate-800">{to?.customerName || edge.toAccountId}</p>
              <p className="text-[10px] text-slate-400">{to?.iban}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] uppercase text-slate-400">Amount</span>
              <p className="text-sm font-mono font-bold text-slate-800">
                {edge.currency} {edge.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400">Hops</span>
              <p className="mt-0.5"><HopBadge hops={edge.hops} /></p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400">Status</span>
              <p className={`text-sm font-bold ${edge.isFlagged ? 'text-red-600' : 'text-green-600'}`}>
                {edge.isFlagged ? 'FLAGGED' : 'CLEAR'}
              </p>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400">Timestamp</span>
            <p className="text-sm text-slate-700">{new Date(edge.timestamp).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
