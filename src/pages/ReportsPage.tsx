import { useState, useMemo, useRef } from 'react';
import { FileText, Printer, Download, MapPin, Building2, GraduationCap, TrendingUp, Brain } from 'lucide-react';
import { PageHeader, Select } from '@/components/UI';
import { states, industries, jobDemandTrend, industryDemandData, skillGapSeverity, stateDemandData } from '@/lib/demoData';
import { storage } from '@/lib/storage';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export function ReportsPage() {
  const trainingPrograms = useMemo(() => storage.getTrainingPrograms(), []);
  const allSkills = useMemo(() => storage.getSkills(), []);
  const jobs = useMemo(() => storage.getJobs(), []);

  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [timePeriod, setTimePeriod] = useState('Last 6 Months');
  const [generated, setGenerated] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const availableDistricts = useMemo(() => {
    const s = states.find((s) => s.name === stateFilter);
    return s ? s.districts : [];
  }, [stateFilter]);

  function generateReport() {
    setGenerated(true);
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function printReport() {
    if (!generated) {
      generateReport();
      setTimeout(() => window.print(), 500);
    } else {
      window.print();
    }
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (stateFilter && j.state !== stateFilter) return false;
      if (districtFilter && j.district !== districtFilter) return false;
      if (industryFilter && j.industry !== industryFilter) return false;
      if (skillFilter && !j.skills.includes(skillFilter)) return false;
      return true;
    });
  }, [jobs, stateFilter, districtFilter, industryFilter, skillFilter]);

  const filteredPrograms = useMemo(() => {
    return trainingPrograms.filter((p) => {
      if (stateFilter && p.state !== stateFilter) return false;
      if (programFilter && p.name !== programFilter) return false;
      return true;
    });
  }, [trainingPrograms, stateFilter, programFilter]);

  const avgAlignment = filteredPrograms.length > 0
    ? Math.round(filteredPrograms.reduce((sum, p) => sum + p.industryAlignment, 0) / filteredPrograms.length)
    : 72;

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate professional skill intelligence reports">
        <button onClick={generateReport} className="btn-primary text-sm no-print">
          <FileText className="w-4 h-4" /> Generate Report
        </button>
        <button onClick={printReport} className="btn-secondary text-sm no-print">
          <Printer className="w-4 h-4" /> Print Report
        </button>
      </PageHeader>

      <div className="card mb-6 no-print">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Select label="State" value={stateFilter} onChange={(v) => { setStateFilter(v); setDistrictFilter(''); }} options={states.map((s) => s.name)} />
          <Select label="District" value={districtFilter} onChange={setDistrictFilter} options={availableDistricts} />
          <Select label="Industry" value={industryFilter} onChange={setIndustryFilter} options={industries.map((i) => i.name)} />
          <Select label="Skill" value={skillFilter} onChange={setSkillFilter} options={allSkills.map((s) => s.name)} />
          <Select label="Training Program" value={programFilter} onChange={setProgramFilter} options={trainingPrograms.map((p) => p.name)} />
          <Select label="Time Period" value={timePeriod} onChange={setTimePeriod} options={['Last 3 Months', 'Last 6 Months', 'Last Year']} />
        </div>
      </div>

      {!generated ? (
        <div className="card text-center py-16 no-print">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Report Generator</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Select filters and click "Generate Report" to create a comprehensive skill intelligence report.
          </p>
          <button onClick={generateReport} className="btn-primary">
            <FileText className="w-4 h-4" /> Generate Report
          </button>
        </div>
      ) : (
        <div ref={reportRef} className="space-y-6">
          {/* Report header */}
          <div className="card bg-gradient-to-br from-blue-900 to-blue-800 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-6 h-6" />
                  <span className="text-lg font-bold">SkillSync India</span>
                </div>
                <h2 className="text-2xl font-bold">Skill Intelligence Report</h2>
                <p className="text-blue-200 text-sm mt-1">
                  {stateFilter || 'All States'} · {industryFilter || 'All Industries'} · {timePeriod}
                </p>
              </div>
              <div className="text-right text-sm text-blue-200">
                <p>Report ID: SIH-RPT-{Date.now().toString().slice(-6)}</p>
                <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Executive Summary
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              This report provides a comprehensive analysis of skill demand and training alignment
              {stateFilter ? ` in ${stateFilter}` : ' across India'}
              {industryFilter ? ` for the ${industryFilter} industry` : ' across all industries'}.
              The analysis covers {filteredJobs.length} active job postings, {filteredPrograms.length} training programs,
              and {allSkills.length} tracked skills. The current training-to-industry alignment rate is {avgAlignment}%,
              {avgAlignment >= 75 ? ' indicating strong workforce readiness.' : avgAlignment >= 60 ? ' with room for improvement in key skill areas.' : ' highlighting significant gaps that require immediate attention.'}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-500">Jobs Analyzed</span></div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredJobs.length}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2"><Building2 className="w-4 h-4 text-teal-500" /><span className="text-xs text-gray-500">Industries</span></div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{industryFilter ? 1 : industries.length}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2"><GraduationCap className="w-4 h-4 text-indigo-500" /><span className="text-xs text-gray-500">Training Programs</span></div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredPrograms.length}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-cyan-500" /><span className="text-xs text-gray-500">Alignment Rate</span></div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgAlignment}%</p>
            </div>
          </div>

          {/* Industry Demand */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Industry Demand Analysis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={industryDemandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis dataKey="industry" tick={{ fontSize: 9 }} stroke="#9ca3af" angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="demand" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Gaps */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Skill Gap Analysis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={skillGapSeverity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis dataKey="skill" tick={{ fontSize: 10 }} stroke="#9ca3af" angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="gap" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Regional Analysis */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Regional Analysis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stateDemandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                <XAxis dataKey="state" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="demand" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="gap" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Training Alignment */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Training Alignment</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700">
                    <th className="table-header">Program</th>
                    <th className="table-header">Provider</th>
                    <th className="table-header">State</th>
                    <th className="table-header">Employment</th>
                    <th className="table-header">Alignment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.slice(0, 10).map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 dark:border-slate-700/50">
                      <td className="table-cell font-medium">{p.name}</td>
                      <td className="table-cell">{p.provider}</td>
                      <td className="table-cell">{p.state}</td>
                      <td className="table-cell">{p.employmentRate}%</td>
                      <td className="table-cell">{p.industryAlignment}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="card bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-800 dark:to-slate-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" /> AI Recommendations
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">•</span> Prioritize updating training curricula to include Power BI, Tableau, and Generative AI modules based on critical skill gaps identified.</li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">•</span> Focus on states with skill gap above 30% — Uttar Pradesh, Rajasthan, West Bengal, and Gujarat — for targeted intervention programs.</li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">•</span> Expand cloud computing and cybersecurity training programs in high-demand corridors: Bengaluru, Hyderabad, Pune, and Gurugram.</li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">•</span> Partner with industry leaders to co-develop EV technology and renewable energy curricula for emerging job markets.</li>
              <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">•</span> Implement quarterly curriculum review cycles aligned with real-time labour-market intelligence data.</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center py-4 text-xs text-gray-500 border-t border-gray-100 dark:border-slate-700">
            <p>SkillSync India · SIH26134 · Government of India Initiative</p>
            <p className="mt-1">This report was generated on {new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
