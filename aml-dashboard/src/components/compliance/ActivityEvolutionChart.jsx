import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { useApp } from '../../context/AppContext';
import { THRESHOLD_AMOUNT } from '../../utils/constants';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);
export function ActivityEvolutionChart() {
  const { edges, selectedAccountId } = useApp();

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date('2026-04-16');
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const accountEdges = selectedAccountId
      ? edges.filter((e) => e.isFlagged && (e.fromAccountId === selectedAccountId || e.toAccountId === selectedAccountId))
      : edges.filter((e) => e.isFlagged);

    const data = days.map((day) =>
      accountEdges
        .filter((e) => e.timestamp.slice(0, 10) === day)
        .reduce((sum, e) => sum + e.amount, 0)
    );

    return {
      labels: days.map((d) => d.slice(5)),
      datasets: [
        {
          label: 'Flagged Volume (€)',
          data,
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f620',
          fill: true,
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: '€10,000 Threshold',
          data: days.map(() => THRESHOLD_AMOUNT),
          borderColor: '#ef4444',
          borderDash: [6, 3],
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  }, [edges, selectedAccountId]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h4 className="text-xs font-semibold text-slate-700 mb-3">
        Flagged Transaction Volume (30 days){selectedAccountId ? ' — Selected Account' : ' — All Accounts'}
      </h4>
      <div className="h-48">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
            scales: {
              x: { ticks: { font: { size: 9 }, maxRotation: 45 } },
              y: { beginAtZero: true, ticks: { font: { size: 9 } } },
            },
          }}
        />
      </div>
    </div>
  );
}
