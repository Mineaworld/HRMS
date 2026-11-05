import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { RightUtilityBar } from './components/layout/RightUtilityBar';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavesPage } from './pages/LeavesPage';
import { PayrollPage } from './pages/PayrollPage';
import { ReportsPage } from './pages/ReportsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { AutomationsPage } from './pages/AutomationsPage';
import { LoginPage } from './pages/LoginPage';
import { useHrmsStore } from './store/useHrmsStore';
import {
  Envelope,
  Buildings,
  IdentificationCard,
  Key,
  CheckCircle,
  SignOut,
  ArrowsClockwise,
  WifiSlash,
  CircleNotch,
  TerminalWindow,
  Cpu,
} from '@phosphor-icons/react';
import { getRoleBadge, ROLE_PERMISSIONS } from './utils/rbac';

export const App: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    isAuthenticated,
    logout,
    isLoading,
    isGatewayConnected,
    gatewayError,
    syncWithGateway,
  } = useHrmsStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const roleBadge = getRoleBadge(currentUser.role);
  const permissions = ROLE_PERMISSIONS[currentUser.role] || [];

  // Automatically initiate sync with Gateway upon authentication
  useEffect(() => {
    if (isAuthenticated) {
      syncWithGateway();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Polished, high-contrast Gateway Disconnected Screen (/unslop & /better-interface compliant)
  if (!isGatewayConnected && gatewayError) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 select-none relative overflow-hidden font-sans">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="relative w-full max-w-xl z-10 space-y-6">
          <div className="rounded-3xl border border-rose-500/30 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-rose-950/40 space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
                  <WifiSlash weight="bold" className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-white tracking-tight">
                      Gateway Connection Lost
                    </h1>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      OFFLINE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Spring Cloud Gateway at <code className="text-rose-300 font-mono">http://localhost:8080</code> is unreachable.
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Service Status</div>
                <div className="text-xs font-mono font-semibold text-rose-400">DISCONNECTED</div>
              </div>
            </div>

            {/* Diagnostics Console Box */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <TerminalWindow weight="bold" className="w-3.5 h-3.5 text-blue-400" />
                  Diagnostic Telemetry
                </span>
                <span>Active Account: {currentUser.userName}</span>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-slate-800 font-mono text-[11px] space-y-2 text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold select-none">[ERR]</span>
                  <span className="text-rose-200 break-all leading-relaxed">
                    {gatewayError}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div>
                    <span className="text-slate-500">Gateway Target:</span> localhost:8080
                  </div>
                  <div>
                    <span className="text-slate-500">Auth Token:</span> Bearer JWT Bound
                  </div>
                  <div>
                    <span className="text-slate-500">Operation Service:</span> :8082
                  </div>
                  <div>
                    <span className="text-slate-500">Report Service:</span> :8083
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting Checklist */}
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                <Cpu weight="duotone" className="w-3.5 h-3.5 text-amber-400" />
                Troubleshooting Checklist:
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
                <li>Verify Spring Cloud Gateway is running on port 8080.</li>
                <li>Ensure backend microservices (8081-8084) and PostgreSQL are healthy.</li>
                <li>Check local firewall or Docker network bridges.</li>
              </ul>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 cursor-pointer"
              >
                <SignOut weight="bold" className="w-4 h-4" />
                <span>Sign Out</span>
              </button>

              <button
                type="button"
                onClick={() => syncWithGateway()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-lg shadow-rose-950/40 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <CircleNotch weight="bold" className="w-4 h-4 animate-spin" />
                    <span>Attempting Handshake...</span>
                  </>
                ) : (
                  <>
                    <ArrowsClockwise weight="bold" className="w-4 h-4" />
                    <span>Retry Connection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'departments':
        return <DepartmentsPage />;
      case 'automations':
        return <AutomationsPage />;
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

            {/* Session Management & Sign Out */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-400">Terminate current session on this device</span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none cursor-pointer"
              >
                <SignOut weight="bold" className="w-4 h-4" />
                <span>Sign Out of BigBoss</span>
              </button>
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
