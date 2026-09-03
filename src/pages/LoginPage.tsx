import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Mail, Lock, ArrowRight, FileSearch, Zap, Target,
  TrendingUp, Briefcase, CheckCircle, AlertCircle, Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    }, 500);
  }

  function handleDemo() {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const result = loginDemo();
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    }, 400);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-700/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-lg">SkillSync India</p>
              <p className="text-xs text-blue-200">SIH26134</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Your Skills.<br />Your Future.<br />One Intelligent Platform.
          </h1>
          <p className="mt-6 text-blue-100 text-lg leading-relaxed max-w-md">
            Access AI-powered skill analysis, career recommendations, job-market insights and personalized learning pathways.
          </p>

          <div className="mt-10 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur">
              <FileSearch className="w-4 h-4 text-blue-200" />
              <span className="text-sm text-white">Resume</span>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-300" />
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur">
              <Zap className="w-4 h-4 text-blue-200" />
              <span className="text-sm text-white">Skills</span>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-300" />
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur">
              <Briefcase className="w-4 h-4 text-blue-200" />
              <span className="text-sm text-white">Job Market</span>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-300" />
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur">
              <Target className="w-4 h-4 text-blue-200" />
              <span className="text-sm text-white">Career</span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-6 text-blue-200">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /><span className="text-sm">12,500+ Jobs</span></div>
          <div className="flex items-center gap-2"><Zap className="w-4 h-4" /><span className="text-sm">850+ Skills</span></div>
          <div className="flex items-center gap-2"><Target className="w-4 h-4" /><span className="text-sm">128 Programs</span></div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg">SkillSync India</p>
              <p className="text-xs text-gray-500">SIH26134</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">Sign in to access your SkillSync dashboard.</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Forgot Password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Login <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <button onClick={handleDemo} disabled={loading} className="btn-secondary w-full justify-center mt-3">
            <Sparkles className="w-4 h-4" /> Use Demo Account
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Create Account</Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-6">
            Demo: <span className="font-medium">demo@skillsync.in</span> / <span className="font-medium">demo123</span>
          </p>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
