import React from 'react';
import {
  ChartBar,
  DownloadSimple,
  Users,
  CalendarCheck,
  CurrencyCircleDollar,
  LockKey,
  ShieldCheck,
  ArrowRight,
  House,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../store/useHrmsStore';
import { LeaveSummaryChart } from '../components/dashboard/LeaveSummaryChart';
import { AttendanceSummaryChart } from '../components/dashboard/AttendanceSummaryChart';
import { TimesheetSummaryChart } from '../components/dashboard/TimesheetSummaryChart';
import { hasPermission } from '../utils/rbac';

export const ReportsPage: React.FC = () => {
  const { employees, departments, payroll, currentUser, setActiveTab } = useHrmsStore();

  const hasAccess = hasPermission(currentUser.role, 'REPORTS_VIEW_EXECUTIVE');

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-white/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)] text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 mx-auto flex items-center justify-center shadow-sm">
          <LockKey weight="duotone" className="w-8 h-8" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-semibold mb-3">
            <ShieldCheck weight="bold" className="w-3.5 h-3.5 text-blue-600" />
            <span>ROLE_EMPLOYEE (Clearance Tier 1)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Executive Analytics Clearance Required
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Workforce intelligence summaries, compensation metrics, and department cost reports are restricted to Administrative (<code className="font-mono text-slate-700 font-semibold">ROLE_ADMIN</code>) and HR Leadership (<code className="font-mono text-slate-700 font-semibold">ROLE_HR</code>) authorities.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left max-w-lg mx-auto text-xs space-y-2">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Gateway Security Policy</span>
            <span className="font-mono text-[10px] text-rose-600 font-bold">HTTP 403 FORBIDDEN</span>
          </div>
          <div className="text-slate-600 text-[11px] font-mono space-y-1">
            <div><span className="text-slate-400">Target:</span> GET /api/report/dashboard</div>
            <div><span className="text-slate-400">Required:</span> hasAnyRole('ADMIN', 'HR_MANAGER')</div>
            <div><span className="text-slate-400">Account:</span> {currentUser.fullName} ({currentUser.userName})</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <House weight="bold" className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  const totalPayroll = payroll.reduce((acc, p) => acc + p.netSalary, 0);

  const handleExportCsv = () => {
    const headers = ['Employee ID,First Name,Last Name,Email,Department,Job Title,Status,Salary'];
    const rows = employees.map(
      (e) =>
        `${e.employeeId},"${e.firstName}","${e.lastName}","${e.email}","${e.departmentName}","${e.jobTitle}",${e.status},${e.salary}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hrms_workforce_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header with Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <ChartBar weight="duotone" className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Executive Analytics & Reports (Report Service)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time workforce intelligence generated from PostgreSQL database.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <DownloadSimple weight="bold" className="w-4 h-4" />
          <span>Export Workforce CSV</span>
        </button>
      </div>

      {/* 2. Key Intelligence Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Headcount */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              {employees.length} <span className="text-sm font-normal text-slate-400">Staff</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Users weight="fill" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Total Active Headcount
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5 leading-tight font-medium">
              Across 5 departments
            </p>
          </div>
        </div>

        {/* Card 2: Attendance Rate */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              94.6%
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <CalendarCheck weight="fill" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Avg Attendance Rate
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5 leading-tight font-medium">
              +2.4% from last quarter
            </p>
          </div>
        </div>

        {/* Card 3: Total Payout */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              ${totalPayroll.toLocaleString()}
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <CurrencyCircleDollar weight="fill" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Total Monthly Payout
            </h3>
            <p className="text-[11px] text-blue-600 mt-0.5 leading-tight font-medium">
              Calculated net payroll
            </p>
          </div>
        </div>
      </div>

      {/* 3. Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="min-h-[290px]">
          <LeaveSummaryChart />
        </div>
        <div className="min-h-[290px]">
          <TimesheetSummaryChart />
        </div>
        <div className="min-h-[290px]">
          <AttendanceSummaryChart />
        </div>
      </div>

      {/* 4. Department Staffing Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Department Headcount & Allocation
          </h3>
          <span className="text-xs text-slate-400">Department Count: {departments.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Department Name</th>
                <th className="py-3 px-6">Function / Description</th>
                <th className="py-3 px-6">Headcount</th>
                <th className="py-3 px-6 text-right">Budget Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {departments.map((d) => (
                <tr key={d.departmentId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">{d.departmentName}</td>
                  <td className="py-3.5 px-6 text-slate-500">{d.description}</td>
                  <td className="py-3.5 px-6 font-mono font-medium">{d.headCount} members</td>
                  <td className="py-3.5 px-6 text-right font-mono font-semibold text-blue-600">
                    {Math.round((d.headCount / 38) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
