import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useApp } from '../../context/AppContext';
import { TYPOLOGY_COLORS, TYPOLOGY_LABELS, TYPOLOGIES } from '../../utils/constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function TypologyBreakdownChart() {
  const { flags } = useApp();

  const chartData = useMemo(() => {
    const counts = TYPOLOGIES.map((t) => flags.filter((f) => f.typology === t).length);
    return {
      labels: TYPOLOGIES.map((t) => TYPOLOGY_LABELS[t]),
      datasets: [{
        label: 'Flag Count',
        data: counts,
        backgroundColor: TYPOLOGIES.map((t) => TYPOLOGY_COLORS[t]),
        borderRadius: 4,
      }],
    };
  }, [flags]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h4 className="text-xs font-semibold text-slate-700 mb-3">Flags by Typology</h4>
      <div className="h-48">
        <Bar
          data={chartData}
          options={{
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 9 } } },
              y: { ticks: { font: { size: 10 } } },
            },
          }}
        />
      </div>
    </div>
  );
}
