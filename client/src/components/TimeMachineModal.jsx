import React, { useState } from 'react';
import { X, Clock, Play, CheckCircle2, AlertTriangle, FastForward } from 'lucide-react';
import { api } from '../services/api';

export default function TimeMachineModal({ isOpen, onClose, simulatedDate, onDateChanged }) {
  const [selectedDate, setSelectedDate] = useState(simulatedDate?.split('T')[0] || '2026-10-03');
  const [loading, setLoading] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);

  if (!isOpen) return null;

  const handleSimulate = async (actionType = 'ADVANCE_TIME') => {
    setLoading(true);
    try {
      const res = await api.timeWarp({
        newDate: selectedDate,
        action: actionType
      });
      if (res.success) {
        setExecutionLogs(res.executionLogs || ['Simulated date updated successfully. All SOP rules checked.']);
        if (onDateChanged) onDateChanged(res.currentSimulatedDate);
      }
    } catch (err) {
      console.error(err);
      setExecutionLogs(['Failed executing time warp simulation.']);
    } finally {
      setLoading(false);
    }
  };

  const presetDates = [
    {
      title: 'Current Starting Date (03 Oct 2026)',
      date: '2026-10-03',
      desc: 'System baseline, active requisitions, open Group-D monthly evaluations.'
    },
    {
      title: 'Group-D Due Date (07 Oct 2026)',
      date: '2026-10-07',
      desc: 'Enforces 7th submission deadline; system issues automated reminder alerts.'
    },
    {
      title: 'Group-D Grace Period Deadline & Auto-Lock (11 Oct 2026)',
      date: '2026-10-11',
      desc: 'Grace period (up to 10th) expired. Enforces automated system lock on unsubmitted evaluations!'
    },
    {
      title: 'Faculty Monthly Routing Day (10 Oct 2026)',
      date: '2026-10-10',
      desc: 'Auto-generates eligible faculty list and routes to Office of Registrar.'
    },
    {
      title: 'Module I Future Effective Date Trigger (01 Nov 2026)',
      date: '2026-11-01',
      desc: 'CR-2026-001 reaches effective date: automatically updates Dr. Ananya Sen to Associate Professor in DB and Org Chart!'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-100 animate-spin" style={{ animationDuration: '6s' }} />
            <div>
              <h2 className="text-base font-bold">University SOP Time Machine & Policy Automator</h2>
              <p className="text-xs text-amber-100">Simulate date progression to test automated deadlines, auto-locks & effective dates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-amber-100 hover:text-white hover:bg-amber-700/50 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Active Date Selector */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Custom Target Simulation Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div className="flex space-x-2 w-full sm:w-auto">
              <button
                onClick={() => handleSimulate('ADVANCE_TIME')}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md shadow-xs transition"
              >
                <FastForward className="w-4 h-4" />
                <span>{loading ? 'Simulating...' : 'Apply Simulated Date'}</span>
              </button>
              <button
                onClick={() => handleSimulate('TRIGGER_MONTHLY_LOCK')}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow-xs transition"
                title="Force execute 10th grace period auto-lock on any pending Group-D evaluation"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Force Auto-Lock</span>
              </button>
            </div>
          </div>

          {/* Preset SOP Workflow Scenarios */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              One-Click SOP Test Scenarios (from Narrative SOP Documents)
            </h3>
            <div className="space-y-2">
              {presetDates.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(item.date)}
                  className={`p-3 rounded-lg border transition cursor-pointer flex items-start justify-between ${
                    selectedDate === item.date
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded-md font-semibold">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(item.date);
                      setTimeout(() => handleSimulate('ADVANCE_TIME'), 50);
                    }}
                    className="ml-3 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-md transition whitespace-nowrap"
                  >
                    Jump & Run
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Output Logs */}
          {executionLogs.length > 0 && (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs space-y-1 border border-slate-800">
              <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SOP Scheduler Execution Output:</span>
              </div>
              {executionLogs.map((log, i) => (
                <div key={i} className="text-slate-300">
                  <span className="text-amber-400">&gt;</span> {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
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
