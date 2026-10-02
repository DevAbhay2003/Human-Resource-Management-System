/**
 * =========================================================================================
 * THE NEOTIA UNIVERSITY (TNU) — ENTERPRISE HRMS & ERP AUTOMATION SYSTEM
 * 
 * Lead Developer & System Architect: ABHAY
 * Campus: Sarisa, D.H. Road, 24 Parganas (South), West Bengal 743368
 * Modules: Module I (HR Change Management), Module II (Recruitment), Module III (Appraisal)
 * License / Attribution: Designed and Engineered by Abhay for Official College Web Deployment
 * =========================================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { initDb, getDb, persistDb, logAudit } = require('./db');
const initialSeedData = require('./seedData');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Database with rich seed data
initDb(initialSeedData);

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.url.startsWith('/assets')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Helper for client IP
const getClientIp = (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

// ==========================================
// DEVOPS, SYSTEM HEALTH & TIME-MACHINE APIS
// ==========================================

app.get('/api/health', (req, res) => {
  const db = getDb();
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    database: {
      status: 'HEALTHY',
      employeesCount: db.employees?.length || 0,
      changeRequestsCount: db.changeRequests?.length || 0,
      mrfCount: db.manpowerRequisitions?.length || 0,
      candidatesCount: db.candidates?.length || 0,
      auditLogsCount: db.auditLogs?.length || 0
    },
    systemSettings: db.systemSettings
  });
});

app.get('/api/ready', (req, res) => {
  res.json({ ready: true, service: "TNU College HRMS & ERP Automation Portal" });
});

app.get('/api/metrics', (req, res) => {
  const db = getDb();
  const uptime = Math.floor(process.uptime());
  const mem = process.memoryUsage();
  
  // Format Prometheus compatible metrics
  const metrics = `
# HELP hrms_uptime_seconds Process uptime in seconds
# TYPE hrms_uptime_seconds counter
hrms_uptime_seconds ${uptime}

# HELP hrms_memory_heap_used_bytes Memory heap used
# TYPE hrms_memory_heap_used_bytes gauge
hrms_memory_heap_used_bytes ${mem.heapUsed}

# HELP hrms_employees_total Total number of active employees
# TYPE hrms_employees_total gauge
hrms_employees_total ${db.employees ? db.employees.length : 0}

# HELP hrms_change_requests_total Total HR change requests
# TYPE hrms_change_requests_total counter
hrms_change_requests_total ${db.changeRequests ? db.changeRequests.length : 0}

# HELP hrms_open_positions_total Active open recruitment requisitions
# TYPE hrms_open_positions_total gauge
hrms_open_positions_total ${(db.manpowerRequisitions || []).filter(m => m.status === 'OPEN').length}

# HELP hrms_group_d_evaluations_total Monthly Group-D evaluations
# TYPE hrms_group_d_evaluations_total counter
hrms_group_d_evaluations_total ${db.groupDMonthlyEvaluations ? db.groupDMonthlyEvaluations.length : 0}
  `.trim();

  res.setHeader('Content-Type', 'text/plain');
  res.send(metrics);
});

app.get('/api/settings', (req, res) => {
  const db = getDb();
  res.json(db.systemSettings);
});

// Time-Warp Engine: Simulate dates and automate monthly SOP rules
app.post('/api/settings/time-warp', (req, res) => {
  const db = getDb();
  const { newDate, action } = req.body;
  
  if (newDate) {
    db.systemSettings.currentSimulatedDate = new Date(newDate).toISOString();
  }
  
  const simDate = new Date(db.systemSettings.currentSimulatedDate);
  const currentDay = simDate.getDate();
  const logs = [];

  // Automation Rule 1: Group-D 10th of month Auto-Lock overdue checks
  if (action === 'TRIGGER_MONTHLY_LOCK' || currentDay > (db.systemSettings.groupDGracePeriodDueDay || 10)) {
    if (db.groupDMonthlyEvaluations) {
      db.groupDMonthlyEvaluations.forEach(ev => {
        if (ev.status === 'PENDING_HOD') {
          const graceDue = new Date(ev.graceDueDate);
          if (simDate > graceDue) {
            ev.status = 'AUTO_LOCKED_OVERDUE';
            ev.isAutoLocked = true;
            ev.lockReason = `Automated SOP Enforcement: Missed submission deadline (7th) and grace period (10th). Auto-locked on ${simDate.toISOString().split('T')[0]}.`;
            logs.push(`Group-D Evaluation for ${ev.employeeName} auto-locked due to overdue deadline.`);
            
            logAudit({
              entityType: 'GROUP_D_EVALUATION',
              entityId: ev.id,
              action: 'AUTO_LOCK_OVERDUE',
              actorName: 'System Scheduler Daemon',
              actorRole: 'SYSTEM',
              remarks: ev.lockReason,
              ip: getClientIp(req)
            });
          }
        }
      });
    }
  }

  // Automation Rule 2: Module I Effective Date Trigger - Auto Apply
  if (db.changeRequests) {
    db.changeRequests.forEach(cr => {
      if (cr.status === 'APPROVED' && cr.stage === 'AWAITING_EFFECTIVE_DATE') {
        const effDate = new Date(cr.effectiveDate);
        if (simDate >= effDate) {
          cr.status = 'EFFECTIVE_APPLIED';
          cr.stage = 'COMPLETED';
          cr.effectiveAppliedAt = simDate.toISOString();
          
          // Apply to employee record
          const emp = db.employees.find(e => e.id === cr.employeeId);
          if (emp) {
            const oldVal = emp[cr.changeField];
            emp[cr.changeField] = cr.proposedValue;
            if (cr.proposedSecondaryValue && cr.changeField === 'designation') {
              emp.level = cr.proposedSecondaryValue;
            }
            logs.push(`Applied Change Request ${cr.reqNumber}: Updated ${emp.name}'s ${cr.changeField} to ${cr.proposedValue}`);
            
            logAudit({
              entityType: 'EMPLOYEE_RECORD',
              entityId: emp.id,
              action: 'EFFECTIVE_DATE_APPLIED',
              actorName: 'System Scheduler Daemon',
              actorRole: 'SYSTEM',
              previousState: { [cr.changeField]: oldVal },
              newState: { [cr.changeField]: cr.proposedValue },
              remarks: `Effective date reached (${cr.effectiveDate}). Change executed.`,
              ip: getClientIp(req)
            });
          }
        }
      }
    });
  }

  persistDb();
  res.json({
    success: true,
    currentSimulatedDate: db.systemSettings.currentSimulatedDate,
    executionLogs: logs
  });
});

app.get('/api/audit-logs', (req, res) => {
  const db = getDb();
  let logs = db.auditLogs || [];
  const { entityType, entityId, limit } = req.query;
  
  if (entityType) {
    logs = logs.filter(l => l.entityType === entityType);
  }
  if (entityId) {
    logs = logs.filter(l => l.entityId === entityId);
  }
  if (limit) {
    logs = logs.slice(0, parseInt(limit, 10));
  }
  
  res.json(logs);
});

app.get('/api/notifications', (req, res) => {
  const db = getDb();
  res.json(db.notifications || []);
});

app.put('/api/notifications/:id/read', (req, res) => {
  const db = getDb();
  const notif = (db.notifications || []).find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    persistDb();
  }
  res.json({ success: true });
});

// ==========================================
// MODULE I: HR CHANGE MANAGEMENT & CENTRAL DB
// ==========================================

app.get('/api/employees', (req, res) => {
  const db = getDb();
  const { category, department, role, search } = req.query;
  let list = db.employees || [];
  
  if (category) {
    list = list.filter(e => e.category === category);
  }
  if (department) {
    list = list.filter(e => e.department.toLowerCase().includes(department.toLowerCase()));
  }
  if (role) {
    list = list.filter(e => e.role === role);
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(e => 
      e.name.toLowerCase().includes(s) || 
      e.empCode.toLowerCase().includes(s) || 
      e.designation.toLowerCase().includes(s) ||
      e.department.toLowerCase().includes(s)
    );
  }
  
  res.json(list);
});

app.get('/api/employees/:id', (req, res) => {
  const db = getDb();
  const emp = (db.employees || []).find(e => e.id === req.params.id || e.empCode === req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  
  // Attach related history
  const changeHistory = (db.changeRequests || []).filter(c => c.employeeId === emp.id);
  const groupDEvaluations = (db.groupDMonthlyEvaluations || []).filter(g => g.employeeId === emp.id);
  const facultyECM = (db.facultyEcmAppraisals || []).filter(f => f.employeeId === emp.id);
  const generalReviews = (db.quarterlyReviews || []).filter(q => q.employeeId === emp.id);
  
  res.json({
    ...emp,
    history: {
      changeHistory,
      groupDEvaluations,
      facultyECM,
      generalReviews
    }
  });
});

app.get('/api/org-chart', (req, res) => {
  const db = getDb();
  const employees = db.employees || [];
  
  // Build hierarchy tree
  const buildTree = (parentId) => {
    return employees
      .filter(e => e.reportingAuthorityId === parentId)
      .map(emp => ({
        id: emp.id,
        name: emp.name,
        empCode: emp.empCode,
        designation: emp.designation,
        level: emp.level,
        department: emp.department,
        school: emp.school,
        category: emp.category,
        subordinates: buildTree(emp.id)
      }));
  };
  
  const rootEmployees = employees.filter(e => !e.reportingAuthorityId);
  const tree = rootEmployees.map(root => ({
    id: root.id,
    name: root.name,
    empCode: root.empCode,
    designation: root.designation,
    level: root.level,
    department: root.department,
    school: root.school,
    category: root.category,
    subordinates: buildTree(root.id)
  }));
  
  res.json(tree);
});

app.get('/api/change-requests', (req, res) => {
  const db = getDb();
  const { status, employeeId, changeType } = req.query;
  let list = db.changeRequests || [];
  
  if (status) {
    list = list.filter(c => c.status === status);
  }
  if (employeeId) {
    list = list.filter(c => c.employeeId === employeeId);
  }
  if (changeType) {
    list = list.filter(c => c.changeType === changeType);
  }
  
  res.json(list);
});

app.post('/api/change-requests', (req, res) => {
  const db = getDb();
  const { employeeId, changeType, proposedValue, proposedSecondaryValue, justification, effectiveDate, requestedBy } = req.body;
  
  const emp = (db.employees || []).find(e => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: 'Target employee not found' });
  
  // Map field
  const fieldMap = {
    'SALARY_REVISION': 'salary',
    'DESIGNATION_CHANGE': 'designation',
    'LEVEL_CHANGE': 'level',
    'DEPT_SCHOOL_CHANGE': 'department',
    'REPORTING_AUTH_CHANGE': 'reportingAuthorityId',
    'LOCATION_CHANGE': 'location',
    'ADDITIONAL_RESPONSIBILITY': 'additionalResponsibility',
    'QUALIFICATION_UPDATE': 'qualifications'
  };
  
  const changeField = fieldMap[changeType] || 'serviceCondition';
  const currentValue = String(emp[changeField] || 'N/A');
  const reqNumber = `CR-${new Date().getFullYear()}-${String((db.changeRequests?.length || 0) + 1).padStart(3, '0')}`;
  
  const newRequest = {
    id: reqNumber,
    reqNumber,
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    changeType,
    changeField,
    currentValue,
    proposedValue,
    currentSecondaryValue: emp.level || '',
    proposedSecondaryValue: proposedSecondaryValue || '',
    justification,
    effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
    status: 'PENDING_HR',
    stage: 'HR_REVIEW',
    requestedBy: requestedBy || 'Department Authority',
    requestedAt: new Date().toISOString(),
    hrStatus: 'PENDING',
    hrReviewedBy: null,
    hrReviewedAt: null,
    hrRemarks: '',
    managementStatus: 'PENDING',
    managementReviewedBy: null,
    managementReviewedAt: null,
    managementRemarks: '',
    effectiveAppliedAt: null
  };
  
  if (!db.changeRequests) db.changeRequests = [];
  db.changeRequests.unshift(newRequest);
  
  logAudit({
    entityType: 'HR_CHANGE_REQUEST',
    entityId: newRequest.id,
    action: 'CHANGE_REQUEST_INITIATED',
    actorName: requestedBy || 'Department Authority',
    actorRole: 'REQUESTER',
    newState: newRequest,
    remarks: `Initiated ${changeType} request for ${emp.name}`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.status(201).json(newRequest);
});

// HR Review on Change Request (Level 1)
app.put('/api/change-requests/:id/hr-review', (req, res) => {
  const db = getDb();
  const { decision, remarks, reviewerName } = req.body;
  const cr = (db.changeRequests || []).find(c => c.id === req.params.id);
  if (!cr) return res.status(404).json({ error: 'Change request not found' });
  
  const previousState = JSON.parse(JSON.stringify(cr));
  cr.hrReviewedBy = reviewerName || 'Head HR';
  cr.hrReviewedAt = new Date().toISOString();
  cr.hrRemarks = remarks || '';
  
  if (decision === 'RECOMMEND_TO_MANAGEMENT') {
    cr.hrStatus = 'APPROVED';
    cr.status = 'PENDING_MANAGEMENT';
    cr.stage = 'MANAGEMENT_REVIEW';
  } else if (decision === 'REQUEST_CLARIFICATION') {
    cr.hrStatus = 'CLARIFICATION_REQUESTED';
    cr.status = 'HR_CLARIFICATION';
    cr.stage = 'RETURNED_FOR_CLARIFICATION';
  } else if (decision === 'REJECT') {
    cr.hrStatus = 'REJECTED';
    cr.status = 'REJECTED';
    cr.stage = 'HR_REJECTED';
  }
  
  logAudit({
    entityType: 'HR_CHANGE_REQUEST',
    entityId: cr.id,
    action: `HR_REVIEW_${decision}`,
    actorName: reviewerName || 'Head HR',
    actorRole: 'HEAD_HR',
    previousState,
    newState: cr,
    remarks: remarks || '',
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(cr);
});

// Senior Management Review on Change Request (Level 2)
app.put('/api/change-requests/:id/mgmt-review', (req, res) => {
  const db = getDb();
  const { decision, remarks, reviewerName, updatedEffectiveDate } = req.body;
  const cr = (db.changeRequests || []).find(c => c.id === req.params.id);
  if (!cr) return res.status(404).json({ error: 'Change request not found' });
  
  const previousState = JSON.parse(JSON.stringify(cr));
  cr.managementReviewedBy = reviewerName || 'Vice-Chancellor / Pro-Chancellor';
  cr.managementReviewedAt = new Date().toISOString();
  cr.managementRemarks = remarks || '';
  
  if (updatedEffectiveDate) {
    cr.effectiveDate = updatedEffectiveDate;
  }
  
  if (decision === 'APPROVE') {
    cr.managementStatus = 'APPROVED';
    cr.status = 'APPROVED';
    
    // Check if effective date is today or past
    const effDate = new Date(cr.effectiveDate);
    const now = new Date(db.systemSettings.currentSimulatedDate || Date.now());
    
    if (now >= effDate) {
      // Immediate execution
      cr.status = 'EFFECTIVE_APPLIED';
      cr.stage = 'COMPLETED';
      cr.effectiveAppliedAt = now.toISOString();
      
      const emp = db.employees.find(e => e.id === cr.employeeId);
      if (emp) {
        emp[cr.changeField] = cr.proposedValue;
        if (cr.proposedSecondaryValue && cr.changeField === 'designation') {
          emp.level = cr.proposedSecondaryValue;
        }
      }
    } else {
      cr.stage = 'AWAITING_EFFECTIVE_DATE';
    }
  } else if (decision === 'REQUEST_CLARIFICATION') {
    cr.managementStatus = 'CLARIFICATION_REQUESTED';
    cr.status = 'MANAGEMENT_CLARIFICATION';
    cr.stage = 'RETURNED_TO_HR';
  } else if (decision === 'REJECT') {
    cr.managementStatus = 'REJECTED';
    cr.status = 'REJECTED';
    cr.stage = 'MANAGEMENT_REJECTED';
  }
  
  logAudit({
    entityType: 'HR_CHANGE_REQUEST',
    entityId: cr.id,
    action: `MANAGEMENT_REVIEW_${decision}`,
    actorName: reviewerName || 'Senior Management',
    actorRole: 'SENIOR_MANAGEMENT',
    previousState,
    newState: cr,
    remarks: remarks || '',
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(cr);
});

// Force Execute Effective Date
app.post('/api/change-requests/:id/apply-effective', (req, res) => {
  const db = getDb();
  const cr = (db.changeRequests || []).find(c => c.id === req.params.id);
  if (!cr) return res.status(404).json({ error: 'Change request not found' });
  if (cr.status !== 'APPROVED') return res.status(400).json({ error: 'Only approved change requests can be made effective' });
  
  const emp = db.employees.find(e => e.id === cr.employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  
  const previousState = { ...emp };
  emp[cr.changeField] = cr.proposedValue;
  if (cr.proposedSecondaryValue && cr.changeField === 'designation') {
    emp.level = cr.proposedSecondaryValue;
  }
  
  cr.status = 'EFFECTIVE_APPLIED';
  cr.stage = 'COMPLETED';
  cr.effectiveAppliedAt = new Date().toISOString();
  
  logAudit({
    entityType: 'HR_CHANGE_REQUEST',
    entityId: cr.id,
    action: 'CHANGE_APPLIED_EFFECTIVE',
    actorName: 'HR Administrator',
    actorRole: 'HEAD_HR',
    previousState,
    newState: emp,
    remarks: `Executed change in Central DB and Org Structure.`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json({ success: true, employee: emp, changeRequest: cr });
});

// Real-Time Configurable Reports
app.get('/api/reports/change-management', (req, res) => {
  const db = getDb();
  const requests = db.changeRequests || [];
  
  const pendingHr = requests.filter(r => r.status === 'PENDING_HR').length;
  const pendingMgmt = requests.filter(r => r.status === 'PENDING_MANAGEMENT').length;
  const awaitingEffective = requests.filter(r => r.status === 'APPROVED' && r.stage === 'AWAITING_EFFECTIVE_DATE').length;
  const effectiveApplied = requests.filter(r => r.status === 'EFFECTIVE_APPLIED').length;
  const rejected = requests.filter(r => r.status === 'REJECTED').length;
  
  // By department
  const byDept = {};
  requests.forEach(r => {
    byDept[r.department] = (byDept[r.department] || 0) + 1;
  });
  
  // By change type
  const byType = {};
  requests.forEach(r => {
    byType[r.changeType] = (byType[r.changeType] || 0) + 1;
  });
  
  res.json({
    summary: {
      total: requests.length,
      pendingHr,
      pendingMgmt,
      awaitingEffective,
      effectiveApplied,
      rejected
    },
    byDepartment: byDept,
    byChangeType: byType,
    allRecords: requests
  });
});

// ==========================================
// MODULE II: RECRUITMENT & SELECTION SYSTEM
// ==========================================

app.get('/api/recruitment/mrf', (req, res) => {
  const db = getDb();
  res.json(db.manpowerRequisitions || []);
});

app.post('/api/recruitment/mrf', (req, res) => {
  const db = getDb();
  const {
    requisitionType,
    positionTitle,
    positionType,
    department,
    school,
    vacanciesCount,
    teachingLoadHoursPerWeek,
    proposedCtcRange,
    minQualification,
    minExperienceYears,
    justification,
    replacementForEmployeeName,
    resignationAcceptanceDate,
    initiatedBy
  } = req.body;
  
  const mrfNumber = `MRF-${positionType === 'ACADEMIC' ? 'ACAD' : 'NONACAD'}-${new Date().getFullYear()}-${String((db.manpowerRequisitions?.length || 0) + 1).padStart(2, '0')}`;
  
  const newMrf = {
    id: `MRF-${uuidv4().slice(0, 8)}`,
    mrfNumber,
    requisitionType: requisitionType || 'ANNUAL_ACADEMIC',
    positionTitle,
    positionType: positionType || 'ACADEMIC',
    department,
    school: school || 'University',
    vacanciesCount: parseInt(vacanciesCount, 10) || 1,
    teachingLoadHoursPerWeek: parseInt(teachingLoadHoursPerWeek, 10) || 0,
    proposedCtcRange,
    minQualification,
    minExperienceYears: parseInt(minExperienceYears, 10) || 0,
    justification,
    replacementForEmployeeName: replacementForEmployeeName || null,
    resignationAcceptanceDate: resignationAcceptanceDate || null,
    initiatedBy: initiatedBy || 'Department Authority',
    initiatedAt: new Date().toISOString(),
    vettingStatus: 'PENDING',
    vettedBy: null,
    vettingRemarks: '',
    vettedAt: null,
    managementStatus: 'PENDING',
    managementApprovedBy: null,
    managementRemarks: '',
    managementApprovedAt: null,
    targetTatDays: positionType === 'ACADEMIC' ? 45 : 30,
    targetCompletionDate: new Date(Date.now() + (positionType === 'ACADEMIC' ? 45 : 30) * 86400000).toISOString().split('T')[0],
    status: 'VETTING',
    advertisedChannels: []
  };
  
  if (!db.manpowerRequisitions) db.manpowerRequisitions = [];
  db.manpowerRequisitions.unshift(newMrf);
  
  logAudit({
    entityType: 'MANPOWER_REQUISITION',
    entityId: newMrf.id,
    action: 'MRF_INITIATED',
    actorName: initiatedBy || 'Department Authority',
    actorRole: 'REQUISITIONER',
    newState: newMrf,
    remarks: `Initiated ${requisitionType} for ${positionTitle}`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.status(201).json(newMrf);
});

// Vetting MRF (Assoc Dean for Academic / Head HR for Non-Academic)
app.put('/api/recruitment/mrf/:id/vetting', (req, res) => {
  const db = getDb();
  const { decision, remarks, vettedBy } = req.body;
  const mrf = (db.manpowerRequisitions || []).find(m => m.id === req.params.id);
  if (!mrf) return res.status(404).json({ error: 'MRF not found' });
  
  mrf.vettedBy = vettedBy || 'Vetting Authority';
  mrf.vettedAt = new Date().toISOString();
  mrf.vettingRemarks = remarks || '';
  
  if (decision === 'RECOMMEND') {
    mrf.vettingStatus = 'VETTED';
    mrf.status = 'APPROVAL';
  } else if (decision === 'REQUEST_CLARIFICATION') {
    mrf.vettingStatus = 'CLARIFICATION_REQUESTED';
    mrf.status = 'DRAFT';
  } else if (decision === 'REJECT') {
    mrf.vettingStatus = 'REJECTED';
    mrf.status = 'CANCELLED';
  }
  
  logAudit({
    entityType: 'MANPOWER_REQUISITION',
    entityId: mrf.id,
    action: `MRF_VETTING_${decision}`,
    actorName: vettedBy || 'Vetting Authority',
    actorRole: mrf.positionType === 'ACADEMIC' ? 'ASSOC_DEAN' : 'HEAD_HR',
    newState: mrf,
    remarks: remarks || '',
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(mrf);
});

// Management Approval for MRF
app.put('/api/recruitment/mrf/:id/approval', (req, res) => {
  const db = getDb();
  const { decision, remarks, approvedBy } = req.body;
  const mrf = (db.manpowerRequisitions || []).find(m => m.id === req.params.id);
  if (!mrf) return res.status(404).json({ error: 'MRF not found' });
  
  mrf.managementApprovedBy = approvedBy || 'Pro-Chancellor / Vice-Chancellor';
  mrf.managementApprovedAt = new Date().toISOString();
  mrf.managementRemarks = remarks || '';
  
  if (decision === 'APPROVE') {
    mrf.managementStatus = 'APPROVED';
    mrf.status = 'OPEN';
    mrf.advertisedChannels = ["WEBSITE", "LINKEDIN"];
  } else if (decision === 'REJECT') {
    mrf.managementStatus = 'REJECTED';
    mrf.status = 'CANCELLED';
  }
  
  logAudit({
    entityType: 'MANPOWER_REQUISITION',
    entityId: mrf.id,
    action: `MRF_APPROVAL_${decision}`,
    actorName: approvedBy || 'Senior Management',
    actorRole: 'PRO_CHANCELLOR',
    newState: mrf,
    remarks: remarks || '',
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(mrf);
});

app.get('/api/recruitment/open-positions', (req, res) => {
  const db = getDb();
  const openPositions = (db.manpowerRequisitions || []).filter(m => m.status === 'OPEN' || m.status === 'IN_PROGRESS');
  
  const mapped = openPositions.map(m => {
    const totalApplicants = (db.candidates || []).filter(c => c.mrfId === m.id).length;
    const shortlistedCount = (db.candidates || []).filter(c => c.mrfId === m.id && c.shortlistingStatus === 'SHORTLISTED').length;
    const yetToJoinCount = (db.candidates || []).filter(c => c.mrfId === m.id && c.selectionStage === 'YET_TO_JOIN').length;
    
    // SLA turnaround calculation
    const initDate = new Date(m.initiatedAt);
    const now = new Date(db.systemSettings.currentSimulatedDate || Date.now());
    const daysElapsed = Math.floor((now - initDate) / (1000 * 60 * 60 * 24));
    const isOverdue = daysElapsed > m.targetTatDays;
    
    return {
      ...m,
      totalApplicants,
      shortlistedCount,
      yetToJoinCount,
      daysElapsed,
      isOverdue
    };
  });
  
  res.json(mapped);
});

app.get('/api/recruitment/candidates', (req, res) => {
  const db = getDb();
  const { mrfId, positionType, selectionStage, search } = req.query;
  let list = db.candidates || [];
  
  if (mrfId) {
    list = list.filter(c => c.mrfId === mrfId);
  }
  if (positionType) {
    list = list.filter(c => c.positionType === positionType);
  }
  if (selectionStage) {
    list = list.filter(c => c.selectionStage === selectionStage);
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(c => 
      c.fullName.toLowerCase().includes(s) || 
      c.candidateCode.toLowerCase().includes(s) || 
      c.email.toLowerCase().includes(s)
    );
  }
  
  res.json(list);
});

// Candidate Application Ingestion (Public Portal or HR Sourcing)
app.post('/api/recruitment/candidates', (req, res) => {
  const db = getDb();
  const {
    mrfId,
    fullName,
    email,
    phone,
    channelSource,
    highestQualification,
    ugcNetGateQualified,
    phdCompleted,
    totalExperienceYears,
    currentCtc,
    expectedCtc
  } = req.body;
  
  const mrf = (db.manpowerRequisitions || []).find(m => m.id === mrfId);
  const positionTitle = mrf ? mrf.positionTitle : 'Direct Application';
  const positionType = mrf ? mrf.positionType : 'ACADEMIC';
  
  // Automated Shortlisting & UGC Screening Logic
  let shortlistingScore = 60;
  let ugcNormsCompliant = false;
  
  if (positionType === 'ACADEMIC') {
    if (phdCompleted) shortlistingScore += 25;
    if (ugcNetGateQualified) shortlistingScore += 15;
    if (totalExperienceYears >= (mrf?.minExperienceYears || 2)) shortlistingScore += 10;
    if (phdCompleted || ugcNetGateQualified) {
      ugcNormsCompliant = true;
    }
  } else {
    if (totalExperienceYears >= (mrf?.minExperienceYears || 3)) shortlistingScore += 25;
    if (highestQualification && (highestQualification.includes('Tech') || highestQualification.includes('MBA') || highestQualification.includes('MCA'))) {
      shortlistingScore += 15;
    }
    ugcNormsCompliant = true;
  }
  
  const candidateCode = `CV-${new Date().getFullYear()}-${String((db.candidates?.length || 0) + 1).padStart(3, '0')}`;
  
  const newCandidate = {
    id: `CAND-${uuidv4().slice(0, 8)}`,
    candidateCode,
    mrfId: mrf?.id || 'MRF-GENERAL',
    mrfTitle: positionTitle,
    positionType,
    fullName,
    email,
    phone,
    channelSource: channelSource || 'UNIVERSITY_WEBSITE',
    resumeFileName: `${fullName.replace(/\s+/g, '_')}_Resume.pdf`,
    highestQualification,
    ugcNetGateQualified: Boolean(ugcNetGateQualified),
    phdCompleted: Boolean(phdCompleted),
    totalExperienceYears: parseFloat(totalExperienceYears) || 0,
    currentCtc: parseFloat(currentCtc) || 0,
    expectedCtc: parseFloat(expectedCtc) || 0,
    shortlistingStatus: shortlistingScore >= 75 ? 'SHORTLISTED' : 'NEW',
    shortlistingScore,
    ugcNormsCompliant,
    recruiterCallStatus: 'PENDING',
    rcsNotes: '',
    rcsRecruiterName: '',
    rcsDate: null,
    mgmtInterviewClearance: 'PENDING',
    mgmtClearanceRemarks: '',
    selectionStage: shortlistingScore >= 75 ? 'SHORTLISTED' : 'SOURCED',
    selectionWorkflow: {}
  };
  
  if (!db.candidates) db.candidates = [];
  db.candidates.unshift(newCandidate);
  
  logAudit({
    entityType: 'RECRUITMENT_CV',
    entityId: newCandidate.id,
    action: 'APPLICATION_INGESTED',
    actorName: fullName,
    actorRole: 'CANDIDATE',
    newState: newCandidate,
    remarks: `Application submitted via ${channelSource || 'Website'}. Auto score: ${shortlistingScore}/100.`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.status(201).json(newCandidate);
});

// Recruiter Calling Screen (RCS) Update
app.put('/api/recruitment/candidates/:id/rcs', (req, res) => {
  const db = getDb();
  const { rcsNotes, recruiterName, status } = req.body;
  const cand = (db.candidates || []).find(c => c.id === req.params.id);
  if (!cand) return res.status(404).json({ error: 'Candidate not found' });
  
  cand.recruiterCallStatus = status || 'COMPLETED';
  cand.rcsNotes = rcsNotes;
  cand.rcsRecruiterName = recruiterName || 'Vikram Malhotra (HR)';
  cand.rcsDate = new Date().toISOString().split('T')[0];
  
  if (status === 'COMPLETED') {
    cand.selectionStage = 'RCS_DONE';
  }
  
  logAudit({
    entityType: 'RECRUITMENT_CV',
    entityId: cand.id,
    action: 'RCS_RECORDED',
    actorName: recruiterName || 'HR Recruiter',
    actorRole: 'HR_EXECUTIVE',
    newState: cand,
    remarks: rcsNotes,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(cand);
});

// Management Interview Clearance
app.put('/api/recruitment/candidates/:id/mgmt-clearance', (req, res) => {
  const db = getDb();
  const { decision, remarks, approvedBy } = req.body;
  const cand = (db.candidates || []).find(c => c.id === req.params.id);
  if (!cand) return res.status(404).json({ error: 'Candidate not found' });
  
  cand.mgmtInterviewClearance = decision === 'CLEAR' ? 'CLEARED' : 'ON_HOLD';
  cand.mgmtClearanceRemarks = remarks || '';
  
  if (decision === 'CLEAR') {
    cand.selectionStage = 'MGMT_CLEARED';
  }
  
  logAudit({
    entityType: 'RECRUITMENT_CV',
    entityId: cand.id,
    action: `MGMT_INTERVIEW_CLEARANCE_${decision}`,
    actorName: approvedBy || 'Senior Management',
    actorRole: 'SENIOR_MANAGEMENT',
    newState: cand,
    remarks: remarks || '',
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(cand);
});

// Selection Workflow Evaluation (Academic Selection Committee or Non-Academic 3-Rounds)
app.put('/api/recruitment/candidates/:id/evaluate', (req, res) => {
  const db = getDb();
  const { pathway, evaluationData } = req.body;
  const cand = (db.candidates || []).find(c => c.id === req.params.id);
  if (!cand) return res.status(404).json({ error: 'Candidate not found' });
  
  if (!cand.selectionWorkflow) cand.selectionWorkflow = {};
  
  if (pathway === 'ACADEMIC') {
    cand.selectionWorkflow.academicSelectionCommittee = evaluationData;
    cand.selectionStage = 'EVALUATED';
  } else {
    cand.selectionWorkflow.nonAcademicRounds = evaluationData;
    cand.selectionStage = 'EVALUATED';
  }
  
  logAudit({
    entityType: 'RECRUITMENT_EVALUATION',
    entityId: cand.id,
    action: `${pathway}_INTERVIEW_EVALUATION_COMPLETED`,
    actorName: 'Selection Committee / Evaluators',
    actorRole: 'SELECTION_COMMITTEE',
    newState: cand.selectionWorkflow,
    remarks: `Completed ${pathway} interview assessment.`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(cand);
});

// Management Cost Approval & LOI Generation
app.put('/api/recruitment/candidates/:id/mgmt-cost-approval', (req, res) => {
  const db = getDb();
  const { approvedSalary, approvedDesignation, remarks, approvedBy } = req.body;
  const cand = (db.candidates || []).find(c => c.id === req.params.id);
  if (!cand) return res.status(404).json({ error: 'Candidate not found' });
  
  if (!cand.selectionWorkflow) cand.selectionWorkflow = {};
  cand.selectionWorkflow.managementCostApproval = {
    approvedCtcMonthly: parseFloat(approvedSalary),
    approvedDesignation,
    approvedBy: approvedBy || 'Vice-Chancellor & VP - Admin',
    costApprovalDate: new Date().toISOString().split('T')[0],
    remarks: remarks || ''
  };
  
  // Auto Generate LOI
  const loiNumber = `TNU/HR/LOI/${new Date().getFullYear()}/${String(Math.floor(100 + Math.random() * 900))}`;
  cand.loiDetails = {
    loiNumber,
    issuedDate: new Date().toISOString().split('T')[0],
    offeredSalary: parseFloat(approvedSalary),
    offeredDesignation,
    acceptanceStatus: 'PENDING',
    acceptedDate: null,
    noticePeriodDays: 30,
    expectedDoj: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    verificationStatus: 'IN_PROGRESS',
    preOnboardingMilestones: {
      loiAccepted: false,
      policeBackgroundVerification: false,
      educationalCertsVerified: true,
      relievingLetterSubmitted: false,
      healthCheckupCleared: false,
      orientationDocketPrepared: false
    }
  };
  
  cand.selectionStage = 'LOI_ISSUED';
  
  logAudit({
    entityType: 'RECRUITMENT_LOI',
    entityId: cand.id,
    action: 'COST_APPROVAL_AND_LOI_GENERATED',
    actorName: approvedBy || 'Senior Management',
    actorRole: 'SENIOR_MANAGEMENT',
    newState: cand.loiDetails,
    remarks: `Approved ₹${approvedSalary}/month. Issued ${loiNumber}`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(cand);
});

// LOI Acceptance Tracking -> Transition to "Yet to Join"
app.put('/api/recruitment/candidates/:id/loi-status', (req, res) => {
  const db = getDb();
  const { acceptanceStatus, noticePeriodDays, expectedDoj } = req.body;
  const cand = (db.candidates || []).find(c => c.id === req.params.id);
  if (!cand || !cand.loiDetails) return res.status(404).json({ error: 'LOI not found for candidate' });
  
  cand.loiDetails.acceptanceStatus = acceptanceStatus;
  cand.loiDetails.acceptedDate = new Date().toISOString().split('T')[0];
  if (noticePeriodDays) cand.loiDetails.noticePeriodDays = parseInt(noticePeriodDays, 10);
  if (expectedDoj) cand.loiDetails.expectedDoj = expectedDoj;
  
  if (acceptanceStatus === 'ACCEPTED') {
    cand.selectionStage = 'YET_TO_JOIN';
    cand.loiDetails.preOnboardingMilestones.loiAccepted = true;
  } else {
    cand.selectionStage = 'OFFER_DECLINED';
  }
  
  logAudit({
    entityType: 'RECRUITMENT_LOI',
    entityId: cand.id,
    action: `LOI_${acceptanceStatus}`,
    actorName: cand.fullName,
    actorRole: 'CANDIDATE',
    newState: cand.loiDetails,
    remarks: `Candidate ${acceptanceStatus.toLowerCase()} LOI. Notice period: ${cand.loiDetails.noticePeriodDays} days.`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(cand);
});

// Update Pre-Onboarding Milestone
app.put('/api/recruitment/candidates/:id/milestone', (req, res) => {
  const db = getDb();
  const { milestoneKey, value } = req.body;
  const cand = (db.candidates || []).find(c => c.id === req.params.id);
  if (!cand || !cand.loiDetails) return res.status(404).json({ error: 'Candidate LOI details not found' });
  
  if (!cand.loiDetails.preOnboardingMilestones) {
    cand.loiDetails.preOnboardingMilestones = {};
  }
  cand.loiDetails.preOnboardingMilestones[milestoneKey] = Boolean(value);
  
  persistDb();
  res.json(cand);
});

// 1-Click Convert Candidate to Joined Employee (Seamless Integration with Module I & Module III)
app.post('/api/recruitment/candidates/:id/convert-to-employee', (req, res) => {
  const db = getDb();
  const cand = (db.candidates || []).find(c => c.id === req.params.id);
  if (!cand) return res.status(404).json({ error: 'Candidate not found' });
  if (cand.selectionStage !== 'YET_TO_JOIN') return res.status(400).json({ error: 'Candidate must be in Yet to Join status' });
  
  const mrf = (db.manpowerRequisitions || []).find(m => m.id === cand.mrfId);
  const department = mrf ? mrf.department : 'General';
  const school = mrf ? mrf.school : 'University Administration';
  const newEmpId = `EMP-${String((db.employees?.length || 0) + 1).padStart(3, '0')}`;
  const empCode = `TNU-${cand.positionType === 'ACADEMIC' ? 'FAC' : 'NONFAC'}-${String((db.employees?.length || 0) + 1).padStart(3, '0')}`;
  
  // Default reporting authority based on dept
  const reportingAuth = db.employees.find(e => e.department === department && (e.role === 'HOD' || e.role === 'DEAN')) || db.employees.find(e => e.id === 'EMP-001');
  
  const newEmployee = {
    id: newEmpId,
    empCode,
    name: cand.fullName,
    email: cand.email,
    phone: cand.phone,
    role: cand.positionType === 'ACADEMIC' ? 'FACULTY' : 'NON_FACULTY',
    category: cand.positionType === 'ACADEMIC' ? 'FACULTY' : 'NON_FACULTY',
    designation: cand.loiDetails?.offeredDesignation || 'Assistant Professor',
    level: cand.positionType === 'ACADEMIC' ? 'L-10' : 'L-7',
    department,
    school,
    location: 'Main Campus',
    reportingAuthorityId: reportingAuth?.id || 'EMP-001',
    reportingAuthorityName: reportingAuth?.name || 'Prof. (Dr.) B. N. Sengupta',
    salary: cand.loiDetails?.offeredSalary || 80000,
    doj: new Date().toISOString().split('T')[0],
    probationStatus: 'IN_PROBATION',
    probationEndDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    qualifications: cand.highestQualification,
    status: 'ACTIVE',
    digitalDossier: [
      { title: 'Resume & Application Docket', date: new Date().toISOString().split('T')[0], type: 'RECRUITMENT' },
      { title: `LOI Accepted: ${cand.loiDetails?.loiNumber}`, date: cand.loiDetails?.acceptedDate || new Date().toISOString().split('T')[0], type: 'OFFICIAL_ORDER' }
    ]
  };
  
  db.employees.push(newEmployee);
  cand.selectionStage = 'JOINED';
  cand.convertedEmployeeId = newEmpId;
  
  // Trigger Module III Track B Onboarding Goal Setting SLA (30 Days)
  if (!db.generalEmployeeGoals) db.generalEmployeeGoals = [];
  db.generalEmployeeGoals.push({
    id: `GOAL-${uuidv4().slice(0, 8)}`,
    employeeId: newEmpId,
    employeeName: newEmployee.name,
    designation: newEmployee.designation,
    department: newEmployee.department,
    doj: newEmployee.doj,
    goalSettingDeadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    submissionDate: null,
    slaAdherence: 'PENDING_WITHIN_30_DAYS',
    status: 'DRAFT',
    kpiItems: [],
    hrVerified: false,
    mgmtVerified: false
  });
  
  logAudit({
    entityType: 'RECRUITMENT_ONBOARDING',
    entityId: newEmpId,
    action: 'CANDIDATE_CONVERTED_TO_EMPLOYEE',
    actorName: 'HR Talent Acquisition',
    actorRole: 'HR_EXECUTIVE',
    newState: newEmployee,
    remarks: `Joined university. Provisioned in Central DB. Triggered 30-day Goal-setting in Module III.`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json({ success: true, employee: newEmployee, candidate: cand });
});

// ==========================================
// MODULE III: PERFORMANCE MANAGEMENT AUTOMATION
// TRACK A: GROUP-D / BAND I EMPLOYEES
// ==========================================

app.get('/api/performance/group-d/templates', (req, res) => {
  const db = getDb();
  res.json(db.groupDFormTemplates || []);
});

app.post('/api/performance/group-d/templates', (req, res) => {
  const db = getDb();
  const { roleName, kpis, competencies, version } = req.body;
  
  const newTemplate = {
    id: `TPL-GRPD-${uuidv4().slice(0, 6).toUpperCase()}`,
    roleName,
    version: version || `v${((db.groupDFormTemplates?.length || 0) + 1)}.0 (2026)`,
    kpis: kpis || [],
    competencies: competencies || []
  };
  
  if (!db.groupDFormTemplates) db.groupDFormTemplates = [];
  db.groupDFormTemplates.push(newTemplate);
  
  logAudit({
    entityType: 'GROUP_D_TEMPLATE',
    entityId: newTemplate.id,
    action: 'TEMPLATE_CREATED_OR_VERSIONED',
    actorName: 'Head HR',
    actorRole: 'HEAD_HR',
    newState: newTemplate,
    remarks: `Configured standardized KPIs & Competencies for ${roleName}`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.status(201).json(newTemplate);
});

app.get('/api/performance/group-d/evaluations', (req, res) => {
  const db = getDb();
  const { monthYear, hodId, status } = req.query;
  let list = db.groupDMonthlyEvaluations || [];
  
  if (monthYear) {
    list = list.filter(e => e.monthYear === monthYear);
  }
  if (hodId) {
    list = list.filter(e => e.hodId === hodId);
  }
  if (status) {
    list = list.filter(e => e.status === status);
  }
  
  res.json(list);
});

// HOD Completes and Submits Monthly Evaluation Online (Checks 7th & 10th grace deadlines)
app.post('/api/performance/group-d/evaluations/:id/submit', (req, res) => {
  const db = getDb();
  const { kpiScores, competencyScores, hodComments, positiveObservations, negativeObservations } = req.body;
  const ev = (db.groupDMonthlyEvaluations || []).find(e => e.id === req.params.id);
  if (!ev) return res.status(404).json({ error: 'Evaluation form not found' });
  
  if (ev.isAutoLocked) {
    return res.status(403).json({ error: 'Submission locked! Form exceeded grace period (10th of the month).' });
  }
  
  // Calculate scores
  let totalKpi = 0;
  kpiScores.forEach(k => { totalKpi += parseFloat(k.score) || 0; });
  let totalComp = 0;
  competencyScores.forEach(c => { totalComp += parseFloat(c.score) || 0; });
  
  ev.kpiScores = kpiScores;
  ev.competencyScores = competencyScores;
  ev.totalKpiScore = totalKpi;
  ev.totalCompetencyScore = totalComp;
  ev.overallCompositeScore = Math.round(((totalKpi + totalComp) / 2) * 10) / 10;
  ev.hodComments = hodComments || '';
  ev.positiveObservations = positiveObservations || '';
  ev.negativeObservations = negativeObservations || '';
  ev.submissionDate = new Date().toISOString();
  ev.status = 'SUBMITTED_HOD';
  
  logAudit({
    entityType: 'GROUP_D_EVALUATION',
    entityId: ev.id,
    action: 'HOD_SUBMITTED_MONTHLY_FORM',
    actorName: ev.hodName,
    actorRole: 'HOD',
    newState: ev,
    remarks: `Submitted monthly evaluation for ${ev.employeeName}. Score: ${ev.overallCompositeScore}`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(ev);
});

// Vice President - Administration Sign-off / Approval
app.put('/api/performance/group-d/evaluations/:id/vp-approve', (req, res) => {
  const db = getDb();
  const { decision, remarks, approvedBy } = req.body;
  const ev = (db.groupDMonthlyEvaluations || []).find(e => e.id === req.params.id);
  if (!ev) return res.status(404).json({ error: 'Evaluation form not found' });
  
  if (decision === 'APPROVE') {
    ev.status = 'APPROVED_VP_ADMIN';
    ev.vpAdminApproval = {
      approvedBy: approvedBy || 'Mr. Amitabh Roy (VP - Administration)',
      approvedAt: new Date().toISOString(),
      remarks: remarks || ''
    };
    
    // Store directly into employee's digital dossier
    const emp = (db.employees || []).find(e => e.id === ev.employeeId);
    if (emp) {
      if (!emp.digitalDossier) emp.digitalDossier = [];
      emp.digitalDossier.push({
        title: `Monthly Appraisal Approved: ${ev.cycleMonth} (Score: ${ev.overallCompositeScore})`,
        date: new Date().toISOString().split('T')[0],
        type: 'APPRAISAL'
      });
    }
  } else {
    ev.status = 'REJECTED';
  }
  
  logAudit({
    entityType: 'GROUP_D_EVALUATION',
    entityId: ev.id,
    action: `VP_ADMIN_${decision}`,
    actorName: approvedBy || 'VP - Administration',
    actorRole: 'VICE_PRESIDENT_ADMIN',
    newState: ev,
    remarks: remarks || '',
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(ev);
});

// Monthly Collation & Annual Report for Group-D
app.get('/api/performance/group-d/reports/annual', (req, res) => {
  const db = getDb();
  res.json(db.groupDAnnualReports || []);
});

// Group-D Compensation Review Workflow (Mandatory Probation Check)
app.post('/api/performance/group-d/compensation-review', (req, res) => {
  const db = getDb();
  const { annualReportId, decision, percentageIncrease, remarks, approvedBy } = req.body;
  const ann = (db.groupDAnnualReports || []).find(a => a.id === annualReportId);
  if (!ann) return res.status(404).json({ error: 'Annual report not found' });
  
  const emp = (db.employees || []).find(e => e.id === ann.employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  
  // Enforce SOP rule: Check probation status
  if (emp.probationStatus !== 'COMPLETED') {
    return res.status(400).json({
      error: 'SOP Policy Violation: Compensation-change workflow cannot be activated unless the probation period is marked as mandatorily completed.'
    });
  }
  
  ann.managementReviewStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  ann.managementDecisionDate = new Date().toISOString();
  ann.managementNotes = remarks || '';
  
  if (decision === 'APPROVE') {
    const inc = parseFloat(percentageIncrease) || 10;
    const oldSalary = emp.salary;
    const newSalary = Math.round(oldSalary * (1 + inc / 100));
    emp.salary = newSalary;
    
    // Log audit
    logAudit({
      entityType: 'GROUP_D_COMPENSATION',
      entityId: ann.id,
      action: 'COMPENSATION_INCREMENT_APPLIED',
      actorName: approvedBy || 'Management Reviewer',
      actorRole: 'MANAGEMENT',
      previousState: { salary: oldSalary },
      newState: { salary: newSalary, percentageIncrease: inc },
      remarks: `Applied ${inc}% increment following annual review (Score: ${ann.annualWeightedAverageScore}).`,
      ip: getClientIp(req)
    });
  }
  
  persistDb();
  res.json({ success: true, annualReport: ann, employee: emp });
});

// ==========================================
// MODULE III TRACK B: GENERAL EMPLOYEES
// KRA/KPI, QUARTERLY REVIEW & ANNUAL APPRAISAL
// ==========================================

app.get('/api/performance/general/goals', (req, res) => {
  const db = getDb();
  res.json(db.generalEmployeeGoals || []);
});

app.post('/api/performance/general/goals', (req, res) => {
  const db = getDb();
  const { employeeId, kpiItems } = req.body;
  const goal = (db.generalEmployeeGoals || []).find(g => g.employeeId === employeeId);
  if (!goal) return res.status(404).json({ error: 'Goal record not found for employee' });
  
  goal.kpiItems = kpiItems;
  goal.submissionDate = new Date().toISOString().split('T')[0];
  goal.status = 'SUBMITTED';
  
  logAudit({
    entityType: 'EMPLOYEE_GOAL_SETTING',
    entityId: goal.id,
    action: 'KRA_KPIS_SUBMITTED',
    actorName: goal.employeeName,
    actorRole: 'EMPLOYEE',
    newState: goal,
    remarks: 'Submitted initial KRAs/KPIs within 30-day onboarding window.',
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(goal);
});

// HR & Management Goal Verification -> Lock Goals
app.put('/api/performance/general/goals/:id/verify', (req, res) => {
  const db = getDb();
  const { verifierType, verifierName } = req.body;
  const goal = (db.generalEmployeeGoals || []).find(g => g.id === req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal record not found' });
  
  if (verifierType === 'HR') {
    goal.hrVerified = true;
    goal.hrVerifiedBy = verifierName || 'Ms. Sunita Sharma';
    goal.status = 'HR_VERIFIED';
  } else if (verifierType === 'MANAGEMENT') {
    goal.mgmtVerified = true;
    goal.mgmtVerifiedBy = verifierName || 'Mr. Amitabh Roy';
    goal.status = 'MGMT_LOCKED';
    goal.lockedAt = new Date().toISOString();
  }
  
  logAudit({
    entityType: 'EMPLOYEE_GOAL_SETTING',
    entityId: goal.id,
    action: `GOALS_VERIFIED_${verifierType}`,
    actorName: verifierName || 'Authority',
    actorRole: verifierType,
    newState: goal,
    remarks: `Verified and locked goals.`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(goal);
});

app.get('/api/performance/general/quarterly', (req, res) => {
  const db = getDb();
  res.json(db.quarterlyReviews || []);
});

app.post('/api/performance/general/quarterly/:id/submit', (req, res) => {
  const db = getDb();
  const { achievements, selfScore } = req.body;
  const qr = (db.quarterlyReviews || []).find(q => q.id === req.params.id);
  if (!qr) return res.status(404).json({ error: 'Quarterly review not found' });
  
  qr.employeeAchievements = achievements;
  qr.selfScore = parseFloat(selfScore) || 85;
  qr.submittedAt = new Date().toISOString().split('T')[0];
  qr.status = 'SUBMITTED_TO_RA';
  
  logAudit({
    entityType: 'QUARTERLY_REVIEW',
    entityId: qr.id,
    action: 'EMPLOYEE_SUBMITTED_REVIEW',
    actorName: qr.employeeName,
    actorRole: 'EMPLOYEE',
    newState: qr,
    remarks: `Submitted ${qr.quarter} review.`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(qr);
});

// Reporting Authority Verification (Within 7 Days)
app.put('/api/performance/general/quarterly/:id/ra-verify', (req, res) => {
  const db = getDb();
  const { score, comments, verifiedBy } = req.body;
  const qr = (db.quarterlyReviews || []).find(q => q.id === req.params.id);
  if (!qr) return res.status(404).json({ error: 'Quarterly review not found' });
  
  qr.reportingAuthorityReview = {
    verifiedBy: verifiedBy || 'Reporting Authority',
    verifiedAt: new Date().toISOString().split('T')[0],
    score: parseFloat(score) || 90,
    comments: comments || ''
  };
  qr.status = 'SUBMITTED_TO_HR';
  
  logAudit({
    entityType: 'QUARTERLY_REVIEW',
    entityId: qr.id,
    action: 'REPORTING_AUTHORITY_VERIFIED',
    actorName: verifiedBy || 'Reporting Authority',
    actorRole: 'REPORTING_AUTHORITY',
    newState: qr,
    remarks: comments || '',
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(qr);
});

// HR Review on Quarterly Review
app.put('/api/performance/general/quarterly/:id/hr-review', (req, res) => {
  const db = getDb();
  const { recommendation, reviewedBy } = req.body;
  const qr = (db.quarterlyReviews || []).find(q => q.id === req.params.id);
  if (!qr) return res.status(404).json({ error: 'Quarterly review not found' });
  
  qr.hrReview = {
    reviewedBy: reviewedBy || 'Head HR',
    reviewedAt: new Date().toISOString().split('T')[0],
    recommendation: recommendation || ''
  };
  qr.status = 'SUBMITTED_TO_MGMT';
  
  persistDb();
  res.json(qr);
});

// Management Review on Quarterly Review
app.put('/api/performance/general/quarterly/:id/mgmt-review', (req, res) => {
  const db = getDb();
  const { decision, reviewedBy } = req.body;
  const qr = (db.quarterlyReviews || []).find(q => q.id === req.params.id);
  if (!qr) return res.status(404).json({ error: 'Quarterly review not found' });
  
  qr.mgmtReview = {
    reviewedBy: reviewedBy || 'Senior Management',
    reviewedAt: new Date().toISOString().split('T')[0],
    decision: decision || 'APPROVED'
  };
  qr.status = 'COMPLETED';
  
  persistDb();
  res.json(qr);
});

// Post-Q4 Annual Appraisal -> Integration with Module I (No re-entry required!)
app.post('/api/performance/general/sync-to-module-1', (req, res) => {
  const db = getDb();
  const { employeeId, changeType, proposedValue, justification, effectiveDate } = req.body;
  const emp = (db.employees || []).find(e => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  
  const reqNumber = `CR-${new Date().getFullYear()}-${String((db.changeRequests?.length || 0) + 1).padStart(3, '0')}`;
  
  const newChangeReq = {
    id: reqNumber,
    reqNumber,
    employeeId: emp.id,
    employeeName: emp.name,
    department: emp.department,
    changeType: changeType || 'SALARY_REVISION',
    changeField: changeType === 'SALARY_REVISION' ? 'salary' : 'designation',
    currentValue: String(emp[changeType === 'SALARY_REVISION' ? 'salary' : 'designation']),
    proposedValue,
    currentSecondaryValue: emp.level || '',
    proposedSecondaryValue: '',
    justification: justification || 'System-driven integration from successful completion of 4-Quarter Annual Appraisal.',
    effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
    status: 'PENDING_MANAGEMENT', // Pre-verified by HR during quarterly cycles!
    stage: 'MANAGEMENT_REVIEW',
    requestedBy: 'Automated Module III Appraisal Engine',
    requestedAt: new Date().toISOString(),
    hrStatus: 'APPROVED',
    hrReviewedBy: 'System Auto-Feed (Module III)',
    hrReviewedAt: new Date().toISOString(),
    hrRemarks: 'Generated automatically from completed Q1-Q4 appraisal cycle. All SLAs satisfied.',
    managementStatus: 'PENDING',
    managementReviewedBy: null,
    managementReviewedAt: null,
    managementRemarks: '',
    effectiveAppliedAt: null
  };
  
  if (!db.changeRequests) db.changeRequests = [];
  db.changeRequests.unshift(newChangeReq);
  
  logAudit({
    entityType: 'HR_CHANGE_REQUEST',
    entityId: newChangeReq.id,
    action: 'MODULE_III_TO_MODULE_I_SYNC',
    actorName: 'Appraisal Integration Engine',
    actorRole: 'SYSTEM',
    newState: newChangeReq,
    remarks: `Fed annual appraisal outcome directly into Module I as change request ${reqNumber}`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.status(201).json({ success: true, changeRequest: newChangeReq });
});

// ==========================================
// MODULE III TRACK C: FACULTY MEMBERS (ECM)
// ==========================================

app.get('/api/performance/faculty/eligibility', (req, res) => {
  const db = getDb();
  const faculties = (db.employees || []).filter(e => e.category === 'FACULTY');
  
  const eligibleList = faculties.map(f => {
    const dojDate = new Date(f.doj);
    const now = new Date(db.systemSettings.currentSimulatedDate || Date.now());
    const monthsSinceDoj = Math.floor((now - dojDate) / (1000 * 60 * 60 * 24 * 30.4375));
    const isProbationDone = f.probationStatus === 'COMPLETED';
    const isEligible = isProbationDone && monthsSinceDoj >= 12;
    
    return {
      employeeId: f.id,
      empCode: f.empCode,
      name: f.name,
      department: f.department,
      designation: f.designation,
      doj: f.doj,
      probationStatus: f.probationStatus,
      monthsSinceDoj,
      isEligible,
      routingToRegistrarDue: "10th of every month"
    };
  });
  
  res.json(eligibleList);
});

app.get('/api/performance/faculty/appraisals', (req, res) => {
  const db = getDb();
  res.json(db.facultyEcmAppraisals || []);
});

// Faculty Submits Self-Appraisal (Within 7 Working Days)
app.post('/api/performance/faculty/appraisals/:id/submit', (req, res) => {
  const db = getDb();
  const { selfAppraisalData } = req.body;
  const appItem = (db.facultyEcmAppraisals || []).find(a => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ error: 'Appraisal record not found' });
  
  appItem.selfAppraisalData = selfAppraisalData;
  appItem.selfAppraisalSubmittedDate = new Date().toISOString().split('T')[0];
  appItem.status = 'UNDER_VERIFICATION';
  
  logAudit({
    entityType: 'FACULTY_ECM_APPRAISAL',
    entityId: appItem.id,
    action: 'SELF_APPRAISAL_SUBMITTED',
    actorName: appItem.employeeName,
    actorRole: 'FACULTY',
    newState: appItem,
    remarks: 'Submitted self-appraisal form with teaching and research citations.',
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(appItem);
});

// Stakeholder Verification (School Dean, R&D Cell, Placement Cell, HR Dept) with Discrepancy Return Loop
app.put('/api/performance/faculty/appraisals/:id/verify', (req, res) => {
  const db = getDb();
  const { stakeholder, status, remarks, verifierName } = req.body;
  const appItem = (db.facultyEcmAppraisals || []).find(a => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ error: 'Appraisal record not found' });
  
  const item = (appItem.stakeholderVerifications || []).find(s => s.stakeholder === stakeholder);
  if (item) {
    item.status = status;
    item.remarks = remarks || '';
    item.verifiedAt = new Date().toISOString();
    if (verifierName) item.name = verifierName;
  }
  
  if (status === 'DISCREPANCY_FOUND') {
    appItem.status = 'DISCREPANCY_RETURNED_TO_FACULTY';
  } else {
    // Check if all verified
    const allDone = appItem.stakeholderVerifications.every(s => s.status === 'VERIFIED');
    if (allDone) {
      appItem.status = 'READY_FOR_ECM_SCHEDULING';
    }
  }
  
  logAudit({
    entityType: 'FACULTY_ECM_APPRAISAL',
    entityId: appItem.id,
    action: `STAKEHOLDER_VERIFICATION_${status}`,
    actorName: verifierName || stakeholder,
    actorRole: stakeholder,
    newState: appItem,
    remarks: remarks || '',
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(appItem);
});

// Registrar Schedules ECM
app.post('/api/performance/faculty/schedule-ecm', (req, res) => {
  const db = getDb();
  const { appraisalId, meetingDate, venueMode, committeeMembers } = req.body;
  const appItem = (db.facultyEcmAppraisals || []).find(a => a.id === appraisalId);
  if (!appItem) return res.status(404).json({ error: 'Appraisal record not found' });
  
  appItem.ecmMeeting = {
    scheduledBy: 'Dr. R. K. Mukherjee (Registrar)',
    scheduledDate: meetingDate,
    venueMode: venueMode || 'CONFERENCE_ROOM_A_AND_ONLINE',
    committeeMembers: committeeMembers || [
      'Prof. (Dr.) B. N. Sengupta (Vice-Chancellor - Chair)',
      'Dr. R. K. Mukherjee (Registrar - Secretary)',
      'Prof. P. K. Sinha (External Subject Expert - IIT)'
    ],
    status: 'SCHEDULED'
  };
  appItem.status = 'ECM_SCHEDULED';
  
  persistDb();
  res.json(appItem);
});

// Submit Digital ECM Score Sheet (TNU Protocol) & Compile Evaluation Matrix
app.post('/api/performance/faculty/ecm-score', (req, res) => {
  const db = getDb();
  const { appraisalId, teachingScore, researchScore, consultancyScore, institutionalScore, remarks } = req.body;
  const appItem = (db.facultyEcmAppraisals || []).find(a => a.id === appraisalId);
  if (!appItem) return res.status(404).json({ error: 'Appraisal record not found' });
  
  const t100 = parseFloat(teachingScore) || 90;
  const r100 = parseFloat(researchScore) || 90;
  const c50 = parseFloat(consultancyScore) || 45;
  const i50 = parseFloat(institutionalScore) || 45;
  const total = t100 + r100 + c50 + i50;
  const percentage = Math.round((total / 300) * 1000) / 10;
  
  appItem.digitalEcmScoreSheet = {
    teachingScore100: t100,
    researchScore100: r100,
    consultancyGrantScore50: c50,
    institutionalDevScore50: i50,
    totalTnuProtocolScore: total,
    tnuPercentage: percentage,
    committeeRemarks: remarks || 'Recommended by Evaluation Committee.'
  };
  
  appItem.evaluationMatrixCompiled = {
    previousIncrementDetails: 'Previous increment recorded in central service docket.',
    compiledDate: new Date().toISOString(),
    routedToManagementDate: new Date().toISOString()
  };
  
  appItem.status = 'AWAITING_MGMT_DECISION';
  
  logAudit({
    entityType: 'FACULTY_ECM_APPRAISAL',
    entityId: appItem.id,
    action: 'ECM_SCORES_COMPILED',
    actorName: 'Evaluation Committee',
    actorRole: 'EVALUATION_COMMITTEE',
    newState: appItem.digitalEcmScoreSheet,
    remarks: `TNU Score: ${total}/300 (${percentage}%). Routed to Management.`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json(appItem);
});

// Management Decision, Official Letter Generation & HR/Payroll Implementation
app.post('/api/performance/faculty/mgmt-decision', (req, res) => {
  const db = getDb();
  const { appraisalId, decisionType, newDesignation, newSalary, salaryIncrease, remarks, decidedBy } = req.body;
  const appItem = (db.facultyEcmAppraisals || []).find(a => a.id === appraisalId);
  if (!appItem) return res.status(404).json({ error: 'Appraisal record not found' });
  
  const letterRef = `TNU/REG/ECM/${new Date().getFullYear()}/${String(Math.floor(100 + Math.random() * 900))}`;
  
  appItem.managementDecision = {
    decisionType,
    newDesignation: newDesignation || '',
    newMonthlySalary: parseFloat(newSalary) || 0,
    salaryIncreaseAmount: parseFloat(salaryIncrease) || 0,
    effectiveSalaryCycleMonth: 'Next Applicable Cycle',
    decidedBy: decidedBy || 'Prof. (Dr.) B. N. Sengupta (Vice-Chancellor)',
    decisionDate: new Date().toISOString(),
    remarks: remarks || '',
    officialLetterGenerated: true,
    letterReferenceNumber: letterRef,
    routedToPayroll: true,
    payrollRoutingDate: new Date().toISOString()
  };
  
  appItem.status = 'COMPLETED';
  
  // Store into faculty personal file
  const emp = (db.employees || []).find(e => e.id === appItem.employeeId);
  if (emp) {
    if (!emp.digitalDossier) emp.digitalDossier = [];
    emp.digitalDossier.push({
      title: `ECM Appraisal Decision Letter: Ref ${letterRef}`,
      date: new Date().toISOString().split('T')[0],
      type: 'ECM_OFFICIAL_ORDER'
    });
    
    // If confirmation or salary change
    if (newSalary) emp.salary = parseFloat(newSalary);
    if (newDesignation) emp.designation = newDesignation;
  }
  
  logAudit({
    entityType: 'FACULTY_ECM_APPRAISAL',
    entityId: appItem.id,
    action: `ECM_MGMT_DECISION_${decisionType}`,
    actorName: decidedBy || 'Vice-Chancellor',
    actorRole: 'SENIOR_MANAGEMENT',
    newState: appItem.managementDecision,
    remarks: `Generated official letter ${letterRef} and routed to HR/Payroll.`,
    ip: getClientIp(req)
  });
  
  persistDb();
  res.json({ success: true, appraisal: appItem, letterReference: letterRef });
});

// Serve frontend client in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.use((req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏛️ THE NEOTIA UNIVERSITY (TNU) — ENTERPRISE HRMS & ERP`);
  console.log(`💻 Lead Developer & Architect: ABHAY`);
  console.log(`🚀 System is active on http://localhost:${PORT}`);
  console.log(`📊 Health Probe: http://localhost:${PORT}/api/health`);
  console.log(`📈 Metrics Probe: http://localhost:${PORT}/api/metrics`);
  console.log(`=======================================================`);
});
