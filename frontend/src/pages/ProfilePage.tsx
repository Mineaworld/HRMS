import React, { useState } from 'react';
import {
  Envelope,
  IdentificationCard,
  Buildings,
  ShieldCheck,
  SignOut,
  CheckCircle,
  Key,
  Lock,
  CaretDown,
  CaretUp,
  Fingerprint,
} from '@phosphor-icons/react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useHrmsStore } from '../store/useHrmsStore';
import { getRoleBadge, ROLE_PERMISSIONS } from '../utils/rbac';

export const ProfilePage: React.FC = () => {
  const { currentUser, logout } = useHrmsStore();
  const [showTechnicalAuthorities, setShowTechnicalAuthorities] = useState(false);

  const roleBadge = getRoleBadge(currentUser.role);
  const rawAuthorities = ROLE_PERMISSIONS[currentUser.role] || [];

  // Grouped human-readable capabilities (Base Web UI principle: eliminate raw strings)
  const humanCapabilities = [
    { title: 'Workforce Roster', desc: 'Directory, employee profiles, and departmental assignments' },
    { title: 'Time & Attendance', desc: 'Punch station verification, late tracking, and punch disputes' },
    { title: 'Leave Approvals', desc: 'Application review, balance audit, and clearance authority' },
    { title: 'Payroll Operations', desc: 'Monthly batch generation, salary setups, and payslips' },
    { title: 'System Automations', desc: 'CRON daemon execution, contract expiry, and telemetry' },
    { title: 'Executive Analytics', desc: 'Workforce intelligence reporting and data exports' },
  ];

  const initials = currentUser.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none animate-fadeIn">
      {/* 1. Profile Header Card */}
      <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Avatar className="w-20 h-20 rounded-2xl ring-4 ring-slate-100 shadow-sm shrink-0">
            <AvatarImage
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="rounded-2xl object-cover"
            />
            <AvatarFallback className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {currentUser.fullName}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${roleBadge.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${roleBadge.dotClass}`} />
                <span>{roleBadge.shortTag}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{roleBadge.description}</p>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Account ID: #{currentUser.employeeId || currentUser.accountId || 1}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          aria-label="Sign out of BigBoss"
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.96] text-slate-700 text-xs font-semibold border border-slate-200 hover:border-rose-200 transition-colors duration-150 cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <SignOut weight="bold" className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* 2. Account Credentials Grid (Clean 4-Cell Base Web Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Envelope weight="duotone" className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Corporate Email
            </div>
            <div className="text-xs font-semibold text-slate-900 mt-0.5">{currentUser.email}</div>
          </div>
        </div>

        {/* Username */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IdentificationCard weight="duotone" className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Username
            </div>
            <div className="text-xs font-semibold text-slate-900 font-mono mt-0.5">
              {currentUser.userName}
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Buildings weight="duotone" className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Organization Hub
            </div>
            <div className="text-xs font-semibold text-slate-900 mt-0.5">
              BigBoss Engineering Hub
            </div>
          </div>
        </div>

        {/* Security & Access Level (Clean human label, zero technical port leak) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck weight="duotone" className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Session Security
            </div>
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Authenticated & Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. System Access & Capabilities (Clean Base Web Cards) */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Role Entitlements & Access
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational capabilities granted under your assigned role
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {humanCapabilities.map((cap, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-2.5"
            >
              <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-semibold text-slate-900">{cap.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{cap.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Authorities (Collapsible Disclosure - Base Web progressive disclosure) */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowTechnicalAuthorities(!showTechnicalAuthorities)}
            aria-expanded={showTechnicalAuthorities}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <Fingerprint weight="bold" className="w-3.5 h-3.5" />
            <span>Technical Authorities ({rawAuthorities.length})</span>
            {showTechnicalAuthorities ? (
              <CaretUp weight="bold" className="w-3 h-3" />
            ) : (
              <CaretDown weight="bold" className="w-3 h-3" />
            )}
          </button>

          {showTechnicalAuthorities && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-wrap gap-1.5 animate-fadeIn">
              {rawAuthorities.map((auth) => (
                <span
                  key={auth}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-600 shadow-2xs"
                >
                  {auth}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
