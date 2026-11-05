import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useHrmsStore } from '../../store/useHrmsStore';

ChartJS.register(ArcElement, Tooltip, Legend);

export const LeaveSummaryChart: React.FC = () => {
  const { leaves } = useHrmsStore();

  // Aggregate real leaves by leaveType
  const typeCounts: Record<string, number> = {};
  leaves.forEach((l) => {
    const type = l.leaveType || 'General Leave';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const categories = Object.keys(typeCounts).length > 0
    ? Object.keys(typeCounts)
    : ['Personal Leave', 'Sick Leave', 'Annual Leave', 'Casual Leave'];

  const counts = Object.keys(typeCounts).length > 0
    ? Object.values(typeCounts)
    : [4, 3, 2, 1];

  const palette = ['#06B6D4', '#1E293B', '#84CC16', '#F97316', '#3B82F6', '#A855F7'];

  const data = {
    labels: categories,
    datasets: [
      {
        data: counts,
        backgroundColor: categories.map((_, i) => palette[i % palette.length]),
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.raw} Requests`,
        },
      },
    },
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Leave Distribution</h2>
        <span className="text-[11px] font-mono text-slate-400">{leaves.length} Total</span>
      </div>

      <div className="flex items-center justify-between flex-1 gap-4">
        {/* Donut Chart Canvas */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <Doughnut data={data} options={options} />
        </div>

        {/* Side Legend */}
        <div className="flex flex-col gap-2 flex-1 pl-2">
          {categories.map((label, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: palette[idx % palette.length] }}
              ></span>
              <span className="truncate text-[11px] font-medium">{label}</span>
              <span className="ml-auto text-[10px] font-mono font-semibold text-slate-400">
                {counts[idx]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
