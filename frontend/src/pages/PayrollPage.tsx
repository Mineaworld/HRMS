import React, { useState } from 'react';
import {
  CurrencyDollar,
  Play,
  FileText,
  Printer,
  X,
  CheckCircle,
  Clock,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../store/useHrmsStore';
import { PayrollRecord } from '../types';

export const PayrollPage: React.FC = () => {
  const { payroll, employees, generateMonthlyPayroll, markPayrollPaid, currentUser } = useHrmsStore();
  const [selectedMonth, setSelectedMonth] = useState('January 2026');
  const [viewingPayslip, setViewingPayslip] = useState<PayrollRecord | null>(null);

  const canProcess = currentUser.role === 'ROLE_ADMIN' || currentUser.role === 'ROLE_HR';

  const totalPayrollExpense = payroll.reduce((sum, p) => sum + p.netSalary, 0);
  const totalTax = payroll.reduce((sum, p) => sum + p.taxDeductions, 0);

  const handleGenerate = () => {
    generateMonthlyPayroll(selectedMonth);
    alert(`Monthly payroll generated for ${selectedMonth} across ${employees.length} employees.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Summary Cards & Generator Action */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Monthly Payout
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            ${totalPayrollExpense.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Calculated net compensation</div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Withholding Tax Total
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            ${totalTax.toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-600 mt-1">Tax compliance withholding</div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Batch Payroll Processing
          </div>
          {canProcess ? (
            <div className="flex items-center gap-2 mt-2">
              <select
                aria-label="Select payroll period month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
              >
                <option value="January 2026">Jan 2026</option>
                <option value="February 2026">Feb 2026</option>
                <option value="March 2026">Mar 2026</option>
              </select>
              <button
                onClick={handleGenerate}
                aria-label="Run monthly payroll calculation"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              >
                <Play weight="fill" className="w-3.5 h-3.5" />
                <span>Run Payroll</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-1">
              Admin / HR permissions required to trigger batch runs.
            </p>
          )}
        </div>
      </div>

      {/* 2. Payroll Records Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CurrencyDollar weight="duotone" className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Payroll Records & Slips ({payroll.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Period: {selectedMonth}</span>
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
              {payroll.map((p) => (
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

                      {canProcess && p.status !== 'PAID' && (
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
      {viewingPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="glass-card rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText weight="duotone" className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Official Salary Payslip
                </h3>
              </div>
              <button
                onClick={() => setViewingPayslip(null)}
                aria-label="Close dialog"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              >
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>

            {/* Payslip Card Layout */}
            <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-base font-bold text-slate-900">SETEC HRMS Corp.</h4>
                  <p className="text-[11px] text-slate-400">Class SU - Year 4 Semester 1</p>
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
                  <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider text-slate-400">
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
                  <h5 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider text-slate-400">
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

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
              <span className="text-[11px] text-slate-400">Generated by HRMS Operation Service</span>
              <button
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
    </div>
  );
};
