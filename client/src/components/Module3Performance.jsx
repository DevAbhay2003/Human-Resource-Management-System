import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Calendar, 
  Clock, 
  FileText, 
  ArrowRight, 
  PlusCircle, 
  Send, 
  DollarSign, 
  ShieldCheck, 
  TrendingUp, 
  Check, 
  X, 
  Building,
  RotateCcw,
  Sparkles,
  BookOpen,
  Sliders,
  CheckCircle,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function Module3Performance({ currentPersona, onShowToast }) {
  const [activeTrack, setActiveTrack] = useState('trackA'); // trackA (Group-D), trackB (General Non-Faculty), trackC (Faculty ECM)
  const [loading, setLoading] = useState(false);

  // Track A Data
  const [groupDTemplates, setGroupDTemplates] = useState([]);
  const [groupDEvaluations, setGroupDEvaluations] = useState([]);
  const [groupDAnnualReports, setGroupDAnnualReports] = useState([]);

  // Track B Data
  const [generalGoals, setGeneralGoals] = useState([]);
  const [quarterlyReviews, setQuarterlyReviews] = useState([]);

  // Track C Data
  const [facultyEligibility, setFacultyEligibility] = useState([]);
  const [facultyAppraisals, setFacultyAppraisals] = useState([]);

  // Modals
  const [submittingGroupDForm, setSubmittingGroupDForm] = useState(null);
  const [groupDKpiScores, setGroupDKpiScores] = useState([]);
  const [groupDCompScores, setGroupDCompScores] = useState([]);
  const [groupDHodComments, setGroupDHodComments] = useState('');

  const [vpApprovingEvaluation, setVpApprovingEvaluation] = useState(null);
  const [vpRemarks, setVpRemarks] = useState('');

  const [reviewingGroupDCompensation, setReviewingGroupDCompensation] = useState(null);
  const [groupDCompIncrease, setGroupDCompIncrease] = useState('10');
  const [groupDCompRemarks, setGroupDCompRemarks] = useState('');

  // Track B Modals
  const [syncingGoalEmp, setSyncingGoalEmp] = useState(null);
  const [syncType, setSyncType] = useState('SALARY_REVISION');
  const [syncVal, setSyncVal] = useState('78000');

  // Track C Modals
  const [verifyingAppraisal, setVerifyingAppraisal] = useState(null);
  const [stakeholderType, setStakeholderType] = useState('SCHOOL_DEAN');
  const [stakeholderStatus, setStakeholderStatus] = useState('VERIFIED');
  const [stakeholderRemarks, setStakeholderRemarks] = useState('');

  const [scoringAppraisal, setScoringAppraisal] = useState(null);
  const [teachingScore, setTeachingScore] = useState('95');
  const [researchScore, setResearchScore] = useState('96');
  const [consultancyScore, setConsultancyScore] = useState('48');
  const [institutionalScore, setInstitutionalScore] = useState('46');

  const [mgmtDecisionAppraisal, setMgmtDecisionAppraisal] = useState(null);
  const [ecmDecisionType, setEcmDecisionType] = useState('PROMOTION_AND_COMPENSATION_REVISION');
  const [ecmNewSalary, setEcmNewSalary] = useState('115000');
  const [ecmNewDesig, setEcmNewDesig] = useState('Associate Professor');

  useEffect(() => {
    loadTrackData();
  }, [activeTrack]);

  const notify = (type, title, message) => {
    if (onShowToast) {
      onShowToast(type, title, message);
    }
  };

  const loadTrackData = async () => {
    setLoading(true);
    try {
      if (activeTrack === 'trackA') {
        const [tpls, evals, anns] = await Promise.all([
          api.getGroupDTemplates(),
          api.getGroupDEvaluations(),
          api.getGroupDAnnualReports()
        ]);
        setGroupDTemplates(tpls);
        setGroupDEvaluations(evals);
        setGroupDAnnualReports(anns);
      } else if (activeTrack === 'trackB') {
        const [goals, qrs] = await Promise.all([
          api.getGeneralGoals(),
          api.getGeneralQuarterlyReviews()
        ]);
        setGeneralGoals(goals);
        setQuarterlyReviews(qrs);
      } else if (activeTrack === 'trackC') {
        const [elig, apps] = await Promise.all([
          api.getFacultyEligibility(),
          api.getFacultyAppraisals()
        ]);
        setFacultyEligibility(elig);
        setFacultyAppraisals(apps);
      }
    } catch (err) {
      console.error(err);
      notify('error', 'Sync Failed', 'Could not retrieve performance management records.');
    } finally {
      setLoading(false);
    }
  };

  // Group-D Handlers
  const handleOpenGroupDForm = (ev) => {
    setSubmittingGroupDForm(ev);
    const tpl = groupDTemplates.find(t => t.id === ev.templateId) || groupDTemplates[0];
    if (tpl) {
      setGroupDKpiScores(tpl.kpis.map(k => ({ kpiId: k.id, name: k.name, score: k.maxScore, max: k.maxScore })));
      setGroupDCompScores(tpl.competencies.map(c => ({ compId: c.id, name: c.name, score: c.maxScore, max: c.maxScore })));
    }
    setGroupDHodComments('');
  };

  const calculateGroupDTotal = () => {
    const kpiTotal = groupDKpiScores.reduce((acc, k) => acc + (parseFloat(k.score) || 0), 0);
    const kpiMax = groupDKpiScores.reduce((acc, k) => acc + (k.max || 20), 0) || 100;
    const compTotal = groupDCompScores.reduce((acc, c) => acc + (parseFloat(c.score) || 0), 0);
    const compMax = groupDCompScores.reduce((acc, c) => acc + (c.max || 20), 0) || 100;
    
    const kpiPct = (kpiTotal / kpiMax) * 100;
    const compPct = (compTotal / compMax) * 100;
    return Math.round((kpiPct * 0.7) + (compPct * 0.3));
  };

  const handleGroupDSubmit = async (e) => {
    e.preventDefault();
    if (!submittingGroupDForm) return;
    try {
      const overall = calculateGroupDTotal();
      await api.submitGroupDEvaluation(submittingGroupDForm.id, {
        kpiScores: groupDKpiScores,
        competencyScores: groupDCompScores,
        hodComments: groupDHodComments,
        positiveObservations: 'Exemplary punctuality and proactive maintenance.',
        negativeObservations: 'None.'
      });
      notify('success', 'Monthly Evaluation Submitted', `HOD score for ${submittingGroupDForm.employeeName} submitted with composite score of ${overall}%. Forwarded to VP-Admin.`);
      setSubmittingGroupDForm(null);
      loadTrackData();
    } catch (err) {
      notify('error', 'Evaluation Error', err.message || 'Submission error');
    }
  };

  const handleVpApproveSubmit = async () => {
    if (!vpApprovingEvaluation) return;
    try {
      await api.vpApproveGroupD(vpApprovingEvaluation.id, {
        decision: 'APPROVE',
        remarks: vpRemarks,
        approvedBy: `${currentPersona.name} (${currentPersona.role})`
      });
      notify('success', 'VP-Admin Approval Granted', `Monthly evaluation for ${vpApprovingEvaluation.employeeName} approved and archived into Digital Dossier.`);
      setVpApprovingEvaluation(null);
      loadTrackData();
    } catch (err) {
      console.error(err);
      notify('error', 'Approval Error', err.message);
    }
  };

  const handleGroupDCompensationSubmit = async () => {
    if (!reviewingGroupDCompensation) return;
    try {
      const res = await api.groupDCompensationReview({
        annualReportId: reviewingGroupDCompensation.id,
        decision: 'APPROVE',
        percentageIncrease: groupDCompIncrease,
        remarks: groupDCompRemarks,
        approvedBy: `${currentPersona.name} (${currentPersona.role})`
      });
      if (res.error) {
        notify('error', 'Probation Restriction', res.error);
      } else {
        notify('success', 'Compensation Increment Sanctioned', `Annual increment of ${groupDCompIncrease}% approved for ${reviewingGroupDCompensation.employeeName}. Updated in payroll records!`);
        setReviewingGroupDCompensation(null);
        loadTrackData();
      }
    } catch (err) {
      notify('error', 'Compensation Error', err.message);
    }
  };

  // Track B Handlers
  const handleVerifyGoal = async (goalId, verifierType) => {
    try {
      await api.verifyGeneralGoals(goalId, {
        verifierType,
        verifierName: `${currentPersona.name} (${currentPersona.role})`
      });
      notify('success', `${verifierType} Verification Saved`, `30-day KRA goals verified and committed to ERP.`);
      loadTrackData();
    } catch (err) {
      console.error(err);
      notify('error', 'Verification Error', err.message);
    }
  };

  const handleSyncToModule1 = async () => {
    if (!syncingGoalEmp) return;
    try {
      const res = await api.syncGeneralAppraisalToModule1({
        employeeId: syncingGoalEmp.employeeId,
        changeType: syncType,
        proposedValue: syncVal,
        justification: 'System-driven integration from successful completion of 4-Quarter Annual Appraisal Cycle.',
        effectiveDate: '2026-11-01'
      });
      if (res.success) {
        notify('success', 'Auto-Synced to Module I', `Change Request ${res.changeRequest.reqNumber} initialized directly into Module I Central Database without re-entry!`);
        setSyncingGoalEmp(null);
        loadTrackData();
      }
    } catch (err) {
      console.error(err);
      notify('error', 'Sync Failed', err.message);
    }
  };

  // Track C Handlers
  const handleVerifyFacultyAppraisal = async () => {
    if (!verifyingAppraisal) return;
    try {
      await api.verifyFacultyAppraisal(verifyingAppraisal.id, {
        stakeholder: stakeholderType,
        status: stakeholderStatus,
        remarks: stakeholderRemarks,
        verifierName: `${currentPersona.name} (${currentPersona.role})`
      });
      notify(stakeholderStatus === 'VERIFIED' ? 'success' : 'warning', 'Verification Updated', `Stakeholder verification (${stakeholderType.replace('_', ' ')}) recorded as ${stakeholderStatus}.`);
      setVerifyingAppraisal(null);
      loadTrackData();
    } catch (err) {
      console.error(err);
      notify('error', 'Verification Failed', err.message);
    }
  };

  const handleFacultyEcmScoring = async () => {
    if (!scoringAppraisal) return;
    try {
      const totalScore = (parseFloat(teachingScore) || 0) + (parseFloat(researchScore) || 0) + (parseFloat(consultancyScore) || 0) + (parseFloat(institutionalScore) || 0);
      const pct = Math.round((totalScore / 300) * 100);
      await api.submitFacultyEcmScore({
        appraisalId: scoringAppraisal.id,
        teachingScore,
        researchScore,
        consultancyScore,
        institutionalScore,
        remarks: 'Scores verified and compiled as per TNU Protocol parameters.'
      });
      notify('success', 'TNU Protocol Score Compiled', `Score: ${totalScore}/300 (${pct}%) recorded for ${scoringAppraisal.employeeName}. Ready for Management Order.`);
      setScoringAppraisal(null);
      loadTrackData();
    } catch (err) {
      console.error(err);
      notify('error', 'Scoring Failed', err.message);
    }
  };

  const handleFacultyMgmtDecisionSubmit = async () => {
    if (!mgmtDecisionAppraisal) return;
    try {
      const res = await api.submitFacultyMgmtDecision({
        appraisalId: mgmtDecisionAppraisal.id,
        decisionType: ecmDecisionType,
        newDesignation: ecmNewDesig,
        newSalary: ecmNewSalary,
        salaryIncrease: '17000',
        remarks: 'Approved as recommended. Outstanding contributor to university research profile.',
        decidedBy: `${currentPersona.name} (${currentPersona.role})`
      });
      if (res.success) {
        notify('success', 'Official Order Issued', `Decision Letter generated: Ref ${res.letterReference} and routed to Payroll for automatic salary disbursement!`);
        setMgmtDecisionAppraisal(null);
        loadTrackData();
      }
    } catch (err) {
      console.error(err);
      notify('error', 'Decision Letter Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Overview Header */}
      <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-amber-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Module III — Performance Management SOP Automation</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-mono border border-amber-500/30">
                SOP Compliant
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Centralized Performance Appraisal System
            </h1>
            <p className="mt-1 text-xs md:text-sm text-amber-200/90 max-w-3xl leading-relaxed">
              Automated institutional performance lifecycle across 3 distinct statutory tracks: Track A (Group-D monthly HOD reviews with 7th due date, 10th grace auto-lock & VP-Admin sanction), Track B (General Employee 30-day KRA setup & 4-Quarter Module I integration), and Track C (Faculty ECM-based annual appraisal with TNU 300-point protocol and payroll decision letters).
            </p>
          </div>
        </div>

        {/* Track Switcher */}
        <div className="mt-6 pt-5 border-t border-amber-800/60 flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTrack('trackA')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 cursor-pointer ${
              activeTrack === 'trackA'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/40 ring-2 ring-amber-300/40'
                : 'bg-amber-950/40 text-amber-200 hover:bg-amber-900/60 hover:text-white border border-amber-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Track A: Group-D / Band I Employees (Monthly SOP)</span>
          </button>

          <button
            onClick={() => setActiveTrack('trackB')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 cursor-pointer ${
              activeTrack === 'trackB'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/40 ring-2 ring-amber-300/40'
                : 'bg-amber-950/40 text-amber-200 hover:bg-amber-900/60 hover:text-white border border-amber-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Track B: General Employees (KRA/KPI & 4 Quarters)</span>
          </button>

          <button
            onClick={() => setActiveTrack('trackC')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 cursor-pointer ${
              activeTrack === 'trackC'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-950/40 ring-2 ring-amber-300/40'
                : 'bg-amber-950/40 text-amber-200 hover:bg-amber-900/60 hover:text-white border border-amber-800/50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Track C: Faculty Members (ECM Protocol & 300 pts)</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TRACK A: GROUP-D / BAND I EMPLOYEES                      */}
      {/* ========================================================= */}
      {activeTrack === 'trackA' && (
        <div className="space-y-6">
          {/* SOP Rules Ribbon & Interactive Stepper */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <span className="font-bold text-amber-950 text-sm block">SOP Timeline Enforced Rules:</span>
                  <span className="text-amber-800 text-xs">
                    Due Date: <strong>7th of every month</strong> • Grace Window: <strong>3 days (up to 10th)</strong> • Auto-Lock after 10th if unsubmitted • Final Approval: <strong>Vice President – Administration</strong>
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-200/80 text-amber-900 font-bold rounded-lg font-mono text-xs border border-amber-300">
                SOP Rule 5.1 Enforced
              </span>
            </div>

            {/* 6-Stage Timeline Stepper Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-amber-200/60 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <div className="text-[10px] font-bold text-amber-700 uppercase">1st of Month</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Cycle Opens</div>
                <div className="text-[10px] text-slate-400">System generated</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <div className="text-[10px] font-bold text-amber-700 uppercase">7th of Month</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">HOD Due Date</div>
                <div className="text-[10px] text-slate-400">KPI & Comp entry</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <div className="text-[10px] font-bold text-red-700 uppercase">10th (Grace End)</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Auto-Lock System</div>
                <div className="text-[10px] text-red-500 font-semibold">Strict cut-off</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <div className="text-[10px] font-bold text-indigo-700 uppercase">15th of Month</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">VP-Admin Approval</div>
                <div className="text-[10px] text-slate-400">Digital Dossier</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Annual Mark</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Probation Validation</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Mandatory check</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <div className="text-[10px] font-bold text-purple-700 uppercase">Slab Matrix</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Increment Applied</div>
                <div className="text-[10px] text-slate-400">+5% / +10% / +15%</div>
              </div>
            </div>
          </div>

          {/* Interactive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs card-hover-effect">
              <div className="text-xs font-bold text-slate-500 uppercase">Total Active Reviews</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{groupDEvaluations.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Monthly Band I staff cycle</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs card-hover-effect bg-amber-50/20">
              <div className="text-xs font-bold text-amber-800 uppercase">Pending HOD Submission</div>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {groupDEvaluations.filter(e => e.status === 'PENDING_HOD').length}
              </div>
              <div className="text-[11px] text-amber-700 mt-0.5">Due before 7th/10th</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-xs card-hover-effect bg-indigo-50/20">
              <div className="text-xs font-bold text-indigo-800 uppercase">VP-Admin Sanctioned</div>
              <div className="text-2xl font-black text-indigo-700 mt-1">
                {groupDEvaluations.filter(e => e.status === 'APPROVED_VP_ADMIN').length}
              </div>
              <div className="text-[11px] text-indigo-700 mt-0.5">Collated to digital dossier</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs card-hover-effect bg-emerald-50/20">
              <div className="text-xs font-bold text-emerald-800 uppercase">Annual Reports Ready</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {groupDAnnualReports.length}
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">12-month weighted avg</div>
            </div>
          </div>

          {/* Monthly Evaluations Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
              <span>Group-D Monthly Evaluations Routed to Department HODs</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Monthly Performance Report generated automatically upon VP-Admin approval
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {groupDEvaluations.map((ev) => (
                <div key={ev.id} className="p-4 hover:bg-slate-50/70 transition card-hover-effect">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {ev.id}
                        </span>
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                          Cycle: {ev.cycleMonth}
                        </span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          ev.status === 'APPROVED_VP_ADMIN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          ev.status === 'SUBMITTED_HOD' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                          ev.status === 'AUTO_LOCKED_OVERDUE' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {ev.status.replace(/_/g, ' ')}
                        </span>
                        {ev.isAutoLocked && (
                          <span className="px-2.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>System Locked</span>
                          </span>
                        )}
                      </div>

                      <div className="text-base font-bold text-slate-900">
                        {ev.employeeName} — <span className="text-slate-500 font-normal">{ev.roleTitle} ({ev.department})</span>
                      </div>

                      <div className="text-xs text-slate-600 flex items-center space-x-3 flex-wrap gap-y-1">
                        <span>Assigned HOD: <strong className="text-slate-800">{ev.hodName}</strong></span>
                        <span>•</span>
                        <span>Due Date: <strong className="text-amber-700">{ev.dueDate}</strong></span>
                        <span>•</span>
                        <span>Grace Due: <strong className="text-red-700">{ev.graceDueDate}</strong></span>
                      </div>

                      {/* Display Score if submitted */}
                      {ev.overallCompositeScore > 0 && (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex items-center space-x-4 flex-wrap gap-y-2">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">KPI Score (70%):</span>
                            <span className="font-bold text-slate-800">{ev.totalKpiScore}/100</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Competency (30%):</span>
                            <span className="font-bold text-slate-800">{ev.totalCompetencyScore}/100</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Composite:</span>
                            <span className="font-bold text-emerald-700 text-sm">{ev.overallCompositeScore}%</span>
                          </div>
                          {ev.vpAdminApproval && (
                            <div className="border-l border-slate-200 pl-4">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">VP Approval:</span>
                              <span className="font-bold text-indigo-700">{ev.vpAdminApproval.approvedBy}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {ev.lockReason && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-800 font-medium">
                          {ev.lockReason}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {ev.status === 'PENDING_HOD' && (
                        <button
                          onClick={() => handleOpenGroupDForm(ev)}
                          className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>HOD Complete Form Online</span>
                        </button>
                      )}

                      {ev.status === 'SUBMITTED_HOD' && (
                        <button
                          onClick={() => {
                            setVpApprovingEvaluation(ev);
                            setVpRemarks('');
                          }}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>VP Admin Sign-off / Approval</span>
                        </button>
                      )}

                      {ev.status === 'APPROVED_VP_ADMIN' && (
                        <span className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Stored in Digital Dossier
                        </span>
                      )}

                      {ev.status === 'AUTO_LOCKED_OVERDUE' && (
                        <span className="px-3.5 py-1.5 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          Flagged Overdue to HR
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Annual Reports & Compensation Review Workflow */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Group-D Annual Performance Reports & Compensation Review</h2>
                <p className="text-xs text-slate-500">
                  Triggered on completion of 1 year • Collates 12 monthly reports into weighted score • Enforces mandatory probation check
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {groupDAnnualReports.map((ann) => (
                <div key={ann.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 card-hover-effect p-3 rounded-xl">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {ann.id}
                      </span>
                      <span className="font-bold text-base text-slate-900">{ann.employeeName}</span>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                        Probation: {ann.probationStatus}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Collated 12 Monthly Reports • Annual Weighted Average Score: <strong className="text-emerald-700 text-sm">{ann.annualWeightedAverageScore}%</strong>
                    </div>

                    <div className="text-xs text-slate-500">
                      Recommendation: <strong>{ann.recommendedCompensationSlab?.slabName}</strong> (+{ann.recommendedCompensationSlab?.percentageIncrease}%)
                      • Proposed Salary: <strong className="text-slate-800">₹{ann.recommendedCompensationSlab?.proposedNewSalary?.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div>
                    {ann.managementReviewStatus === 'APPROVED' ? (
                      <span className="px-3.5 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Increment Approved & Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setReviewingGroupDCompensation(ann);
                          setGroupDCompIncrease(String(ann.recommendedCompensationSlab?.percentageIncrease || 10));
                          setGroupDCompRemarks('');
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                      >
                        Management Review & Apply Compensation
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TRACK B: GENERAL EMPLOYEES (NON-FACULTY)                 */}
      {/* ========================================================= */}
      {activeTrack === 'trackB' && (
        <div className="space-y-6">
          {/* SOP Rules Ribbon & Interactive Stepper */}
          <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-teal-700 shrink-0" />
                <div>
                  <span className="font-bold text-teal-950 text-sm block">General Employees KRA/KPI & Appraisal Rules:</span>
                  <span className="text-teal-800 text-xs">
                    Goal Setting within <strong>30 days of joining</strong> • Locked after HR & Management verification • 4 Quarterly Reviews (90d, 180d, 270d, 360d) • Annual appraisal directly feeds Module I without re-entry!
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 bg-teal-200/80 text-teal-900 font-bold rounded-lg font-mono text-xs border border-teal-300">
                Close-the-Loop Integration
              </span>
            </div>

            {/* 5-Stage Stepper Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-teal-200/60 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-teal-200 shadow-2xs">
                <div className="text-[10px] font-bold text-teal-700 uppercase">Within 30 Days</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">KRA Goal Setting</div>
                <div className="text-[10px] text-slate-400">HR & Mgmt locked</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-teal-200 shadow-2xs">
                <div className="text-[10px] font-bold text-teal-700 uppercase">Day 90 Mark</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Q1 Review</div>
                <div className="text-[10px] text-slate-400">Probation progress</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-teal-200 shadow-2xs">
                <div className="text-[10px] font-bold text-teal-700 uppercase">Day 180 Mark</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Q2 Mid-Year Review</div>
                <div className="text-[10px] text-slate-400">Milestone check</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-teal-200 shadow-2xs">
                <div className="text-[10px] font-bold text-teal-700 uppercase">Day 360 Mark</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Q4 Annual Out of 100</div>
                <div className="text-[10px] text-slate-400">Self + Reporting Auth</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-teal-200 shadow-2xs">
                <div className="text-[10px] font-bold text-indigo-700 uppercase">Statutory Loop</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Feed to Module I</div>
                <div className="text-[10px] text-indigo-600 font-semibold">Zero manual re-entry</div>
              </div>
            </div>
          </div>

          {/* Goal Setting Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
              <span>Stage 1: Onboarding KRA / KPI Goal Setting (30-Day SLA)</span>
            </div>

            <div className="divide-y divide-slate-100">
              {generalGoals.map((g) => (
                <div key={g.id} className="p-4 hover:bg-slate-50/70 transition card-hover-effect">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {g.id}
                        </span>
                        <span className="text-base font-bold text-slate-900">{g.employeeName}</span>
                        <span className="text-xs text-slate-500 font-medium">{g.designation} • {g.department}</span>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          {g.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        Date of Joining: {g.doj} • 30-Day Goal Setting Deadline: <strong className="text-amber-800">{g.goalSettingDeadline}</strong>
                      </div>

                      {/* Display KPIs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                        {g.kpiItems.map((k) => (
                          <div key={k.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-800">{k.kra}</span> ({k.weight}%)
                            <p className="text-slate-500 text-[11px] mt-0.5">{k.metric}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      {!g.hrVerified && (
                        <button
                          onClick={() => handleVerifyGoal(g.id, 'HR')}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                        >
                          HR Verify Goals
                        </button>
                      )}
                      {g.hrVerified && !g.mgmtVerified && (
                        <button
                          onClick={() => handleVerifyGoal(g.id, 'MANAGEMENT')}
                          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                        >
                          Management Verify & Lock
                        </button>
                      )}
                      {g.mgmtVerified && (
                        <span className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Goals Locked in ERP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quarterly Reviews Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
              <span>Stage 2 & 3: Quarterly Review Cycle (Q1, Q2, Q3, Q4) & Feed into Module I</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Cycle: Submit → Verify (7d) → HR Review → Mgmt Review → Feed to Module I
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {quarterlyReviews.map((qr) => (
                <div key={qr.id} className="p-4 hover:bg-slate-50/70 transition card-hover-effect">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {qr.quarter} Review
                        </span>
                        <span className="font-bold text-base text-slate-900">{qr.employeeName}</span>
                        <span className="text-xs text-slate-500">Day {qr.targetDaysMark} Mark</span>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          {qr.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 italic">
                        "{qr.employeeAchievements}"
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                        <span>Self Score: <strong className="text-slate-700">{qr.selfScore}/100</strong></span>
                        <span>•</span>
                        <span>Reporting Auth Score: <strong className="text-blue-700">{qr.reportingAuthorityReview?.score}/100</strong></span>
                        <span>•</span>
                        <span>Verified by: <strong>{qr.reportingAuthorityReview?.verifiedBy}</strong></span>
                      </div>
                    </div>

                    <div>
                      {qr.quarter === 'Q4' && qr.status === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            setSyncingGoalEmp(qr);
                            setSyncVal('78000');
                          }}
                          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer border border-blue-400/40"
                          title="Initialize Module I change request directly from appraisal outcome"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Feed Outcome to Module I (No Re-entry)</span>
                        </button>
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
      {/* TRACK C: FACULTY MEMBERS (ECM ROUTE)                      */}
      {/* ========================================================= */}
      {activeTrack === 'trackC' && (
        <div className="space-y-6">
          {/* SOP Rules Ribbon & Interactive Stepper */}
          <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-5 h-5 text-purple-700 shrink-0" />
                <div>
                  <span className="font-bold text-purple-950 text-sm block">Faculty Annual ECM Appraisal SOP Rules:</span>
                  <span className="text-purple-800 text-xs">
                    Completed probation & ≥ 12 months • List auto-routed to Registrar by <strong>10th of every month</strong> • Self-Appraisal in <strong>7 working days</strong> • Multi-stakeholder verification (Dean, R&D, Placement, HR) • Monthly ECM & TNU Protocol Matrix (300 Max) • Management Decision letter to Payroll
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 bg-purple-200/80 text-purple-900 font-bold rounded-lg font-mono text-xs border border-purple-300">
                ECM Statutory Flow
              </span>
            </div>

            {/* 6-Stage Timeline Stepper Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-purple-200/60 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-purple-200 shadow-2xs">
                <div className="text-[10px] font-bold text-purple-700 uppercase">10th of Month</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Registrar Routing</div>
                <div className="text-[10px] text-slate-400">Auto-filtered list</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-purple-200 shadow-2xs">
                <div className="text-[10px] font-bold text-purple-700 uppercase">7 Working Days</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Self-Appraisal Form 1</div>
                <div className="text-[10px] text-slate-400">Faculty submission</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-purple-200 shadow-2xs">
                <div className="text-[10px] font-bold text-purple-700 uppercase">4 Cells Check</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Stakeholder Vetting</div>
                <div className="text-[10px] text-slate-400">Dean, R&D, Place, HR</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-purple-200 shadow-2xs">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Discrepancy Loop</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">UGC Norms Audit</div>
                <div className="text-[10px] text-slate-400">Scopus/SCI check</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-purple-200 shadow-2xs">
                <div className="text-[10px] font-bold text-purple-700 uppercase">TNU Protocol</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Digital Score Sheet</div>
                <div className="text-[10px] text-purple-600 font-semibold">300 Points Scale</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-purple-200 shadow-2xs">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Official Order</div>
                <div className="font-bold text-slate-800 text-[11px] mt-0.5">Decision to Payroll</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Promotion/Increment</div>
              </div>
            </div>
          </div>

          {/* Eligible Faculty List */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
              <span>Auto-Identified Eligible Faculty Members (10th of Month Routing)</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Filter: Probation = COMPLETED & Service ≥ 12 Months
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Faculty Name</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4">DOJ</th>
                    <th className="py-2.5 px-4">Months of Service</th>
                    <th className="py-2.5 px-4">Probation Status</th>
                    <th className="py-2.5 px-4">Eligibility Determination</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {facultyEligibility.map((f) => (
                    <tr key={f.employeeId} className="hover:bg-purple-50/30 transition">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-900">{f.name}</div>
                        <div className="text-[11px] text-slate-500">{f.empCode} • {f.designation}</div>
                      </td>
                      <td className="py-2.5 px-4">{f.department}</td>
                      <td className="py-2.5 px-4">{f.doj}</td>
                      <td className="py-2.5 px-4 font-bold">{f.monthsSinceDoj} Months</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          f.probationStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {f.probationStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {f.isEligible ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            <Check className="w-3 h-3 mr-1" /> Eligible for ECM
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Ineligible (&lt; 12 mo or in probation)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Faculty Appraisals */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
              <span>ECM Appraisal Pipeline & Multi-Stakeholder Verification</span>
              <span className="text-[11px] text-slate-500 font-normal">
                School Dean → R&D Cell → Placement Cell → HR Dept → ECM Scoring → Management Decision
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {facultyAppraisals.map((app) => (
                <div key={app.id} className="p-5 hover:bg-slate-50/70 transition space-y-3 card-hover-effect">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {app.id}
                        </span>
                        <span className="font-bold text-base text-slate-900">{app.employeeName}</span>
                        <span className="text-xs text-slate-500">{app.designation} • {app.department}</span>
                        <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-full border border-purple-200">
                          {app.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mt-1">
                        Self-Appraisal Submitted: {app.selfAppraisalSubmittedDate} • Research Papers: <strong>{app.selfAppraisalData?.researchAndPublications?.scopusIeeePapers} SCI/Scopus</strong> • Grant: <strong>₹{app.selfAppraisalData?.sponsoredResearchAndGrants?.grantAmountLakhs} Lakhs</strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setVerifyingAppraisal(app);
                          setStakeholderType('SCHOOL_DEAN');
                          setStakeholderStatus('VERIFIED');
                          setStakeholderRemarks('');
                        }}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                      >
                        Stakeholder Verification
                      </button>

                      <button
                        onClick={() => setScoringAppraisal(app)}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                      >
                        Digital ECM Score Sheet (TNU Protocol)
                      </button>

                      <button
                        onClick={() => {
                          setMgmtDecisionAppraisal(app);
                          setEcmDecisionType('PROMOTION_AND_COMPENSATION_REVISION');
                          setEcmNewSalary('115000');
                          setEcmNewDesig('Associate Professor');
                        }}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                      >
                        Management Decision & Letter
                      </button>
                    </div>
                  </div>

                  {/* Multi-Stakeholder Verification Status Badges */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                      Statutory Verification Routing (SOP Step 4):
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {app.stakeholderVerifications?.map((s) => (
                        <div key={s.stakeholder} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-800">{s.stakeholder.replace(/_/g, ' ')}</div>
                            <div className="text-[10px] text-slate-400">{s.name}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            s.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TNU Protocol Score Sheet Display */}
                  {app.digitalEcmScoreSheet && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3.5 rounded-xl border border-purple-200 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-purple-900">Compiled TNU Protocol Score Sheet:</span>
                        <span className="font-black text-purple-700 text-sm">
                          {app.digitalEcmScoreSheet.totalTnuProtocolScore} / 300 ({app.digitalEcmScoreSheet.tnuPercentage}%)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div>Teaching & Pedagogy: <strong>{app.digitalEcmScoreSheet.teachingScore100} / 100</strong></div>
                        <div>Research & Pubs: <strong>{app.digitalEcmScoreSheet.researchScore100} / 100</strong></div>
                        <div>Consultancy & Grants: <strong>{app.digitalEcmScoreSheet.consultancyGrantScore50} / 50</strong></div>
                        <div>Institutional Dev: <strong>{app.digitalEcmScoreSheet.institutionalDevScore50} / 50</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Management Decision and Official Letter Ref */}
                  {app.managementDecision && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-emerald-900 block">
                          Official Decision: {app.managementDecision.decisionType}
                        </span>
                        <span className="text-emerald-700">
                          Letter Reference: <strong>{app.managementDecision.letterReferenceNumber}</strong> • Routed to Payroll: <strong>Yes</strong>
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs">
                        Order Issued
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: HOD SUBMITS GROUP-D EVALUATION ONLINE              */}
      {/* ========================================================= */}
      {submittingGroupDForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Group-D Monthly Evaluation Form
                </h2>
                <p className="text-xs text-white/80">Employee: {submittingGroupDForm.employeeName} ({submittingGroupDForm.cycleMonth})</p>
              </div>
              <button onClick={() => setSubmittingGroupDForm(null)} className="p-1 rounded-md text-white/80 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGroupDSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900 flex justify-between items-center">
                <span><strong>Timeline Reminder:</strong> Due by 7th. Grace period ends 10th (auto-lock).</span>
                <span className="font-black text-amber-800 text-sm bg-amber-100 px-2.5 py-0.5 rounded-md">
                  Calculated: {calculateGroupDTotal()}%
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2">Role-Specific KPIs (Max Scores)</h3>
                <div className="space-y-2">
                  {groupDKpiScores.map((kpi, idx) => (
                    <div key={kpi.kpiId} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-medium text-slate-700 flex-1">{kpi.name}</span>
                      <div className="flex items-center space-x-2 ml-4">
                        <input
                          type="range"
                          min="0"
                          max={kpi.max}
                          value={kpi.score}
                          onChange={(e) => {
                            const newScores = [...groupDKpiScores];
                            newScores[idx].score = parseFloat(e.target.value) || 0;
                            setGroupDKpiScores(newScores);
                          }}
                          className="w-24 accent-amber-600 cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max={kpi.max}
                          required
                          value={kpi.score}
                          onChange={(e) => {
                            const newScores = [...groupDKpiScores];
                            newScores[idx].score = parseFloat(e.target.value) || 0;
                            setGroupDKpiScores(newScores);
                          }}
                          className="w-14 px-2 py-1 border border-slate-300 rounded font-bold text-center text-slate-900"
                        />
                        <span className="text-slate-400 font-semibold">/ {kpi.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">HOD Comments & Observations</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record positive diligence, apparatus upkeep, attendance, punctuality..."
                  value={groupDHodComments}
                  onChange={(e) => setGroupDHodComments(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSubmittingGroupDForm(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  Submit for VP-Admin Sign-off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VP-ADMIN APPROVAL GROUP-D                          */}
      {/* ========================================================= */}
      {vpApprovingEvaluation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-indigo-950 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-300" />
                  VP - Administration Review & Sign-off
                </h2>
                <p className="text-xs text-indigo-200">Ref: {vpApprovingEvaluation.id} • {vpApprovingEvaluation.employeeName}</p>
              </div>
              <button onClick={() => setVpApprovingEvaluation(null)} className="p-1 rounded-md text-indigo-200 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>Composite Score: <strong className="text-emerald-700 text-sm">{vpApprovingEvaluation.overallCompositeScore}%</strong></div>
                <div>HOD Comments: <em>"{vpApprovingEvaluation.hodComments}"</em></div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">VP - Administration Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Record formal administrative sign-off remarks..."
                  value={vpRemarks}
                  onChange={(e) => setVpRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setVpApprovingEvaluation(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVpApproveSubmit}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  Formally Approve & Collate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: GROUP-D COMPENSATION REVIEW (PROBATION CHECK)      */}
      {/* ========================================================= */}
      {reviewingGroupDCompensation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Group-D Compensation Review Workflow
                </h2>
                <p className="text-xs text-emerald-200">Mandatory Probation Validation & Slab Calculation</p>
              </div>
              <button onClick={() => setReviewingGroupDCompensation(null)} className="p-1 rounded-md text-emerald-200 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div>Employee: <strong>{reviewingGroupDCompensation.employeeName}</strong></div>
                <div>Annual Weighted Score: <strong className="text-emerald-700">{reviewingGroupDCompensation.annualWeightedAverageScore}%</strong></div>
                <div>Probation Status: <strong className="text-emerald-700">{reviewingGroupDCompensation.probationStatus}</strong></div>
                <div className="text-slate-500 text-[11px] pt-1">
                  * SOP Enforced Rule: Compensation workflow strictly blocked if probation is incomplete.
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Percentage Increment (%)</label>
                <input
                  type="number"
                  value={groupDCompIncrease}
                  onChange={(e) => setGroupDCompIncrease(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Management Decision Notes</label>
                <textarea
                  rows={3}
                  value={groupDCompRemarks}
                  onChange={(e) => setGroupDCompRemarks(e.target.value)}
                  placeholder="Record formal approval rationale..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReviewingGroupDCompensation(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGroupDCompensationSubmit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  Approve Increment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TRACK B DIRECT FEED TO MODULE I                   */}
      {/* ========================================================= */}
      {syncingGoalEmp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-blue-950 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Feed Appraisal Outcome Directly to Module I
                </h2>
                <p className="text-xs text-blue-200">Zero re-entry statutory service condition change</p>
              </div>
              <button onClick={() => setSyncingGoalEmp(null)} className="p-1 rounded-md text-blue-200 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                Employee: <strong>{syncingGoalEmp.employeeName}</strong>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Resulting Service Change Type</label>
                <select
                  value={syncType}
                  onChange={(e) => setSyncType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800"
                >
                  <option value="SALARY_REVISION">Salary Merit Increment</option>
                  <option value="DESIGNATION_CHANGE">Promotion to Higher Designation</option>
                  <option value="LEVEL_CHANGE">Pay Level Band Upgrade</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Proposed Value</label>
                <input
                  type="text"
                  value={syncVal}
                  onChange={(e) => setSyncVal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSyncingGoalEmp(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSyncToModule1}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  Initialize in Module I
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TRACK C STAKEHOLDER VERIFICATION                   */}
      {/* ========================================================= */}
      {verifyingAppraisal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-blue-950 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-300" />
                  Faculty Self-Appraisal Verification
                </h2>
                <p className="text-xs text-blue-200">Discrepancy loop supported (return to faculty for correction)</p>
              </div>
              <button onClick={() => setVerifyingAppraisal(null)} className="p-1 rounded-md text-blue-200 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Verifying Stakeholder Department</label>
                <select
                  value={stakeholderType}
                  onChange={(e) => setStakeholderType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800"
                >
                  <option value="SCHOOL_DEAN">School Dean (Curriculum & Pedagogy)</option>
                  <option value="RD_CELL">R&D Cell (Publications & Grants)</option>
                  <option value="PLACEMENT_CELL">Placement Cell (Student Mentorship)</option>
                  <option value="HR_DEPARTMENT">HR Department (Service & Attendance)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Verification Status</label>
                <select
                  value={stakeholderStatus}
                  onChange={(e) => setStakeholderStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800"
                >
                  <option value="VERIFIED">Verified & Cleared</option>
                  <option value="DISCREPANCY_FOUND">Discrepancy Found (Return to Faculty for Correction)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Remarks / Discrepancy Note</label>
                <textarea
                  rows={3}
                  value={stakeholderRemarks}
                  onChange={(e) => setStakeholderRemarks(e.target.value)}
                  placeholder="Record verification notes or citation discrepancies..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setVerifyingAppraisal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyFacultyAppraisal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  Save Verification Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TRACK C DIGITAL ECM SCORE SHEET                    */}
      {/* ========================================================= */}
      {scoringAppraisal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Digital ECM Score Sheet (TNU Protocol)
                </h2>
                <p className="text-xs text-white/80">Evaluation Committee Scoring: {scoringAppraisal.employeeName}</p>
              </div>
              <button onClick={() => setScoringAppraisal(null)} className="p-1 rounded-md text-white/80 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Teaching & Pedagogy (Max 100)</label>
                  <input
                    type="number"
                    max="100"
                    value={teachingScore}
                    onChange={(e) => setTeachingScore(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Research & Publications (Max 100)</label>
                  <input
                    type="number"
                    max="100"
                    value={researchScore}
                    onChange={(e) => setResearchScore(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Consultancy & Grants (Max 50)</label>
                  <input
                    type="number"
                    max="50"
                    value={consultancyScore}
                    onChange={(e) => setConsultancyScore(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Institutional Development (Max 50)</label>
                  <input
                    type="number"
                    max="50"
                    value={institutionalScore}
                    onChange={(e) => setInstitutionalScore(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Real-time score calculator preview */}
              {(() => {
                const total = (parseFloat(teachingScore) || 0) + (parseFloat(researchScore) || 0) + (parseFloat(consultancyScore) || 0) + (parseFloat(institutionalScore) || 0);
                const pct = Math.round((total / 300) * 100);
                let grade = 'Needs Improvement';
                let gradeColor = 'text-red-700 bg-red-100';
                if (pct >= 90) { grade = 'Outstanding'; gradeColor = 'text-emerald-800 bg-emerald-100'; }
                else if (pct >= 75) { grade = 'Very Good'; gradeColor = 'text-blue-800 bg-blue-100'; }
                else if (pct >= 60) { grade = 'Good'; gradeColor = 'text-amber-800 bg-amber-100'; }

                return (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex justify-between items-center font-bold text-amber-950">
                    <div>
                      <span>Total Protocol Score: </span>
                      <span className="text-base text-amber-900 font-black">{total} / 300</span>
                      <span className="text-slate-500 font-normal ml-2">({pct}%)</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${gradeColor}`}>
                      Grade: {grade}
                    </span>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setScoringAppraisal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFacultyEcmScoring}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  Compile Evaluation Matrix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TRACK C MANAGEMENT DECISION & LETTER               */}
      {/* ========================================================= */}
      {mgmtDecisionAppraisal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-purple-950 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-purple-300" />
                  Management Decision & Official Order Generation
                </h2>
                <p className="text-xs text-purple-200">Routes letter to HR / Payroll for implementation</p>
              </div>
              <button onClick={() => setMgmtDecisionAppraisal(null)} className="p-1 rounded-md text-purple-200 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Decision Outcome</label>
                <select
                  value={ecmDecisionType}
                  onChange={(e) => setEcmDecisionType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800"
                >
                  <option value="PROMOTION_AND_COMPENSATION_REVISION">Promotion & Compensation Revision</option>
                  <option value="CONFIRMATION">Confirmation of Employment</option>
                  <option value="EXTENSION_OF_PROBATION">Extension of Probation (Below Min Score)</option>
                  <option value="REWARDS_AND_RECOGNITION">Rewards & Recognition</option>
                  <option value="PERFORMANCE_IMPROVEMENT_PLAN">Performance Improvement Plan (PIP)</option>
                  <option value="REPRIMAND">Official Reprimand</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">New Designation</label>
                  <input
                    type="text"
                    value={ecmNewDesig}
                    onChange={(e) => setEcmNewDesig(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">New Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={ecmNewSalary}
                    onChange={(e) => setEcmNewSalary(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setMgmtDecisionAppraisal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFacultyMgmtDecisionSubmit}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  Generate Official Letter & Route to Payroll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
