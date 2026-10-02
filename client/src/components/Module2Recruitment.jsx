import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  FileText, 
  Search, 
  Filter, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  ShieldCheck, 
  Award, 
  UserCheck, 
  ChevronRight, 
  Calendar, 
  ArrowRight,
  Send,
  AlertTriangle,
  Building,
  Check,
  X,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function Module2Recruitment({ currentPersona }) {
  const [subTab, setSubTab] = useState('openPositions'); // mrf, openPositions, cvDatabase, selection, yetToJoin
  const [mrfs, setMrfs] = useState([]);
  const [openPositions, setOpenPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pathwayFilter, setPathwayFilter] = useState('');

  // Modals
  const [showNewMrfModal, setShowNewMrfModal] = useState(false);
  const [newMrfData, setNewMrfData] = useState({
    requisitionType: 'ANNUAL_ACADEMIC',
    positionTitle: '',
    positionType: 'ACADEMIC',
    department: 'Computer Science & Engineering',
    school: 'School of Engineering & Technology',
    vacanciesCount: 1,
    teachingLoadHoursPerWeek: 16,
    proposedCtcRange: '',
    minQualification: '',
    minExperienceYears: 3,
    justification: '',
    replacementForEmployeeName: ''
  });

  const [vettingMrf, setVettingMrf] = useState(null);
  const [vettingDecision, setVettingDecision] = useState('RECOMMEND');
  const [vettingRemarks, setVettingRemarks] = useState('');

  const [approvingMrf, setApprovingMrf] = useState(null);
  const [approvalDecision, setApprovalDecision] = useState('APPROVE');
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const [rcsCandidate, setRcsCandidate] = useState(null);
  const [rcsNotes, setRcsNotes] = useState('');
  const [rcsStatus, setRcsStatus] = useState('COMPLETED');

  const [evaluatingCandidate, setEvaluatingCandidate] = useState(null);
  const [academicEvaluation, setAcademicEvaluation] = useState({
    scheduledDate: '2026-10-15',
    interviewMode: 'HYBRID_ONLINE',
    externalSubjectExpert: 'Prof. K. K. Biswas (IIT Delhi)',
    teachingPedagogyScore: 90,
    researchPublicationsScore: 92,
    domainDepthScore: 90,
    totalScore: 90.6,
    committeeRecommendation: 'RECOMMENDED_STRONGLY',
    committeeRemarks: 'Demonstrated high pedagogical depth.'
  });

  const [nonAcademicEvaluation, setNonAcademicEvaluation] = useState({
    round1Technical: {
      evaluator: 'Department HOD',
      jobKnowledgeScore: 88,
      technicalSkillsScore: 90,
      remarks: 'Strong domain expertise.',
      status: 'RECOMMENDED'
    },
    round2HR: {
      evaluator: 'Head HR',
      communicationScore: 85,
      attitudeCultureFitScore: 87,
      remarks: 'Cultural fit confirmed.',
      status: 'RECOMMENDED'
    },
    round3Management: {
      evaluator: 'Vice President - Administration',
      leadershipIntegrityScore: 88,
      verdict: 'APPROVED',
      remarks: 'Cost sanctioned.'
    }
  });

  const [costApprovalCandidate, setCostApprovalCandidate] = useState(null);
  const [approvedSalary, setApprovedSalary] = useState('');
  const [approvedDesignation, setApprovedDesignation] = useState('');

  useEffect(() => {
    loadData();
  }, [subTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (subTab === 'mrf') {
        const data = await api.getMrfs();
        setMrfs(data);
      } else if (subTab === 'openPositions') {
        const data = await api.getOpenPositions();
        setOpenPositions(data);
      } else if (subTab === 'cvDatabase' || subTab === 'selection' || subTab === 'yetToJoin') {
        const data = await api.getCandidates();
        setCandidates(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMrf = async (e) => {
    e.preventDefault();
    try {
      await api.createMrf({
        ...newMrfData,
        initiatedBy: `${currentPersona.name} (${currentPersona.role})`
      });
      setShowNewMrfModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVettingSubmit = async () => {
    if (!vettingMrf) return;
    try {
      await api.vetMrf(vettingMrf.id, {
        decision: vettingDecision,
        remarks: vettingRemarks,
        vettedBy: `${currentPersona.name} (${currentPersona.role})`
      });
      setVettingMrf(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprovalSubmit = async () => {
    if (!approvingMrf) return;
    try {
      await api.approveMrf(approvingMrf.id, {
        decision: approvalDecision,
        remarks: approvalRemarks,
        approvedBy: `${currentPersona.name} (${currentPersona.role})`
      });
      setApprovingMrf(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRcsSubmit = async () => {
    if (!rcsCandidate) return;
    try {
      await api.updateRcs(rcsCandidate.id, {
        rcsNotes,
        status: rcsStatus,
        recruiterName: `${currentPersona.name} (${currentPersona.role})`
      });
      setRcsCandidate(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMgmtClearance = async (candId, decision) => {
    try {
      await api.mgmtInterviewClearance(candId, {
        decision,
        remarks: 'Cleared by Senior Management for Selection Committee',
        approvedBy: `${currentPersona.name} (${currentPersona.role})`
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEvaluationSubmit = async () => {
    if (!evaluatingCandidate) return;
    try {
      const isAcademic = evaluatingCandidate.positionType === 'ACADEMIC';
      await api.evaluateCandidate(evaluatingCandidate.id, {
        pathway: isAcademic ? 'ACADEMIC' : 'NON_ACADEMIC',
        evaluationData: isAcademic ? academicEvaluation : nonAcademicEvaluation
      });
      setEvaluatingCandidate(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCostApprovalSubmit = async () => {
    if (!costApprovalCandidate) return;
    try {
      await api.mgmtCostApproval(costApprovalCandidate.id, {
        approvedSalary,
        approvedDesignation,
        approvedBy: `${currentPersona.name} (${currentPersona.role})`,
        remarks: 'Cost and Band Sanctioned by Senior Management'
      });
      setCostApprovalCandidate(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCandidateLoiAction = async (candId, acceptanceStatus) => {
    try {
      await api.updateLoiStatus(candId, {
        acceptanceStatus,
        noticePeriodDays: 30,
        expectedDoj: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMilestoneToggle = async (candId, milestoneKey, currentVal) => {
    try {
      await api.updateMilestone(candId, {
        milestoneKey,
        value: !currentVal
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToEmployee = async (candId) => {
    try {
      const res = await api.convertCandidateToEmployee(candId);
      if (res.success) {
        alert(`Candidate successfully joined! Converted to ${res.employee.name} (${res.employee.empCode}) in Module I Central Database, and triggered 30-day Goal-setting in Module III!`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Overview Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-xl p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Module II — Talent Acquisition & Governance</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Recruitment & Selection Automation System
            </h1>
            <p className="mt-1 text-xs md:text-sm text-emerald-200/90 max-w-3xl leading-relaxed">
              End-to-end recruitment lifecycle: Manpower Requisitions (MRF) with teaching load validation, Vetting & Pro-Chancellor approvals, Open Positions Tracker with TAT SLAs, Central CV Database with UGC NET/PhD screening, Recruiter Calling (RCS), Dual Selection Pathways (Academic Selection Committee vs Non-Academic 3-Rounds), LOI issuance, Yet-to-Join Tracker, and 1-Click transition to Central Employee DB.
            </p>
          </div>

          <button
            onClick={() => setShowNewMrfModal(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-2 transition self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise Manpower Requisition (MRF)</span>
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="mt-6 pt-4 border-t border-emerald-800/80 flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={() => setSubTab('openPositions')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
              subTab === 'openPositions' ? 'bg-emerald-600 text-white' : 'text-emerald-200 hover:bg-emerald-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Open Positions Tracker (SLA / TAT)</span>
          </button>
          <button
            onClick={() => setSubTab('mrf')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
              subTab === 'mrf' ? 'bg-emerald-600 text-white' : 'text-emerald-200 hover:bg-emerald-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manpower Planning & MRFs</span>
          </button>
          <button
            onClick={() => setSubTab('cvDatabase')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
              subTab === 'cvDatabase' ? 'bg-emerald-600 text-white' : 'text-emerald-200 hover:bg-emerald-800/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Central CV Database & Sourcing</span>
          </button>
          <button
            onClick={() => setSubTab('selection')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
              subTab === 'selection' ? 'bg-emerald-600 text-white' : 'text-emerald-200 hover:bg-emerald-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Dual Selection Workflows</span>
          </button>
          <button
            onClick={() => setSubTab('yetToJoin')}
            className={`px-3 py-1.5 rounded-md transition flex items-center space-x-1.5 ${
              subTab === 'yetToJoin' ? 'bg-emerald-600 text-white' : 'text-emerald-200 hover:bg-emerald-800/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Yet-to-Join & Pre-Onboarding Tracker</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUBTAB 1: OPEN POSITIONS TRACKER                          */}
      {/* ========================================================= */}
      {subTab === 'openPositions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold text-slate-500 uppercase">Active Open Positions</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{openPositions.length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
              <div className="text-xs font-bold text-emerald-800 uppercase">Total Sourced Candidates</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {openPositions.reduce((acc, o) => acc + (o.totalApplicants || 0), 0)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-2xs bg-teal-50/20">
              <div className="text-xs font-bold text-teal-800 uppercase">Candidates in Pipeline</div>
              <div className="text-2xl font-black text-teal-700 mt-1">
                {openPositions.reduce((acc, o) => acc + (o.shortlistedCount || 0), 0)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-2xs bg-purple-50/20">
              <div className="text-xs font-bold text-purple-800 uppercase">Offers Accepted (Yet to Join)</div>
              <div className="text-2xl font-black text-purple-700 mt-1">
                {openPositions.reduce((acc, o) => acc + (o.yetToJoinCount || 0), 0)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
              <span>Active Vacancy Tracker with TAT SLA Benchmarks</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Academic: 45 Days TAT | Non-Academic: 30 Days TAT | Urgent Replacement: 25 Days
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {openPositions.map((pos) => (
                <div key={pos.id} className="p-4 hover:bg-slate-50/60 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                          {pos.mrfNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pos.positionType === 'ACADEMIC' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {pos.positionType}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                          {pos.vacanciesCount} Vacanc{pos.vacanciesCount > 1 ? 'ies' : 'y'}
                        </span>
                        {pos.requisitionType === 'URGENT_REPLACEMENT' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full">
                            Urgent Replacement (Resignation Linked)
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-bold text-slate-900">{pos.positionTitle}</div>
                      <div className="text-xs text-slate-500 font-medium">{pos.department} • {pos.school}</div>

                      <div className="flex items-center space-x-4 text-[11px] text-slate-500 pt-1">
                        <span>Teaching Load: <strong>{pos.teachingLoadHoursPerWeek} hrs/week</strong></span>
                        <span>•</span>
                        <span>CTC Range: <strong>{pos.proposedCtcRange}</strong></span>
                        <span>•</span>
                        <span>Channels: <strong className="text-slate-700">{pos.advertisedChannels?.join(', ')}</strong></span>
                      </div>
                    </div>

                    {/* SLA Monitor */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 min-w-[220px] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-semibold">SLA Turnaround:</span>
                        <span className={`font-bold ${pos.isOverdue ? 'text-red-600' : 'text-emerald-700'}`}>
                          {pos.daysElapsed} / {pos.targetTatDays} Days
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            pos.isOverdue ? 'bg-red-500' : (pos.daysElapsed / pos.targetTatDays > 0.75 ? 'bg-amber-500' : 'bg-emerald-500')
                          }`}
                          style={{ width: `${Math.min(100, (pos.daysElapsed / pos.targetTatDays) * 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Initiated: {pos.initiatedAt?.split('T')[0]}</span>
                        <span>Target: {pos.targetCompletionDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: MANPOWER PLANNING & MRF WORKFLOW               */}
      {/* ========================================================= */}
      {subTab === 'mrf' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
            <span>Manpower Requisitions (MRF) with Teaching Load & Vetting Hierarchy</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Academic: Vetted by Assoc Dean → Pro-Chancellor | Non-Academic: Head HR → VP Admin
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {mrfs.map((m) => (
              <div key={m.id} className="p-4 hover:bg-slate-50/50 transition">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {m.mrfNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                        {m.requisitionType}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        m.vettingStatus === 'VETTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Vetting: {m.vettingStatus}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        m.managementStatus === 'APPROVED' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        Management: {m.managementStatus}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900">{m.positionTitle}</div>
                    <p className="text-xs text-slate-600 italic">"{m.justification}"</p>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Teaching Load:</span>
                        <span className="font-bold text-slate-700">{m.teachingLoadHoursPerWeek} Hours/Week</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Sanctioned Posts:</span>
                        <span className="font-bold text-slate-700">{m.vacanciesCount} Post(s)</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Turnaround:</span>
                        <span className="font-bold text-slate-700">{m.targetTatDays} Days (Completion: {m.targetCompletionDate})</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {m.vettingStatus === 'PENDING' && (
                      <button
                        onClick={() => {
                          setVettingMrf(m);
                          setVettingDecision('RECOMMEND');
                          setVettingRemarks('');
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md shadow-2xs transition"
                      >
                        Vetting Sign-off ({m.positionType === 'ACADEMIC' ? 'Assoc Dean' : 'Head HR'})
                      </button>
                    )}

                    {m.vettingStatus === 'VETTED' && m.managementStatus === 'PENDING' && (
                      <button
                        onClick={() => {
                          setApprovingMrf(m);
                          setApprovalDecision('APPROVE');
                          setApprovalRemarks('');
                        }}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-md shadow-2xs transition"
                      >
                        Pro-Chancellor / Management Approval
                      </button>
                    )}

                    {m.managementStatus === 'APPROVED' && (
                      <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-md text-center">
                        Active in Open Tracker
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 3: CENTRAL CV DATABASE & SOURCING                 */}
      {/* ========================================================= */}
      {subTab === 'cvDatabase' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates by name, code, qualifications, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={pathwayFilter}
                onChange={(e) => setPathwayFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="">All Position Types</option>
                <option value="ACADEMIC">Academic / Faculty Candidates</option>
                <option value="NON_ACADEMIC">Non-Academic Officers</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {candidates
              .filter(c => !pathwayFilter || c.positionType === pathwayFilter)
              .filter(c => !searchQuery || c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || c.candidateCode.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((cand) => (
                <div key={cand.id} className="p-4 hover:bg-slate-50/60 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                          {cand.candidateCode}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                          Source: {cand.channelSource}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          Stage: {cand.selectionStage}
                        </span>
                        {cand.ugcNormsCompliant && (
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-full">
                            UGC Norms Screened ({cand.shortlistingScore}/100)
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-bold text-slate-900">{cand.fullName}</div>
                      <div className="text-xs text-slate-600 font-medium">Applied for: <strong className="text-slate-800">{cand.mrfTitle}</strong></div>
                      <div className="text-xs text-slate-500">{cand.highestQualification} • {cand.totalExperienceYears} Years Exp</div>

                      {/* RCS Notes */}
                      {cand.rcsNotes ? (
                        <div className="bg-amber-50/60 p-2 rounded border border-amber-200 text-[11px] text-amber-900">
                          <strong>Recruiter Call Screen (RCS) Notes:</strong> {cand.rcsNotes}
                          <span className="text-slate-400 block text-[10px] mt-0.5">By {cand.rcsRecruiterName} on {cand.rcsDate}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">RCS screening call pending.</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                      {cand.recruiterCallStatus === 'PENDING' && (
                        <button
                          onClick={() => {
                            setRcsCandidate(cand);
                            setRcsNotes('');
                            setRcsStatus('COMPLETED');
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md shadow-2xs transition flex items-center justify-center space-x-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Record RCS Call</span>
                        </button>
                      )}

                      {cand.recruiterCallStatus === 'COMPLETED' && cand.mgmtInterviewClearance === 'PENDING' && (
                        <button
                          onClick={() => handleMgmtClearance(cand.id, 'CLEAR')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md shadow-2xs transition flex items-center justify-center space-x-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Clear for Interview (Mgmt)</span>
                        </button>
                      )}

                      {cand.mgmtInterviewClearance === 'CLEARED' && (
                        <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold rounded-md text-center">
                          Cleared for Selection
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 4: DUAL SELECTION PATHWAYS                        */}
      {/* ========================================================= */}
      {subTab === 'selection' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
            <span>Dual Configurable Selection Workflows</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Academic: Selection Committee + External Expert | Non-Academic: 3-Round Matrix (Technical → HR → Management)
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {candidates
              .filter(c => c.selectionStage !== 'SOURCED')
              .map((cand) => {
                const isAcademic = cand.positionType === 'ACADEMIC';
                return (
                  <div key={cand.id} className="p-4 hover:bg-slate-50/50 transition">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                            {cand.candidateCode}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAcademic ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {isAcademic ? 'Academic Pathway (Selection Committee)' : 'Non-Academic (3-Rounds)'}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                            Status: {cand.selectionStage}
                          </span>
                        </div>

                        <div className="text-sm font-bold text-slate-900">{cand.fullName}</div>
                        <div className="text-xs text-slate-600">{cand.mrfTitle}</div>

                        {/* Workflow Matrix Display */}
                        {isAcademic && cand.selectionWorkflow?.academicSelectionCommittee && (
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Pedagogy:</span>
                              <span className="font-bold text-slate-800">{cand.selectionWorkflow.academicSelectionCommittee.teachingPedagogyScore}/100</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Research/Pubs:</span>
                              <span className="font-bold text-slate-800">{cand.selectionWorkflow.academicSelectionCommittee.researchPublicationsScore}/100</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">External Expert:</span>
                              <span className="font-bold text-teal-700">{cand.selectionWorkflow.academicSelectionCommittee.externalSubjectExpert}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Committee Score:</span>
                              <span className="font-bold text-emerald-700">{cand.selectionWorkflow.academicSelectionCommittee.totalScore} / 100</span>
                            </div>
                          </div>
                        )}

                        {!isAcademic && cand.selectionWorkflow?.nonAcademicRounds && (
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">R1 Technical (HOD):</span>
                              <span className="font-bold text-slate-800">{cand.selectionWorkflow.nonAcademicRounds.round1Technical?.technicalSkillsScore}/100</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">R2 HR Assessment:</span>
                              <span className="font-bold text-slate-800">{cand.selectionWorkflow.nonAcademicRounds.round2HR?.attitudeCultureFitScore}/100</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">R3 Management:</span>
                              <span className="font-bold text-purple-700">{cand.selectionWorkflow.nonAcademicRounds.round3Management?.verdict}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {cand.selectionStage === 'INTERVIEW_SCHEDULED' && (
                          <button
                            onClick={() => setEvaluatingCandidate(cand)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md shadow-2xs transition"
                          >
                            Conduct & Record {isAcademic ? 'Committee Evaluation' : '3-Round Matrix'}
                          </button>
                        )}

                        {cand.selectionStage === 'EVALUATED' && (
                          <button
                            onClick={() => {
                              setCostApprovalCandidate(cand);
                              setApprovedSalary('155000');
                              setApprovedDesignation(cand.mrfTitle);
                            }}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-md shadow-2xs transition"
                          >
                            Management Cost Approval & Generate LOI
                          </button>
                        )}

                        {cand.loiDetails && (
                          <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-md text-center">
                            LOI Generated: {cand.loiDetails.loiNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 5: YET-TO-JOIN & PRE-ONBOARDING TRACKER           */}
      {/* ========================================================= */}
      {subTab === 'yetToJoin' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
            <span>Yet-to-Join Tracker & Pre-Onboarding Milestones (Deans, HODs & HR View)</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Offer Acceptance → BGV & Verification → Notice Period → Onboarding Orientation → Convert to Employee
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {candidates
              .filter(c => c.selectionStage === 'YET_TO_JOIN' || c.selectionStage === 'LOI_ISSUED' || c.selectionStage === 'JOINED')
              .map((cand) => (
                <div key={cand.id} className="p-4 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                          {cand.loiDetails?.loiNumber || 'LOI Pending'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cand.selectionStage === 'JOINED' ? 'bg-emerald-100 text-emerald-800' :
                          cand.selectionStage === 'YET_TO_JOIN' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {cand.selectionStage}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                          Offered: ₹{cand.loiDetails?.offeredSalary?.toLocaleString('en-IN')}/mo
                        </span>
                      </div>

                      <div className="text-sm font-bold text-slate-900">{cand.fullName}</div>
                      <div className="text-xs text-slate-600 font-medium">Designation: {cand.loiDetails?.offeredDesignation} • Expected DOJ: {cand.loiDetails?.expectedDoj}</div>

                      {/* Milestone Checklist */}
                      {cand.loiDetails?.preOnboardingMilestones && (
                        <div className="pt-2">
                          <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                            Pre-Onboarding Statutory Milestones Checklist:
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 p-2 rounded border border-slate-200">
                              <input
                                type="checkbox"
                                checked={cand.loiDetails.preOnboardingMilestones.loiAccepted}
                                onChange={() => handleMilestoneToggle(cand.id, 'loiAccepted', cand.loiDetails.preOnboardingMilestones.loiAccepted)}
                                className="rounded text-emerald-600"
                              />
                              <span className="font-semibold text-slate-700">LOI Accepted</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 p-2 rounded border border-slate-200">
                              <input
                                type="checkbox"
                                checked={cand.loiDetails.preOnboardingMilestones.policeBackgroundVerification}
                                onChange={() => handleMilestoneToggle(cand.id, 'policeBackgroundVerification', cand.loiDetails.preOnboardingMilestones.policeBackgroundVerification)}
                                className="rounded text-emerald-600"
                              />
                              <span className="font-semibold text-slate-700">Police & BGV Clear</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 p-2 rounded border border-slate-200">
                              <input
                                type="checkbox"
                                checked={cand.loiDetails.preOnboardingMilestones.educationalCertsVerified}
                                onChange={() => handleMilestoneToggle(cand.id, 'educationalCertsVerified', cand.loiDetails.preOnboardingMilestones.educationalCertsVerified)}
                                className="rounded text-emerald-600"
                              />
                              <span className="font-semibold text-slate-700">Certs Verified</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 p-2 rounded border border-slate-200">
                              <input
                                type="checkbox"
                                checked={cand.loiDetails.preOnboardingMilestones.healthCheckupCleared}
                                onChange={() => handleMilestoneToggle(cand.id, 'healthCheckupCleared', cand.loiDetails.preOnboardingMilestones.healthCheckupCleared)}
                                className="rounded text-emerald-600"
                              />
                              <span className="font-semibold text-slate-700">Health Fit</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {cand.selectionStage === 'LOI_ISSUED' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCandidateLoiAction(cand.id, 'ACCEPTED')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-2xs transition"
                          >
                            Accept LOI
                          </button>
                          <button
                            onClick={() => handleCandidateLoiAction(cand.id, 'DECLINED')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow-2xs transition"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {cand.selectionStage === 'YET_TO_JOIN' && (
                        <button
                          onClick={() => handleConvertToEmployee(cand.id)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-md shadow-sm transition flex items-center justify-center space-x-1.5"
                          title="Provisions employee in Module I Central Database and triggers Module III Goal setting!"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Complete Joining & Onboard to Module I</span>
                        </button>
                      )}

                      {cand.selectionStage === 'JOINED' && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md text-center">
                          Active Employee Joined
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RAISE NEW MRF                                      */}
      {/* ========================================================= */}
      {showNewMrfModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Raise Manpower Requisition Form (MRF)</h2>
                <p className="text-xs text-emerald-200">Academic & Non-Academic workload & expansion requisition</p>
              </div>
              <button onClick={() => setShowNewMrfModal(false)} className="p-1 rounded-md text-emerald-200 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMrf} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Requisition Type</label>
                  <select
                    value={newMrfData.requisitionType}
                    onChange={(e) => setNewMrfData({ ...newMrfData, requisitionType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="ANNUAL_ACADEMIC">Annual Manpower Plan (Academic)</option>
                    <option value="OPERATIONAL_NON_ACADEMIC">Operational Need (Non-Academic)</option>
                    <option value="URGENT_REPLACEMENT">Urgent Replacement (Resignation Event)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Position Type</label>
                  <select
                    value={newMrfData.positionType}
                    onChange={(e) => setNewMrfData({ ...newMrfData, positionType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="ACADEMIC">Academic / Faculty</option>
                    <option value="NON_ACADEMIC">Non-Academic / Technical Officer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Position Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Professor in Cloud Computing or Network Specialist"
                  value={newMrfData.positionTitle}
                  onChange={(e) => setNewMrfData({ ...newMrfData, positionTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMrfData.vacanciesCount}
                    onChange={(e) => setNewMrfData({ ...newMrfData, vacanciesCount: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Teaching Load (Hrs/Wk)</label>
                  <input
                    type="number"
                    min="0"
                    value={newMrfData.teachingLoadHoursPerWeek}
                    onChange={(e) => setNewMrfData({ ...newMrfData, teachingLoadHoursPerWeek: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Min Exp (Years)</label>
                  <input
                    type="number"
                    min="0"
                    value={newMrfData.minExperienceYears}
                    onChange={(e) => setNewMrfData({ ...newMrfData, minExperienceYears: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Proposed CTC Range</label>
                <input
                  type="text"
                  placeholder="e.g. ₹1,20,000 - ₹1,50,000 / month"
                  value={newMrfData.proposedCtcRange}
                  onChange={(e) => setNewMrfData({ ...newMrfData, proposedCtcRange: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Workload Justification & Expansion Needs</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail curriculum teaching load, faculty student ratio (1:15), or expansion justification..."
                  value={newMrfData.justification}
                  onChange={(e) => setNewMrfData({ ...newMrfData, justification: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewMrfModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-xs transition"
                >
                  Submit MRF for Vetting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VETTING MRF                                        */}
      {/* ========================================================= */}
      {vettingMrf && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Vetting Sign-off: {vettingMrf.mrfNumber}</h2>
                <p className="text-xs text-white/80">Assoc Dean (Academic) / Head HR (Non-Academic)</p>
              </div>
              <button onClick={() => setVettingMrf(null)} className="p-1 rounded-md text-white/80 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div>Position: <strong>{vettingMrf.positionTitle}</strong></div>
                <div>Teaching Load: <strong>{vettingMrf.teachingLoadHoursPerWeek} hrs/week</strong></div>
                <div>Justification: <em>"{vettingMrf.justification}"</em></div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Vetting Recommendation</label>
                <select
                  value={vettingDecision}
                  onChange={(e) => setVettingDecision(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="RECOMMEND">Recommend & Forward to Pro-Chancellor / Management</option>
                  <option value="REQUEST_CLARIFICATION">Return for Workload Clarification</option>
                  <option value="REJECT">Reject Requisition</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Vetting Remarks</label>
                <textarea
                  rows={3}
                  value={vettingRemarks}
                  onChange={(e) => setVettingRemarks(e.target.value)}
                  placeholder="Record workload verification notes..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setVettingMrf(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVettingSubmit}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-md shadow-xs transition"
                >
                  Submit Vetting Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PRO-CHANCELLOR / MANAGEMENT APPROVAL MRF            */}
      {/* ========================================================= */}
      {approvingMrf && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Pro-Chancellor Sanction & Open Tracker Approval</h2>
                <p className="text-xs text-purple-200">Ref: {approvingMrf.mrfNumber}</p>
              </div>
              <button onClick={() => setApprovingMrf(null)} className="p-1 rounded-md text-purple-200 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Management Decision</label>
                <select
                  value={approvalDecision}
                  onChange={(e) => setApprovalDecision(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                >
                  <option value="APPROVE">Sanction & Add to Open Positions Tracker</option>
                  <option value="REJECT">Reject Requisition</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Sanction Remarks</label>
                <textarea
                  rows={3}
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  placeholder="Record sanction order remarks (e.g. external subject expert composition)..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setApprovingMrf(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprovalSubmit}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-md shadow-xs transition"
                >
                  Sanction Position
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RECORD RCS CALL                                    */}
      {/* ========================================================= */}
      {rcsCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Recruiter Calling Screen (RCS)</h2>
                <p className="text-xs text-white/80">Candidate: {rcsCandidate.fullName} ({rcsCandidate.candidateCode})</p>
              </div>
              <button onClick={() => setRcsCandidate(null)} className="p-1 rounded-md text-white/80 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>Current CTC: <strong>₹{rcsCandidate.currentCtc?.toLocaleString('en-IN')}</strong></div>
                <div>Expected CTC: <strong>₹{rcsCandidate.expectedCtc?.toLocaleString('en-IN')}</strong></div>
                <div>Experience: <strong>{rcsCandidate.totalExperienceYears} Years</strong></div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">RCS Call Disposition</label>
                <select
                  value={rcsStatus}
                  onChange={(e) => setRcsStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="COMPLETED">Call Completed & Positive Fit</option>
                  <option value="NO_RESPONSE">No Response / Callback Scheduled</option>
                  <option value="NOT_INTERESTED">Not Interested / Compensation Mismatch</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Detailed Recruiter Notes</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record notice period, willingness to relocate to Diamond Harbour campus, publication counts, communication rating..."
                  value={rcsNotes}
                  onChange={(e) => setRcsNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRcsCandidate(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRcsSubmit}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-md shadow-xs transition"
                >
                  Save RCS Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SELECTION COMMITTEE EVALUATION                     */}
      {/* ========================================================= */}
      {evaluatingCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-blue-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">
                  {evaluatingCandidate.positionType === 'ACADEMIC'
                    ? 'Academic Selection Committee Evaluation'
                    : 'Non-Academic 3-Round Evaluation Matrix'}
                </h2>
                <p className="text-xs text-blue-200">Candidate: {evaluatingCandidate.fullName}</p>
              </div>
              <button onClick={() => setEvaluatingCandidate(null)} className="p-1 rounded-md text-blue-200 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {evaluatingCandidate.positionType === 'ACADEMIC' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Teaching Pedagogy Score (100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={academicEvaluation.teachingPedagogyScore}
                        onChange={(e) => setAcademicEvaluation({ ...academicEvaluation, teachingPedagogyScore: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Research & Pubs Score (100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={academicEvaluation.researchPublicationsScore}
                        onChange={(e) => setAcademicEvaluation({ ...academicEvaluation, researchPublicationsScore: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">External Subject Expert Name</label>
                    <input
                      type="text"
                      value={academicEvaluation.externalSubjectExpert}
                      onChange={(e) => setAcademicEvaluation({ ...academicEvaluation, externalSubjectExpert: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Committee Recommendation</label>
                    <select
                      value={academicEvaluation.committeeRecommendation}
                      onChange={(e) => setAcademicEvaluation({ ...academicEvaluation, committeeRecommendation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md font-semibold text-slate-800"
                    >
                      <option value="RECOMMENDED_STRONGLY">Strongly Recommended</option>
                      <option value="RECOMMENDED">Recommended</option>
                      <option value="WAITLISTED">Waitlisted</option>
                      <option value="REJECTED">Not Recommended</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">R1 Technical Score (HOD)</label>
                      <input
                        type="number"
                        value={nonAcademicEvaluation.round1Technical.technicalSkillsScore}
                        onChange={(e) => setNonAcademicEvaluation({
                          ...nonAcademicEvaluation,
                          round1Technical: { ...nonAcademicEvaluation.round1Technical, technicalSkillsScore: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">R2 HR Score</label>
                      <input
                        type="number"
                        value={nonAcademicEvaluation.round2HR.attitudeCultureFitScore}
                        onChange={(e) => setNonAcademicEvaluation({
                          ...nonAcademicEvaluation,
                          round2HR: { ...nonAcademicEvaluation.round2HR, attitudeCultureFitScore: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEvaluatingCandidate(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEvaluationSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-xs transition"
                >
                  Record Evaluation Matrix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: MANAGEMENT COST APPROVAL & LOI GENERATOR            */}
      {/* ========================================================= */}
      {costApprovalCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Management Cost Approval & Generate LOI</h2>
                <p className="text-xs text-purple-200">Candidate: {costApprovalCandidate.fullName}</p>
              </div>
              <button onClick={() => setCostApprovalCandidate(null)} className="p-1 rounded-md text-purple-200 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Approved Designation</label>
                <input
                  type="text"
                  value={approvedDesignation}
                  onChange={(e) => setApprovedDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Sanctioned Monthly CTC (₹)</label>
                <input
                  type="number"
                  value={approvedSalary}
                  onChange={(e) => setApprovedSalary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-bold text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCostApprovalCandidate(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCostApprovalSubmit}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-md shadow-xs transition"
                >
                  Approve Cost & Issue LOI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
