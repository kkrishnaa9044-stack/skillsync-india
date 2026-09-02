import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, TrendingUp, AlertTriangle, GraduationCap, Building2, Target,
  ArrowRight, Sparkles, FileSearch,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import { PageHeader, StatCard, FilterBar, Select } from '@/components/UI';
import { states, industries, jobDemandTrend, topEmergingSkills, skillGapSeverity, industryDemandData, stateDemandData } from '@/lib/demoData';
import { storage } from '@/lib/storage';

const COLORS = ['#2563eb', '#0d9488', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function DashboardPage() {
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [jobRoleFilter, setJobRoleFilter] = useState('');
  const [timePeriod, setTimePeriod] = useState('Last 6 Months');

  const jobs = useMemo(() => storage.getJobs(), []);
  const allSkills = useMemo(() => storage.getSkills(), []);
  const trainingPrograms = useMemo(() => storage.getTrainingPrograms(), []);
  const allIndustries = useMemo(() => storage.getIndustries(), []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (stateFilter && j.state !== stateFilter) return false;
      if (districtFilter && j.district !== districtFilter) return false;
      if (industryFilter && j.industry !== industryFilter) return false;
      if (jobRoleFilter && j.role !== jobRoleFilter) return true;
      return true;
    });
  }, [jobs, stateFilter, districtFilter, industryFilter, jobRoleFilter]);

  const availableDistricts = useMemo(() => {
    if (!stateFilter) return [];
    const s = states.find((s) => s.name === stateFilter);
    return s ? s.districts : [];
  }, [stateFilter]);

  const jobRoles = useMemo(() => [...new Set(jobs.map((j) => j.role))], [jobs]);

  return (
    <div>
      <PageHeader title="India Skill Intelligence Dashboard" subtitle="Real-time labour-market intelligence and skill gap analysis">
        <Link to="/skill-gap" className="btn-accent text-sm">
          <Sparkles className="w-4 h-4" /> Analyze Skill Gap
        </Link>
      </PageHeader>

      <FilterBar>
        <Select label="State" value={stateFilter} onChange={setStateFilter} options={states.map((s) => s.name)} />
        <Select label="District" value={districtFilter} onChange={setDistrictFilter} options={availableDistricts} />
        <Select label="Industry" value={industryFilter} onChange={setIndustryFilter} options={industries.map((i) => i.name)} />
        <Select label="Job Role" value={jobRoleFilter} onChange={setJobRoleFilter} options={jobRoles} />
        <Select label="Time Period" value={timePeriod} onChange={setTimePeriod} options={['Last 3 Months', 'Last 6 Months', 'Last Year']} />
      </FilterBar>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Jobs Analyzed" value={filteredJobs.length > 0 ? (12540).toLocaleString() : 0} icon={Briefcase} color="bg-blue-600" />
        <StatCard label="High Demand Skills" value={allSkills.filter(s => s.demand >= 75).length} icon={TrendingUp} color="bg-teal-600" />
        <StatCard label="Critical Skill Gaps" value={74} icon={AlertTriangle} color="bg-red-500" />
        <StatCard label="Training Programs" value={trainingPrograms.length} icon={GraduationCap} color="bg-indigo-600" />
        <StatCard label="Industry Partners" value={67} icon={Building2} color="bg-cyan-600" />
        <StatCard label="Employability Alignment" value={72} suffix="%" icon={Target} color="bg-emerald-600" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Job Demand Trend</h3>
          <p className="text-xs text-gray-500 mb-4">Monthly job postings by industry</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={jobDemandTrend}>
              <defs>
                <linearGradient id="cIT" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0} /></linearGradient>
                <linearGradient id="cMfg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} /><stop offset="100%" stopColor="#0d9488" stopOpacity={0} /></linearGradient>
                <linearGradient id="cHl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="100%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                <linearGradient id="cAuto" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="IT" stroke="#2563eb" fill="url(#cIT)" strokeWidth={2} />
              <Area type="monotone" dataKey="Manufacturing" stroke="#0d9488" fill="url(#cMfg)" strokeWidth={2} />
              <Area type="monotone" dataKey="Healthcare" stroke="#f59e0b" fill="url(#cHl)" strokeWidth={2} />
              <Area type="monotone" dataKey="Automobile" stroke="#8b5cf6" fill="url(#cAuto)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Top Emerging Skills</h3>
          <p className="text-xs text-gray-500 mb-4">Demand score and growth rate</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topEmergingSkills} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 100]} />
              <YAxis dataKey="skill" type="category" tick={{ fontSize: 11 }} stroke="#9ca3af" width={90} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Bar dataKey="demand" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Skill Gap Severity</h3>
          <p className="text-xs text-gray-500 mb-4">Gap percentage by skill</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={skillGapSeverity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
              <XAxis dataKey="skill" tick={{ fontSize: 10 }} stroke="#9ca3af" angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Bar dataKey="gap" radius={[6, 6, 0, 0]} barSize={32}>
                {skillGapSeverity.map((entry, i) => (
                  <Cell key={i} fill={entry.severity === 'Critical' ? '#ef4444' : entry.severity === 'Partial' ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Industry Demand Distribution</h3>
          <p className="text-xs text-gray-500 mb-4">Job count by industry</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={industryDemandData} dataKey="jobs" nameKey="industry" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={2}>
                {industryDemandData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* State-wise demand */}
      <div className="card mb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">State-wise Demand & Skill Gap</h3>
        <p className="text-xs text-gray-500 mb-4">Job demand vs skill gap by state</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stateDemandData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
            <XAxis dataKey="state" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="demand" name="Job Demand" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar dataKey="gap" name="Skill Gap %" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Resume Readiness card */}
      <ResumeReadinessCard />

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/skill-gap" className="card card-hover group">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Skill Gap Analysis</p>
              <p className="text-sm text-gray-500 mt-1">AI-powered gap detection</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>
        <Link to="/recommendations" className="card card-hover group">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">AI Curriculum Advisor</p>
              <p className="text-sm text-gray-500 mt-1">Generate curriculum recommendations</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>
        <Link to="/resume-analyzer" className="card card-hover group">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">AI Resume Analyzer</p>
              <p className="text-sm text-gray-500 mt-1">Analyze your resume against job market</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}

function ResumeReadinessCard() {
  const [resumeData, setResumeData] = useState<{ analysis: { resumeScore: number; jobMatchScore: number; atsScore: number; skillGaps: { severity: string }[]; recommendations: unknown[] } } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('skillsync_resume_analysis');
      if (saved) setResumeData(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  if (!resumeData?.analysis) {
    return (
      <Link to="/resume-analyzer" className="card card-hover group mb-6 block">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
            <FileSearch className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">AI Resume Analyzer</p>
            <p className="text-sm text-gray-500 mt-0.5">Upload your resume and get an AI-powered analysis against current job-market requirements.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
        </div>
      </Link>
    );
  }

  const a = resumeData.analysis;
  const criticalGaps = a.skillGaps.filter((g: { severity: string }) => g.severity === 'critical').length;

  return (
    <Link to="/resume-analyzer" className="card card-hover group mb-6 block">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Resume Readiness</h3>
        </div>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{a.resumeScore}<span className="text-sm text-gray-400">/100</span></span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{a.jobMatchScore}%</p>
          <p className="text-xs text-gray-500">Skill Match</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{a.atsScore}</p>
          <p className="text-xs text-gray-500">ATS Score</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
          <p className="text-lg font-bold text-red-500">{criticalGaps}</p>
          <p className="text-xs text-gray-500">Critical Gaps</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{a.recommendations.length}</p>
          <p className="text-xs text-gray-500">Recommendations</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end">
        <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
          View Resume Analysis <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
