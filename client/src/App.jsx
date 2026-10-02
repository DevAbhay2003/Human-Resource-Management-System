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
import { ShieldCheck, Heart, Building2, CheckCircle2 } from 'lucide-react';

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

  const handleDateChanged = (newDate) => {
    setSimulatedDate(newDate);
    loadSettingsAndNotifs();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Header */}
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
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'module1' && (
          <Module1ChangeManagement currentPersona={currentPersona} />
        )}
        {activeTab === 'module2' && (
          <Module2Recruitment currentPersona={currentPersona} />
        )}
        {activeTab === 'module3' && (
          <Module3Performance currentPersona={currentPersona} />
        )}
        {activeTab === 'career' && (
          <CareerPortal />
        )}
        {activeTab === 'devops' && (
          <DevOpsDashboard />
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

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-slate-200">The Neotia University — Official Enterprise HRMS & ERP Automation Portal</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center space-x-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SOP Compliant (Modules I, II, III)</span>
            </span>
            <span>•</span>
            <span>UGC & NAAC Statutory Norms Aligned</span>
            <span>•</span>
            <span className="font-mono text-slate-500">v2.5.0-prod</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
