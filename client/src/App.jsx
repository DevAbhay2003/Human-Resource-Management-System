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
import { ShieldCheck, Heart, Building2, CheckCircle2, Code2, Sparkles, MapPin } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900 selection:bg-[#c62828] selection:text-white">
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
      />

      {/* Main Content Area */}
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

      {/* Institutional Footer Personalized with Official TNU Branding and Abhay's Signature */}
      <footer className="bg-[#001f3f] text-slate-300 border-t-2 border-[#c62828] text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
            {/* Logo and Name */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-white rounded-lg p-1 flex items-center justify-center shadow-xs">
                <img src="/assets/tnu-logo.jpg" alt="TNU" className="h-8 w-auto object-contain" />
              </div>
              <div>
                <span className="font-black text-white text-sm tracking-wide">THE NEOTIA UNIVERSITY</span>
                <p className="text-[11px] text-slate-400">
                  Established under West Bengal State Act XXIII of 2014 • Recognized by UGC
                </p>
              </div>
            </div>

            {/* Developer Signature Box by Abhay */}
            <div className="px-4 py-2 bg-slate-900/90 rounded-lg border border-indigo-500/40 shadow-sm flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                A
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Lead Developer & Architect</div>
                <div className="text-sm font-black text-white flex items-center space-x-1">
                  <span>Abhay</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 ml-1 inline" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>Campus: Sarisa, D.H. Road, 24 Parganas (South), West Bengal 743368</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Modules I, II & III SOP Compliant</span>
              </span>
              <span>•</span>
              <span className="text-slate-400">Developed with precision by <strong className="text-white">Abhay</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
