import React, { useState } from 'react';
import {
  CurrencyDollar,
  Play,
  FileText,
  Printer,
  X,
  CheckCircle,
  Clock,
  Receipt,
  GearSix,
  Wallet,
  ShieldCheck,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../store/useHrmsStore';
import { PayrollRecord } from '../types';
import { BehavioralHistorySelect } from '../components/ui/behavioral-history-select';
import { Modal } from '../components/ui/modal';
import { hasPermission } from '../utils/rbac';

export const PayrollPage: React.FC = () => {
  const { payroll, employees, generateMonthlyPayroll, markPayrollPaid, currentUser, updateEmployee } = useHrmsStore();
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [viewingPayslip, setViewingPayslip] = useState<PayrollRecord | null>(null);

  // Salary Setup Modal State (PayrollProfile)
  const [isSalarySetupOpen, setIsSalarySetupOpen] = useState(false);
  const [profileEmpId, setProfileEmpId] = useState<number>(1);
  const [profileBaseSalary, setProfileBaseSalary] = useState<number>(2800);
  const [profilePenaltyPerMin, setProfilePenaltyPerMin] = useState<number>(0.26);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canViewAll = hasPermission(currentUser.role, 'PAYROLL_VIEW_ALL');
  const canGenerate = hasPermission(currentUser.role, 'PAYROLL_GENERATE_BATCH');
  const canMarkPaid = hasPermission(currentUser.role, 'PAYROLL_MARK_PAID');
  const myEmployeeId = currentUser.employeeId || 1;

  const displayedPayroll = canViewAll
    ? payroll
    : payroll.filter((p) => p.employeeId === myEmployeeId);

  // Aggregates for Admin / HR
  const totalPayrollExpense = payroll.reduce((sum, p) => sum + p.netSalary, 0);
  const totalTax = payroll.reduce((sum, p) => sum + p.taxDeductions, 0);

  // Aggregates for Individual Employee
  const myLatestSlip = displayedPayroll[0];
  const myNetSalary = myLatestSlip?.netSalary || 0;
  const myAllowances = myLatestSlip?.allowances || 0;
  const myTax = myLatestSlip ? myLatestSlip.taxDeductions + myLatestSlip.lateDeductions : 0;

  const handleGenerate = () => {
    generateMonthlyPayroll(selectedMonth);
    setToastMessage(`Monthly payroll batch calculated for ${selectedMonth} across ${employees.length} personnel.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenSalarySetup = () => {
    const targetEmp = employees.find((e) => e.employeeId === profileEmpId) || employees[0];
    if (targetEmp) {
      setProfileEmpId(targetEmp.employeeId);
      setProfileBaseSalary(targetEmp.salary || 2500);
      setProfilePenaltyPerMin(Number(((targetEmp.salary || 2500) / 22 / 480).toFixed(2)));
    }
    setIsSalarySetupOpen(true);
  };

  const handleSaveSalaryProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployee(profileEmpId, { salary: Number(profileBaseSalary) });
    setIsSalarySetupOpen(false);
    setToastMessage(`Updated compensation profile for Employee #${profileEmpId} (Base: $${profileBaseSalary}/mo).`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Summary Cards & Generator Action */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {canViewAll ? (
          <>
            {/* Card 1: Payout */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
              <div className="flex items-start justify-between">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
                  ${totalPayrollExpense.toLocaleString()}
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <CurrencyDollar weight="fill" className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
                  Total Monthly Payout
                </h3>
                <p className="text-[11px] text-emerald-600 mt-0.5 leading-tight font-medium">
                  Calculated net compensation
                </p>
              </div>
            </div>

            {/* Card 2: Withholding Tax */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
              <div className="flex items-start justify-between">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
                  ${totalTax.toLocaleString()}
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Receipt weight="fill" className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
                  Withholding Tax Total
                </h3>
                <p className="text-[11px] text-blue-600 mt-0.5 leading-tight font-medium">
                  Tax compliance withholding
                </p>
              </div>
            </div>

            {/* Card 3: Batch Run */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-800 tracking-tight">
                  Batch Payroll Processing
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <GearSix weight="fill" className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <BehavioralHistorySelect
                  label="Payroll Period"
                  options={[
                    { value: 'January 2026', label: 'Jan 2026' },
                    { value: 'February 2026', label: 'Feb 2026' },
                    { value: 'March 2026', label: 'Mar 2026' },
                  ]}
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  storageKey="hrms_payroll_period_history"
                  selectWidth="130px"
                  placeholder="Period..."
                />
                <button
                  onClick={handleGenerate}
                  aria-label="Run monthly payroll calculation"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                >
                  <Play weight="fill" className="w-3.5 h-3.5" />
                  <span>Run Payroll</span>
                </button>
                <button
                  onClick={handleOpenSalarySetup}
                  title="Configure base salary and penalty multipliers (PayrollProfile)"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <GearSix weight="bold" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Employee Card 1: My Net Salary */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
              <div className="flex items-start justify-between">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
                  ${myNetSalary.toLocaleString()}
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Wallet weight="fill" className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
                  My Monthly Net Payout
                </h3>
                <p className="text-[11px] text-emerald-600 mt-0.5 leading-tight font-medium">
                  Direct deposited to bank
                </p>
              </div>
            </div>

            {/* Employee Card 2: My Allowances */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
              <div className="flex items-start justify-between">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
                  +${myAllowances.toLocaleString()}
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Receipt weight="fill" className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
                  Monthly Allowances
                </h3>
                <p className="text-[11px] text-blue-600 mt-0.5 leading-tight font-medium">
                  Transport & Meal subsidy
                </p>
              </div>
            </div>

            {/* Employee Card 3: Deductions */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[120px]">
              <div className="flex items-start justify-between">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
                  -${myTax.toLocaleString()}
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ShieldCheck weight="fill" className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
                  Tax & Deductions
                </h3>
                <p className="text-[11px] text-purple-600 mt-0.5 leading-tight font-medium">
                  Statutory tax withheld
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2. Payroll Records Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CurrencyDollar weight="duotone" className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {canViewAll ? 'Payroll Records & Slips' : 'My Compensation & Pay Advice'}
              </h2>
              <p className="text-[10px] text-slate-400">
                {canViewAll ? 'All employee salary distributions' : `Personal payroll advice for ${currentUser.fullName}`}
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400">
            {canViewAll ? `Period: ${selectedMonth}` : `Employee #${myEmployeeId}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Employee</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Period</th>
                <th className="py-3 px-6">Base Salary</th>
                <th className="py-3 px-6">Allowances</th>
                <th className="py-3 px-6">Deductions</th>
                <th className="py-3 px-6">Net Salary</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {displayedPayroll.map((p) => (
                <tr key={p.recordId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    <div>{p.employeeName}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{p.jobTitle}</div>
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-600">{p.departmentName}</td>
                  <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500">{p.periodMonth}</td>
                  <td className="py-3.5 px-6 font-mono font-medium">${p.baseSalary.toLocaleString()}</td>
                  <td className="py-3.5 px-6 font-mono text-emerald-600">+${p.allowances}</td>
                  <td className="py-3.5 px-6 font-mono text-rose-500">
                    -${p.lateDeductions + p.taxDeductions}
                  </td>
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                    ${p.netSalary.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        p.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      }`}
                    >
                      {p.status === 'PAID' ? (
                        <CheckCircle weight="fill" className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock weight="fill" className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{p.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingPayslip(p)}
                        aria-label={`View payslip for ${p.employeeName}`}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                        title="View Official Payslip"
                      >
                        <FileText weight="bold" className="w-3.5 h-3.5 text-blue-600" />
                        <span>Payslip</span>
                      </button>

                      {canMarkPaid && p.status !== 'PAID' && (
                        <button
                          onClick={() => markPayrollPaid(p.recordId)}
                          aria-label={`Mark payroll paid for ${p.employeeName}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Official Printable Payslip Modal */}
      <Modal
        isOpen={!!viewingPayslip}
        onClose={() => setViewingPayslip(null)}
        title="Official Salary Payslip"
        subtitle="Confidential Pay Advice generated by BigBoss Operation Service"
        maxWidth="lg"
      >
        {viewingPayslip && (
          <div className="space-y-4">
            {/* Payslip Card Layout */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-base font-bold text-slate-900">BigBoss Corp.</h4>
                  <p className="text-[11px] text-slate-400">Payroll Administration Service</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-blue-600">
                    {viewingPayslip.periodMonth}
                  </span>
                  <p className="text-[10px] text-slate-400">Confidential Pay Advice</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Employee: </span>
                  <span className="font-bold text-slate-800">{viewingPayslip.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Designation: </span>
                  <span className="font-semibold text-slate-700">{viewingPayslip.jobTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400">Department: </span>
                  <span className="font-medium text-slate-700">{viewingPayslip.departmentName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Status: </span>
                  <span className="font-bold text-emerald-600">{viewingPayslip.status}</span>
                </div>
              </div>

              {/* Earnings vs Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                <div className="space-y-1.5">
                  <h5 className="font-bold uppercase text-[10px] tracking-wider text-slate-400">
                    Earnings
                  </h5>
                  <div className="flex justify-between text-slate-600">
                    <span>Base Salary:</span>
                    <span className="font-mono font-semibold">${viewingPayslip.baseSalary}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Allowances:</span>
                    <span className="font-mono text-emerald-600">+${viewingPayslip.allowances}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h5 className="font-bold uppercase text-[10px] tracking-wider text-slate-400">
                    Deductions
                  </h5>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax Withheld:</span>
                    <span className="font-mono text-rose-500">-${viewingPayslip.taxDeductions}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Late Penalties:</span>
                    <span className="font-mono text-rose-500">-${viewingPayslip.lateDeductions}</span>
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">Total Net Salary Paid:</span>
                <span className="text-lg font-extrabold font-mono text-blue-700">
                  ${viewingPayslip.netSalary.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">Generated by BigBoss Operation Service</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  aria-label="Print official salary payslip"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                >
                  <Printer weight="bold" className="w-4 h-4" />
                  <span>Print Payslip</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs shadow-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle weight="fill" className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODAL: Compensation & Salary Profile Setup (PayrollProfile) */}
      <Modal
        isOpen={isSalarySetupOpen}
        onClose={() => setIsSalarySetupOpen(false)}
        title="Compensation Rules (PayrollProfile)"
        subtitle="Backed by operation_service (/api/payroll/profiles)"
        maxWidth="md"
      >
        <form onSubmit={handleSaveSalaryProfile} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Employee
            </label>
            <BehavioralHistorySelect
              placeholder="Select employee..."
              options={employees.map((emp) => ({
                value: emp.employeeId,
                label: `${emp.firstName} ${emp.lastName} (#${emp.employeeId}) • ${emp.departmentName}`,
              }))}
              value={profileEmpId}
              onChange={(val) => {
                const id = Number(val);
                setProfileEmpId(id);
                const emp = employees.find((x) => x.employeeId === id);
                if (emp) {
                  setProfileBaseSalary(emp.salary || 2500);
                  setProfilePenaltyPerMin(Number(((emp.salary || 2500) / 22 / 480).toFixed(2)));
                }
              }}
              storageKey="hrms_payroll_employee_profile_history"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Base Salary (USD)
              </label>
              <input
                type="number"
                value={profileBaseSalary}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setProfileBaseSalary(val);
                  setProfilePenaltyPerMin(Number((val / 22 / 480).toFixed(2)));
                }}
                required
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Rate (22 days)
              </label>
              <div className="w-full px-3 py-2 text-xs font-mono bg-slate-100 rounded-xl text-slate-600">
                ${(profileBaseSalary / 22).toFixed(2)}/day
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Late Penalty Rate (USD/minute)
            </label>
            <input
              type="number"
              step="0.01"
              value={profilePenaltyPerMin}
              onChange={(e) => setProfilePenaltyPerMin(Number(e.target.value))}
              required
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Formula: Base / 22 days / 8 hrs / 60 mins = penalty deducted per unexcused late minute.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSalarySetupOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold active:scale-[0.98] transition-all"
            >
              Save Salary Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
