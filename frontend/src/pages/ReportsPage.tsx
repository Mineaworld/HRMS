import React from 'react';
import {
  ChartBar,
  DownloadSimple,
  Users,
  CalendarCheck,
  CurrencyCircleDollar,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../store/useHrmsStore';
import { LeaveSummaryChart } from '../components/dashboard/LeaveSummaryChart';
import { AttendanceSummaryChart } from '../components/dashboard/AttendanceSummaryChart';
import { TimesheetSummaryChart } from '../components/dashboard/TimesheetSummaryChart';

export const ReportsPage: React.FC = () => {
  const { employees, departments, payroll } = useHrmsStore();

  const totalPayroll = payroll.reduce((acc, p) => acc + p.netSalary, 0);

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
          onClick={() => alert('Exporting complete HRMS Executive Report as CSV / PDF...')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <DownloadSimple weight="bold" className="w-4 h-4" />
          <span>Export Summary Report</span>
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
              <Users weight="bold" className="w-5 h-5" />
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
              <CalendarCheck weight="bold" className="w-5 h-5" />
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
              <CurrencyCircleDollar weight="bold" className="w-5 h-5" />
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
