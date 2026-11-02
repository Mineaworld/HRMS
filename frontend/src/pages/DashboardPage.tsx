import React from 'react';
import {
  Briefcase,
  House,
  CheckCircle,
  Calendar,
  Clock,
} from '@phosphor-icons/react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { PendingActionCard } from '../components/dashboard/PendingActionCard';
import { AnnouncementCard } from '../components/dashboard/AnnouncementCard';
import { EventCalendarCard } from '../components/dashboard/EventCalendarCard';
import { LeaveSummaryChart } from '../components/dashboard/LeaveSummaryChart';
import { TimesheetSummaryChart } from '../components/dashboard/TimesheetSummaryChart';
import { AttendanceSummaryChart } from '../components/dashboard/AttendanceSummaryChart';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-10">
      {/* 1. Top Metrics Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          value="04"
          title="Active Projects"
          subtitle="Projects employee is working on"
          icon={Briefcase}
          accent="blue"
        />
        <MetricCard
          value={
            <span>
              05<span className="text-sm font-normal text-slate-400">/08</span>
            </span>
          }
          title="WFH Balance"
          subtitle="This Month"
          icon={House}
          accent="purple"
        />
        <MetricCard
          value="50"
          title="Tasks Completed"
          subtitle="This Month"
          icon={CheckCircle}
          accent="green"
        />
        <MetricCard
          value="05"
          title="Leave Balance"
          subtitle="Remaining (YTD)"
          icon={Calendar}
          accent="orange"
        />
        <MetricCard
          value={
            <span>
              176<span className="text-sm font-normal text-slate-400">/hr</span>
            </span>
          }
          title="Work Hours"
          subtitle="This Month"
          icon={Clock}
          accent="cyan"
        />
      </div>

      {/* 2. Middle Row (3 Widget Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="min-h-[310px]">
          <PendingActionCard />
        </div>
        <div className="min-h-[310px]">
          <AnnouncementCard />
        </div>
        <div className="min-h-[310px]">
          <EventCalendarCard />
        </div>
      </div>

      {/* 3. Bottom Row (3 Chart Analytics Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="min-h-[260px]">
          <LeaveSummaryChart />
        </div>
        <div className="min-h-[260px]">
          <TimesheetSummaryChart />
        </div>
        <div className="min-h-[260px]">
          <AttendanceSummaryChart />
        </div>
      </div>
    </div>
  );
};
