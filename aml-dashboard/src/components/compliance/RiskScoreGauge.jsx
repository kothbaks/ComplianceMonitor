import { useMemo } from 'react';
import { SEVERITY_COLORS } from '../../utils/constants';

export function RiskScoreGauge({ account }) {
  const score = account?.riskScore || 0;

  const color = useMemo(() => {
    if (score >= 80) return SEVERITY_COLORS.CRITICAL.hex;
    if (score >= 60) return SEVERITY_COLORS.HIGH.hex;
    if (score >= 40) return SEVERITY_COLORS.MEDIUM.hex;
    return SEVERITY_COLORS.LOW.hex;
  }, [score]);

  // Semi-circular gauge using SVG
  const radius = 60;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col items-center">
      <h4 className="text-xs font-semibold text-slate-700 mb-2">Composite Risk Score</h4>
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path
          d="M 10 75 A 60 60 0 0 1 130 75"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 10 75 A 60 60 0 0 1 130 75"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text x="70" y="68" textAnchor="middle" className="text-2xl font-bold" fill={color} fontSize="24">
          {score}
        </text>
      </svg>
      <p className="text-[10px] text-slate-400 mt-1">0–100 composite scale</p>
    </div>
  );
}
