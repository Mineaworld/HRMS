import React from 'react';
import { Megaphone } from '@phosphor-icons/react';
import { useHrmsStore } from '../../store/useHrmsStore';

export const AnnouncementCard: React.FC = () => {
  const { announcements } = useHrmsStore();

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-full">
      {/* Card Title */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          Company Bulletins
        </h2>
        <span className="text-[10px] font-mono text-slate-400">
          {announcements.length} Published
        </span>
      </div>

      {/* Subheader Column Labels */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400">
        <span>Topic</span>
        <span>Date</span>
      </div>

      {/* Content Area */}
      <div className="divide-y divide-slate-100/80 flex-1 overflow-y-auto pr-0.5">
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <Megaphone weight="duotone" className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-700">No Active Bulletins</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">
              Corporate notices and announcements will be displayed here.
            </p>
          </div>
        ) : (
          announcements.map((item) => (
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
          ))
        )}
      </div>
    </div>
  );
};
