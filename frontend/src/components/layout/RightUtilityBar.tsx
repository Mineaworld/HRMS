import React from 'react';
import {
  UserCircle,
  CalendarCheck,
  Clock,
  ClockCountdown,
  TreeStructure,
  ChartLineUp,
  ArrowsClockwise,
  FileText,
} from '@phosphor-icons/react';
import { useHrmsStore, NavTab } from '../../store/useHrmsStore';
import { isRoleAllowedForTab } from '../../utils/rbac';

export const RightUtilityBar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useHrmsStore();
  const isEmployee = currentUser.role === 'ROLE_EMPLOYEE';

  const rawUtilityItems = [
    { id: 'profile' as NavTab, label: 'Profile', icon: UserCircle },
    { id: 'leaves' as NavTab, label: isEmployee ? 'My Leave' : 'Leave', icon: CalendarCheck },
    { id: 'attendance' as NavTab, label: isEmployee ? 'Punch' : 'Attendance', icon: Clock },
    { id: 'timesheet' as NavTab, label: 'Timesheet', icon: ClockCountdown },
    { id: 'employees' as NavTab, label: isEmployee ? 'Directory' : 'Organization', icon: TreeStructure },
    { id: 'payroll' as NavTab, label: isEmployee ? 'Payslip' : 'Payroll', icon: ChartLineUp },
    { id: 'attendance' as NavTab, label: 'Shift', icon: ArrowsClockwise },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
  ];

  const utilityItems = rawUtilityItems.filter((item) => isRoleAllowedForTab(currentUser.role, item.id));

  return (
    <aside
      aria-label="Quick Actions Utility Bar"
      className="hidden lg:flex flex-col items-center py-6 px-2.5 w-16 bg-white/70 backdrop-blur-xl border-l border-white/80 shadow-sm z-20"
    >
      <div className="flex flex-col items-center gap-3.5">
        {utilityItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={idx}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
              className={`group relative flex flex-col items-center justify-center p-2 rounded-xl transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/70'
              }`}
              title={item.label}
            >
              <Icon weight={isActive ? 'fill' : 'duotone'} className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-1 tracking-tight text-center max-w-[50px] truncate">
                {item.label}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute right-full mr-2 px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
