import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Briefcase, 
  MapPin, 
  Clock, 
  GraduationCap, 
  Send, 
  CheckCircle2, 
  Search, 
  Filter, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X,
  Code2
} from 'lucide-react';
import { api } from '../services/api';

export default function CareerPortal() {
  const [openPositions, setOpenPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(null);

  // Application Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    highestQualification: '',
    ugcNetGateQualified: true,
    phdCompleted: true,
    totalExperienceYears: '5',
    currentCtc: '1000000',
    expectedCtc: '1400000',
    channelSource: 'UNIVERSITY_WEBSITE'
  });

  useEffect(() => {
    loadOpenPositions();
  }, []);

  const loadOpenPositions = async () => {
    setLoading(true);
    try {
      const data = await api.getOpenPositions();
      setOpenPositions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const res = await api.submitCandidateApplication({
        ...formData,
        mrfId: selectedJob.id
      });
      setSubmittedSuccess(res);
      setShowApplyModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Career Hero Banner with the Real TNU Campus Grand Entrance Photo */}
      <div 
        className="relative rounded-2xl p-8 sm:p-12 shadow-xl border border-slate-700 text-center overflow-hidden bg-cover bg-center min-h-[300px] flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 31, 63, 0.88), rgba(15, 23, 42, 0.90)), url('/assets/tnu-campus-banner.webp')`
        }}
      >
        <div className="max-w-3xl mx-auto space-y-3 relative z-10 text-white">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
            <img src="/assets/tnu-logo.jpg" alt="TNU" className="h-4 w-auto rounded-xs inline bg-white p-0.5" />
            <span>The Neotia University Career Opportunities</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
            Shape the Future of Higher Education
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Join a vibrant academic ecosystem at our sprawling green campus in Diamond Harbour. Explore sanctioned academic, research, administrative, and technical positions with transparent UGC-aligned governance.
          </p>

          <div className="pt-2 flex items-center justify-center space-x-4 text-xs text-slate-300">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>Sarisa, Diamond Harbour Road, WB</span>
            </span>
            <span>•</span>
            <span className="text-emerald-300 font-semibold">UGC Approved 2(f)</span>
            <span>•</span>
            <span className="text-blue-200">Portal Dev: <strong>Abhay</strong></span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {submittedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start justify-between shadow-2xs">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-900 block text-sm">Application Successfully Submitted!</span>
              <p className="text-emerald-800 mt-0.5">
                Statutory Reference Code: <strong className="font-mono">{submittedSuccess.candidateCode}</strong> • Ingested into Central CV Database.
              </p>
              <p className="text-emerald-700 text-[11px] mt-1">
                Automated UGC Qualification Screening Score: <strong className="font-bold">{submittedSuccess.shortlistingScore}/100</strong> ({submittedSuccess.shortlistingStatus}).
              </p>
            </div>
          </div>
          <button onClick={() => setSubmittedSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Open Positions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {openPositions.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  job.positionType === 'ACADEMIC' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {job.positionType}
                </span>
                <span className="text-[11px] font-bold text-[#c62828] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  {job.vacanciesCount} Post(s) Sanctioned
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">{job.positionTitle}</h2>
                <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.department} • Diamond Harbour Campus</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {job.justification || job.minQualification}
              </p>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <div>Min Experience: <strong className="text-slate-700">{job.minExperienceYears || 3} Years</strong></div>
                {job.teachingLoadHoursPerWeek > 0 && (
                  <div>Teaching Load: <strong className="text-slate-700">{job.teachingLoadHoursPerWeek} hrs/week</strong></div>
                )}
                <div>Sanctioned Band: <strong className="text-slate-700">{job.proposedCtcRange}</strong></div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedJob(job);
                  setShowApplyModal(true);
                }}
                className="w-full py-2 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-lg shadow-2xs transition flex items-center justify-center space-x-1.5"
              >
                <span>Apply for Position</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#002244] text-white flex items-center justify-between border-b-2 border-[#c62828]">
              <div>
                <h2 className="text-base font-bold">University Job Application</h2>
                <p className="text-xs text-slate-300">{selectedJob.positionTitle}</p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="p-1 rounded-md text-slate-300 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Priyabrata Roy"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98300 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Highest Qualification</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ph.D. in Computer Science (IIT) or M.Tech (First Class)"
                  value={formData.highestQualification}
                  onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.phdCompleted}
                    onChange={(e) => setFormData({ ...formData, phdCompleted: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Ph.D. Awarded</span>
                </label>

                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ugcNetGateQualified}
                    onChange={(e) => setFormData({ ...formData, ugcNetGateQualified: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">UGC-NET / GATE Qualified</span>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Total Exp (Yrs)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalExperienceYears}
                    onChange={(e) => setFormData({ ...formData, totalExperienceYears: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Current CTC (₹)</label>
                  <input
                    type="number"
                    value={formData.currentCtc}
                    onChange={(e) => setFormData({ ...formData, currentCtc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Expected CTC (₹)</label>
                  <input
                    type="number"
                    value={formData.expectedCtc}
                    onChange={(e) => setFormData({ ...formData, expectedCtc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-md shadow-xs transition"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
