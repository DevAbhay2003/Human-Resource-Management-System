/**
 * =========================================================================================
 * THE NEOTIA UNIVERSITY (TNU) — ENTERPRISE HRMS & ERP AUTOMATION SYSTEM
 * 
 * Lead Developer & System Architect: ABHAY
 * Implementation: Modules I, II & III SOP Workflows & Production DevOps
 * Campus: Sarisa, D.H. Road, 24 Parganas (South), West Bengal 743368
 * =========================================================================================
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Module1ChangeManagement from './components/Module1ChangeManagement';
import Module2Recruitment from './components/Module2Recruitment';
import Module3Performance from './components/Module3Performance';
import CareerPortal from './components/CareerPortal';
import DevOpsDashboard from './components/DevOpsDashboard';
import TimeMachineModal from './components/TimeMachineModal';
import AuditTrailModal from './components/AuditTrailModal';
import NotificationCenterModal from './components/NotificationCenterModal';
import { api } from './services/api';
import { 
  ShieldCheck, 
  Heart, 
  Building2, 
  CheckCircle2, 
  Code2, 
  Sparkles, 
  MapPin,
  AlertCircle,
  Info,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('module1');
  const [currentPersona, setCurrentPersona] = useState({
    id: 'HEAD_HR',
    role: 'Head - Human Resources',
    name: 'Ms. Sunita Sharma',
    badge: 'bg-emerald-100 text-emerald-800'
  });

  const [simulatedDate, setSimulatedDate] = useState('2026-10-03T09:00:00.000Z');
  const [notifications, setNotifications] = useState([]);
  
  // Interactive Toast State
  const [toast, setToast] = useState(null);

  // Modals state
  const [isTimeMachineOpen, setIsTimeMachineOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    loadSettingsAndNotifs();
  }, []);

  const loadSettingsAndNotifs = async () => {
    try {
      const [settings, notifs] = await Promise.all([
        api.getSettings(),
        api.getNotifications()
      ]);
      if (settings?.currentSimulatedDate) {
        setSimulatedDate(settings.currentSimulatedDate);
      }
      setNotifications(notifs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handleDateChanged = (newDate) => {
    setSimulatedDate(newDate);
    loadSettingsAndNotifs();
    showToast(`Time Warp updated to ${new Date(newDate).toLocaleDateString('en-IN')}`, 'info');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans text-slate-900 selection:bg-[#c62828] selection:text-white relative">
      {/* Interactive Global Toast Notification Popup */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full toast-slide">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-start justify-between gap-3 ${
            toast.type === 'error' ? 'bg-red-900 text-white border-red-700' :
            toast.type === 'info' ? 'bg-blue-900 text-white border-blue-700' :
            'bg-slate-900 text-white border-slate-700'
          }`}>
            <div className="flex items-start space-x-3">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              ) : toast.type === 'info' ? (
                <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">System Notification</div>
                <div className="text-xs font-semibold text-slate-100 mt-0.5 leading-relaxed">{toast.message}</div>
              </div>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header with Official Logo and Developer Signature */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPersona={currentPersona}
        setCurrentPersona={setCurrentPersona}
        simulatedDate={simulatedDate}
        onOpenTimeMachine={() => setIsTimeMachineOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotifsCount={unreadCount}
        onShowToast={showToast}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'module1' && (
          <Module1ChangeManagement currentPersona={currentPersona} onShowToast={showToast} />
        )}
        {activeTab === 'module2' && (
          <Module2Recruitment currentPersona={currentPersona} onShowToast={showToast} />
        )}
        {activeTab === 'module3' && (
          <Module3Performance currentPersona={currentPersona} onShowToast={showToast} />
        )}
        {activeTab === 'career' && (
          <CareerPortal onShowToast={showToast} />
        )}
        {activeTab === 'devops' && (
          <DevOpsDashboard onShowToast={showToast} />
        )}
      </main>

      {/* Modals */}
      <TimeMachineModal
        isOpen={isTimeMachineOpen}
        onClose={() => setIsTimeMachineOpen(false)}
        simulatedDate={simulatedDate}
        onDateChanged={handleDateChanged}
      />

      <AuditTrailModal
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
      />

      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onRefresh={loadSettingsAndNotifs}
      />

      {/* Institutional Footer Personalized with Official TNU Branding and Abhay's Signature */}
      <footer className="bg-[#001f3f] text-slate-300 border-t-4 border-[#c62828] text-xs py-10 mt-12 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
            {/* Logo and Name */}
            <div className="flex items-center space-x-3.5">
              <div className="h-12 w-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-md">
                <img src="/assets/tnu-logo.jpg" alt="TNU" className="h-10 w-auto object-contain" />
              </div>
              <div>
                <span className="font-black text-white text-base tracking-wide block">THE NEOTIA UNIVERSITY</span>
                <p className="text-[11px] text-slate-400">
                  Established under West Bengal State Act XXIII of 2014 • Approved under Sec. 2(f) of UGC Act 1956
                </p>
              </div>
            </div>

            {/* Developer Signature Box by Abhay */}
            <div className="px-5 py-2.5 bg-slate-900/90 rounded-xl border border-indigo-400/50 shadow-md flex items-center space-x-3.5 hover:border-indigo-400 transition cursor-default">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-inner">
                A
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">System Architect & Developer</div>
                <div className="text-sm font-black text-white flex items-center space-x-1">
                  <span>Abhay</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 ml-1 inline" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <span>Campus: Sarisa, D.H. Road, 24 Parganas (South), West Bengal 743368</span>
            </div>

            <div className="flex items-center space-x-3 flex-wrap">
              <span className="text-emerald-400 font-semibold flex items-center space-x-1 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Modules I, II & III SOP Compliant</span>
              </span>
              <span>•</span>
              <span className="text-slate-400">Engineered by <strong className="text-white">Abhay</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
