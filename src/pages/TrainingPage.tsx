import { useState, useMemo } from 'react';
import { Search, GraduationCap, Users, TrendingUp, Clock } from 'lucide-react';
import { PageHeader, FilterBar, Select, ProgressBar, EmptyState } from '@/components/UI';
import { Modal } from '@/components/Modal';
import { states, industries } from '@/lib/demoData';
import { storage } from '@/lib/storage';
import type { TrainingProgram } from '@/lib/types';

export function TrainingPage() {
  const allPrograms = useMemo(() => storage.getTrainingPrograms(), []);

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selected, setSelected] = useState<TrainingProgram | null>(null);

  const filtered = useMemo(() => {
    let result = allPrograms.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.provider.toLowerCase().includes(q) && !p.skills.some((s) => s.toLowerCase().includes(q))) return false;
      }
      if (stateFilter && p.state !== stateFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'students') return b.students - a.students;
      if (sortBy === 'employment') return b.employmentRate - a.employmentRate;
      if (sortBy === 'alignment') return b.industryAlignment - a.industryAlignment;
      return 0;
    });

    return result;
  }, [allPrograms, search, stateFilter, sortBy]);

  return (
    <div>
      <PageHeader title="Training Programs" subtitle={`${filtered.length} training programs across India`} />

      <FilterBar>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 min-w-[180px]"
            />
          </div>
        </div>
        <Select label="State" value={stateFilter} onChange={setStateFilter} options={states.map((s) => s.name)} />
        <Select label="Sort By" value={sortBy} onChange={setSortBy} options={['name', 'students', 'employment', 'alignment']} />
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState message="No training programs match your filters." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="card overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700">
                    <th className="table-header">Program</th>
                    <th className="table-header">Provider</th>
                    <th className="table-header">State</th>
                    <th className="table-header">Skills</th>
                    <th className="table-header">Duration</th>
                    <th className="table-header">Students</th>
                    <th className="table-header">Employment</th>
                    <th className="table-header">Alignment</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                      onClick={() => setSelected(p)}
                    >
                      <td className="table-cell font-medium text-gray-900 dark:text-white">{p.name}</td>
                      <td className="table-cell">{p.provider}</td>
                      <td className="table-cell">{p.state}</td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {p.skills.slice(0, 3).map((s) => (
                            <span key={s} className="badge badge-blue">{s}</span>
                          ))}
                          {p.skills.length > 3 && <span className="badge badge-blue">+{p.skills.length - 3}</span>}
                        </div>
                      </td>
                      <td className="table-cell">{p.duration}</td>
                      <td className="table-cell">{p.students}</td>
                      <td className="table-cell">
                        <span className={`badge ${p.employmentRate >= 80 ? 'badge-green' : p.employmentRate >= 70 ? 'badge-yellow' : 'badge-red'}`}>
                          {p.employmentRate}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={p.industryAlignment} color="bg-teal-500" />
                          <span className="text-xs w-8">{p.industryAlignment}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="card card-hover" onClick={() => setSelected(p)}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.provider} · {p.state}</p>
                  </div>
                  <span className={`badge ${p.employmentRate >= 80 ? 'badge-green' : p.employmentRate >= 70 ? 'badge-yellow' : 'badge-red'}`}>
                    {p.employmentRate}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.skills.map((s) => (
                    <span key={s} className="badge badge-blue">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.students} students</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{p.industryAlignment}% aligned</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''} size="md">
        {selected && (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-gray-500">Provider</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selected.provider}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-gray-500">State</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selected.state}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selected.duration}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3">
                <p className="text-xs text-gray-500">Students Enrolled</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selected.students}</p>
              </div>
            </div>

            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Skills Covered</h4>
              <div className="flex flex-wrap gap-2">
                {selected.skills.map((s) => (
                  <span key={s} className="badge badge-blue">{s}</span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Employment Rate</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{selected.employmentRate}%</span>
                </div>
                <ProgressBar value={selected.employmentRate} color="bg-green-500" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Industry Alignment</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{selected.industryAlignment}%</span>
                </div>
                <ProgressBar value={selected.industryAlignment} color="bg-teal-500" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
