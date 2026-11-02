import React, { useState } from 'react';
import {
  CalendarBlank,
  Plus,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Sun,
  FirstAid,
  Suitcase,
  PlusCircle,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../store/useHrmsStore';
import { LeaveRequest } from '../types';

export const LeavesPage: React.FC = () => {
  const { leaves, currentUser, submitLeaveRequest, updateLeaveStatus } = useHrmsStore();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave' as LeaveRequest['leaveType'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    daysCount: 1,
    reason: '',
  });

  const canApprove = currentUser.role === 'ROLE_ADMIN' || currentUser.role === 'ROLE_HR';

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) {
      alert('Please state a reason for your leave application');
      return;
    }

    submitLeaveRequest({
      employeeId: currentUser.employeeId || 1,
      employeeName: currentUser.fullName,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      daysCount: Number(formData.daysCount),
      reason: formData.reason,
    });

    setIsApplyModalOpen(false);
    setFormData({
      leaveType: 'Casual Leave',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      daysCount: 1,
      reason: '',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Leave Balances Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Casual Leave */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              12<span className="text-sm font-normal text-slate-400">/14d</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sun weight="bold" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Casual Leave
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5 leading-tight font-medium">
              Available standard balance
            </p>
          </div>
        </div>

        {/* Card 2: Sick Leave */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              08<span className="text-sm font-normal text-slate-400">/10d</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <FirstAid weight="bold" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Sick Leave
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5 leading-tight font-medium">
              Medical cert protocol
            </p>
          </div>
        </div>

        {/* Card 3: Privilege Leave */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              15<span className="text-sm font-normal text-slate-400">/18d</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Suitcase weight="bold" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Privilege Leave
            </h3>
            <p className="text-[11px] text-blue-600 mt-0.5 leading-tight font-medium">
              Carry-forward eligible
            </p>
          </div>
        </div>

        {/* Card 4: Quick Action */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              Request Time Off
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <PlusCircle weight="bold" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              aria-label="Open leave application dialog"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              <Plus weight="bold" className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Leave Requests Table Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarBlank weight="duotone" className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Leave Applications Queue
            </h2>
          </div>
          <span className="text-xs text-slate-400">Total: {leaves.length} applications</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Employee</th>
                <th className="py-3 px-6">Leave Type</th>
                <th className="py-3 px-6">Duration</th>
                <th className="py-3 px-6">Reason</th>
                <th className="py-3 px-6">Applied Date</th>
                <th className="py-3 px-6">Status</th>
                {canApprove && <th className="py-3 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {leaves.map((leave) => (
                <tr key={leave.leaveId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    {leave.employeeName}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-blue-700">
                    {leave.leaveType}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-[11px]">
                    {leave.startDate} to {leave.endDate} ({leave.daysCount} d)
                  </td>
                  <td className="py-3.5 px-6 max-w-xs truncate text-slate-600" title={leave.reason}>
                    {leave.reason}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-slate-400 text-[11px]">
                    {leave.appliedDate}
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        leave.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : leave.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      {leave.status === 'APPROVED' && <CheckCircle weight="fill" className="w-3.5 h-3.5 text-emerald-600" />}
                      {leave.status === 'REJECTED' && <XCircle weight="fill" className="w-3.5 h-3.5 text-rose-600" />}
                      {leave.status === 'PENDING' && <Clock weight="fill" className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{leave.status}</span>
                    </span>
                  </td>

                  {canApprove && (
                    <td className="py-3.5 px-6 text-right">
                      {leave.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => updateLeaveStatus(leave.leaveId, 'APPROVED')}
                            aria-label={`Approve leave for ${leave.employeeName}`}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                            title="Approve Leave"
                          >
                            <Check weight="bold" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(leave.leaveId, 'REJECTED')}
                            aria-label={`Reject leave for ${leave.employeeName}`}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                            title="Reject Leave"
                          >
                            <X weight="bold" className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {leave.approvedBy ? `By ${leave.approvedBy}` : 'Completed'}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-md p-6 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Submit Leave Application</h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                aria-label="Close dialog"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              >
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApply} className="mt-4 space-y-4">
              <div>
                <label htmlFor="leaveTypeSelect" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Leave Type
                </label>
                <select
                  id="leaveTypeSelect"
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Birthday / Anniv">Birthday / Anniversary Leave</option>
                  <option value="Optional Holiday">Optional Holiday</option>
                  <option value="Privilege Leave">Privilege Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="startDateInput" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Start Date
                  </label>
                  <input
                    id="startDateInput"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="endDateInput" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    End Date
                  </label>
                  <input
                    id="endDateInput"
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="daysCountInput" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Days Count
                </label>
                <input
                  id="daysCountInput"
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={formData.daysCount}
                  onChange={(e) => setFormData({ ...formData, daysCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="reasonInput" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Reason for Absence
                </label>
                <textarea
                  id="reasonInput"
                  rows={3}
                  required
                  placeholder="Explain why you are taking leave..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
