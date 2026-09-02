import { useState, useMemo } from 'react';
import { MapPin, TrendingUp, AlertTriangle, GraduationCap, Target, Building2 } from 'lucide-react';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { PageHeader, Select } from '@/components/UI';
import { states } from '@/lib/demoData';

export function RegionalPage() {
  const [selectedState, setSelectedState] = useState(states[0].name);

  const state = useMemo(() => states.find((s) => s.name === selectedState)!, [selectedState]);

  const comparisonData = states.map((s) => ({
    state: s.name.slice(0, 2).toUpperCase(),
    Demand: s.jobDemand,
    Gap: s.skillGap,
    Employability: s.employability,
  }));

  const radarData = states.slice(0, 6).map((s) => ({
    state: s.name.slice(0, 2),
    Employability: s.employability,
    Gap: 100 - s.skillGap,
    Training: s.trainingPrograms * 4,
  }));

  return (
    <div>
      <PageHeader title="Regional Insights" subtitle="State and district-level workforce intelligence across India" />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="w-full sm:w-64">
          <Select label="Select State" value={selectedState} onChange={setSelectedState} options={states.map((s) => s.name)} />
        </div>
      </div>

      {/* State overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.jobDemand.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Job Demand</p>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.topIndustries.length}</p>
          <p className="text-sm text-gray-500">Top Industries</p>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.topSkills.length}</p>
          <p className="text-sm text-gray-500">Top Skills</p>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.skillGap}%</p>
          <p className="text-sm text-gray-500">Skill Gap</p>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.trainingPrograms}</p>
          <p className="text-sm text-gray-500">Training Programs</p>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{state.employability}%</p>
          <p className="text-sm text-gray-500">Employability</p>
        </div>
      </div>

      {/* State details */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Top Industries in {state.name}</h3>
          <div className="space-y-2">
            {state.topIndustries.map((ind, i) => (
              <div key={ind} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-blue-900 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{ind}</span>
                </div>
                <span className="badge badge-blue">High Demand</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Top Skills Required</h3>
          <div className="flex flex-wrap gap-2">
            {state.topSkills.map((s) => (
              <span key={s} className="badge badge-blue text-sm px-3 py-1.5">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Districts */}
      <div className="card mb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Districts in {state.name}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {state.districts.map((d) => (
            <div key={d} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">State Comparison</h3>
          <p className="text-xs text-gray-500 mb-4">Job demand, skill gap, and employability</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
              <XAxis dataKey="state" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Demand" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Gap" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Employability" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Regional Radar</h3>
          <p className="text-xs text-gray-500 mb-4">Multi-dimensional state comparison</p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" className="dark:opacity-20" />
              <PolarAngleAxis dataKey="state" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <PolarRadiusAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <Radar name="Employability" dataKey="Employability" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
              <Radar name="Training" dataKey="Training" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} />
              <Radar name="Skill Coverage" dataKey="Gap" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
