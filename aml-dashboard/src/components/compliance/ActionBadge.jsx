import { ACTION_COLORS } from '../../utils/constants';

export function ActionBadge({ action }) {
  const config = ACTION_COLORS[action] || ACTION_COLORS.EDD;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
