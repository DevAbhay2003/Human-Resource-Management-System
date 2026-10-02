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
  Code2,
  Check,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function CareerPortal({ onShowToast }) {
  const [openPositions, setOpenPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Application Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    highestQualification: 'Ph.D. in Computer Science',
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

  const notify = (type, title, message) => {
    if (onShowToast) {
      onShowToast(type, title, message);
    }
  };

  const loadOpenPositions = async () => {
    setLoading(true);
    try {
      const data = await api.getOpenPositions();
      setOpenPositions(data);
    } catch (err) {
      console.error(err);
      notify('error', 'Fetch Error', 'Could not retrieve open positions.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time UGC Qualification Screen Score Calculator
  const calculateUgcScore = () => {
    let score = 50; // base score for application
    if (formData.phdCompleted) score += 30;
    if (formData.ugcNetGateQualified) score += 15;
    const exp = parseInt(formData.totalExperienceYears) || 0;
    if (exp >= 5) score += 5;
    return Math.min(100, score);
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
      notify('success', 'Application Received!', `Application ${res.candidateCode} submitted for ${selectedJob.positionTitle}. Screened with UGC Score ${res.shortlistingScore}/100.`);
    } catch (err) {
      console.error(err);
      notify('error', 'Application Failed', err.message);
    }
  };

  const filteredJobs = openPositions.filter(job => {
    if (selectedCategory === 'ACADEMIC') return job.positionType === 'ACADEMIC';
    if (selectedCategory === 'NON_ACADEMIC') return job.positionType === 'NON_ACADEMIC';
    return true;
  }).filter(job => {
    if (!searchQuery) return true;
    return job.positionTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           job.department?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Career Hero Banner with the Real TNU Campus Grand Entrance Photo */}
      <div 
        className="relative rounded-2xl p-8 sm:p-12 shadow-xl border border-slate-700 text-center overflow-hidden bg-cover bg-center min-h-[300px] flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 31, 63, 0.90), rgba(15, 23, 42, 0.92)), url('/assets/tnu-campus-banner.webp')`
        }}
      >
        <div className="max-w-3xl mx-auto space-y-3 relative z-10 text-white">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
            <img src="/assets/tnu-logo.jpg" alt="TNU" className="h-4 w-auto rounded-xs inline bg-white p-0.5" />
            <span>The Neotia University Official Career Opportunities</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
            Shape the Future of Higher Education & Research
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Join a vibrant academic ecosystem at our sprawling green campus in Diamond Harbour. Explore sanctioned academic, research, administrative, and technical positions with transparent UGC-aligned governance.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
            <span className="flex items-center space-x-1 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>Sarisa, Diamond Harbour Road, WB</span>
            </span>
            <span className="text-emerald-300 font-semibold bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30">
              UGC Approved Sec. 2(f)
            </span>
            <span className="text-blue-200 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/30">
              Dev & Architect: <strong>Abhay</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Search & Category Filter Pills */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search faculty or officer vacancies by position, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#003366] focus:bg-white focus:outline-hidden transition"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 shrink-0">
            {[
              { id: 'ALL', label: `All Positions (${openPositions.length})` },
              { id: 'ACADEMIC', label: `Faculty / Academic (${openPositions.filter(p => p.positionType === 'ACADEMIC').length})` },
              { id: 'NON_ACADEMIC', label: `Officers / Non-Faculty (${openPositions.filter(p => p.positionType === 'NON_ACADEMIC').length})` }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setSelectedCategory(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === pill.id
                    ? 'bg-[#003366] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {submittedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start justify-between shadow-2xs animate-in fade-in">
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
          <button onClick={() => setSubmittedSuccess(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Open Positions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-200 p-5 flex flex-col justify-between card-hover-effect"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  job.positionType === 'ACADEMIC' ? 'bg-teal-100 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  {job.positionType === 'ACADEMIC' ? 'Academic / Faculty' : 'Non-Academic Officer'}
                </span>
                <span className="text-[11px] font-bold text-[#c62828] bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                  {job.vacanciesCount} Post(s) Sanctioned
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">{job.positionTitle}</h2>
                <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{job.department} • Sarisa Campus</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {job.justification || job.minQualification}
              </p>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <div>Min Experience: <strong className="text-slate-700">{job.minExperienceYears || 3} Years</strong></div>
                {job.teachingLoadHoursPerWeek > 0 && (
                  <div>Teaching Load: <strong className="text-slate-700">{job.teachingLoadHoursPerWeek} hrs/week (1:15 Ratio)</strong></div>
                )}
                <div>Sanctioned Band: <strong className="text-slate-800 font-semibold">{job.proposedCtcRange}</strong></div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedJob(job);
                  setShowApplyModal(true);
                }}
                className="w-full py-2.5 bg-[#003366] hover:bg-[#002244] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer border border-[#002244]"
              >
                <span>Apply for Position</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No vacancies found matching the selected criteria.
          </div>
        )}
      </div>

      {/* Application Modal with Real-time UGC Screening Feedback */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#002244] text-white flex items-center justify-between border-b-2 border-[#c62828]">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-300" />
                  The Neotia University Application
                </h2>
                <p className="text-xs text-slate-300">{selectedJob.positionTitle} ({selectedJob.department})</p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="p-1 rounded-lg text-slate-300 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 space-y-4 text-xs">
              {/* Live UGC Eligibility Meter */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 block">Automated UGC Screening Score Preview:</span>
                  <span className="text-[11px] text-emerald-700">
                    {calculateUgcScore() >= 90 ? 'Meets full UGC Assistant/Associate Professor criteria' : 'Conditional shortlisting subject to document verification'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-800">{calculateUgcScore()}/100</span>
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase">
                    {calculateUgcScore() >= 80 ? 'Compliant' : 'Under Review'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Candidate Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Priyabrata Roy"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-[#003366] focus:outline-hidden"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#003366] focus:outline-hidden"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#003366] focus:outline-hidden"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#003366] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.phdCompleted}
                    onChange={(e) => setFormData({ ...formData, phdCompleted: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-700">Ph.D. Awarded</span>
                </label>

                <label className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.ugcNetGateQualified}
                    onChange={(e) => setFormData({ ...formData, ugcNetGateQualified: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-[#003366] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Current CTC (₹)</label>
                  <input
                    type="number"
                    value={formData.currentCtc}
                    onChange={(e) => setFormData({ ...formData, currentCtc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-[#003366] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Expected CTC (₹)</label>
                  <input
                    type="number"
                    value={formData.expectedCtc}
                    onChange={(e) => setFormData({ ...formData, expectedCtc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-[#003366] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003366] hover:bg-[#002244] active:scale-95 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
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
