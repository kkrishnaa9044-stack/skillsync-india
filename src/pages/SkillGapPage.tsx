import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, ArrowRight, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { PageHeader, FilterBar, Select, ProgressBar, Badge } from '@/components/UI';
import { states, industries } from '@/lib/demoData';
import { storage } from '@/lib/storage';
import { computeSkillGaps, generateAIInsight } from '@/lib/aiEngine';
import type { SkillGap as SG } from '@/lib/types';
import { useApp } from '@/context/AppContext';

export function SkillGapPage() {
  const { addNotification } = useApp();
  const [stateFilter, setStateFilter] = useState('Uttar Pradesh');
  const [districtFilter, setDistrictFilter] = useState('Ghaziabad');
  const [industryFilter, setIndustryFilter] = useState('IT & Software');
  const [jobRoleFilter, setJobRoleFilter] = useState('Data Analyst');
  const [gaps, setGaps] = useState<SG[]>([]);
  const [insight, setInsight] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const jobs = useMemo(() => storage.getJobs(), []);
  const trainingPrograms = useMemo(() => storage.getTrainingPrograms(), []);

  const availableDistricts = useMemo(() => {
    const s = states.find((s) => s.name === stateFilter);
    return s ? s.districts : [];
  }, [stateFilter]);

  const jobRoles = useMemo(() => {
    return [...new Set(jobs.filter(j => !industryFilter || j.industry === industryFilter).map((j) => j.role))].sort();
  }, [jobs, industryFilter]);

  function analyze() {
    const relevantJobs = jobs.filter(
      (j) => (!stateFilter || j.state === stateFilter) && (!industryFilter || j.industry === industryFilter) && (!jobRoleFilter || j.role === jobRoleFilter)
    );

    const requiredSkills = relevantJobs.length > 0
      ? [...new Set(relevantJobs.flatMap((j) => j.skills))]
      : ['Python', 'SQL', 'Power BI', 'Statistics', 'Tableau', 'Cloud (AWS)'];

    const relevantPrograms = trainingPrograms.filter(
      (tp) => !industryFilter || tp.skills.some((s) => requiredSkills.includes(s))
    );

    const currentSkills = relevantPrograms.length > 0
      ? [...new Set(relevantPrograms.flatMap((tp) => tp.skills))]
      : ['Python', 'SQL', 'Excel', 'Statistics'];

    const computedGaps = computeSkillGaps(currentSkills, requiredSkills);
    setGaps(computedGaps);

    const region = `${districtFilter || stateFilter || 'India'}`;
    setInsight(generateAIInsight(computedGaps, jobRoleFilter || 'the selected role', region));
    setHasAnalyzed(true);
  }

  function generateRecommendation() {
    addNotification({
      title: 'Training Recommendation Generated',
      message: `AI curriculum recommendation generated for ${jobRoleFilter} in ${districtFilter || stateFilter}.`,
      type: 'success',
    });
    // Navigate to recommendations page with state
    window.location.href = `/recommendations?program=Data Analytics Foundation&industry=${encodeURIComponent(industryFilter)}&role=${encodeURIComponent(jobRoleFilter)}&state=${encodeURIComponent(stateFilter)}`;
  }

  return (
    <div>
      <PageHeader title="AI-Powered Skill Gap Analysis" subtitle="Compare industry skill requirements with training program coverage" />

      <FilterBar>
        <Select label="State" value={stateFilter} onChange={(v) => { setStateFilter(v); setDistrictFilter(''); }} options={states.map((s) => s.name)} />
        <Select label="District" value={districtFilter} onChange={setDistrictFilter} options={availableDistricts} />
        <Select label="Industry" value={industryFilter} onChange={(v) => { setIndustryFilter(v); setJobRoleFilter(''); }} options={industries.map((i) => i.name)} />
        <Select label="Job Role" value={jobRoleFilter} onChange={setJobRoleFilter} options={jobRoles} />
        <button onClick={analyze} className="btn-primary self-end">
          <Sparkles className="w-4 h-4" /> Analyze Gap
        </button>
      </FilterBar>

      {!hasAnalyzed ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to Analyze</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Select filters and click "Analyze Gap" to compare industry skill requirements with current training coverage.
          </p>
          <div className="mt-6">
            <p className="text-xs text-gray-400 mb-2">Default example: Uttar Pradesh · Ghaziabad · IT & Software · Data Analyst</p>
            <button onClick={analyze} className="btn-primary">
              <Sparkles className="w-4 h-4" /> Run Analysis
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Skill gap table */}
          <div className="card mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Skill Gap Analysis — {jobRoleFilter} · {districtFilter || stateFilter} · {industryFilter}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700">
                    <th className="table-header">Skill</th>
                    <th className="table-header">Industry Requirement</th>
                    <th className="table-header">Training Coverage</th>
                    <th className="table-header">Gap</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gaps.map((g, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-slate-700/50">
                      <td className="table-cell font-medium text-gray-900 dark:text-white">{g.skill}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={g.industryRequirement} color="bg-blue-500" />
                          <span className="text-xs font-medium w-10">{g.industryRequirement}%</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={g.trainingCoverage} color="bg-teal-500" />
                          <span className="text-xs font-medium w-10">{g.trainingCoverage}%</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={g.gap} color={g.status === 'Critical Gap' ? 'bg-red-500' : g.status === 'Partial Gap' ? 'bg-amber-500' : 'bg-green-500'} />
                          <span className="text-xs font-medium w-10">{g.gap}%</span>
                        </div>
                      </td>
                      <td className="table-cell"><Badge status={g.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <p className="text-xs text-gray-500">Aligned</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{gaps.filter(g => g.status === 'Aligned').length}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-gray-500">Partial Gap</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{gaps.filter(g => g.status === 'Partial Gap').length}</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-xs text-gray-500">Critical Gap</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{gaps.filter(g => g.status === 'Critical Gap').length}</p>
            </div>
          </div>

          {/* AI Insight */}
          <div className="card mb-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 border-blue-100 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">AI Insight</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={generateRecommendation} className="btn-accent">
              <Sparkles className="w-4 h-4" /> Generate Training Recommendation
            </button>
            <Link to="/recommendations" className="btn-secondary">
              Go to AI Curriculum Advisor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
