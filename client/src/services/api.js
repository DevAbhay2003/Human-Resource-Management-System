const API_BASE = '/api';

export const api = {
  // System & DevOps
  getHealth: () => fetch(`${API_BASE}/health`).then(r => r.json()),
  getSettings: () => fetch(`${API_BASE}/settings`).then(r => r.json()),
  timeWarp: (data) => fetch(`${API_BASE}/settings/time-warp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/audit-logs?${query}`).then(r => r.json());
  },
  getNotifications: () => fetch(`${API_BASE}/notifications`).then(r => r.json()),
  markNotificationRead: (id) => fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' }).then(r => r.json()),

  // Module I: Employees & Change Management
  getEmployees: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/employees?${query}`).then(r => r.json());
  },
  getEmployeeById: (id) => fetch(`${API_BASE}/employees/${id}`).then(r => r.json()),
  getOrgChart: () => fetch(`${API_BASE}/org-chart`).then(r => r.json()),
  getChangeRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/change-requests?${query}`).then(r => r.json());
  },
  createChangeRequest: (data) => fetch(`${API_BASE}/change-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  hrReviewChangeRequest: (id, data) => fetch(`${API_BASE}/change-requests/${id}/hr-review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  mgmtReviewChangeRequest: (id, data) => fetch(`${API_BASE}/change-requests/${id}/mgmt-review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  applyEffectiveChangeRequest: (id) => fetch(`${API_BASE}/change-requests/${id}/apply-effective`, {
    method: 'POST'
  }).then(r => r.json()),
  getChangeManagementReport: () => fetch(`${API_BASE}/reports/change-management`).then(r => r.json()),

  // Module II: Recruitment & Selection
  getMrfs: () => fetch(`${API_BASE}/recruitment/mrf`).then(r => r.json()),
  createMrf: (data) => fetch(`${API_BASE}/recruitment/mrf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  vetMrf: (id, data) => fetch(`${API_BASE}/recruitment/mrf/${id}/vetting`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  approveMrf: (id, data) => fetch(`${API_BASE}/recruitment/mrf/${id}/approval`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  getOpenPositions: () => fetch(`${API_BASE}/recruitment/open-positions`).then(r => r.json()),
  getCandidates: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/recruitment/candidates?${query}`).then(r => r.json());
  },
  submitCandidateApplication: (data) => fetch(`${API_BASE}/recruitment/candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  updateRcs: (id, data) => fetch(`${API_BASE}/recruitment/candidates/${id}/rcs`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  mgmtInterviewClearance: (id, data) => fetch(`${API_BASE}/recruitment/candidates/${id}/mgmt-clearance`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  evaluateCandidate: (id, data) => fetch(`${API_BASE}/recruitment/candidates/${id}/evaluate`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  mgmtCostApproval: (id, data) => fetch(`${API_BASE}/recruitment/candidates/${id}/mgmt-cost-approval`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  updateLoiStatus: (id, data) => fetch(`${API_BASE}/recruitment/candidates/${id}/loi-status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  updateMilestone: (id, data) => fetch(`${API_BASE}/recruitment/candidates/${id}/milestone`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  convertCandidateToEmployee: (id) => fetch(`${API_BASE}/recruitment/candidates/${id}/convert-to-employee`, {
    method: 'POST'
  }).then(r => r.json()),

  // Module III Track A: Group-D
  getGroupDTemplates: () => fetch(`${API_BASE}/performance/group-d/templates`).then(r => r.json()),
  createGroupDTemplate: (data) => fetch(`${API_BASE}/performance/group-d/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  getGroupDEvaluations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/performance/group-d/evaluations?${query}`).then(r => r.json());
  },
  submitGroupDEvaluation: (id, data) => fetch(`${API_BASE}/performance/group-d/evaluations/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  vpApproveGroupD: (id, data) => fetch(`${API_BASE}/performance/group-d/evaluations/${id}/vp-approve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  getGroupDAnnualReports: () => fetch(`${API_BASE}/performance/group-d/reports/annual`).then(r => r.json()),
  groupDCompensationReview: (data) => fetch(`${API_BASE}/performance/group-d/compensation-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Module III Track B: General Employees
  getGeneralGoals: () => fetch(`${API_BASE}/performance/general/goals`).then(r => r.json()),
  submitGeneralGoals: (data) => fetch(`${API_BASE}/performance/general/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  verifyGeneralGoals: (id, data) => fetch(`${API_BASE}/performance/general/goals/${id}/verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  getGeneralQuarterlyReviews: () => fetch(`${API_BASE}/performance/general/quarterly`).then(r => r.json()),
  submitGeneralQuarterlyReview: (id, data) => fetch(`${API_BASE}/performance/general/quarterly/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  raVerifyQuarterlyReview: (id, data) => fetch(`${API_BASE}/performance/general/quarterly/${id}/ra-verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  hrReviewQuarterlyReview: (id, data) => fetch(`${API_BASE}/performance/general/quarterly/${id}/hr-review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  mgmtReviewQuarterlyReview: (id, data) => fetch(`${API_BASE}/performance/general/quarterly/${id}/mgmt-review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  syncGeneralAppraisalToModule1: (data) => fetch(`${API_BASE}/performance/general/sync-to-module-1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Module III Track C: Faculty ECM
  getFacultyEligibility: () => fetch(`${API_BASE}/performance/faculty/eligibility`).then(r => r.json()),
  getFacultyAppraisals: () => fetch(`${API_BASE}/performance/faculty/appraisals`).then(r => r.json()),
  submitFacultySelfAppraisal: (id, data) => fetch(`${API_BASE}/performance/faculty/appraisals/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  verifyFacultyAppraisal: (id, data) => fetch(`${API_BASE}/performance/faculty/appraisals/${id}/verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  scheduleFacultyEcm: (data) => fetch(`${API_BASE}/performance/faculty/schedule-ecm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  submitFacultyEcmScore: (data) => fetch(`${API_BASE}/performance/faculty/ecm-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  submitFacultyMgmtDecision: (data) => fetch(`${API_BASE}/performance/faculty/mgmt-decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json())
};
