export function HopBadge({ hops }) {
  let color = 'bg-slate-100 text-slate-600';
  if (hops >= 4) color = 'bg-red-100 text-red-700';
  else if (hops >= 3) color = 'bg-amber-100 text-amber-700';

  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded ${color}`}
      title={`${hops} hop${hops !== 1 ? 's' : ''} in transaction chain`}
    >
      {hops}H
    </span>
  );
}
