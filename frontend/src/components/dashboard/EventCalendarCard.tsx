import React, { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { CalendarDots, Sparkle } from '@phosphor-icons/react';

export const EventCalendarCard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2026, 0, 15));

  // Key event dates for company milestones matching announcements
  const eventDates = [
    new Date(2026, 0, 15),
    new Date(2026, 0, 18),
    new Date(2026, 0, 20),
    new Date(2026, 0, 27),
  ];

  const hasEventOnDate = (date: Date) => {
    return eventDates.some(
      (d) =>
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-full justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <CalendarDots weight="duotone" className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Event Calendar
          </h2>
        </div>
        <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          Q1 2026
        </span>
      </div>

      {/* Calendar Component */}
      <div className="flex-1 flex items-center justify-center py-1">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          defaultMonth={new Date(2026, 0)}
          className="p-0 select-none"
          modifiers={{
            hasEvent: (date) => hasEventOnDate(date),
          }}
          modifiersClassNames={{
            hasEvent:
              "relative font-bold after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-600 after:rounded-full",
          }}
        />
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-100/90 flex items-center justify-between text-[11px]">
        <div className="text-slate-600 truncate">
          <span className="font-semibold text-slate-800">
            {selectedDate
              ? selectedDate.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Select date'}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <Sparkle weight="fill" className="w-2.5 h-2.5 text-emerald-600" />
          <span>Active schedule</span>
        </span>
      </div>
    </div>
  );
};

export default EventCalendarCard;
