import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Plus,
  CalendarPlus,
  ClockAfternoon,
} from '@phosphor-icons/react';
import { useHrmsStore, NavTab } from '../../store/useHrmsStore';
import { getRoleBadge } from '../../utils/rbac';
import { NotificationsMenu } from '../ui/notifications-menu';
import { GlobalSearch } from './GlobalSearch';

interface HeaderProps {
  onRaiseRequestClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRaiseRequestClick }) => {
  const { activeTab, setActiveTab, currentUser, leaves, attendance } = useHrmsStore();
  const [isRaiseDropdownOpen, setIsRaiseDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('notif') === 'true'
  );
  const notifRef = useRef<HTMLDivElement>(null);
  const raiseRef = useRef<HTMLDivElement>(null);

  const unreadCount =
    leaves.filter((l) => l.status === 'PENDING').length +
    attendance.filter((a) => a.status === 'LATE').length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (raiseRef.current && !raiseRef.current.contains(event.target as Node)) {
        setIsRaiseDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false);
        setIsRaiseDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getSectionTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Workforce Overview';
      case 'attendance':
        return 'Attendance & Punch Records';
      case 'timesheet':
        return 'Timesheet Summary';
      case 'employees':
        return 'Employee Directory';
      case 'departments':
        return 'Organization & Departments';
      case 'automations':
        return 'System Automations';
      case 'leaves':
        return 'Leave Applications';
      case 'payroll':
        return 'Payroll & Compensation';
      case 'reports':
        return 'Workforce Intelligence';
      case 'profile':
        return 'Account Profile';
      default:
        return 'Workforce Overview';
    }
  };

  const getSectionSubtitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Daily headcount, operational schedule, and punctuality analytics';
      case 'attendance':
        return 'Time tracking, late arrival audit, and overtime logs';
      case 'timesheet':
        return 'Weekly hours verification and timesheet statuses';
      case 'employees':
        return 'Staff profiles, departmental assignments, and contact data';
      case 'departments':
        return 'Organization hierarchy, headcounts, and departmental budgets';
      case 'automations':
        return 'Background jobs, automated reconciliations, and execution history';
      case 'leaves':
        return 'Time off requests, allowances balance, and approvals';
      case 'payroll':
        return 'Monthly compensation calculation snapshots and payslips';
      case 'reports':
        return 'Statistical metrics generated from operational database';
      case 'profile':
        return 'Personal credentials and role entitlements';
      default:
        return 'Daily workforce status';
    }
  };

  const roleBadge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-20 flex flex-col gap-4 px-8 pt-5 pb-4 bg-[#eaf1f7]/90 backdrop-blur-md border-b border-slate-200/60 select-none">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Global Search Command Bar with Live Dropdown & Keyboard Shortcuts */}
        <GlobalSearch />

        {/* Right Tools */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Popover Trigger */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-label="View notifications"
              aria-expanded={isNotificationsOpen}
              aria-haspopup="true"
              className={`relative w-10 h-10 rounded-xl border text-slate-600 hover:text-slate-900 active:scale-[0.96] transition-all duration-100 flex items-center justify-center shadow-2xs focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer ${
                isNotificationsOpen
                  ? 'bg-blue-50 border-blue-300 text-blue-600 shadow-sm'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bell weight={isNotificationsOpen ? 'fill' : 'bold'} className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notifications Popover with Polish Animation */}
            {isNotificationsOpen && (
              <div
                className="absolute right-0 top-12 z-50 w-[420px] sm:w-[460px] origin-top-right transition-all duration-200 animate-in fade-in zoom-in-95"
                style={{
                  animationDuration: '180ms',
                  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <NotificationsMenu onClose={() => setIsNotificationsOpen(false)} />
              </div>
            )}
          </div>

          {/* Verified Session Role & Account Pill (40px desktop hit target) */}
          <button
            onClick={() => setActiveTab('profile')}
            title="View account credentials and authorities"
            className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:border-slate-300 shadow-2xs active:scale-[0.96] transition-transform duration-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer"
          >
            <span className={`w-2 h-2 rounded-full ${roleBadge.dotClass}`} />
            <span className="font-mono text-[11px] tracking-tight font-bold">{roleBadge.shortTag}</span>
            <span className="text-slate-200">|</span>
            <span className="text-slate-600 font-medium text-[11px] truncate max-w-[120px]">
              {currentUser.userName}
            </span>
          </button>

          {/* New Request Button (40px desktop hit target) */}
          <div className="relative" ref={raiseRef}>
            <button
              onClick={() => {
                if (onRaiseRequestClick) {
                  onRaiseRequestClick();
                } else {
                  setIsRaiseDropdownOpen(!isRaiseDropdownOpen);
                }
              }}
              aria-label="Create request"
              aria-expanded={isRaiseDropdownOpen}
              aria-haspopup="true"
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.96] text-white text-xs font-medium transition-transform duration-100 shadow-2xs focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer"
            >
              <Plus weight="bold" className="w-3.5 h-3.5" />
              <span>New request</span>
            </button>

            {isRaiseDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200/90 p-1.5 z-50 origin-top-right transition-all duration-200 animate-in fade-in zoom-in-95"
                style={{
                  animationDuration: '180ms',
                  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <button
                  onClick={() => {
                    setIsRaiseDropdownOpen(false);
                    if (onRaiseRequestClick) {
                      onRaiseRequestClick();
                    } else {
                      setActiveTab('leaves');
                    }
                  }}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg active:scale-[0.96] transition-transform duration-100 cursor-pointer"
                >
                  <CalendarPlus weight="bold" className="w-4 h-4 text-blue-600" />
                  <span>Apply for leave</span>
                </button>
                <button
                  onClick={() => {
                    setIsRaiseDropdownOpen(false);
                    setActiveTab('attendance');
                  }}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg active:scale-[0.96] transition-transform duration-100 cursor-pointer"
                >
                  <ClockAfternoon weight="bold" className="w-4 h-4 text-amber-600" />
                  <span>Request attendance correction</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Headline & Context */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          {getSectionTitle(activeTab)}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {getSectionSubtitle(activeTab)}
        </p>
      </div>
    </header>
  );
};
