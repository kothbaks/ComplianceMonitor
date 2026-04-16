import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useApp } from '../../context/AppContext';
import { TYPOLOGY_COLORS, TYPOLOGIES } from '../../utils/constants';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function PatternTimeSeriesChart() {
  const { edges } = useApp();

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date('2026-04-16');
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const flaggedEdges = edges.filter((e) => e.isFlagged);

    const datasets = TYPOLOGIES.map((typology) => {
      const data = days.map((day) =>
        flaggedEdges.filter((e) => e.timestamp.slice(0, 10) === day).length
      );
      return {
        label: typology.replace(/_/g, ' '),
        data,
        borderColor: TYPOLOGY_COLORS[typology],
        backgroundColor: TYPOLOGY_COLORS[typology] + '20',
        tension: 0.3,
        pointRadius: 2,
      };
    });

    return {
      labels: days.map((d) => d.slice(5)),
      datasets,
    };
  }, [edges]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h4 className="text-xs font-semibold text-slate-700 mb-3">Flagged Activity (30 days)</h4>
      <div className="h-48">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
            scales: {
              x: { ticks: { font: { size: 9 }, maxRotation: 45 } },
              y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 9 } } },
            },
          }}
        />
      </div>
    </div>
  );
}
