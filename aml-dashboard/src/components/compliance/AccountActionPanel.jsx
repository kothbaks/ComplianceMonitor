import { useApp } from '../../context/AppContext';
import { ACTION_COLORS } from '../../utils/constants';

export function AccountActionPanel() {
  const { selectedAccount, addToast } = useApp();

  if (!selectedAccount) return null;

  const actions = [
    { key: 'SAR', ...ACTION_COLORS.SAR },
    { key: 'EDD', ...ACTION_COLORS.EDD },
    { key: 'FREEZE', ...ACTION_COLORS.FREEZE },
    { key: 'FIU_ESCALATION', ...ACTION_COLORS.FIU_ESCALATION },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h4 className="text-xs font-semibold text-slate-700 mb-3">
        Actions for {selectedAccount.customerName}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => addToast(`${action.label} — Action logged (mock)`, 'success')}
            className={`text-xs font-medium px-3 py-2 rounded-lg border transition-colors hover:opacity-80 ${action.bg} ${action.text}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
