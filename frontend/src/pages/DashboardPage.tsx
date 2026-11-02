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
          comparison="Projects employee is working on"
          icon={Briefcase}
        />
        <MetricCard
          value="05/08"
          title="WFH Balance"
          comparison="This Month"
          icon={House}
        />
        <MetricCard
          value="50"
          title="Tasks Completed"
          comparison="This Month"
          icon={CheckCircle}
        />
        <MetricCard
          value="05"
          title="Leave Balance"
          comparison="Remaining (YTD)"
          icon={Calendar}
        />
        <MetricCard
          value="176/hr"
          title="Work Hours"
          comparison="This Month"
          icon={Clock}
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
