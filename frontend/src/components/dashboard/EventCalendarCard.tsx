import React, { useState } from 'react';
import { CaretLeft, CaretRight, CalendarBlank } from '@phosphor-icons/react';

export const EventCalendarCard: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(0);

  const months = ['January 2026', 'February 2026', 'March 2026'];
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const calendarCells = [
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    { day: 31, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true, hasEvent: true },
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
    { day: 15, isCurrentMonth: true, hasEvent: true },
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
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col h-full">
      {/* Title & Navigation */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarBlank weight="duotone" className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-900">Schedule</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
            aria-label="Previous month"
            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <CaretLeft weight="bold" className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-semibold text-slate-700 min-w-[90px] text-center">
            {months[currentMonthIndex]}
          </span>
          <button
            onClick={() => setCurrentMonthIndex((prev) => Math.min(months.length - 1, prev + 1))}
            aria-label="Next month"
            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <CaretRight weight="bold" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-[10px] font-medium text-slate-400 pb-1.5 border-b border-slate-100">
        {weekDays.map((w, idx) => (
          <div key={idx}>{w}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center flex-1 pt-1.5">
        {calendarCells.map((cell, idx) => {
          const isSelected = cell.isCurrentMonth && cell.day === selectedDay;

          return (
            <button
              key={idx}
              onClick={() => {
                if (cell.isCurrentMonth) setSelectedDay(cell.day);
              }}
              aria-label={cell.isCurrentMonth ? `${cell.day} ${months[currentMonthIndex]}` : undefined}
              className={`relative flex items-center justify-center h-7 rounded-md text-xs transition-colors ${
                !cell.isCurrentMonth
                  ? 'text-slate-300 pointer-events-none'
                  : isSelected
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{cell.day}</span>
              {cell.hasEvent && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
