import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { RightUtilityBar } from './components/layout/RightUtilityBar';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavesPage } from './pages/LeavesPage';
import { PayrollPage } from './pages/PayrollPage';
import { ReportsPage } from './pages/ReportsPage';
import { useHrmsStore } from './store/useHrmsStore';
import {
  UserCircle,
  Envelope,
  Phone,
  Buildings,
  IdentificationCard,
  ShieldCheck,
  Key,
  CheckCircle,
} from '@phosphor-icons/react';
import { getRoleBadge, ROLE_PERMISSIONS } from './utils/rbac';

export const App: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useHrmsStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const roleBadge = getRoleBadge(currentUser.role);
  const permissions = ROLE_PERMISSIONS[currentUser.role] || [];

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'attendance':
      case 'timesheet':
        return <AttendancePage />;
      case 'leaves':
        return <LeavesPage />;
      case 'payroll':
        return <PayrollPage />;
      case 'reports':
        return <ReportsPage />;
      case 'profile':
        return (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto space-y-6 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-5">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-500/20 shadow-md"
                />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{currentUser.fullName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${roleBadge.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${roleBadge.dotClass}`} />
                      <span>{roleBadge.shortTag}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: #{currentUser.employeeId || 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{roleBadge.description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                <Envelope weight="duotone" className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Email</div>
                  <div className="font-medium text-slate-800">{currentUser.email}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                <IdentificationCard weight="duotone" className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Username</div>
                  <div className="font-medium text-slate-800 font-mono">{currentUser.userName}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                <Buildings weight="duotone" className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Organization</div>
                  <div className="font-medium text-slate-800">BigBoss Engineering Hub</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                <Key weight="duotone" className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Gateway Token</div>
                  <div className="font-medium text-emerald-600 font-mono">JWT Valid (:8080)</div>
                </div>
              </div>
            </div>

            {/* Active RBAC Authorities */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Assigned RBAC Permissions ({permissions.length})
                </span>
                <span className="text-[10px] text-blue-600 font-mono font-semibold">
                  Spring Security Authorities
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {permissions.map((perm) => (
                  <span
                    key={perm}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-700 shadow-sm"
                  >
                    <CheckCircle weight="bold" className="w-3 h-3 text-emerald-600" />
                    <span>{perm}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#eaf1f7]">
      {/* 1. Left Sidebar (shadcn-style collapsible) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Central Work Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <Header onRaiseRequestClick={() => setActiveTab('leaves')} />

        <main className="flex-1 px-8 pt-2">
          {renderActivePage()}
        </main>
      </div>

      {/* 3. Right Quick-Action Utility Bar */}
      <RightUtilityBar />
    </div>
  );
};

export default App;
