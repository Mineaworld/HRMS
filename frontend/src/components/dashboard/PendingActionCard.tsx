import React, { useState } from 'react';
import {
  ChatCircleText,
  Bell,
  CheckCircle,
  ArrowRight,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../../store/useHrmsStore';

export const PendingActionCard: React.FC = () => {
  const { pendingActions } = useHrmsStore();
  const [activeTab, setActiveTab] = useState<'tasks' | 'notifications'>('tasks');

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Pending tasks</h2>
        <span className="text-[11px] font-mono text-slate-400">
          {pendingActions.length} open
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 mb-3.5 p-1 rounded-lg bg-slate-100/80 border border-slate-200/60" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'tasks'}
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ChatCircleText weight="bold" className="w-3.5 h-3.5" />
          <span>Active tasks</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell weight="bold" className="w-3.5 h-3.5" />
          <span>Alerts</span>
        </button>
      </div>

      {/* Content Feed */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
        {activeTab === 'tasks' ? (
          pendingActions.map((action) => (
            <div
              key={action.id}
              className="p-3 rounded-lg border border-slate-200/70 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-slate-700">{action.code}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  {action.badgeText}
                </span>
              </div>

              <div className="mt-1.5 text-xs text-slate-800 font-medium">
                {action.employeeName}
              </div>

              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Updated {action.lastUpdated}
              </div>

              <button
                onClick={() => alert(`Triggered action: ${action.actionText}`)}
                className="mt-2.5 w-full py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              >
                <span>{action.actionText}</span>
                <ArrowRight weight="bold" className="w-3 h-3" />
              </button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <CheckCircle weight="duotone" className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-slate-700">No unread alerts</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All staff updates reviewed</p>
          </div>
        )}
      </div>
    </div>
  );
};
