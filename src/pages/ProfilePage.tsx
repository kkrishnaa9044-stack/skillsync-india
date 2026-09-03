import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, GraduationCap, MapPin, Target, Save, CheckCircle,
  AlertCircle, Loader2, ArrowLeft, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { states } from '@/lib/demoData';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [education, setEducation] = useState(user?.education || '');
  const [state, setState] = useState(user?.state || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [careerInterest, setCareerInterest] = useState(user?.careerInterest || '');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const availableDistricts = states.find((s) => s.name === state)?.districts || [];

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const result = updateProfile({ name, education, state, district, careerInterest });
      setLoading(false);
      setToast({ type: result.success ? 'success' : 'error', message: result.message });
      setTimeout(() => setToast(null), 3000);
    }, 400);
  }

  if (!user) return null;

  const initials = user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      <div className="mb-6">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your SkillSync account information.</p>
      </div>

      {toast && (
        <div className={`mb-4 flex items-start gap-2 p-3 rounded-xl ${toast.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
          <p className={`text-sm ${toast.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{toast.message}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile summary card */}
        <div className="card text-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-900 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            {initials || 'U'}
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
            <Sparkles className="w-3 h-3" /> {user.role}
          </div>
          <p className="text-xs text-gray-400 mt-3">Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
        </div>

        {/* Edit form */}
        <div className="card lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-10" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Email (read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={user.email} disabled className="input-field pl-10 opacity-60 cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Education</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. B.Tech Computer Science" className="input-field pl-10" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">State</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={state} onChange={(e) => { setState(e.target.value); setDistrict(''); }} className="input-field pl-10">
                    <option value="">Select State</option>
                    {states.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">District</label>
                <select value={district} onChange={(e) => setDistrict(e.target.value)} className="input-field" disabled={!availableDistricts.length}>
                  <option value="">Select District</option>
                  {availableDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Career Interest</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={careerInterest} onChange={(e) => setCareerInterest(e.target.value)} placeholder="e.g. Data Analyst" className="input-field pl-10" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
