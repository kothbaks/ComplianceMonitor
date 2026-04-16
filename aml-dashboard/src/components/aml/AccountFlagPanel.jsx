import { useApp } from '../../context/AppContext';
import { AmlFlagCard } from './AmlFlagCard';
import { EmptyState } from '../common/EmptyState';

export function AccountFlagPanel() {
  const { selectedAccount, flags, selectedAccountId } = useApp();
  const accountFlags = flags.filter((f) => f.accountId === selectedAccountId);

  if (!selectedAccountId) {
    return <EmptyState message="Select an account to view AML flags" />;
  }

  if (accountFlags.length === 0) {
    return <EmptyState message="No AML flags detected for this account" />;
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">
        AML Flags for {selectedAccount?.customerName || 'Selected Account'} ({accountFlags.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {accountFlags.map((flag) => (
          <AmlFlagCard key={flag.flagId} flag={flag} />
        ))}
      </div>
    </div>
  );
}
