import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useHrmsStore } from '../../store/useHrmsStore';

ChartJS.register(ArcElement, Tooltip, Legend);

export const TimesheetSummaryChart: React.FC = () => {
  const { leaves } = useHrmsStore();

  const approved = leaves.filter((l) => l.status === 'APPROVED').length;
  const pending = leaves.filter((l) => l.status === 'PENDING').length;
  const rejected = leaves.filter((l) => l.status === 'REJECTED').length;

  const data = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [approved, pending, rejected],
        backgroundColor: [
          '#10B981', // Emerald / Green (Approved)
          '#F59E0B', // Amber (Pending)
          '#EF4444', // Red (Rejected)
        ],
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

  const legendPills = [
    { label: 'Approved', count: approved, color: '#10B981' },
    { label: 'Pending', count: pending, color: '#F59E0B' },
    { label: 'Rejected', count: rejected, color: '#EF4444' },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Request Approvals</h2>
        <span className="text-[11px] font-mono text-slate-400">{leaves.length} Applications</span>
      </div>

      {/* Donut Chart Canvas in center */}
      <div className="relative w-full h-36 flex items-center justify-center my-auto">
        <Doughnut data={data} options={options} />
      </div>

      {/* Bottom Horizontal Legend with Real Counts */}
      <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
        {legendPills.map((pill, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: pill.color }}
            ></span>
            <span>
              {pill.label} <strong className="text-slate-800 font-mono">({pill.count})</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
