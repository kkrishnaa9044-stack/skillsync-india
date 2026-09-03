import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSearch, Upload, FileText, X, CheckCircle, AlertCircle, Sparkles,
  Target, TrendingUp, Award, BookOpen, Briefcase, GraduationCap, GitBranch,
  Download, Printer, Trash2, Zap, ChevronRight, User, Mail, Phone, Linkedin,
  Github, FileCheck, BarChart3, Lightbulb, Rocket, ClipboardList, Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { PageHeader } from '@/components/UI';
import { useAuth } from '@/context/AuthContext';
import { validateFile, extractTextFromFile } from '@/services/resumeParser';
import {
  analyzeResume, compareWithJobDescription, targetJobRoles,
  type ResumeAnalysis,
} from '@/services/resumeAnalyzer';

const STORAGE_KEY_BASE = 'resumeAnalysis_';
const ANALYSIS_STEPS = [
  'Reading Resume',
  'Extracting Skills',
  'Analyzing Experience',
  'Comparing With Job Market',
  'Finding Skill Gaps',
  'Generating Recommendations',
];

const severityColors = {
  critical: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', label: 'Critical' },
  important: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', label: 'Important' },
  strong: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500', label: 'Strong' },
};

const priorityColors = {
  high: 'badge-red',
  medium: 'badge-yellow',
  low: 'badge-blue',
};

export function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [targetRole, setTargetRole] = useState('Data Analyst');
  const [useAutoDetect, setUseAutoDetect] = useState(false);
  const [extracting, setExtracting] = useState(false);

  // JD comparison
  const [jdText, setJdText] = useState('');
  const [jdResult, setJdResult] = useState<{ matchScore: number; skillsYouHave: string[]; skillsMissing: string[]; recommendedChanges: string[] } | null>(null);
  const [jdAnalyzing, setJdAnalyzing] = useState(false);

  const { user } = useAuth();
  const storageKey = user ? `${STORAGE_KEY_BASE}${user.id}` : 'skillsync_resume_analysis';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.analysis) setAnalysis(parsed.analysis);
        if (parsed.targetRole) setTargetRole(parsed.targetRole);
      }
    } catch {
      // ignore
    }
  }, []);

  function saveAnalysis(a: ResumeAnalysis | null, role: string) {
    try {
      if (a) {
        localStorage.setItem(storageKey, JSON.stringify({ analysis: a, targetRole: role }));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      // ignore
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, []);

  function handleFileSelect(selectedFile: File) {
    setError(null);
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFile(selectedFile);
    setAnalysis(null);
    setResumeText('');
  }

  async function handleExtractAndAnalyze() {
    if (!file) {
      setError('Please select a resume file first.');
      return;
    }

    setExtracting(true);
    setError(null);
    try {
      const text = await extractTextFromFile(file);
      if (text.trim().length < 20) {
        setError('We couldn\'t extract enough information from this resume. Please upload a text-based PDF or DOCX file.');
        setExtracting(false);
        return;
      }
      setResumeText(text);
      setExtracting(false);
      runAnalysis(text, useAutoDetect ? '' : targetRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process the resume file.');
      setExtracting(false);
    }
  }

  async function runAnalysis(text: string, role: string) {
    setAnalyzing(true);
    setAnalysisStep(0);
    setAnalysis(null);

    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setAnalysisStep(i);
      await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 300));
    }

    const result = analyzeResume(text, role || '');
    const finalRole = useAutoDetect ? result.autoDetectedRole : role;
    setTargetRole(finalRole);
    setAnalysis(result);
    setAnalyzing(false);
    saveAnalysis(result, finalRole);
  }

  function reAnalyzeWithRole(role: string) {
    setTargetRole(role);
    setUseAutoDetect(false);
    if (resumeText) {
      runAnalysis(resumeText, role);
    }
  }

  function handleAutoDetect() {
    setUseAutoDetect(true);
    if (resumeText) {
      runAnalysis(resumeText, '');
    }
  }

  function removeFile() {
    setFile(null);
    setResumeText('');
    setAnalysis(null);
    setError(null);
    saveAnalysis(null, targetRole);
  }

  function deleteData() {
    setAnalysis(null);
    setFile(null);
    setResumeText('');
    setJdResult(null);
    setJdText('');
    saveAnalysis(null, targetRole);
  }

  function handleJdCompare() {
    if (!resumeText || !jdText.trim()) return;
    setJdAnalyzing(true);
    setTimeout(() => {
      const result = compareWithJobDescription(resumeText, jdText, targetRole);
      setJdResult(result);
      setJdAnalyzing(false);
    }, 600);
  }

  function handlePrint() {
    window.print();
  }

  const scoreData = analysis ? [{ name: 'Score', value: analysis.resumeScore, fill: analysis.resumeScore >= 70 ? '#10b981' : analysis.resumeScore >= 50 ? '#f59e0b' : '#ef4444' }] : [];
  const atsScoreData = analysis ? [{ name: 'ATS', value: analysis.atsScore, fill: analysis.atsScore >= 70 ? '#10b981' : analysis.atsScore >= 50 ? '#f59e0b' : '#ef4444' }] : [];
  const matchScoreData = analysis ? [{ name: 'Match', value: analysis.jobMatchScore, fill: analysis.jobMatchScore >= 70 ? '#10b981' : analysis.jobMatchScore >= 50 ? '#f59e0b' : '#ef4444' }] : [];

  const scoreBreakdownData = analysis ? [
    { name: 'ATS', value: analysis.scoreBreakdown.atsCompatibility, max: 25, fill: '#2563eb' },
    { name: 'Skills', value: analysis.scoreBreakdown.skills, max: 25, fill: '#0d9488' },
    { name: 'Experience', value: analysis.scoreBreakdown.experience, max: 20, fill: '#f59e0b' },
    { name: 'Projects', value: analysis.scoreBreakdown.projects, max: 15, fill: '#8b5cf6' },
    { name: 'Education', value: analysis.scoreBreakdown.education, max: 10, fill: '#06b6d4' },
    { name: 'Structure', value: analysis.scoreBreakdown.resumeStructure, max: 5, fill: '#10b981' },
  ] : [];

  return (
    <div className="no-print">
      <PageHeader title="AI Resume Analyzer" subtitle="Analyze your resume against current job-market requirements and discover exactly what you need to improve.">
        <span className="badge badge-blue"><Sparkles className="w-3 h-3 mr-1" /> AI-Powered</span>
      </PageHeader>

      {/* Section 1: Upload */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileSearch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Upload Your Resume</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload your resume and let SkillSync AI analyze your skills, experience and job-market readiness.</p>

        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Drag and drop your resume here</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Supports PDF, DOCX, TXT — Max 10 MB</p>
            <button className="btn-primary text-sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <Upload className="w-4 h-4" /> Choose Resume
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB · <span className="text-green-600 dark:text-green-400">Ready to analyze</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={removeFile} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors">
                <X className="w-3.5 h-3.5" /> Remove File
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {file && (
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button onClick={handleExtractAndAnalyze} disabled={analyzing || extracting} className="btn-primary text-sm">
              {extracting ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting text...</> : analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Analyze Resume</>}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Your resume is processed locally and is not uploaded to any server.
            </p>
          </div>
        )}
      </div>

      {/* Loading / Analysis Steps */}
      {(analyzing || extracting) && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{extracting ? 'Extracting text from resume...' : 'Analyzing your resume...'}</h3>
          </div>
          {!extracting && (
            <div className="space-y-3">
              {ANALYSIS_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${i < analysisStep ? 'bg-green-500 text-white' : i === analysisStep ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'}`}>
                    {i < analysisStep ? <CheckCircle className="w-4 h-4" /> : i === analysisStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-xs font-medium">{i + 1}</span>}
                  </div>
                  <p className={`text-sm transition-colors ${i <= analysisStep ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400 dark:text-gray-500'}`}>{step}</p>
                </div>
              ))}
            </div>
          )}
          {extracting && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Reading and extracting text from your {file?.name.split('.').pop()?.toUpperCase()} file...</p>
          )}
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !analyzing && !extracting && (
        <div ref={reportRef} className="space-y-6">
          {/* Section 2: Resume Score */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Resume Score</h3>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center">
                <ResponsiveContainer width={200} height={200}>
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={scoreData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: '#e5e7eb' }} dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="-mt-28 text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{analysis.resumeScore}</p>
                  <p className="text-xs text-gray-500">out of 100</p>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="space-y-3">
                  {scoreBreakdownData.map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}/{item.max}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(item.value / item.max) * 100}%`, backgroundColor: item.fill }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Profile Overview */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Detected Profile</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ProfileItem icon={User} label="Name" value={analysis.profile.name} />
              <ProfileItem icon={Mail} label="Email" value={analysis.profile.email} />
              <ProfileItem icon={Phone} label="Phone" value={analysis.profile.phone} />
              <ProfileItem icon={Linkedin} label="LinkedIn" value={analysis.profile.linkedin} />
              <ProfileItem icon={Github} label="GitHub" value={analysis.profile.github} />
              <ProfileItem icon={GraduationCap} label="Degree" value={analysis.profile.degree} />
              <ProfileItem icon={BookOpen} label="College" value={analysis.profile.college} />
              <ProfileItem icon={Briefcase} label="Experience" value={analysis.profile.experienceCount} />
              <ProfileItem icon={FileText} label="Projects" value={analysis.profile.projectCount !== 'Not detected' ? `${analysis.profile.projectCount} projects` : 'Not detected'} />
              <ProfileItem icon={Award} label="Certifications" value={analysis.profile.certificationCount !== 'Not detected' ? `${analysis.profile.certificationCount} certifications` : 'Not detected'} />
              <ProfileItem icon={TrendingUp} label="Achievements" value={analysis.profile.achievements} />
              <ProfileItem icon={GitBranch} label="Languages" value={analysis.profile.languages} />
            </div>
          </div>

          {/* Section 4: Skills Detected */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Skills Detected</h3>
            </div>
            {analysis.detectedSkills.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No skills detected. Please upload a resume with a clear skills section.</p>
            ) : (
              <div className="space-y-4">
                {analysis.detectedSkills.map((group) => (
                  <div key={group.category}>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{group.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.skills.map((skill) => (
                        <span key={skill} className="badge badge-blue">{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Target Job Role */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Target Job Role</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Select Target Job Role</label>
                <select value={targetRole} onChange={(e) => reAnalyzeWithRole(e.target.value)} className="input-field">
                  {targetJobRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <button onClick={handleAutoDetect} className="btn-secondary text-sm whitespace-nowrap">
                <Sparkles className="w-4 h-4" /> Auto Detect Job Role
              </button>
            </div>
            {useAutoDetect && analysis.autoDetectedRole && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Auto-detected role: <strong>{analysis.autoDetectedRole}</strong></p>
            )}
          </div>

          {/* Section 6: Job Market Match */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Job Market Match</h3>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center">
                <ResponsiveContainer width={180} height={180}>
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={matchScoreData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: '#e5e7eb' }} dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="-mt-24 text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{analysis.jobMatchScore}%</p>
                  <p className="text-xs text-gray-500">Match</p>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" /> Strong Match</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.strongMatch.length > 0 ? analysis.strongMatch.map((s) => <span key={s} className="badge badge-green">{s}</span>) : <span className="text-sm text-gray-400">None</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full" /> Partial Match</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.partialMatch.length > 0 ? analysis.partialMatch.map((s) => <span key={s} className="badge badge-yellow">{s}</span>) : <span className="text-sm text-gray-400">None</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" /> Missing</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills.length > 0 ? analysis.missingSkills.map((s) => <span key={s} className="badge badge-red">{s}</span>) : <span className="text-sm text-gray-400">None</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Essential Skills for Target Job */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Essential Skills for {analysis.targetJobRole}</h3>
            <p className="text-xs text-gray-500 mb-4">Based on the SkillSync demo dataset</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.essentialSkills.map((es) => (
                <div key={es.skill} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{es.skill}</span>
                  {es.matched ? <CheckCircle className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />}
                </div>
              ))}
            </div>
            <div className="mt-3 text-right">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{analysis.essentialSkills.filter((e) => e.matched).length}/{analysis.essentialSkills.length} skills matched</span>
            </div>
          </div>

          {/* Section 7: Skill Gaps */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Your Skill Gaps</h3>
            </div>
            <div className="space-y-3">
              {analysis.skillGaps.map((gap) => {
                const colors = severityColors[gap.severity];
                return (
                  <div key={gap.skill} className={`p-4 rounded-xl ${colors.bg}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{gap.skill}</span>
                        <span className={`badge ${gap.severity === 'critical' ? 'badge-red' : gap.severity === 'important' ? 'badge-yellow' : 'badge-green'}`}>{colors.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${colors.text}`}>{gap.gap}% gap</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <p>Industry requirement: <span className="font-medium">{gap.industryRequirement}%</span></p>
                      <p>Resume evidence: <span className="font-medium">{gap.resumeEvidence}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 8: ATS Analysis */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">ATS Compatibility</h3>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center">
                <ResponsiveContainer width={180} height={180}>
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={atsScoreData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: '#e5e7eb' }} dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="-mt-24 text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{analysis.atsScore}</p>
                  <p className="text-xs text-gray-500">out of 100</p>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-2">
                {analysis.atsChecks.map((check, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {check.passed ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> : <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{check.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {analysis.atsRecommendations.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">ATS Recommendations:</p>
                <ul className="space-y-1">
                  {analysis.atsRecommendations.map((rec, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-1.5"><span className="text-blue-500">•</span>{rec}</li>)}
                </ul>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3">Estimated ATS compatibility based on the SkillSync demo dataset. This does not guarantee ATS success.</p>
          </div>

          {/* Section 9: AI Recommendations */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
            </div>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center shrink-0 text-white text-xs font-bold">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{rec.title}</p>
                        <span className={`badge ${priorityColors[rec.priority]}`}>{rec.priority}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 10: Resume Improvements */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Improve My Resume</h3>
            </div>
            <div className="space-y-4">
              {analysis.resumeImprovements.map((imp, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{imp.section}</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Current</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{imp.current}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Recommended</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{imp.recommended}</p>
                      <button onClick={() => navigator.clipboard?.writeText(imp.recommended)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 flex items-center gap-1">
                        <GitBranch className="w-3 h-3" /> Copy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Analysis */}
          {analysis.projects.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Project Analysis</h3>
              </div>
              <div className="space-y-3">
                {analysis.projects.map((proj, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{proj.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Technologies: {proj.technologies}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{proj.strength}%</p>
                        <p className="text-[10px] text-gray-500">Strength</p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-600 rounded-full overflow-hidden mb-2">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${proj.strength}%`, backgroundColor: proj.strength >= 70 ? '#10b981' : proj.strength >= 40 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{proj.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 11: Learning Roadmap */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Personalized Learning Roadmap</h3>
            </div>
            <div className="space-y-3">
              {analysis.learningRoadmap.map((phase, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                    {i < analysis.learningRoadmap.length - 1 && <div className="w-0.5 h-8 bg-gray-200 dark:bg-slate-600 mt-1" />}
                  </div>
                  <div className="pt-1 pb-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{phase.phase}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {phase.skills.map((s) => <span key={s} className="badge badge-blue">{s}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/training" className="btn-secondary text-sm mt-4">
              <GraduationCap className="w-4 h-4" /> View Recommended Training
            </Link>
          </div>

          {/* Section 12: Job Description Comparison */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Compare With a Job Description</h3>
            </div>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste Job Description Here"
              rows={5}
              className="input-field resize-y"
            />
            <button onClick={handleJdCompare} disabled={!jdText.trim() || jdAnalyzing} className="btn-primary text-sm mt-3">
              {jdAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Analyze Match</>}
            </button>

            {jdResult && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{jdResult.matchScore}%</p>
                    <p className="text-xs text-gray-500">Match Score</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">Skills You Have</p>
                    <div className="flex flex-wrap gap-2">
                      {jdResult.skillsYouHave.length > 0 ? jdResult.skillsYouHave.map((s) => <span key={s} className="badge badge-green">{s}</span>) : <span className="text-sm text-gray-400">None matched</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">Skills Missing</p>
                    <div className="flex flex-wrap gap-2">
                      {jdResult.skillsMissing.length > 0 ? jdResult.skillsMissing.map((s) => <span key={s} className="badge badge-red">{s}</span>) : <span className="text-sm text-gray-400">None — all matched!</span>}
                    </div>
                  </div>
                </div>
                {jdResult.recommendedChanges.length > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">Recommended Changes:</p>
                    <ul className="space-y-1">
                      {jdResult.recommendedChanges.map((rec, i) => <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-1.5"><span className="text-blue-500">•</span>{rec}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 13: Download / Print / Actions */}
          <div className="card">
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={handlePrint} className="btn-primary text-sm">
                <Printer className="w-4 h-4" /> Print Report
              </button>
              <button onClick={deleteData} className="btn-secondary text-sm">
                <Trash2 className="w-4 h-4" /> Delete Resume Data
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">Your resume analysis is stored locally in your browser and is not sent to any server. Use "Delete Resume Data" to remove it.</p>
          </div>
        </div>
      )}

      {/* Empty state when no analysis */}
      {!analysis && !analyzing && !extracting && !file && (
        <div className="card text-center py-12">
          <FileSearch className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Upload your resume to get started. SkillSync AI will analyze it against current job-market requirements.</p>
        </div>
      )}
    </div>
  );
}

function ProfileItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  const notDetected = value === 'Not detected';
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${notDetected ? 'text-gray-300 dark:text-slate-600' : 'text-blue-600 dark:text-blue-400'}`} />
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`text-sm font-medium truncate ${notDetected ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>{value}</p>
      </div>
    </div>
  );
}


