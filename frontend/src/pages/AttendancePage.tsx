import React, { useState, useEffect } from 'react';
import {
  Clock,
  SignIn,
  SignOut,
  CalendarCheck,
  WarningCircle,
  CheckCircle,
  Plus,
  UserCheck,
  ClockCountdown,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../store/useHrmsStore';

export const AttendancePage: React.FC = () => {
  const { attendance, currentUser, checkInToday, checkOutToday } = useHrmsStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = currentTime.toISOString().split('T')[0];
  const myRecordToday = attendance.find(
    (a) => a.employeeId === (currentUser.employeeId || 1) && a.attendanceDate === todayStr
  );

  const isCheckedIn = Boolean(myRecordToday?.checkIn);
  const isCheckedOut = Boolean(myRecordToday?.checkOut);

  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
  const lateCount = attendance.filter((a) => a.status === 'LATE').length;
  const onLeaveCount = attendance.filter((a) => a.status === 'ON_LEAVE').length;
  const totalOtHours = attendance.reduce((sum, a) => sum + (a.otHours || 0), 0);

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
              <UserCheck weight="bold" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Present Today
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5 leading-tight font-medium">
              Checked-in workforce
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
              <WarningCircle weight="bold" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Late Arrivals
            </h3>
            <p className="text-[11px] text-amber-600 mt-0.5 leading-tight font-medium">
              Grace period exceeded
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
              <CalendarCheck weight="bold" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Approved Leave
            </h3>
            <p className="text-[11px] text-cyan-600 mt-0.5 leading-tight font-medium">
              Planned absence
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
              <ClockCountdown weight="bold" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Overtime Hours
            </h3>
            <p className="text-[11px] text-purple-600 mt-0.5 leading-tight font-medium">
              Logged excess hours
            </p>
          </div>
        </div>
      </div>

      {/* 3. Attendance Daily Logs Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck weight="duotone" className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Daily Attendance Records
            </h2>
          </div>
          <button
            onClick={() => alert('Attendance correction request dialog opened')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            <span>Request Correction</span>
          </button>
        </div>

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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {attendance.map((rec) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
