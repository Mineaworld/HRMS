import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const LeaveSummaryChart: React.FC = () => {
  const data = {
    labels: [
      'Casual Leave',
      'Bday/Anniv Leave',
      'Optional Holiday',
      'Sick Leave',
      'Privilege Leave',
    ],
    datasets: [
      {
        data: [35, 15, 12, 18, 20],
        backgroundColor: [
          '#06B6D4', // Cyan
          '#1E293B', // Slate / Dark Navy
          '#84CC16', // Lime Green
          '#F97316', // Orange
          '#3B82F6', // Royal Blue
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
        display: false, // We use custom HTML legend matching Dribbble
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.raw}%`,
        },
      },
    },
  };

  const legendItems = [
    { label: 'Casual Leave', color: '#06B6D4' },
    { label: 'Bday/Anniv Leave', color: '#1E293B' },
    { label: 'Optional Holiday', color: '#84CC16' },
    { label: 'Sick Leave', color: '#F97316' },
    { label: 'Privilege Leave', color: '#3B82F6' },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col h-full">
      <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-4">Leave Summary</h2>

      <div className="flex items-center justify-between flex-1 gap-4">
        {/* Donut Chart Canvas */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <Doughnut data={data} options={options} />
        </div>

        {/* Side Legend */}
        <div className="flex flex-col gap-2 flex-1 pl-2">
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="truncate text-[11px] font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
