import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const TimesheetSummaryChart: React.FC = () => {
  const data = {
    labels: ['Draft', 'Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [20, 30, 35, 15],
        backgroundColor: [
          '#8B5CF6', // Purple (Draft)
          '#FB7185', // Salmon / Rose (Pending)
          '#06B6D4', // Cyan (Approved)
          '#FBBF24', // Amber (Rejected)
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
          label: (context: any) => ` ${context.label}: ${context.raw}%`,
        },
      },
    },
  };

  const legendPills = [
    { label: 'Draft', color: '#8B5CF6' },
    { label: 'Pending', color: '#FB7185' },
    { label: 'Approved', color: '#06B6D4' },
    { label: 'Rejected', color: '#FBBF24' },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col h-full justify-between">
      <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-2">Timesheet Summary</h2>

      {/* Donut Chart Canvas in center */}
      <div className="relative w-full h-36 flex items-center justify-center my-auto">
        <Doughnut data={data} options={options} />
      </div>

      {/* Bottom Horizontal Legend */}
      <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
        {legendPills.map((pill, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: pill.color }}
            ></span>
            <span>{pill.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
