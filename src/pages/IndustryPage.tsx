import { useState, useMemo } from 'react';
import { Building2, TrendingUp, AlertTriangle, IndianRupee, Briefcase, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '@/components/UI';
import { Modal } from '@/components/Modal';
import { storage } from '@/lib/storage';
import type { Industry } from '@/lib/types';

export function IndustryPage() {
  const industries = useMemo(() => storage.getIndustries(), []);
  const [selected, setSelected] = useState<Industry | null>(null);

  const chartData = industries.map((ind) => ({
    name: ind.name.length > 12 ? ind.name.slice(0, 10) + '…' : ind.name,
    demand: ind.demandScore,
    growth: ind.growth,
  }));

  return (
    <div>
      <PageHeader title="Industry Demand" subtitle="Demand scores, growth rates, and critical skills across 10 industries" />

      <div className="card mb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Industry Demand & Growth Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
            <Bar dataKey="demand" name="Demand Score" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={20} />
            <Bar dataKey="growth" name="Growth %" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {industries.map((ind) => (
          <div
            key={ind.id}
            className="card card-hover"
            onClick={() => setSelected(ind)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className={`badge ${ind.demandScore >= 85 ? 'badge-red' : ind.demandScore >= 70 ? 'badge-yellow' : 'badge-green'}`}>
                Demand: {ind.demandScore}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{ind.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{ind.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <TrendingUp className="w-3.5 h-3.5 text-teal-500" /> {ind.growth}% growth
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" /> {ind.jobCount} jobs
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <IndianRupee className="w-3.5 h-3.5 text-green-500" /> ₹{ind.avgSalaryMin}–{ind.avgSalaryMax} LPA
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> {ind.criticalSkills.length} critical
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''} size="lg">
        {selected && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">{selected.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-gray-500">Demand Score</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{selected.demandScore}/100</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-gray-500">Growth Rate</p>
                <p className="text-xl font-bold text-teal-600">{selected.growth}%</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-gray-500">Total Jobs</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{selected.jobCount.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-gray-500">Avg Salary</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">₹{selected.avgSalaryMin}–{selected.avgSalaryMax} LPA</p>
              </div>
            </div>

            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Top Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selected.topSkills.map((s) => (
                  <span key={s} className="badge badge-blue">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Critical Skills (Gap Areas)</h4>
              <div className="flex flex-wrap gap-2">
                {selected.criticalSkills.map((s) => (
                  <span key={s} className="badge badge-red">{s}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
