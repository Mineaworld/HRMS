import React, { useState } from 'react';
import {
  Cpu,
  Play,
  Clock,
  CheckCircle,
  WarningCircle,
  CircleNotch,
  ArrowClockwise,
  ShieldCheck,
  CalendarCheck,
  CurrencyDollar,
  ChartBar,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../store/useHrmsStore';
import { BehavioralHistorySelect } from '../components/ui/behavioral-history-select';

interface CronJobSpec {
  jobName: string;
  title: string;
  cadence: string;
  schedule: string;
  description: string;
  targetService: string;
  icon: any;
}

const CRON_JOBS: CronJobSpec[] = [
  {
    jobName: 'DailyAttendanceSyncJob',
    title: 'Daily Attendance Reconciler',
    cadence: 'Daily at 01:00 AM',
    schedule: '0 0 1 * * ?',
    description: 'Scans attendance logs, calculates cutoff late minutes, and marks absent personnel.',
    targetService: 'operation_service (:8082)',
    icon: Clock,
  },
  {
    jobName: 'ContractExpiryJob',
    title: 'Contract Expiration Scanner',
    cadence: 'Daily at 08:00 AM',
    schedule: '0 0 8 * * ?',
    description: 'Audits employee contracts and notifies People Ops of agreements expiring within 30 days.',
    targetService: 'operation_service (:8082)',
    icon: CalendarCheck,
  },
  {
    jobName: 'MonthlyPayrollJob',
    title: 'Monthly Payroll Batch Engine',
    cadence: 'Monthly on 28th at 00:00',
    schedule: '0 0 0 28 * ?',
    description: 'Automates batch salary generation, applies late penalty deductions, and creates pay records.',
    targetService: 'operation_service (:8082)',
    icon: CurrencyDollar,
  },
  {
    jobName: 'WeeklyReportJob',
    title: 'Executive Analytics Aggregator',
    cadence: 'Mondays at 09:00 AM',
    schedule: '0 0 9 ? * MON',
    description: 'Aggregates department turnover, attendance rates, and labor expenses for analytics reporting.',
    targetService: 'report_service (:8083)',
    icon: ChartBar,
  },
];

export const AutomationsPage: React.FC = () => {
  const { cronHistory, triggerCronJob, currentUser } = useHrmsStore();
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('ALL');

  const isAdmin = currentUser.role === 'ROLE_ADMIN' || currentUser.role === 'ROLE_HR';

  const handleTrigger = (jobName: string) => {
    setTriggeringJob(jobName);
    setToastMessage(null);

    setTimeout(() => {
      triggerCronJob(jobName);
      setTriggeringJob(null);
      setToastMessage(`Job "${jobName}" triggered successfully on cron_service (:8084).`);

      setTimeout(() => setToastMessage(null), 4000);
    }, 600);
  };

  const filteredHistory = selectedJobFilter === 'ALL'
    ? cronHistory
    : cronHistory.filter((h) => h.jobName === selectedJobFilter);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn select-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            System Automations & Scheduled Jobs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cron daemon telemetry, scheduled batch executions, and cross-service triggers (:8084)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-mono font-bold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cron Daemon: Healthy</span>
          </span>
        </div>
      </div>

      {/* 2. Success Banner */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600">Cross-Service Synchronized</span>
        </div>
      )}

      {/* 3. Scheduled Jobs Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Scheduled Daemons (4)
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Targeting :8082 & :8083</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CRON_JOBS.map((job) => {
            const Icon = job.icon;
            const isRunning = triggeringJob === job.jobName;

            return (
              <div
                key={job.jobName}
                className="rounded-2xl bg-white p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                      <Icon weight="duotone" className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {job.schedule}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-3">{job.title}</h3>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{job.jobName}</div>

                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed line-clamp-3">
                    {job.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Cadence</div>
                    <div className="text-[11px] font-medium text-slate-700">{job.cadence}</div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleTrigger(job.jobName)}
                      disabled={isRunning}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-60"
                    >
                      {isRunning ? (
                        <>
                          <CircleNotch weight="bold" className="w-3.5 h-3.5 animate-spin" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play weight="fill" className="w-3 h-3 text-emerald-400" />
                          <span>Run Now</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Execution Telemetry & Audit Trail */}
      <div className="rounded-2xl bg-white border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Job Execution History</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Audit log captured via JobExecutionController (GET /api/v1/jobs/history)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter:</span>
            <BehavioralHistorySelect
              selectWidth="210px"
              value={selectedJobFilter}
              onChange={(val) => setSelectedJobFilter(val)}
              options={[
                { value: 'ALL', label: 'All Scheduled Jobs' },
                ...CRON_JOBS.map((j) => ({
                  value: j.jobName,
                  label: j.title,
                })),
              ]}
              storageKey="hrms_cron_filter_history"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Job Identifier</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Execution Telemetry</th>
                <th className="px-5 py-3 text-right">Trigger Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No executions recorded for this filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-700 whitespace-nowrap">
                      {item.executionTime}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900">{item.jobName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full ${
                          item.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{item.durationMs}ms</td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-md truncate">{item.message}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-[11px] text-slate-500">
                      {item.triggeredBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
