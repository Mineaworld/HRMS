import React, { useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

export const EventCalendarCard: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(0);

  const months = ['January 2026', 'February 2026', 'March 2026'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarCells = [
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    { day: 31, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true, isHighlighted: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-full">
      {/* Title */}
      <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-2">
        Event Calendar
      </h2>

      {/* Month Navigator Header with Blue Text matching Reference */}
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
          aria-label="Previous month"
          className="p-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <CaretLeft weight="bold" className="w-4 h-4" />
        </button>

        <span className="text-sm font-bold text-blue-600 tracking-tight">
          {months[currentMonthIndex]}
        </span>

        <button
          onClick={() => setCurrentMonthIndex((prev) => Math.min(months.length - 1, prev + 1))}
          aria-label="Next month"
          className="p-1 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <CaretRight weight="bold" className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-500 pb-1.5 border-b border-slate-100">
        {weekDays.map((w, idx) => (
          <div key={idx}>{w}</div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center flex-1 pt-2">
        {calendarCells.map((cell, idx) => {
          const isSelected = cell.isCurrentMonth && cell.day === selectedDay;
          const isHighlighted = cell.isHighlighted;

          return (
            <button
              key={idx}
              onClick={() => {
                if (cell.isCurrentMonth) setSelectedDay(cell.day);
              }}
              aria-label={cell.isCurrentMonth ? `${cell.day} ${months[currentMonthIndex]}` : undefined}
              className={`flex items-center justify-center h-7 rounded-lg text-xs transition-colors ${
                !cell.isCurrentMonth
                  ? 'text-slate-300 pointer-events-none'
                  : isHighlighted
                  ? 'bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-sm shadow-rose-500/30'
                  : isSelected
                  ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                  : 'text-slate-700 hover:bg-slate-100 font-medium'
              }`}
            >
              <span>{cell.day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
