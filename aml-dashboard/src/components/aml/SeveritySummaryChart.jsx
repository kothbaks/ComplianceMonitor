import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useApp } from '../../context/AppContext';
import { SEVERITY_COLORS, SEVERITIES } from '../../utils/constants';

ChartJS.register(ArcElement, Tooltip, Legend);

export function SeveritySummaryChart() {
  const { flags } = useApp();

  const chartData = useMemo(() => {
    const counts = SEVERITIES.map((s) => flags.filter((f) => f.severity === s).length);
    return {
      labels: SEVERITIES,
      datasets: [{
        data: counts,
        backgroundColor: SEVERITIES.map((s) => SEVERITY_COLORS[s].hex),
        borderWidth: 2,
        borderColor: '#fff',
      }],
    };
  }, [flags]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h4 className="text-xs font-semibold text-slate-700 mb-3">Severity Distribution</h4>
      <div className="h-48 flex items-center justify-center">
        <Doughnut
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
          }}
        />
      </div>
    </div>
  );
}
