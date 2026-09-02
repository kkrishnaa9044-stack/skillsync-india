import { useState, useMemo } from 'react';
import { Search, Briefcase, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, FilterBar, Select, Badge, EmptyState } from '@/components/UI';
import { states, industries } from '@/lib/demoData';
import { storage } from '@/lib/storage';
import type { Job } from '@/lib/types';

const PAGE_SIZE = 10;

export function JobsPage() {
  const allJobs = useMemo(() => storage.getJobs(), []);

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [demandFilter, setDemandFilter] = useState('');
  const [sortBy, setSortBy] = useState('role');
  const [page, setPage] = useState(1);

  const allSkills = useMemo(() => [...new Set(allJobs.flatMap((j) => j.skills))].sort(), [allJobs]);
  const jobRoles = useMemo(() => [...new Set(allJobs.map((j) => j.role))].sort(), [allJobs]);

  const filtered = useMemo(() => {
    let result = allJobs.filter((j) => {
      if (search) {
        const q = search.toLowerCase();
        if (!j.role.toLowerCase().includes(q) && !j.company.toLowerCase().includes(q) && !j.location.toLowerCase().includes(q)) return false;
      }
      if (stateFilter && j.state !== stateFilter) return false;
      if (industryFilter && j.industry !== industryFilter) return false;
      if (skillFilter && !j.skills.includes(skillFilter)) return false;
      if (demandFilter && j.demand !== demandFilter) return false;
      if (expFilter) {
        const [min, max] = expFilter.split('-').map(Number);
        if (j.experienceMin < min || j.experienceMax > max) return false;
      }
      if (salaryFilter) {
        const [min] = salaryFilter.split('-').map(Number);
        if (j.salaryMax < min) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'role') return a.role.localeCompare(b.role);
      if (sortBy === 'company') return a.company.localeCompare(b.company);
      if (sortBy === 'salary') return b.salaryMax - a.salaryMax;
      if (sortBy === 'experience') return a.experienceMin - b.experienceMin;
      if (sortBy === 'demand') {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return order[a.demand] - order[b.demand];
      }
      return 0;
    });

    return result;
  }, [allJobs, search, stateFilter, industryFilter, skillFilter, demandFilter, expFilter, salaryFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetPage() { setPage(1); }

  return (
    <div>
      <PageHeader title="Job Market" subtitle={`${filtered.length} jobs available across India`} />

      <FilterBar>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="input-field pl-10 min-w-[180px]"
            />
          </div>
        </div>
        <Select label="State" value={stateFilter} onChange={(v) => { setStateFilter(v); resetPage(); }} options={states.map((s) => s.name)} />
        <Select label="Industry" value={industryFilter} onChange={(v) => { setIndustryFilter(v); resetPage(); }} options={industries.map((i) => i.name)} />
        <Select label="Experience" value={expFilter} onChange={(v) => { setExpFilter(v); resetPage(); }} options={['0-2', '1-3', '2-5', '3-8']} />
        <Select label="Salary (LPA)" value={salaryFilter} onChange={(v) => { setSalaryFilter(v); resetPage(); }} options={['3-6', '5-10', '8-14', '10-20']} />
        <Select label="Skill" value={skillFilter} onChange={(v) => { setSkillFilter(v); resetPage(); }} options={allSkills} />
        <Select label="Demand" value={demandFilter} onChange={(v) => { setDemandFilter(v); resetPage(); }} options={['Critical', 'High', 'Medium', 'Low']} />
        <Select label="Sort By" value={sortBy} onChange={setSortBy} options={['role', 'company', 'salary', 'experience', 'demand']} />
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState message="No jobs match your filters. Try adjusting your search." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="card overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700">
                    <th className="table-header">Company</th>
                    <th className="table-header">Job Role</th>
                    <th className="table-header">Location</th>
                    <th className="table-header">Salary</th>
                    <th className="table-header">Experience</th>
                    <th className="table-header">Required Skills</th>
                    <th className="table-header">Demand</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((job: Job) => (
                    <tr key={job.id} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="table-cell font-medium text-gray-900 dark:text-white">{job.company}</td>
                      <td className="table-cell">{job.role}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {job.location}
                        </div>
                      </td>
                      <td className="table-cell">₹{job.salaryMin}–{job.salaryMax} LPA</td>
                      <td className="table-cell">{job.experienceMin}–{job.experienceMax} yrs</td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1">
                          {job.skills.map((s) => (
                            <span key={s} className="badge badge-blue">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="table-cell"><Badge status={job.demand} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {paged.map((job: Job) => (
              <div key={job.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{job.role}</p>
                    <p className="text-sm text-gray-500">{job.company}</p>
                  </div>
                  <Badge status={job.demand} />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span>₹{job.salaryMin}–{job.salaryMax} LPA</span>
                  <span>{job.experienceMin}–{job.experienceMax} yrs</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {job.skills.map((s) => (
                    <span key={s} className="badge badge-blue">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} · {filtered.length} total jobs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
