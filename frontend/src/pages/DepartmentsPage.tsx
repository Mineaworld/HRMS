import React, { useState, useMemo } from 'react';
import {
  Buildings,
  Plus,
  MagnifyingGlass,
  UsersThree,
  CurrencyDollar,
  Trash,
  PencilSimple,
  X,
  WarningCircle,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  User,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../store/useHrmsStore';
import { Department, Employee } from '../types';

export const DepartmentsPage: React.FC = () => {
  const { departments, employees, addDepartment, updateDepartment, deleteDepartment, currentUser } =
    useHrmsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptForRoster, setSelectedDeptForRoster] = useState<Department | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formBudget, setFormBudget] = useState('35000');
  const [formLeadId, setFormLeadId] = useState<number | ''>('');

  const isManager = currentUser.role === 'ROLE_ADMIN' || currentUser.role === 'ROLE_HR';

  // Calculate dynamic headcounts based on employees collection
  const departmentsWithLiveStats = useMemo(() => {
    return departments.map((dept) => {
      const assigned = employees.filter((e) => e.departmentId === dept.departmentId);
      const lead = employees.find((e) => e.employeeId === dept.leadEmployeeId);
      return {
        ...dept,
        headCount: assigned.length,
        leadName: lead ? `${lead.firstName} ${lead.lastName}` : dept.leadName || 'Unassigned',
        leadAvatar: lead ? lead.avatarUrl : dept.leadAvatar,
      };
    });
  }, [departments, employees]);

  // Filtered
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departmentsWithLiveStats;
    const q = searchQuery.toLowerCase();
    return departmentsWithLiveStats.filter(
      (d) =>
        d.departmentName.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        (d.leadName && d.leadName.toLowerCase().includes(q))
    );
  }, [departmentsWithLiveStats, searchQuery]);

  // Total stats
  const totalEmployeesCount = employees.length;
  const totalBudget = departmentsWithLiveStats.reduce((acc, d) => acc + (d.budget || 0), 0);

  const handleOpenCreate = () => {
    setFormName('');
    setFormDesc('');
    setFormBudget('40000');
    setFormLeadId(employees[0]?.employeeId || '');
    setEditingDept(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormName(dept.departmentName);
    setFormDesc(dept.description);
    setFormBudget(dept.budget ? String(dept.budget) : '35000');
    setFormLeadId(dept.leadEmployeeId || employees[0]?.employeeId || '');
    setIsCreateModalOpen(true);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const leadId = typeof formLeadId === 'number' ? formLeadId : undefined;
    const lead = employees.find((emp) => emp.employeeId === leadId);

    if (editingDept) {
      updateDepartment(editingDept.departmentId, {
        departmentName: formName.trim(),
        description: formDesc.trim(),
        budget: Number(formBudget) || 0,
        leadEmployeeId: leadId,
        leadName: lead ? `${lead.firstName} ${lead.lastName}` : undefined,
        leadAvatar: lead?.avatarUrl,
      });
    } else {
      addDepartment({
        departmentName: formName.trim(),
        description: formDesc.trim(),
        budget: Number(formBudget) || 0,
        leadEmployeeId: leadId,
        leadName: lead ? `${lead.firstName} ${lead.lastName}` : undefined,
        leadAvatar: lead?.avatarUrl,
      });
    }

    setIsCreateModalOpen(false);
  };

  const handleDeleteDepartment = (id: number) => {
    setDeleteError(null);
    const result = deleteDepartment(id);
    if (!result.success && result.error) {
      setDeleteError(result.error);
    }
  };

  const rosterEmployees = useMemo(() => {
    if (!selectedDeptForRoster) return [];
    return employees.filter((e) => e.departmentId === selectedDeptForRoster.departmentId);
  }, [selectedDeptForRoster, employees]);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn select-none">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Organization & Departments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Departmental hierarchy, operational budgets, and active personnel allocation
          </p>
        </div>

        {isManager && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs active:scale-[0.98] transition-all"
          >
            <Plus weight="bold" className="w-4 h-4" />
            <span>Create Department</span>
          </button>
        )}
      </div>

      {/* 2. Top Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Divisions</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{departments.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Active organizational units</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Assigned Staff</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalEmployeesCount}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">100% staff allocated</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Monthly Budget</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">${totalBudget.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Operation service (:8082)</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Governance Policy</span>
          <div className="text-sm font-bold text-slate-800 mt-2 flex items-center gap-1.5">
            <ShieldCheck weight="bold" className="w-4 h-4 text-blue-600" />
            <span>Strict Cascade Guard</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Prevents orphan records</span>
        </div>
      </div>

      {/* 3. Safety Alert Banner if Deletion blocked */}
      {deleteError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <WarningCircle weight="fill" className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="font-medium">{deleteError}</span>
          </div>
          <button
            onClick={() => setDeleteError(null)}
            className="text-rose-500 hover:text-rose-700 p-0.5 rounded"
          >
            <X weight="bold" className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MagnifyingGlass weight="bold" className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search departments or leads..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
          />
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredDepartments.length} of {departments.length}
        </span>
      </div>

      {/* 5. Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.departmentId}
            className="group relative rounded-2xl bg-white p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                    <Buildings weight="duotone" className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight">
                      {dept.departmentName}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">ID #{dept.departmentId}</span>
                  </div>
                </div>

                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 flex-shrink-0">
                  {dept.headCount} {dept.headCount === 1 ? 'staff' : 'staff'}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                {dept.description || 'No departmental description specified.'}
              </p>

              {/* Department Lead */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {dept.leadAvatar ? (
                    <img
                      src={dept.leadAvatar}
                      alt={dept.leadName}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                      <User weight="bold" className="w-3 h-3" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Lead</div>
                    <div className="text-xs font-medium text-slate-800 truncate">{dept.leadName}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Budget</div>
                  <div className="text-xs font-mono font-bold text-slate-700">
                    ${(dept.budget || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedDeptForRoster(dept)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 active:scale-[0.98] transition-all flex items-center gap-1"
              >
                <span>View Roster</span>
                <ArrowRight weight="bold" className="w-3.5 h-3.5" />
              </button>

              {isManager && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    title="Edit department"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <PencilSimple weight="bold" className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(dept.departmentId)}
                    title="Delete department (validates empty staff)"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash weight="bold" className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 6. MEMBER ROSTER SIDE DRAWER */}
      {selectedDeptForRoster && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-slideLeft">
            <div>
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Department Roster
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    {selectedDeptForRoster.departmentName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {rosterEmployees.length} active employees assigned
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDeptForRoster(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X weight="bold" className="w-4 h-4" />
                </button>
              </div>

              {/* Roster list */}
              <div className="mt-4 space-y-2.5">
                {rosterEmployees.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No employees currently assigned to this division.
                  </div>
                ) : (
                  rosterEmployees.map((emp) => (
                    <div
                      key={emp.employeeId}
                      className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={emp.avatarUrl}
                          alt={emp.firstName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-900 truncate">
                            {emp.firstName} {emp.lastName}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">{emp.jobTitle}</p>
                          <span className="text-[10px] font-mono text-slate-400">{emp.email}</span>
                        </div>
                      </div>

                      <span
                        className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          emp.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDeptForRoster(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CREATE / EDIT DEPARTMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. AI Cloud Infrastructure"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Operational scope and mission of this unit..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="40000"
                    required
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Lead
                  </label>
                  <select
                    value={formLeadId}
                    onChange={(e) => setFormLeadId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-800"
                  >
                    {employees.map((emp) => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold active:scale-[0.98] transition-all"
                >
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
