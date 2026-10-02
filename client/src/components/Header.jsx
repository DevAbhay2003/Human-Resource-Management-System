import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  Bell, 
  ShieldCheck, 
  History, 
  UserCheck, 
  Terminal, 
  Layers, 
  Users, 
  Briefcase, 
  Award, 
  Globe,
  Code2,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Activity
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  currentPersona, 
  setCurrentPersona, 
  simulatedDate, 
  onOpenTimeMachine, 
  onOpenAuditLogs, 
  onOpenNotifications, 
  unreadNotifsCount,
  onShowToast
}) {
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);

  const personas = [
    { id: 'VC', role: 'Senior Management / Vice-Chancellor', name: 'Prof. (Dr.) B. N. Sengupta', badge: 'bg-purple-100 text-purple-800' },
    { id: 'VP_ADMIN', role: 'Vice President - Administration', name: 'Mr. Amitabh Roy', badge: 'bg-indigo-100 text-indigo-800' },
    { id: 'REGISTRAR', role: 'Registrar', name: 'Dr. R. K. Mukherjee', badge: 'bg-sky-100 text-sky-800' },
    { id: 'HEAD_HR', role: 'Head - Human Resources', name: 'Ms. Sunita Sharma', badge: 'bg-emerald-100 text-emerald-800' },
    { id: 'DEAN', role: 'Dean - School of Engineering', name: 'Prof. (Dr.) Alok Chatterjee', badge: 'bg-blue-100 text-blue-800' },
    { id: 'HOD', role: 'HOD - Computer Science', name: 'Dr. Debasis Roy', badge: 'bg-amber-100 text-amber-800' },
    { id: 'FACULTY', role: 'Faculty Member', name: 'Dr. Ananya Sen', badge: 'bg-teal-100 text-teal-800' },
    { id: 'NON_FACULTY', role: 'General Employee (IT)', name: 'Mr. Subhashis Das', badge: 'bg-slate-100 text-slate-800' },
    { id: 'CANDIDATE', role: 'Prospective Applicant', name: 'Public Candidate', badge: 'bg-rose-100 text-rose-800' }
  ];

  const formattedDate = new Date(simulatedDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs transition-all">
      {/* Top Banner with University Identity & System Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* University Brand with Official TNU Logo */}
        <div className="flex items-center space-x-3.5">
          <div className="h-13 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm flex items-center justify-center shrink-0 hover:shadow-md transition">
            <img 
              src="/assets/tnu-logo.jpg" 
              alt="The Neotia University Logo" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xl font-black tracking-tight text-[#003366] hover:text-[#002244] transition cursor-pointer">
                THE NEOTIA UNIVERSITY
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 rounded-full border border-red-200">
                UGC Sec. 2(f)
              </span>
              <span className="hidden lg:inline text-xs font-serif italic text-slate-500">
                "ज्ञानम् आत्म प्रदीपाय"
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium mt-0.5">
              <span>Enterprise HRMS & ERP SOP Automation Portal</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center space-x-1 text-emerald-600 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Live ERP System Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Developer Signature, Simulated Clock, Persona, Audit, Notifications */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 flex-wrap">
          {/* Developer Signature Badge by Abhay */}
          <div 
            onClick={() => onShowToast && onShowToast("Software Architect: Abhay (DevOps & Fullstack)", "info")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-200/80 rounded-full text-blue-900 text-xs font-bold shadow-2xs hover:shadow-sm transition cursor-pointer"
            title="System engineered and built by Abhay"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Dev: <strong className="text-indigo-700 font-black">Abhay</strong></span>
          </div>

          {/* Time Machine Trigger Button */}
          <button
            onClick={onOpenTimeMachine}
            className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-900 text-xs font-semibold shadow-2xs hover:shadow-sm transition cursor-pointer"
            title="Fast-forward time to test 7th due date, 10th auto-lock, and 90-day review cycles"
          >
            <Clock className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Time Warp: <strong className="font-bold">{formattedDate}</strong></span>
          </button>

          {/* Audit Logs Trigger */}
          <button
            onClick={onOpenAuditLogs}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-lg text-slate-700 text-xs font-semibold shadow-2xs hover:shadow-sm transition cursor-pointer"
            title="View immutable system audit logs & version history"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Audit Trail</span>
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-lg text-slate-700 shadow-2xs hover:shadow-sm transition cursor-pointer"
            title="Notifications and Deadline Reminders"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-900 text-xs font-medium shadow-2xs hover:shadow-sm transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs">
                {currentPersona.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold leading-tight truncate max-w-[120px] text-slate-900">{currentPersona.name}</div>
                <div className="text-[10px] text-blue-600 leading-tight truncate max-w-[120px] font-semibold">{currentPersona.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-600 ml-0.5" />
            </button>

            {personaDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>Switch Active Role Persona</span>
                  <span className="text-[10px] text-blue-600 font-mono">1-Click Test</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {personas.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentPersona(p);
                        setPersonaDropdownOpen(false);
                        if (onShowToast) onShowToast(`Switched active persona to ${p.name} (${p.role})`, "info");
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-blue-50 transition flex items-center justify-between cursor-pointer ${currentPersona.id === p.id ? 'bg-blue-50/80 font-bold border-l-4 border-blue-600' : ''}`}
                    >
                      <div className="pr-2">
                        <div className="text-slate-900 font-bold">{p.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{p.role}</div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 ${p.badge}`}>
                        {p.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs with TNU Brand Theme Colors */}
      <div className="bg-gradient-to-r from-[#001f3f] via-[#002b54] to-[#001f3f] text-white border-t border-red-700/60 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1.5 overflow-x-auto text-xs font-bold py-1.5">
          <button
            onClick={() => setActiveTab('module1')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'module1'
                ? 'bg-[#c62828] text-white shadow-md font-black translate-y-[-1px]'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4 text-blue-300" />
            <span>Module I: HR Change Management</span>
          </button>

          <button
            onClick={() => setActiveTab('module2')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'module2'
                ? 'bg-[#c62828] text-white shadow-md font-black translate-y-[-1px]'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-300" />
            <span>Module II: Recruitment & Selection</span>
          </button>

          <button
            onClick={() => setActiveTab('module3')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'module3'
                ? 'bg-[#c62828] text-white shadow-md font-black translate-y-[-1px]'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Module III: Performance Management (All Tracks)</span>
          </button>

          <button
            onClick={() => setActiveTab('career')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'career'
                ? 'bg-[#c62828] text-white shadow-md font-black translate-y-[-1px]'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-300" />
            <span>Public Career Portal</span>
          </button>

          <button
            onClick={() => setActiveTab('devops')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'devops'
                ? 'bg-[#c62828] text-white shadow-md font-black translate-y-[-1px]'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Terminal className="w-4 h-4 text-purple-300" />
            <span>DevOps & Architecture</span>
          </button>
        </div>
      </div>
    </header>
  );
}
