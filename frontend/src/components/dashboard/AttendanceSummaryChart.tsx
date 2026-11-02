import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export const AttendanceSummaryChart: React.FC = () => {
  const data = {
    labels: ['Present', 'On Leave', 'Absent'],
    datasets: [
      {
        data: [130, 85, 170],
        backgroundColor: [
          '#60A5FA', // Blue
          '#A3E635', // Lime / Green
          '#F87171', // Coral / Red
        ],
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` Count: ${context.raw} Employees`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#64748B',
        },
      },
      y: {
        min: 0,
        max: 200,
        ticks: {
          stepSize: 50,
          font: {
            size: 10,
          },
          color: '#94A3B8',
        },
        grid: {
          color: '#F1F5F9',
        },
      },
    },
  };

  const legendItems = [
    { label: 'Present', color: '#60A5FA' },
    { label: 'On Leave', color: '#A3E635' },
    { label: 'Absent', color: '#F87171' },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col h-full justify-between">
      <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-2">Attendance Summary</h2>

      {/* Bar Chart Canvas */}
      <div className="relative w-full h-36 my-auto">
        <Bar data={data} options={options} />
      </div>

      {/* Bottom Legend */}
      <div className="flex items-center justify-center gap-4 pt-3">
        {legendItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            ></span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
