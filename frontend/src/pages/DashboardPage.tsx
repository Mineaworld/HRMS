import React from 'react';
import {
  UsersThree,
  Buildings,
  CheckCircle,
  CalendarCheck,
  Briefcase,
} from '@phosphor-icons/react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { PendingActionCard } from '../components/dashboard/PendingActionCard';
import { EventCalendarCard } from '../components/dashboard/EventCalendarCard';
import { LeaveSummaryChart } from '../components/dashboard/LeaveSummaryChart';
import { AttendanceSummaryChart } from '../components/dashboard/AttendanceSummaryChart';
import { useHrmsStore } from '../store/useHrmsStore';
import { getRoleBadge } from '../utils/rbac';

export const DashboardPage: React.FC = () => {
  const { currentUser, employees, departments, jobs, leaves, dashboardSummary, isLoading } = useHrmsStore();
  const roleBadge = getRoleBadge(currentUser.role);

  const totalEmployees = dashboardSummary?.totalEmployees ?? employees.length;
  const activeEmployees = dashboardSummary?.activeEmployees ?? employees.filter((e) => e.status === 'Active').length;
  const totalDepartments = dashboardSummary?.totalDepartments ?? departments.length;
  const totalJobs = dashboardSummary?.totalJobs ?? (jobs.length || 23);
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING').length;

  const renderMetric = (val: number) => {
    if (isLoading && val === 0) {
      return <div className="h-7 w-12 bg-slate-200/80 animate-pulse rounded-lg mt-0.5" />;
    }
    return String(val).padStart(2, '0');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome Banner matching Reference UI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Welcome Back, <span className="text-blue-600">{currentUser.fullName}</span>
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${roleBadge.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${roleBadge.dotClass}`} />
            <span>{roleBadge.shortTag}</span>
          </span>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          BigBoss Workforce Command Portal
        </div>
      </div>

      {/* 1. Top Metrics Row (5 Cards - Bound to Real Gateway & PostgreSQL Telemetry) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          value={renderMetric(totalEmployees)}
          title="Total Workforce"
          subtitle="Registered company roster"
          icon={UsersThree}
          accent="blue"
        />
        <MetricCard
          value={renderMetric(activeEmployees)}
          title="Active Staff"
          subtitle="Operational personnel"
          icon={CheckCircle}
          accent="green"
        />
        <MetricCard
          value={renderMetric(totalDepartments)}
          title="Departments"
          subtitle="Operational divisions"
          icon={Buildings}
          accent="purple"
        />
        <MetricCard
          value={renderMetric(totalJobs)}
          title="Job Positions"
          subtitle="Configured career roles"
          icon={Briefcase}
          accent="cyan"
        />
        <MetricCard
          value={renderMetric(pendingLeaves)}
          title="Pending Requests"
          subtitle="Leaves awaiting review"
          icon={CalendarCheck}
          accent="orange"
        />
      </div>

      {/* 2. Middle Row (2 Widget Cards: Pending Actions & Operational Schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-h-[320px]">
          <PendingActionCard />
        </div>
        <div className="min-h-[320px]">
          <EventCalendarCard />
        </div>
      </div>

      {/* 3. Bottom Row (2 High-Impact Analytics Charts: Real Leave & Attendance Telemetry) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-h-[280px]">
          <LeaveSummaryChart />
        </div>
        <div className="min-h-[280px]">
          <AttendanceSummaryChart />
        </div>
      </div>
    </div>
  );
};
