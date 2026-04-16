import { useState } from 'react';
import { TYPOLOGY_LABELS, TYPOLOGY_COLORS } from '../../utils/constants';

const TYPOLOGY_DESCRIPTIONS = {
  STRUCTURING: 'Breaking large transactions into smaller amounts (typically just below reporting thresholds) to avoid triggering mandatory reporting requirements.',
  LAYERING: 'Moving funds through multiple intermediary accounts or transactions to distance the money from its criminal source and obscure the audit trail.',
  ROUND_TRIPPING: 'Circular movement of funds that return to the original sender, often through multiple jurisdictions, to create the appearance of legitimate business activity.',
  SHELL_NETWORK: 'Use of shell companies or nominee accounts with no real business purpose to disguise the beneficial ownership and movement of illicit funds.',
};

export function TypologyLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-lg bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-slate-700"
      >
        <span>AML Typology Reference</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-3 border-t border-slate-200 pt-3">
          {Object.entries(TYPOLOGY_LABELS).map(([key, label]) => (
            <div key={key} className="flex gap-3">
              <span
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: TYPOLOGY_COLORS[key] }}
              />
              <div>
                <p className="text-xs font-bold text-slate-700">{label}</p>
                <p className="text-[11px] text-slate-500">{TYPOLOGY_DESCRIPTIONS[key]}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
