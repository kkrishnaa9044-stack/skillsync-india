import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Mail, ArrowRight, AlertCircle, CheckCircle, Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = resetPassword(email);
      setLoading(false);
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    }, 500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">SkillSync India</p>
            <p className="text-xs text-gray-500">SIH26134</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot your password?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">Enter your email and we'll send you reset instructions.</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-field pl-10" autoComplete="email" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Sign In</Link>
        </p>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
