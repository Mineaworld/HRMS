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
import { UserCircle, Envelope, Phone, Buildings, IdentificationCard } from '@phosphor-icons/react';

export const App: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useHrmsStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
          <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-500/20 shadow-md"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-900">{currentUser.fullName}</h2>
                <p className="text-xs font-semibold text-blue-600 font-mono mt-0.5">
                  {currentUser.role}
                </p>
                <p className="text-xs text-slate-400 mt-1">SETEC Institute - Class SU Member</p>
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
                  <div className="font-medium text-slate-800">{currentUser.userName}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                <Buildings weight="duotone" className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Organization</div>
                  <div className="font-medium text-slate-800">Software Engineering</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
                <Phone weight="duotone" className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Contact</div>
                  <div className="font-medium text-slate-800">+855 12 345 678</div>
                </div>
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
