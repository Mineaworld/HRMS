import React, { useState, useEffect } from 'react';
import {
  Clock,
  SignIn,
  SignOut,
  CalendarCheck,
  WarningCircle,
  CheckCircle,
  UserCheck,
  ClockCountdown,
  ShieldCheck,
  PencilSimple,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../store/useHrmsStore';
import { hasPermission } from '../utils/rbac';
import { AttendanceRecord } from '../types';
import { Modal, Drawer } from '../components/ui/modal';

export const AttendancePage: React.FC = () => {
  const {
    attendance,
    currentUser,
    checkInToday,
    checkOutToday,
    attendanceCorrections,
    requestAttendanceCorrection,
    reviewAttendanceCorrection,
  } = useHrmsStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal / Drawer state
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState(false);
  const [targetRecordForCorrection, setTargetRecordForCorrection] = useState<AttendanceRecord | null>(null);

  // Form State
  const [reqCheckIn, setReqCheckIn] = useState('08:00 AM');
  const [reqCheckOut, setReqCheckOut] = useState('05:00 PM');
  const [reqReason, setReqReason] = useState('Biometric reader fault at reception entrance');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canViewAll = hasPermission(currentUser.role, 'ATTENDANCE_VIEW_ALL');
  const isManager = currentUser.role === 'ROLE_ADMIN' || currentUser.role === 'ROLE_HR';
  const myEmployeeId = currentUser.employeeId || 1;

  // Pending count for managers
  const pendingCorrections = attendanceCorrections.filter((c) => c.status === 'PENDING');

  // Live Clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = currentTime.toISOString().split('T')[0];
  const myRecordToday = attendance.find(
    (a) => a.employeeId === myEmployeeId && a.attendanceDate === todayStr
  );

  const isCheckedIn = Boolean(myRecordToday?.checkIn);
  const isCheckedOut = Boolean(myRecordToday?.checkOut);

  // Scoped attendance records
  const displayedAttendance = canViewAll
    ? attendance
    : attendance.filter((a) => a.employeeId === myEmployeeId);

  // Metrics (Company-wide for Admin/HR vs Personal for Employee)
  const presentCount = canViewAll
    ? attendance.filter((a) => a.status === 'PRESENT').length
    : displayedAttendance.filter((a) => a.status === 'PRESENT').length;

  const lateCount = canViewAll
    ? attendance.filter((a) => a.status === 'LATE').length
    : displayedAttendance.filter((a) => a.status === 'LATE').length;

  const onLeaveCount = canViewAll
    ? attendance.filter((a) => a.status === 'ON_LEAVE').length
    : displayedAttendance.filter((a) => a.status === 'ON_LEAVE').length;

  const totalOtHours = canViewAll
    ? attendance.reduce((sum, a) => sum + (a.otHours || 0), 0)
    : displayedAttendance.reduce((sum, a) => sum + (a.otHours || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Punch Station Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Live Clock Display */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              <Clock weight="fill" className="w-4 h-4" />
              <span>Real-Time Attendance Punch Station</span>
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              <span className="ml-2 text-slate-400">| Standard Workday: 08:00 - 17:00 (15m grace)</span>
            </div>
          </div>

          {/* Punch Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => checkInToday(currentUser.employeeId || 1)}
              disabled={isCheckedIn}
              aria-label="Check in for today"
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                isCheckedIn
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:scale-[1.02]'
              }`}
            >
              {isCheckedIn ? (
                <>
                  <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600" />
                  <span>Checked In ({myRecordToday?.checkIn})</span>
                </>
              ) : (
                <>
                  <SignIn weight="bold" className="w-4 h-4" />
                  <span>Check In Now</span>
                </>
              )}
            </button>

            <button
              onClick={() => checkOutToday(currentUser.employeeId || 1)}
              disabled={!isCheckedIn || isCheckedOut}
              aria-label="Check out for today"
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                isCheckedOut
                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                  : !isCheckedIn
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white hover:scale-[1.02]'
              }`}
            >
              <SignOut weight="bold" className="w-4 h-4" />
              <span>
                {isCheckedOut ? `Checked Out (${myRecordToday?.checkOut})` : 'Check Out'}
              </span>
            </button>
          </div>
        </div>

        {/* Current Punch State Banner */}
        {myRecordToday && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs">
            <span className="font-semibold text-slate-700">Today's Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold ${
                myRecordToday.status === 'PRESENT'
                  ? 'bg-emerald-50 text-emerald-600'
                  : myRecordToday.status === 'LATE'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {myRecordToday.status}
            </span>
            {myRecordToday.lateMinutes > 0 && (
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <WarningCircle weight="bold" className="w-3.5 h-3.5" />
                Late by {myRecordToday.lateMinutes} minutes
              </span>
            )}
            {myRecordToday.otHours > 0 && (
              <span className="text-blue-600 font-medium">
                Overtime: +{myRecordToday.otHours} hrs
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. Attendance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Present */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[118px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              {presentCount}
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <UserCheck weight="fill" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              {canViewAll ? 'Present Today' : 'My Days Present'}
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5 leading-tight font-medium">
              {canViewAll ? 'Checked-in workforce' : 'Personal on-time records'}
            </p>
          </div>
        </div>

        {/* Late */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[118px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              {lateCount}
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <WarningCircle weight="fill" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              {canViewAll ? 'Late Arrivals' : 'My Late Arrivals'}
            </h3>
            <p className="text-[11px] text-amber-600 mt-0.5 leading-tight font-medium">
              {canViewAll ? 'Grace period exceeded' : 'Past 08:15 AM threshold'}
            </p>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[118px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              {onLeaveCount}
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <CalendarCheck weight="fill" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              {canViewAll ? 'Approved Leave' : 'My Leaves Taken'}
            </h3>
            <p className="text-[11px] text-cyan-600 mt-0.5 leading-tight font-medium">
              {canViewAll ? 'Planned company absence' : 'Excused time off'}
            </p>
          </div>
        </div>

        {/* Overtime */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[118px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              {totalOtHours}h
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ClockCountdown weight="fill" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              {canViewAll ? 'Overtime Hours' : 'My Overtime'}
            </h3>
            <p className="text-[11px] text-purple-600 mt-0.5 leading-tight font-medium">
              {canViewAll ? 'Logged company excess' : 'Eligible for OT pay'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Attendance Daily Logs Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck weight="duotone" className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {canViewAll ? 'Daily Attendance Records' : 'My Attendance History'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {canViewAll ? 'Full enterprise attendance audit log' : `Viewing records for ${currentUser.fullName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isManager && (
              <button
                onClick={() => setIsQueueDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold active:scale-[0.98] transition-all"
              >
                <ShieldCheck weight="bold" className="w-3.5 h-3.5 text-blue-400" />
                <span>Corrections Queue</span>
                {pendingCorrections.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                    {pendingCorrections.length}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => {
                const target = displayedAttendance[0] || null;
                setTargetRecordForCorrection(target);
                setIsCorrectionModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              <PencilSimple weight="bold" className="w-3.5 h-3.5" />
              <span>Request Correction</span>
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-3 mx-6 mt-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-600">Audit Synchronized</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Employee</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Check In</th>
                <th className="py-3 px-6">Check Out</th>
                <th className="py-3 px-6">Late Minutes</th>
                <th className="py-3 px-6">OT Hours</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {displayedAttendance.map((rec) => (
                <tr key={rec.attendanceId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    {rec.employeeName}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-slate-500 text-[11px]">
                    {rec.attendanceDate}
                  </td>
                  <td className="py-3.5 px-6 font-mono font-medium text-slate-800">
                    {rec.checkIn || '—'}
                  </td>
                  <td className="py-3.5 px-6 font-mono font-medium text-slate-800">
                    {rec.checkOut || '—'}
                  </td>
                  <td className="py-3.5 px-6">
                    {rec.lateMinutes > 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200/60">
                        +{rec.lateMinutes} mins
                      </span>
                    ) : (
                      <span className="text-slate-400">On Time</span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 font-mono">
                    {rec.otHours > 0 ? `${rec.otHours} hrs` : '0'}
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        rec.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : rec.status === 'LATE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : rec.status === 'ON_LEAVE'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => {
                        setTargetRecordForCorrection(rec);
                        setIsCorrectionModalOpen(true);
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline active:scale-[0.98]"
                    >
                      Dispute
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Request Punch Correction */}
      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title="Request Punch Correction"
        subtitle="Submits to operation_service (/api/attendance/corrections)"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!targetRecordForCorrection) return;

            requestAttendanceCorrection({
              attendanceId: targetRecordForCorrection.attendanceId,
              employeeId: targetRecordForCorrection.employeeId,
              employeeName: targetRecordForCorrection.employeeName,
              attendanceDate: targetRecordForCorrection.attendanceDate,
              originalCheckIn: targetRecordForCorrection.checkIn,
              originalCheckOut: targetRecordForCorrection.checkOut,
              requestedCheckIn: reqCheckIn,
              requestedCheckOut: reqCheckOut,
              reason: reqReason,
            });

            setIsCorrectionModalOpen(false);
            setToastMessage('Correction request submitted for manager review.');
            setTimeout(() => setToastMessage(null), 4000);
          }}
          className="space-y-3.5"
        >
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div className="font-semibold text-slate-800">
              {targetRecordForCorrection?.employeeName} • {targetRecordForCorrection?.attendanceDate}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Current: In {targetRecordForCorrection?.checkIn || 'None'} / Out{' '}
              {targetRecordForCorrection?.checkOut || 'None'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corrected Check-In
              </label>
              <input
                type="text"
                value={reqCheckIn}
                onChange={(e) => setReqCheckIn(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corrected Check-Out
              </label>
              <input
                type="text"
                value={reqCheckOut}
                onChange={(e) => setReqCheckOut(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Adjustment
            </label>
            <textarea
              value={reqReason}
              onChange={(e) => setReqReason(e.target.value)}
              rows={2}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCorrectionModalOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold active:scale-[0.98] transition-all"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* DRAWER: Manager Corrections Review Queue */}
      <Drawer
        isOpen={isQueueDrawerOpen}
        onClose={() => setIsQueueDrawerOpen(false)}
        title="Corrections Queue"
        subtitle="Review and approve employee attendance adjustment disputes"
        width="md"
      >
        <div className="space-y-4">
          <div className="space-y-3 max-h-[65vh] overflow-y-auto">
            {attendanceCorrections.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No correction requests submitted.
              </div>
            ) : (
              attendanceCorrections.map((corr) => (
                <div
                  key={corr.correctionId}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">
                      {corr.employeeName}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        corr.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : corr.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {corr.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    Date: {corr.attendanceDate} • Requested: In {corr.requestedCheckIn} / Out{' '}
                    {corr.requestedCheckOut}
                  </div>

                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic">
                    "{corr.reason}"
                  </p>

                  {corr.status === 'PENDING' && isManager && (
                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          reviewAttendanceCorrection(corr.correctionId, 'REJECTED')
                        }
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() =>
                          reviewAttendanceCorrection(corr.correctionId, 'APPROVED')
                        }
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-[0.98]"
                      >
                        Approve & Overwrite
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setIsQueueDrawerOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
            >
              Close Queue
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
