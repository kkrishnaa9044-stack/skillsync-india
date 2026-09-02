import { useState } from 'react';
import { User, Bell, Moon, Sun, Database, Save, CheckCircle2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/UI';
import { useApp } from '@/context/AppContext';
import { storage } from '@/lib/storage';

export function SettingsPage() {
  const { theme, toggleTheme, notifications, markAllRead, addNotification } = useApp();
  const [profile, setProfile] = useState({
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@skillsync.gov.in',
    role: 'Policymaker',
    organization: 'Ministry of Skill Development',
  });
  const [notifPrefs, setNotifPrefs] = useState({
    skillGaps: true,
    curriculumUpdates: true,
    demandChanges: true,
    newPrograms: true,
  });
  const [dataPrefs, setDataPrefs] = useState({
    autoRefresh: true,
    showTrends: true,
    defaultState: 'Uttar Pradesh',
    dataRange: 'Last 6 Months',
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    addNotification({
      title: 'Settings Updated',
      message: 'Your settings have been saved successfully.',
      type: 'success',
    });
    setTimeout(() => setSaved(false), 3000);
  }

  function handleResetData() {
    if (confirm('Reset all demo data to defaults? This will clear all custom changes.')) {
      localStorage.removeItem('skillsync_jobs');
      localStorage.removeItem('skillsync_skills');
      localStorage.removeItem('skillsync_industries');
      localStorage.removeItem('skillsync_training_programs');
      localStorage.removeItem('skillsync_students');
      addNotification({
        title: 'Data Reset',
        message: 'All demo data has been reset to defaults.',
        type: 'info',
      });
      setTimeout(() => window.location.reload(), 500);
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile, notifications, theme, and data preferences">
        <button onClick={handleSave} className="btn-primary text-sm">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </PageHeader>

      {saved && (
        <div className="card border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800 dark:text-green-400">Settings saved successfully!</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Profile
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Email</label>
              <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Role</label>
              <select value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} className="input-field">
                {['Policymaker', 'Training Institute', 'Industry Partner', 'Student', 'Admin'].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Organization</label>
              <input type="text" value={profile.organization} onChange={(e) => setProfile({ ...profile, organization: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" /> Notifications
          </h3>
          <div className="space-y-3">
            {[
              { key: 'skillGaps', label: 'Critical skill gap alerts' },
              { key: 'curriculumUpdates', label: 'AI curriculum recommendations' },
              { key: 'demandChanges', label: 'Industry demand changes' },
              { key: 'newPrograms', label: 'New training programs' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                <button
                  type="button"
                  onClick={() => setNotifPrefs({ ...notifPrefs, [item.key]: !notifPrefs[item.key as keyof typeof notifPrefs] })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${notifPrefs[item.key as keyof typeof notifPrefs] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${notifPrefs[item.key as keyof typeof notifPrefs] ? 'translate-x-5' : ''}`} />
                </button>
              </label>
            ))}
            <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
              <p className="text-xs text-gray-500 mb-2">{notifications.filter((n) => !n.read).length} unread notifications</p>
              <button onClick={markAllRead} className="btn-secondary text-sm w-full justify-center">Mark All as Read</button>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            {theme === 'light' ? <Sun className="w-5 h-5 text-blue-600" /> : <Moon className="w-5 h-5 text-blue-400" />} Theme
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}
            >
              <Sun className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Light Mode</p>
              <p className="text-xs text-gray-500 mt-1">White background, dark text</p>
            </button>
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}
            >
              <Moon className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-gray-500 mt-1">Dark background, light text</p>
            </button>
          </div>
          <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400">Current theme: <span className="font-medium text-gray-900 dark:text-white">{theme === 'light' ? 'Light' : 'Dark'}</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your preference is saved automatically and persists across sessions.</p>
          </div>
        </div>

        {/* Data Preferences */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" /> Data Preferences
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-refresh dashboard data</span>
              <button
                type="button"
                onClick={() => setDataPrefs({ ...dataPrefs, autoRefresh: !dataPrefs.autoRefresh })}
                className={`relative w-11 h-6 rounded-full transition-colors ${dataPrefs.autoRefresh ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${dataPrefs.autoRefresh ? 'translate-x-5' : ''}`} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show trend indicators</span>
              <button
                type="button"
                onClick={() => setDataPrefs({ ...dataPrefs, showTrends: !dataPrefs.showTrends })}
                className={`relative w-11 h-6 rounded-full transition-colors ${dataPrefs.showTrends ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${dataPrefs.showTrends ? 'translate-x-5' : ''}`} />
              </button>
            </label>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Default State</label>
              <select value={dataPrefs.defaultState} onChange={(e) => setDataPrefs({ ...dataPrefs, defaultState: e.target.value })} className="input-field">
                {['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Rajasthan', 'West Bengal', 'Haryana'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Default Data Range</label>
              <select value={dataPrefs.dataRange} onChange={(e) => setDataPrefs({ ...dataPrefs, dataRange: e.target.value })} className="input-field">
                {['Last 3 Months', 'Last 6 Months', 'Last Year'].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
              <button onClick={handleResetData} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-600 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium">
                <Trash2 className="w-4 h-4" /> Reset All Demo Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
