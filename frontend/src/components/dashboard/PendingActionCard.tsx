import React, { useState } from 'react';
import {
  ChatCircleText,
  Bell,
  CaretDown,
  CheckCircle,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../../store/useHrmsStore';

export const PendingActionCard: React.FC = () => {
  const { pendingActions } = useHrmsStore();
  const [activeTab, setActiveTab] = useState<'tasks' | 'notifications'>('tasks');

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-full">
      {/* Header: Title and Filter Dropdown */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          My Pending Action
        </h2>
        <button
          onClick={() => alert('Filter options opened')}
          aria-label="Filter pending actions"
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-colors"
        >
          <span>Filter</span>
          <CaretDown weight="bold" className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Segmented Pill Tabs */}
      <div
        className="flex items-center gap-1 mb-3.5 p-1 rounded-full bg-slate-100/80 border border-slate-200/60"
        role="tablist"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'tasks'}
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs transition-all duration-150 ${
            activeTab === 'tasks'
              ? 'bg-white text-blue-600 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <ChatCircleText weight={activeTab === 'tasks' ? 'fill' : 'bold'} className="w-3.5 h-3.5" />
          <span>Active task</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs transition-all duration-150 ${
            activeTab === 'notifications'
              ? 'bg-white text-blue-600 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Bell weight={activeTab === 'notifications' ? 'fill' : 'bold'} className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>
      </div>

      {/* Action Items List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
        {activeTab === 'tasks' ? (
          pendingActions.map((action, idx) => {
            const isFirst = idx === 0;

            return (
              <div
                key={action.id}
                className={`p-3.5 rounded-xl border transition-colors ${
                  isFirst
                    ? 'bg-blue-50/30 border-blue-200/90'
                    : 'bg-white border-slate-200/80'
                }`}
              >
                {/* Code & Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 tracking-tight">
                    {action.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {action.badgeText}
                  </span>
                </div>

                {/* Employee Name */}
                <div className="mt-1.5 text-xs text-slate-800 font-semibold">
                  Employee: <span className="font-bold text-slate-900">{action.employeeName}</span>
                </div>

                {/* Timestamp */}
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Last Updated: {action.lastUpdated}
                </div>

                {/* Action Trigger Button */}
                <div className="mt-2.5">
                  <button
                    onClick={() => alert(`Starting action for: ${action.code}`)}
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  >
                    Start Self Evaluation
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center">
            <CheckCircle weight="duotone" className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No unread notifications</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All staff updates have been reviewed</p>
          </div>
        )}
      </div>
    </div>
  );
};
