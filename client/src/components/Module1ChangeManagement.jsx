import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GitPullRequest, 
  Network, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  Filter, 
  Building, 
  DollarSign, 
  Briefcase, 
  ShieldAlert, 
  Download, 
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  X,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api';

export default function Module1ChangeManagement({ currentPersona }) {
  const [subTab, setSubTab] = useState('employees'); // employees, changeRequests, orgChart, reports
  const [employees, setEmployees] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [orgTree, setOrgTree] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Selected Employee for Dossier Drawer
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDossier, setEmployeeDossier] = useState(null);

  // New Change Request Modal
  const [showNewCrModal, setShowNewCrModal] = useState(false);
  const [newCrData, setNewCrData] = useState({
    employeeId: '',
    changeType: 'SALARY_REVISION',
    proposedValue: '',
    proposedSecondaryValue: '',
    justification: '',
    effectiveDate: ''
  });

  // Review Modals
  const [reviewingCr, setReviewingCr] = useState(null);
  const [reviewLevel, setReviewLevel] = useState(null); // 'HR' or 'MANAGEMENT'
  const [reviewDecision, setReviewDecision] = useState('RECOMMEND_TO_MANAGEMENT');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewEffectiveDate, setReviewEffectiveDate] = useState('');

  useEffect(() => {
    loadData();
  }, [subTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (subTab === 'employees') {
        const data = await api.getEmployees();
        setEmployees(data);
      } else if (subTab === 'changeRequests') {
        const data = await api.getChangeRequests();
        setChangeRequests(data);
      } else if (subTab === 'orgChart') {
        const data = await api.getOrgChart();
        setOrgTree(data);
      } else if (subTab === 'reports') {
        const data = await api.getChangeManagementReport();
        setReportData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDossier = async (emp) => {
    setSelectedEmployee(emp);
    try {
      const full = await api.getEmployeeById(emp.id);
      setEmployeeDossier(full);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCr = async (e) => {
    e.preventDefault();
    try {
      await api.createChangeRequest({
        ...newCrData,
        requestedBy: `${currentPersona.name} (${currentPersona.role})`
      });
      setShowNewCrModal(false);
      setNewCrData({
        employeeId: '',
        changeType: 'SALARY_REVISION',
        proposedValue: '',
        proposedSecondaryValue: '',
        justification: '',
        effectiveDate: ''
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleHrReviewSubmit = async () => {
    if (!reviewingCr) return;
    try {
      await api.hrReviewChangeRequest(reviewingCr.id, {
        decision: reviewDecision,
        remarks: reviewRemarks,
        reviewerName: `${currentPersona.name} (${currentPersona.role})`
      });
      setReviewingCr(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMgmtReviewSubmit = async () => {
    if (!reviewingCr) return;
    try {
      await api.mgmtReviewChangeRequest(reviewingCr.id, {
        decision: reviewDecision,
        remarks: reviewRemarks,
        reviewerName: `${currentPersona.name} (${currentPersona.role})`,
        updatedEffectiveDate: reviewEffectiveDate || undefined
      });
      setReviewingCr(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyEffective = async (id) => {
    try {
      await api.applyEffectiveChangeRequest(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEmployees = employees.filter(e => {
    const matchesCat = !categoryFilter || e.category === categoryFilter;
    const matchesSearch = !searchQuery || (
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Module Overview Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-md border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Module I — Single Source of Truth</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              HR Change Management & Automation System
            </h1>
            <p className="mt-1 text-xs md:text-sm text-blue-200/90 max-w-3xl leading-relaxed">
              Controlled governance for employee service-condition modifications: Salary Revisions, Designations, Levels, Reporting Hierarchy, Departmental Transfers, and Additional Responsibilities. Enforces 2-Tier approval hierarchy (HR & Senior Management), effective dates, and real-time ERP integration.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                api.getEmployees().then(setEmployees);
                setShowNewCrModal(true);
              }}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Initiate Service Change</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="mt-6 pt-4 border-t border-blue-800/80 flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={() => setSubTab('employees')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
              subTab === 'employees' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Central Employee Database ({employees.length || 17})</span>
          </button>
          <button
            onClick={() => setSubTab('changeRequests')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
              subTab === 'changeRequests' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-800/60'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Change Requests Queue</span>
          </button>
          <button
            onClick={() => setSubTab('orgChart')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
              subTab === 'orgChart' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-800/60'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Interactive Org Structure</span>
          </button>
          <button
            onClick={() => setSubTab('reports')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
              subTab === 'reports' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Real-Time Reports & Analytics</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUBTAB 1: CENTRAL EMPLOYEE DATABASE                      */}
      {/* ========================================================= */}
      {subTab === 'employees' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees by Name, Code, Department, or Designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="">All Categories</option>
                <option value="MANAGEMENT">University Management</option>
                <option value="FACULTY">Faculty Members</option>
                <option value="NON_FACULTY">Non-Faculty Officers</option>
                <option value="GROUP_D">Group-D / Band I</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Employee Details</th>
                  <th className="py-3 px-4">Category & Level</th>
                  <th className="py-3 px-4">Department / School</th>
                  <th className="py-3 px-4">Reporting Authority</th>
                  <th className="py-3 px-4">Probation Status</th>
                  <th className="py-3 px-4">Current Salary</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <span className="font-mono">{emp.empCode}</span>
                        <span>•</span>
                        <span>{emp.designation}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.category === 'FACULTY' ? 'bg-teal-100 text-teal-800' :
                        emp.category === 'GROUP_D' ? 'bg-amber-100 text-amber-800' :
                        emp.category === 'MANAGEMENT' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {emp.category}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">{emp.level}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{emp.department}</div>
                      <div className="text-[11px] text-slate-500">{emp.school}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{emp.reportingAuthorityName || 'Apex / Board'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.probationStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {emp.probationStatus === 'COMPLETED' ? 'Completed' : 'In Probation'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">DOJ: {emp.doj}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{emp.salary ? emp.salary.toLocaleString('en-IN') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDossier(emp)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold rounded-md transition flex items-center space-x-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: CHANGE REQUESTS QUEUE (2-TIER WORKFLOW)         */}
      {/* ========================================================= */}
      {subTab === 'changeRequests' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold text-slate-500 uppercase">Total Change Requests</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{changeRequests.length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs bg-amber-50/20">
              <div className="text-xs font-bold text-amber-800 uppercase">Pending HR Review (Tier 1)</div>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {changeRequests.filter(c => c.status === 'PENDING_HR').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs bg-indigo-50/20">
              <div className="text-xs font-bold text-indigo-800 uppercase">Pending Management (Tier 2)</div>
              <div className="text-2xl font-black text-indigo-700 mt-1">
                {changeRequests.filter(c => c.status === 'PENDING_MANAGEMENT').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
              <div className="text-xs font-bold text-emerald-800 uppercase">Approved / Applied</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {changeRequests.filter(c => c.status === 'APPROVED' || c.status === 'EFFECTIVE_APPLIED').length}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
              <span>Controlled Service-Change Requests (Audit-Linked Workflow)</span>
              <span className="text-[11px] text-slate-500 font-normal">
                SOP Hierarchy: Requester → HR Level Review → Senior Management Approval → Effective Date Execution
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {changeRequests.map((cr) => (
                <div key={cr.id} className="p-4 hover:bg-slate-50/60 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Request Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                          {cr.reqNumber}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                          {cr.changeType.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          cr.status === 'EFFECTIVE_APPLIED' ? 'bg-emerald-100 text-emerald-800' :
                          cr.status === 'APPROVED' ? 'bg-teal-100 text-teal-800' :
                          cr.status === 'PENDING_MANAGEMENT' ? 'bg-indigo-100 text-indigo-800' :
                          cr.status === 'PENDING_HR' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {cr.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-slate-900">
                        {cr.employeeName} — <span className="text-slate-500 font-normal">{cr.department}</span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Service Value:</span>
                          <span className="font-semibold text-slate-700">{cr.currentValue} {cr.currentSecondaryValue && `(${cr.currentSecondaryValue})`}</span>
                        </div>
                        <div>
                          <span className="text-blue-500 text-[10px] uppercase font-bold block">Proposed Service Value:</span>
                          <span className="font-bold text-blue-700">{cr.proposedValue} {cr.proposedSecondaryValue && `(${cr.proposedSecondaryValue})`}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 italic">
                        "{cr.justification}"
                      </p>

                      <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                        <span>Requested by: <strong className="text-slate-600">{cr.requestedBy}</strong></span>
                        <span>•</span>
                        <span>Effective Date: <strong className="text-slate-700">{cr.effectiveDate}</strong></span>
                      </div>
                    </div>

                    {/* Workflow Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
                      {/* HR Review Action (Tier 1) */}
                      {cr.status === 'PENDING_HR' && (
                        <button
                          onClick={() => {
                            setReviewingCr(cr);
                            setReviewLevel('HR');
                            setReviewDecision('RECOMMEND_TO_MANAGEMENT');
                            setReviewRemarks('');
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md shadow-2xs transition flex items-center justify-center space-x-1"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>HR Review (Tier 1)</span>
                        </button>
                      )}

                      {/* Management Review Action (Tier 2) */}
                      {cr.status === 'PENDING_MANAGEMENT' && (
                        <button
                          onClick={() => {
                            setReviewingCr(cr);
                            setReviewLevel('MANAGEMENT');
                            setReviewDecision('APPROVE');
                            setReviewRemarks('');
                            setReviewEffectiveDate(cr.effectiveDate);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md shadow-2xs transition flex items-center justify-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Management Approval (Tier 2)</span>
                        </button>
                      )}

                      {/* Approved & Waiting for Effective Date */}
                      {cr.status === 'APPROVED' && cr.stage === 'AWAITING_EFFECTIVE_DATE' && (
                        <div className="space-y-1">
                          <span className="inline-block px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold rounded-md">
                            Effective on: {cr.effectiveDate}
                          </span>
                          <button
                            onClick={() => handleApplyEffective(cr.id)}
                            className="w-full px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-md shadow-2xs transition"
                            title="Execute change immediately in Central Database and Org Chart"
                          >
                            Apply Now
                          </button>
                        </div>
                      )}

                      {cr.status === 'EFFECTIVE_APPLIED' && (
                        <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-md flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Live in ERP</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 3: INTERACTIVE ORG STRUCTURE (LIVE SYNC)          */}
      {/* ========================================================= */}
      {subTab === 'orgChart' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Interactive University Organizational Tree</h2>
              <p className="text-xs text-slate-500">Live reporting lines dynamically derived from the Central Employee Database</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
              Live Connected to Module I
            </span>
          </div>

          <div className="space-y-4">
            {orgTree.map((node) => (
              <OrgNode key={node.id} node={node} level={0} />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 4: REAL-TIME REPORTS & ANALYTICS                   */}
      {/* ========================================================= */}
      {subTab === 'reports' && reportData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Changes</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{reportData.summary.total}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">
              <div className="text-[11px] font-bold text-amber-700 uppercase">Pending HR</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{reportData.summary.pendingHr}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs">
              <div className="text-[11px] font-bold text-indigo-700 uppercase">Pending Mgmt</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">{reportData.summary.pendingMgmt}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-2xs">
              <div className="text-[11px] font-bold text-teal-700 uppercase">Awaiting Date</div>
              <div className="text-2xl font-black text-teal-600 mt-1">{reportData.summary.awaitingEffective}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Live Applied</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{reportData.summary.effectiveApplied}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Change Frequency by Department
              </h3>
              <div className="space-y-2">
                {Object.entries(reportData.byDepartment).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">{dept}</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{count} requests</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Changes by Service Condition Type
              </h3>
              <div className="space-y-2">
                {Object.entries(reportData.byChangeType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">{type.replace('_', ' ')}</span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{count} requests</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER: EMPLOYEE DIGITAL DOSSIER                          */}
      {/* ========================================================= */}
      {selectedEmployee && employeeDossier && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Digital Employee File (Single Source of Truth)
                </span>
                <h2 className="text-lg font-black">{employeeDossier.name}</h2>
                <p className="text-xs text-slate-300 font-mono">{employeeDossier.empCode} • {employeeDossier.designation}</p>
              </div>
              <button
                onClick={() => { setSelectedEmployee(null); setEmployeeDossier(null); }}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Profile Details */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category & Level:</span>
                    <span className="font-semibold text-slate-800">{employeeDossier.category} ({employeeDossier.level})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Department:</span>
                    <span className="font-semibold text-slate-800">{employeeDossier.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporting Authority:</span>
                    <span className="font-semibold text-slate-800">{employeeDossier.reportingAuthorityName || 'Apex / Board'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Salary:</span>
                    <span className="font-mono font-bold text-slate-900">₹{employeeDossier.salary?.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Joining:</span>
                    <span className="font-semibold text-slate-800">{employeeDossier.doj}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Probation Status:</span>
                    <span className="font-bold text-emerald-700">{employeeDossier.probationStatus}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Qualifications:</span>
                  <span className="font-medium text-slate-700">{employeeDossier.qualifications}</span>
                </div>
              </div>

              {/* Digital Dossier Documents */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Statutory Digital Documents & Orders</span>
                </h3>
                <div className="space-y-1.5">
                  {(employeeDossier.digitalDossier || []).length === 0 ? (
                    <div className="text-slate-400 text-[11px] italic">No attached documents uploaded yet.</div>
                  ) : (
                    employeeDossier.digitalDossier.map((doc, idx) => (
                      <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-md flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{doc.title}</div>
                          <div className="text-[10px] text-slate-400">{doc.date} • {doc.type}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">Verified</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Service Change History */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <GitPullRequest className="w-4 h-4 text-indigo-600" />
                  <span>Module I Service Modification Trail</span>
                </h3>
                <div className="space-y-2">
                  {employeeDossier.history?.changeHistory?.length === 0 ? (
                    <div className="text-slate-400 text-[11px] italic">No change requests raised.</div>
                  ) : (
                    employeeDossier.history.changeHistory.map((ch) => (
                      <div key={ch.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{ch.changeType.replace('_', ' ')}</span>
                          <span className="text-[10px] text-indigo-600">{ch.status}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          Changed: <strong className="text-slate-700">{ch.currentValue}</strong> → <strong className="text-blue-700">{ch.proposedValue}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Effective: {ch.effectiveDate}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => { setSelectedEmployee(null); setEmployeeDossier(null); }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-md text-xs transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INITIATE NEW SERVICE CHANGE REQUEST                */}
      {/* ========================================================= */}
      {showNewCrModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-blue-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Initiate HR Service-Condition Change</h2>
                <p className="text-xs text-blue-200">Controlled workflow: Enforces HR review & Senior Management sign-off</p>
              </div>
              <button onClick={() => setShowNewCrModal(false)} className="p-1 rounded-md text-blue-200 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCr} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Employee</label>
                <select
                  required
                  value={newCrData.employeeId}
                  onChange={(e) => setNewCrData({ ...newCrData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.empCode}) — {e.designation}, {e.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Change Type</label>
                <select
                  value={newCrData.changeType}
                  onChange={(e) => setNewCrData({ ...newCrData, changeType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="SALARY_REVISION">Salary Revision</option>
                  <option value="DESIGNATION_CHANGE">Designation Promotion / Change</option>
                  <option value="LEVEL_CHANGE">Pay Level / Band Change</option>
                  <option value="DEPT_SCHOOL_CHANGE">Department / School Transfer</option>
                  <option value="REPORTING_AUTH_CHANGE">Reporting Authority Change</option>
                  <option value="ADDITIONAL_RESPONSIBILITY">Additional Statutory Responsibility</option>
                  <option value="QUALIFICATION_UPDATE">Higher Qualification Update</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Proposed Primary Value</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹95,000 or Associate Professor"
                    value={newCrData.proposedValue}
                    onChange={(e) => setNewCrData({ ...newCrData, proposedValue: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Secondary Value (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. L-13A"
                    value={newCrData.proposedSecondaryValue}
                    onChange={(e) => setNewCrData({ ...newCrData, proposedSecondaryValue: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Approved Effective Date</label>
                <input
                  type="date"
                  required
                  value={newCrData.effectiveDate}
                  onChange={(e) => setNewCrData({ ...newCrData, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  * Module I explicitly supports future effective dates; changes execute on the designated date.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Official Justification / Recommendation</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail grounds for modification (e.g. annual appraisal outcome, statutory CAS promotion, departmental reorganization)..."
                  value={newCrData.justification}
                  onChange={(e) => setNewCrData({ ...newCrData, justification: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewCrModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-xs transition"
                >
                  Submit into Approval Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: HR & MANAGEMENT REVIEW MODAL                       */}
      {/* ========================================================= */}
      {reviewingCr && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className={`px-6 py-4 text-white flex items-center justify-between ${
              reviewLevel === 'HR' ? 'bg-amber-600' : 'bg-indigo-900'
            }`}>
              <div>
                <h2 className="text-base font-bold">
                  {reviewLevel === 'HR' ? 'HR Review (Tier 1 Approval)' : 'Senior Management Approval (Tier 2)'}
                </h2>
                <p className="text-xs text-white/80">Ref: {reviewingCr.reqNumber} • {reviewingCr.employeeName}</p>
              </div>
              <button onClick={() => setReviewingCr(null)} className="p-1 rounded-md text-white/80 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div>Change Type: <strong className="text-slate-800">{reviewingCr.changeType}</strong></div>
                <div>Current Value: <strong className="text-slate-800">{reviewingCr.currentValue}</strong></div>
                <div>Proposed Value: <strong className="text-blue-700">{reviewingCr.proposedValue}</strong></div>
                <div>Effective Date: <strong className="text-slate-800">{reviewingCr.effectiveDate}</strong></div>
                <div className="italic text-slate-600">"{reviewingCr.justification}"</div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Decision</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {reviewLevel === 'HR' ? (
                    <>
                      <option value="RECOMMEND_TO_MANAGEMENT">Recommend & Forward to Senior Management</option>
                      <option value="REQUEST_CLARIFICATION">Return for Clarification / Further Data</option>
                      <option value="REJECT">Reject Request</option>
                    </>
                  ) : (
                    <>
                      <option value="APPROVE">Formally Approve Request</option>
                      <option value="REQUEST_CLARIFICATION">Return to HR for Clarification</option>
                      <option value="REJECT">Reject Request</option>
                    </>
                  )}
                </select>
              </div>

              {reviewLevel === 'MANAGEMENT' && reviewDecision === 'APPROVE' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Confirm Effective Date</label>
                  <input
                    type="date"
                    value={reviewEffectiveDate || reviewingCr.effectiveDate}
                    onChange={(e) => setReviewEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Review Remarks / Conditions</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record verification findings, compliance checks or approval remarks..."
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReviewingCr(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={reviewLevel === 'HR' ? handleHrReviewSubmit : handleMgmtReviewSubmit}
                  className={`px-4 py-2 text-white font-bold rounded-md shadow-xs transition ${
                    reviewLevel === 'HR' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  Submit Formal Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Recursive Org Node Card
function OrgNode({ node, level }) {
  const [expanded, setExpanded] = useState(true);
  const hasSubordinates = node.subordinates && node.subordinates.length > 0;

  return (
    <div className={`space-y-2 ${level > 0 ? 'ml-6 pl-4 border-l-2 border-slate-200' : ''}`}>
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:bg-blue-50/50 hover:border-blue-300 transition flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
            level === 0 ? 'bg-blue-900 text-white' :
            node.category === 'FACULTY' ? 'bg-teal-100 text-teal-800' :
            'bg-slate-200 text-slate-800'
          }`}>
            {node.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">{node.name}</div>
            <div className="text-[11px] text-slate-500">{node.designation} • <span className="font-medium text-slate-700">{node.department}</span></div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-slate-100 text-slate-600 font-mono">
            {node.level}
          </span>
          {hasSubordinates && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] px-2 py-0.5 font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition"
            >
              {expanded ? `Hide (${node.subordinates.length})` : `Show (${node.subordinates.length})`}
            </button>
          )}
        </div>
      </div>

      {hasSubordinates && expanded && (
        <div className="space-y-2 pt-1">
          {node.subordinates.map((sub) => (
            <OrgNode key={sub.id} node={sub} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
