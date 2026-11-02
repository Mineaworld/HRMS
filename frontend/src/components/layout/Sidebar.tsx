import React from 'react';
import {
  House,
  CalendarCheck,
  ClockCountdown,
  TreeStructure,
  UserCircle,
  UsersThree,
  ChartBar,
  CaretLeft,
  SignOut,
  Buildings,
} from '@phosphor-icons/react';
import { useHrmsStore, NavTab } from '../../store/useHrmsStore';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { activeTab, setActiveTab, currentUser, resetDemoData } = useHrmsStore();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: House },
    { id: 'attendance' as NavTab, label: 'Attendance & Time', icon: CalendarCheck },
    { id: 'employees' as NavTab, label: 'Employees', icon: UsersThree },
    { id: 'leaves' as NavTab, label: 'Leave Management', icon: ClockCountdown },
    { id: 'payroll' as NavTab, label: 'Payroll & Salary', icon: TreeStructure },
    { id: 'reports' as NavTab, label: 'Analytics', icon: ChartBar },
    { id: 'profile' as NavTab, label: 'My Account', icon: UserCircle },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between h-screen transition-[width] duration-200 ease-out z-30 select-none ${
        isCollapsed ? 'w-[72px]' : 'w-60'
      } bg-white border-r border-slate-200/80 shadow-[1px_0_4px_rgba(0,0,0,0.02)]`}
    >
      {/* Brand Header */}
      <div className="flex flex-col flex-1 px-3 py-5 overflow-y-auto">
        <div className="flex items-center justify-between px-2 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white shadow-sm flex-shrink-0">
              <Buildings weight="bold" className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                  HRMS Portal
                </span>
                <span className="text-[10px] font-medium text-slate-400 block tracking-tight">
                  Enterprise Suite
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <CaretLeft weight="bold" className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-2 mb-2">
          {!isCollapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2 px-1">
              Platform
            </span>
          )}
          <nav className="space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon weight={isActive ? 'fill' : 'regular'} className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="p-2 rounded-lg flex items-center gap-2.5">
          <img
            src={currentUser.avatarUrl}
            alt=""
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-800 truncate">{currentUser.fullName}</h4>
              <p className="text-[10px] text-slate-400 truncate font-mono">{currentUser.email}</p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between px-1">
            <button
              onClick={() => alert(`Logged out from ${currentUser.fullName}`)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              <SignOut weight="bold" className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
            <button
              onClick={resetDemoData}
              className="text-[10px] text-slate-400 hover:text-slate-700 transition-colors font-mono underline"
              title="Reset demonstration state"
            >
              Reset Data
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
