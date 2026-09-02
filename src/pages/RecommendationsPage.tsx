import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Brain, Sparkles, CheckCircle2, XCircle, AlertCircle, ArrowRight, FileDown } from 'lucide-react';
import { PageHeader, Select, ProgressBar } from '@/components/UI';
import { states, industries } from '@/lib/demoData';
import { storage } from '@/lib/storage';
import {
  getRequiredSkills, getCurrentCurriculumForProgram, computeSkillGaps,
  generateRecommendedModules, computeExpectedImprovement, generateAIInsight,
} from '@/lib/aiEngine';
import { useApp } from '@/context/AppContext';

export function RecommendationsPage() {
  const [searchParams] = useSearchParams();
  const { addNotification } = useApp();

  const trainingPrograms = useMemo(() => storage.getTrainingPrograms(), []);
  const jobs = useMemo(() => storage.getJobs(), []);

  const [program, setProgram] = useState(searchParams.get('program') || trainingPrograms[0]?.name || '');
  const [industry, setIndustry] = useState(searchParams.get('industry') || industries[0].name);
  const [jobRole, setJobRole] = useState(searchParams.get('role') || 'Data Analyst');
  const [state, setState] = useState(searchParams.get('state') || 'Uttar Pradesh');

  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [gaps, setGaps] = useState<ReturnType<typeof computeSkillGaps>>([]);
  const [modules, setModules] = useState<ReturnType<typeof generateRecommendedModules>>([]);
  const [improvement, setImprovement] = useState(0);
  const [insight, setInsight] = useState('');
  const [generated, setGenerated] = useState(false);

  const jobRoles = useMemo(() => {
    const roles = [...new Set(jobs.filter(j => !industry || j.industry === industry).map((j) => j.role))];
    return roles.length > 0 ? roles.sort() : ['Data Analyst', 'Cybersecurity Analyst', 'Cloud Engineer', 'Full Stack Developer', 'AI Engineer', 'DevOps Engineer'];
  }, [jobs, industry]);

  useEffect(() => {
    if (searchParams.get('program') || searchParams.get('industry') || searchParams.get('role')) {
      analyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function analyze() {
    const currentSkills = getCurrentCurriculumForProgram(program, trainingPrograms);
    const requiredSkills = getRequiredSkills(jobRole, industry);
    const computedGaps = computeSkillGaps(currentSkills, requiredSkills);
    const missingSkills = computedGaps.filter((g) => g.gap >= 15).map((g) => g.skill);
    const recommendedModules = generateRecommendedModules(missingSkills);
    const expected = computeExpectedImprovement(computedGaps);

    setGaps(computedGaps);
    setModules(recommendedModules);
    setImprovement(expected);
    setInsight(generateAIInsight(computedGaps, jobRole, state));
    setHasAnalyzed(true);
    setGenerated(false);
  }

  function generateCurriculum() {
    setGenerated(true);
    addNotification({
      title: 'AI Curriculum Generated',
      message: `Updated curriculum generated for ${program} — ${jobRole} in ${industry}. Expected improvement: +${improvement}%`,
      type: 'success',
    });
  }

  const currentSkills = getCurrentCurriculumForProgram(program, trainingPrograms);
  const requiredSkills = getRequiredSkills(jobRole, industry);
  const missingSkills = gaps.filter((g) => g.gap >= 15).map((g) => g.skill);

  return (
    <div>
      <PageHeader title="AI Curriculum Advisor" subtitle="Generate dynamic curriculum recommendations from job role and industry requirements" />

      {/* Inputs */}
      <div className="card mb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Select label="Training Program" value={program} onChange={setProgram} options={trainingPrograms.map((p) => p.name)} />
          <Select label="Industry" value={industry} onChange={(v) => { setIndustry(v); setJobRole(''); }} options={industries.map((i) => i.name)} />
          <Select label="Job Role" value={jobRole} onChange={setJobRole} options={jobRoles} />
          <Select label="State" value={state} onChange={setState} options={states.map((s) => s.name)} />
        </div>
        <button onClick={analyze} className="btn-primary">
          <Brain className="w-4 h-4" /> Analyze Curriculum
        </button>
      </div>

      {!hasAnalyzed ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Curriculum Advisor</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Select a training program, industry, and job role, then click "Analyze Curriculum" to generate AI-powered recommendations.
          </p>
        </div>
      ) : (
        <>
          {/* Current vs Required */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Current Curriculum
              </h3>
              <p className="text-xs text-gray-500 mb-3">{program}</p>
              <div className="flex flex-wrap gap-2">
                {currentSkills.map((s) => (
                  <span key={s} className="badge badge-green">{s}</span>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" /> Industry Requirements
              </h3>
              <p className="text-xs text-gray-500 mb-3">{jobRole} · {industry}</p>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((s) => (
                  <span key={s} className={`badge ${currentSkills.includes(s) ? 'badge-green' : 'badge-red'}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Gaps */}
          <div className="card mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Skill Gaps Identified</h3>
            <div className="space-y-3">
              {gaps.map((g, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-32 shrink-0">{g.skill}</span>
                  <div className="flex-1">
                    <ProgressBar value={g.gap} color={g.status === 'Critical Gap' ? 'bg-red-500' : g.status === 'Partial Gap' ? 'bg-amber-500' : 'bg-green-500'} />
                  </div>
                  <span className={`text-xs font-medium w-24 text-right ${g.status === 'Critical Gap' ? 'text-red-500' : g.status === 'Partial Gap' ? 'text-amber-500' : 'text-green-500'}`}>
                    {g.gap}% gap
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing skills */}
          {missingSkills.length > 0 && (
            <div className="card mb-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" /> Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((s) => (
                  <span key={s} className="badge badge-red">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* AI Insight */}
          <div className="card mb-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-800 dark:to-slate-800">
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

          {/* Recommended Curriculum */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recommended Curriculum</h3>
              <span className="badge badge-green">+{improvement}% Expected Improvement</span>
            </div>
            <div className="space-y-3">
              {modules.map((mod, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{mod.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{mod.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected improvement */}
          <div className="card mb-6 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-800 dark:to-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Expected Employability Improvement</p>
                <p className="text-3xl font-bold text-teal-600">+{improvement}%</p>
              </div>
              <button onClick={generateCurriculum} className="btn-accent">
                <FileDown className="w-4 h-4" /> Generate Updated Curriculum
              </button>
            </div>
          </div>

          {generated && (
            <div className="card border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-400">Curriculum Generated Successfully!</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                    The updated curriculum for {program} has been generated with {modules.length} new modules. Expected employability improvement: +{improvement}%.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/reports" className="btn-secondary">
              View Reports <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/students" className="btn-secondary">
              Student Career Guidance <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
