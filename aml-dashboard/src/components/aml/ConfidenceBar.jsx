import { SEVERITY_COLORS } from '../../utils/constants';

export function ConfidenceBar({ score, severity }) {
  const color = SEVERITY_COLORS[severity]?.hex || '#94a3b8';
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  );
}
