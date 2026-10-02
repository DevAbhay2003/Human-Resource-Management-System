import React, { useState, useEffect } from 'react';
import { X, History, Filter, Search, Download, ShieldCheck, ChevronRight, ChevronDown } from 'lucide-react';
import { api } from '../services/api';

export default function AuditTrailModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, selectedEntity]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs({ entityType: selectedEntity || undefined });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredLogs = logs.filter(l => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.id.toLowerCase().includes(q) ||
      l.actorName.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.remarks.toLowerCase().includes(q) ||
      l.entityId.toLowerCase().includes(q)
    );
  });

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `TNU_HRMS_AuditTrail_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold">University Statutory Audit Trail & Version History</h2>
              <p className="text-xs text-slate-400">Complete immutable record of all workflow transitions, approvals and policy decisions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportToJson}
              className="flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-md transition"
              title="Download audit records as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Actor, Entity ID, Action, or Remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="">All Entity Workflows</option>
              <option value="HR_CHANGE_REQUEST">Module I: Change Requests</option>
              <option value="EMPLOYEE_RECORD">Module I: Central Employee DB</option>
              <option value="MANPOWER_REQUISITION">Module II: Manpower Requisitions</option>
              <option value="RECRUITMENT_CV">Module II: CV Database & Sourcing</option>
              <option value="RECRUITMENT_LOI">Module II: LOI & Pre-Onboarding</option>
              <option value="GROUP_D_EVALUATION">Module III: Group-D Evaluations</option>
              <option value="EMPLOYEE_GOAL_SETTING">Module III: General Goals</option>
              <option value="QUARTERLY_REVIEW">Module III: Quarterly Reviews</option>
              <option value="FACULTY_ECM_APPRAISAL">Module III: Faculty ECM</option>
            </select>
          </div>
        </div>

        {/* Logs Timeline List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-xs">Loading audit trail records...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">No audit logs matching criteria.</div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const formattedTime = new Date(log.timestamp).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'medium'
              });

              return (
                <div
                  key={log.id}
                  className="bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition text-xs shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2">
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="mt-0.5 text-slate-400 hover:text-slate-700 transition"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                            {log.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {log.entityType}
                          </span>
                          <span className="font-bold text-slate-800">{log.action}</span>
                        </div>
                        <p className="mt-1 text-slate-600">{log.remarks}</p>
                        <div className="mt-2 flex items-center space-x-3 text-[11px] text-slate-400 flex-wrap">
                          <span>
                            Actor: <strong className="text-slate-700">{log.actorName}</strong> ({log.actorRole})
                          </span>
                          <span>•</span>
                          <span>Target: <strong className="text-slate-700">{log.entityId}</strong></span>
                          <span>•</span>
                          <span>IP: <span className="font-mono">{log.ip}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap text-[11px] text-slate-400 font-mono">
                      {formattedTime}
                    </div>
                  </div>

                  {/* Expanded JSON State Diff */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {log.previousState && (
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Previous State:</div>
                          <pre className="bg-slate-900 text-amber-300 p-2 rounded text-[10px] overflow-x-auto max-h-40">
                            {JSON.stringify(log.previousState, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.newState && (
                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">New State:</div>
                          <pre className="bg-slate-900 text-emerald-300 p-2 rounded text-[10px] overflow-x-auto max-h-40">
                            {JSON.stringify(log.newState, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredLogs.length} audit trail records</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
