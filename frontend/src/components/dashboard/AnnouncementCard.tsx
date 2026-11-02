import React from 'react';
import { useHrmsStore } from '../../store/useHrmsStore';

export const AnnouncementCard: React.FC = () => {
  const { announcements } = useHrmsStore();

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-full">
      {/* Card Title */}
      <div className="mb-3">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          Announcement
        </h2>
      </div>

      {/* Subheader Column Labels */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400">
        <span>Description</span>
        <span>Date</span>
      </div>

      {/* Clean Single-Line Items matching Dribbble Reference */}
      <div className="divide-y divide-slate-100/80 flex-1 overflow-y-auto pr-0.5">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-1 rounded-md transition-colors"
          >
            <span className="text-xs text-slate-700 font-medium truncate flex-1">
              {item.description}
            </span>
            <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap flex-shrink-0">
              {item.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
