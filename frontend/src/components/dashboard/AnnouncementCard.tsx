import React from 'react';
import { MegaphoneSimple } from '@phosphor-icons/react';
import { useHrmsStore } from '../../store/useHrmsStore';

export const AnnouncementCard: React.FC = () => {
  const { announcements } = useHrmsStore();

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MegaphoneSimple weight="duotone" className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-900">Announcements</h2>
        </div>
        <span className="text-[11px] font-medium text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">
          View all
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto pr-0.5">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 px-1 rounded transition-colors"
          >
            <div className="min-w-0 flex-1">
              <span className="text-xs text-slate-700 block truncate font-medium">
                {item.description}
              </span>
              {item.tag && (
                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-500 bg-slate-100">
                  {item.tag}
                </span>
              )}
            </div>
            <div className="text-right text-[11px] font-mono text-slate-400 whitespace-nowrap">
              {item.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
