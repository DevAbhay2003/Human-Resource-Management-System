import React from 'react';
import { X, Bell, Check, AlertCircle, Info, Calendar } from 'lucide-react';
import { api } from '../services/api';

export default function NotificationCenterModal({ isOpen, onClose, notifications, onRefresh }) {
  if (!isOpen) return null;

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold">University SOP Alerts & Reminders</h2>
              <p className="text-xs text-slate-400">Automated cycle intimations and SLA notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {(!notifications || notifications.length === 0) ? (
            <div className="text-center py-10 text-slate-400 text-xs">No active notifications.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border text-xs transition flex items-start justify-between gap-3 ${
                  n.read ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-blue-50/70 border-blue-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  {n.type === 'DEADLINE_WARNING' ? (
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  ) : n.type === 'ACTION_REQUIRED' ? (
                    <Calendar className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-slate-900">{n.title}</div>
                    <p className="mt-0.5 text-slate-600 leading-relaxed">{n.message}</p>
                    <div className="mt-1 text-[10px] text-slate-400">
                      {new Date(n.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
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
