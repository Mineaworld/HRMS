import React, { useState } from 'react';
import {
  UsersThree,
  UserPlus,
  MagnifyingGlass,
  Trash,
  X,
  XCircle,
  TreeStructure,
  CheckCircle,
  CurrencyDollar,
  EyeSlash,
  ShieldCheck,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../store/useHrmsStore';
import { BehavioralHistorySelect } from '../components/ui/behavioral-history-select';
import { Modal } from '../components/ui/modal';
import { hasPermission } from '../utils/rbac';

export const EmployeesPage: React.FC = () => {
  const { employees, departments, addEmployee, deleteEmployee, currentUser } = useHrmsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: 'Male' as const,
    dob: '1995-01-01',
    salary: 2000,
    departmentId: 1,
    jobTitle: '',
    status: 'Active' as const,
    hireDate: new Date().toISOString().split('T')[0],
  });

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      selectedDept === 'ALL' || emp.departmentName === selectedDept;

    return matchesSearch && matchesDept;
  });

  const activeCount = employees.filter((e) => e.status === 'Active').length;
  const avgSalary = Math.round(
    employees.reduce((sum, e) => sum + e.salary, 0) / (employees.length || 1)
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setFormError('Please fill out all required fields (First Name, Last Name, and Email).');
      return;
    }

    const dept = departments.find((d) => d.departmentId === Number(formData.departmentId));

    addEmployee({
      ...formData,
      departmentId: Number(formData.departmentId),
      departmentName: dept ? dept.departmentName : 'Engineering',
      salary: Number(formData.salary),
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&w=200&q=80`,
    });

    setIsAddModalOpen(false);
    setFormError(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      gender: 'Male',
      dob: '1995-01-01',
      salary: 2000,
      departmentId: 1,
      jobTitle: '',
      status: 'Active',
      hireDate: new Date().toISOString().split('T')[0],
    });
  };

  const canCreate = hasPermission(currentUser.role, 'EMPLOYEE_CREATE');
  const canViewSalary = hasPermission(currentUser.role, 'EMPLOYEE_VIEW_SALARY');
  const canDelete = hasPermission(currentUser.role, 'EMPLOYEE_DELETE');

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[118px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              {employees.length}
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <UsersThree weight="fill" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Total Employees
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight truncate">
              Active company roster
            </p>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[118px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              {departments.length}
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <TreeStructure weight="fill" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Departments
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight truncate">
              Operational divisions
            </p>
          </div>
        </div>

        {/* Active Ratio */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[118px]">
          <div className="flex items-start justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
              {activeCount}
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <CheckCircle weight="fill" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
              Active In Office
            </h3>
            <p className="text-[11px] text-emerald-600 mt-0.5 leading-tight font-medium">
              Currently on duty
            </p>
          </div>
        </div>

        {/* Card 4: Average Compensation (Admin/HR) OR Role Clearance (Employee) */}
        {canViewSalary ? (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[118px]">
            <div className="flex items-start justify-between">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums leading-none">
                ${avgSalary.toLocaleString()}
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <CurrencyDollar weight="fill" className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-snug">
                Average Salary
              </h3>
              <p className="text-[11px] text-amber-600 mt-0.5 leading-tight font-medium">
                Monthly compensation base
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between min-h-[118px]">
            <div className="flex items-start justify-between">
              <div className="text-sm font-bold tracking-tight text-slate-800 leading-snug">
                Employee Privacy Protocol
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <ShieldCheck weight="fill" className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-slate-600 tracking-tight leading-snug">
                Salaries Protected
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight font-mono">
                RBAC Masking Active
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <MagnifyingGlass weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              aria-label="Search employees by name, email, or job title"
              placeholder="Search by name, email, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <BehavioralHistorySelect
            options={[
              { value: 'ALL', label: 'All Departments' },
              ...departments.map((d) => ({
                value: d.departmentName,
                label: d.departmentName,
              })),
            ]}
            value={selectedDept}
            onChange={setSelectedDept}
            storageKey="hrms_dept_filter_history"
            selectWidth="200px"
            placeholder="All Departments"
          />
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            aria-label="Open add employee dialog"
            className="flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.96] text-white text-xs font-bold shadow-sm transition-transform duration-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer"
          >
            <UserPlus weight="bold" className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* 3. Employees Table Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersThree weight="duotone" className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Employee Directory ({filteredEmployees.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Total Staff: {employees.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Employee</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Job Title</th>
                <th className="py-3 px-6">{canViewSalary ? 'Salary' : 'Compensation'}</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Hire Date</th>
                {canDelete && <th className="py-3 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredEmployees.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs ring-2 ring-white shadow-sm overflow-hidden flex-shrink-0">
                        {emp.avatarUrl ? (
                          <img src={emp.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          `${emp.firstName[0]}${emp.lastName[0]}`
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-medium">{emp.departmentName}</td>
                  <td className="py-3.5 px-6 text-slate-600">{emp.jobTitle}</td>
                  <td className="py-3.5 px-6 font-mono">
                    {canViewSalary ? (
                      <span className="font-semibold text-slate-900">${emp.salary.toLocaleString()}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[11px]">
                        <EyeSlash weight="bold" className="w-3 h-3 text-slate-400" />
                        <span>Confidential</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        emp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : emp.status === 'On Leave'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                    {emp.hireDate}
                  </td>
                  {canDelete && (
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove employee ${emp.firstName} ${emp.lastName}?`)) {
                            deleteEmployee(emp.employeeId);
                          }
                        }}
                        aria-label={`Delete employee ${emp.firstName} ${emp.lastName}`}
                        className="min-w-[36px] min-h-[36px] p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-[0.96] transition-transform duration-100 inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none cursor-pointer"
                        title="Delete Employee (Admin Clearance)"
                      >
                        <Trash weight="bold" className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        subtitle="Create enterprise employee profile and assign credentials"
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="empFirstName" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    First Name
                  </label>
                  <input
                    id="empFirstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      if (formError) setFormError(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="empLastName" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Last Name
                  </label>
                  <input
                    id="empLastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      if (formError) setFormError(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="empEmail" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    id="empEmail"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formError) setFormError(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="empPhone" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="empPhone"
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Department
                  </label>
                  <BehavioralHistorySelect
                    label="Choose Department"
                    options={departments.map((d) => ({
                      value: String(d.departmentId),
                      label: d.departmentName,
                    }))}
                    value={String(formData.departmentId)}
                    onChange={(val) => setFormData({ ...formData, departmentId: Number(val) })}
                    storageKey="hrms_emp_dept_history"
                    selectWidth="100%"
                    placeholder="Select Department..."
                  />
                </div>
                <div>
                  <label htmlFor="empTitle" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Job Title
                  </label>
                  <input
                    id="empTitle"
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="empSalary" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Monthly Base Salary ($)
                  </label>
                  <input
                    id="empSalary"
                    type="number"
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Gender
                  </label>
                  <BehavioralHistorySelect
                    label="Select Gender"
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    value={formData.gender}
                    onChange={(val) => setFormData({ ...formData, gender: val as any })}
                    storageKey="hrms_emp_gender_history"
                    selectWidth="100%"
                    placeholder="Select Gender..."
                  />
                </div>
              </div>

              {/* Clean Inline Form Error (Banish native alert) */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2">
                  <XCircle weight="fill" className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span className="font-medium">{formError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setIsAddModalOpen(false);
                  }}
                  className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 active:scale-[0.96] transition-transform duration-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.96] text-white text-xs font-semibold shadow-sm transition-transform duration-100 cursor-pointer"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </Modal>
    </div>
  );
};
