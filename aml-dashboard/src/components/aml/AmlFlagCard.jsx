import { SEVERITY_COLORS, TYPOLOGY_LABELS, ACTION_COLORS } from '../../utils/constants';
import { ConfidenceBar } from './ConfidenceBar';
import { formatDistanceToNow } from 'date-fns';

export function AmlFlagCard({ flag }) {
  const severity = SEVERITY_COLORS[flag.severity] || SEVERITY_COLORS.LOW;
  const action = ACTION_COLORS[flag.recommendedAction] || ACTION_COLORS.EDD;

  return (
    <div className={`bg-white rounded-lg border ${severity.border} p-4 space-y-3`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800">
            {TYPOLOGY_LABELS[flag.typology] || flag.typology}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {formatDistanceToNow(new Date(flag.detectedAt), { addSuffix: true })}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${severity.bg} ${severity.text}`}>
          {flag.severity}
        </span>
      </div>
      <div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
          <span>Confidence</span>
          <span className="font-mono font-bold">{flag.confidenceScore}%</span>
        </div>
        <ConfidenceBar score={flag.confidenceScore} severity={flag.severity} />
      </div>
      <div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${action.bg} ${action.text}`}>
          {action.label}
        </span>
      </div>
    </div>
  );
}
