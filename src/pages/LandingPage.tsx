import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, TrendingUp, Brain, MapPin, GraduationCap,
  Users, BarChart3, AlertTriangle, Building2, Target, CheckCircle2,
  Briefcase, LogIn, UserPlus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const solutionCards = [
  { icon: TrendingUp, title: 'Labour Market Intelligence', desc: 'Real-time analysis of job postings, hiring trends, and emerging skill demands across India.', color: 'bg-blue-600' },
  { icon: Target, title: 'Skill Gap Analysis', desc: 'AI-powered comparison between industry requirements and existing training program coverage.', color: 'bg-teal-600' },
  { icon: Brain, title: 'AI Curriculum Recommendation', desc: 'Dynamic curriculum modules generated from real job role and industry skill requirements.', color: 'bg-indigo-600' },
  { icon: MapPin, title: 'Regional Workforce Intelligence', desc: 'State and district-level insights into job demand, skill gaps, and training availability.', color: 'bg-cyan-600' },
  { icon: GraduationCap, title: 'Training Program Alignment', desc: 'Evaluate and align training programs with current industry standards and emerging technologies.', color: 'bg-emerald-600' },
  { icon: Users, title: 'Student Career Guidance', desc: 'Personalized career paths with skill match scores and recommended learning journeys.', color: 'bg-orange-600' },
];

const flowSteps = [
  { label: 'Job Market', icon: Briefcase },
  { label: 'Industry Demand', icon: Building2 },
  { label: 'Skill Analysis', icon: BarChart3 },
  { label: 'Training Gap', icon: AlertTriangle },
  { label: 'AI Recommendation', icon: Sparkles },
  { label: 'Better Employability', icon: CheckCircle2 },
];

const impactStats = [
  { value: '12,500+', label: 'Jobs Analyzed' },
  { value: '850+', label: 'Skills Tracked' },
  { value: '128', label: 'Training Programs' },
  { value: '28', label: 'States' },
  { value: '67', label: 'Industry Partners' },
  { value: '72%', label: 'Training Alignment' },
];

const problems = [
  'Industry requirements change rapidly with new technologies, leaving training programs outdated.',
  'Training curricula often lag behind, teaching skills that are no longer in high demand.',
  'Students invest in education but may graduate without the skills employers actually need.',
  'Regional skill gaps vary widely across districts, making one-size-fits-all policies ineffective.',
  'Government and policymakers lack real-time labour-market intelligence for evidence-based decisions.',
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const dashboardLink = isAuthenticated ? '/dashboard' : '/login';
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-900 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">SkillSync India</p>
              <p className="text-[10px] text-gray-500">SIH26134</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#problem" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Problem</a>
            <a href="#solution" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Solution</a>
            <a href="#impact" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Impact</a>
            <Link to={dashboardLink} className="btn-primary text-sm">Explore Dashboard <ArrowRight className="w-4 h-4" /></Link>
            {!isAuthenticated && (
              <Link to="/register" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <UserPlus className="w-4 h-4" /> Create Account
              </Link>
            )}
          </div>
          <Link to={dashboardLink} className="md:hidden btn-primary text-sm px-4 py-2">Dashboard</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Skill Intelligence Platform
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Bridge the Skills Gap. <span className="text-blue-700 dark:text-blue-400">Build India's Future Workforce.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              SkillSync India uses labour-market intelligence and AI-driven insights to align skill development programs with real industry requirements and emerging job opportunities.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to={dashboardLink} className="btn-primary justify-center">
                {isAuthenticated ? 'Explore Dashboard' : 'Get Started'} <ArrowRight className="w-4 h-4" />
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="btn-secondary justify-center">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
              )}
              {isAuthenticated && (
                <Link to="/skill-gap" className="btn-secondary justify-center">
                  Analyze Skill Gap <Target className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Flow */}
          <div className="mt-16">
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {flowSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex items-center gap-2 md:gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-gray-100 dark:border-slate-700 flex items-center justify-center">
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-[10px] md:text-xs font-medium text-gray-600 dark:text-gray-300 text-center max-w-[70px]">{step.label}</p>
                    </div>
                    {i < flowSteps.length - 1 && (
                      <div className="hidden sm:block w-6 md:w-8 h-px bg-gradient-to-r from-blue-300 to-teal-300 dark:from-blue-700 dark:to-teal-700" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="py-16 md:py-24 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="badge badge-red mb-3">The Challenge</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">The Problem</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              India's skill ecosystem faces a critical misalignment between training and industry needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((p, i) => (
              <div key={i} className="card card-hover">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="badge badge-blue mb-3">The Solution</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">AI-Powered Skill Intelligence</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Six integrated modules working together to close the skill gap.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {solutionCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="card card-hover group">
                  <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="py-16 md:py-24 bg-blue-900 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-800 text-blue-200 text-xs font-medium mb-3">
              Real Impact
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Our Reach & Impact</h2>
            <p className="mt-3 text-blue-200 max-w-2xl mx-auto">
              Data-driven intelligence powering India's skill development ecosystem.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {impactStats.map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-5 text-center border border-white/10">
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs md:text-sm text-blue-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Ready to explore the platform?</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Dive into the dashboard, analyze skill gaps, and generate AI-powered curriculum recommendations.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={dashboardLink} className="btn-primary justify-center">
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'} <ArrowRight className="w-4 h-4" />
            </Link>
            {isAuthenticated ? (
              <Link to="/recommendations" className="btn-secondary justify-center">
                AI Curriculum Advisor <Brain className="w-4 h-4" />
              </Link>
            ) : (
              <Link to="/register" className="btn-secondary justify-center">
                <UserPlus className="w-4 h-4" /> Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">SkillSync India</p>
              <p className="text-xs text-gray-500">Smart India Hackathon · SIH26134</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Government of India Initiative · Aligning Skills with Industry</p>
        </div>
      </footer>
    </div>
  );
}
