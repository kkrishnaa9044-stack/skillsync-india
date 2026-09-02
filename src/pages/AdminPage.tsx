import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Briefcase, TrendingUp, Building2, GraduationCap, FileText, Users } from 'lucide-react';
import { PageHeader, Select, EmptyState } from '@/components/UI';
import { Modal, ConfirmModal } from '@/components/Modal';
import { storage, uid } from '@/lib/storage';
import { states, industries } from '@/lib/demoData';
import { useApp } from '@/context/AppContext';
import type { Job, Skill, TrainingProgram, User as UserType } from '@/lib/types';

type Tab = 'jobs' | 'skills' | 'training' | 'industries' | 'users' | 'reports';

const tabs = [
  { id: 'jobs' as Tab, label: 'Jobs', icon: Briefcase },
  { id: 'skills' as Tab, label: 'Skills', icon: TrendingUp },
  { id: 'training' as Tab, label: 'Training Programs', icon: GraduationCap },
  { id: 'industries' as Tab, label: 'Industries', icon: Building2 },
  { id: 'users' as Tab, label: 'Users', icon: Users },
  { id: 'reports' as Tab, label: 'Reports', icon: FileText },
];

export function AdminPage() {
  const { addNotification } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('jobs');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const jobs = useMemo(() => storage.getJobs(), []);
  const skills = useMemo(() => storage.getSkills(), []);
  const trainingPrograms = useMemo(() => storage.getTrainingPrograms(), []);
  const allIndustries = useMemo(() => storage.getIndustries(), []);
  const users = useMemo(() => storage.getUsers(), []);

  const counts = {
    jobs: jobs.length,
    skills: skills.length,
    training: trainingPrograms.length,
    industries: allIndustries.length,
    users: users.length,
    reports: 0,
  };

  function openCreate() {
    setEditingId(null);
    setFormData({});
    setModalOpen(true);
  }

  function openEdit(id: string, data: Record<string, string>) {
    setEditingId(id);
    setFormData(data);
    setModalOpen(true);
  }

  function handleSave() {
    if (activeTab === 'jobs') {
      if (editingId) {
        const updated = jobs.map((j) => (j.id === editingId ? { ...j, ...formData } as Job : j));
        storage.saveJobs(updated);
      } else {
        const newJob: Job = {
          id: uid('j'),
          company: formData.company || 'New Company',
          role: formData.role || 'New Role',
          location: formData.location || 'Mumbai',
          state: formData.state || 'Maharashtra',
          district: formData.district || 'Mumbai',
          industry: formData.industry || 'IT & Software',
          salaryMin: Number(formData.salaryMin) || 5,
          salaryMax: Number(formData.salaryMax) || 10,
          experienceMin: Number(formData.experienceMin) || 0,
          experienceMax: Number(formData.experienceMax) || 2,
          skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()) : ['Python'],
          demand: (formData.demand as Job['demand']) || 'Medium',
          postedDate: new Date().toISOString().slice(0, 10),
        };
        storage.saveJobs([newJob, ...jobs]);
      }
    } else if (activeTab === 'skills') {
      if (editingId) {
        const updated = skills.map((s) => (s.id === editingId ? { ...s, ...formData } as Skill : s));
        storage.saveSkills(updated);
      } else {
        const newSkill: Skill = {
          id: uid('sk'),
          name: formData.name || 'New Skill',
          category: formData.category || 'Programming',
          demand: Number(formData.demand) || 70,
          growth: Number(formData.growth) || 15,
          industry: formData.industry || 'IT & Software',
        };
        storage.saveSkills([newSkill, ...skills]);
      }
    } else if (activeTab === 'training') {
      if (editingId) {
        const updated = trainingPrograms.map((p) => (p.id === editingId ? { ...p, ...formData, skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()) : p.skills } as TrainingProgram : p));
        storage.saveTrainingPrograms(updated);
      } else {
        const newProgram: TrainingProgram = {
          id: uid('tp'),
          name: formData.name || 'New Program',
          provider: formData.provider || 'NSDC',
          state: formData.state || 'Uttar Pradesh',
          skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()) : ['Python'],
          duration: formData.duration || '3 months',
          students: Number(formData.students) || 50,
          employmentRate: Number(formData.employmentRate) || 70,
          industryAlignment: Number(formData.industryAlignment) || 65,
        };
        storage.saveTrainingPrograms([newProgram, ...trainingPrograms]);
      }
    } else if (activeTab === 'users') {
      if (editingId) {
        const updated = users.map((u) => (u.id === editingId ? { ...u, ...formData } as UserType : u));
        storage.saveUsers(updated);
      } else {
        const newUser: UserType = {
          id: uid('u'),
          name: formData.name || 'New User',
          email: formData.email || 'user@skillsync.gov.in',
          role: formData.role || 'Student',
          createdAt: new Date().toISOString().slice(0, 10),
        };
        storage.saveUsers([newUser, ...users]);
      }
    }
    setModalOpen(false);
    addNotification({ title: editingId ? 'Record Updated' : 'Record Added', message: `${activeTab} record has been ${editingId ? 'updated' : 'added'}.`, type: 'success' });
    // Force re-render by changing state
    window.dispatchEvent(new Event('storage'));
    setTimeout(() => window.location.reload(), 100);
  }

  function handleDelete() {
    if (!deleteId) return;
    if (activeTab === 'jobs') storage.saveJobs(jobs.filter((j) => j.id !== deleteId));
    else if (activeTab === 'skills') storage.saveSkills(skills.filter((s) => s.id !== deleteId));
    else if (activeTab === 'training') storage.saveTrainingPrograms(trainingPrograms.filter((p) => p.id !== deleteId));
    else if (activeTab === 'users') storage.saveUsers(users.filter((u) => u.id !== deleteId));
    setDeleteId(null);
    addNotification({ title: 'Record Deleted', message: `${activeTab} record has been removed.`, type: 'info' });
    setTimeout(() => window.location.reload(), 100);
  }

  function getFields(): { key: string; label: string; type: string; options?: string[] }[] {
    switch (activeTab) {
      case 'jobs':
        return [
          { key: 'company', label: 'Company', type: 'text' },
          { key: 'role', label: 'Job Role', type: 'text' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'state', label: 'State', type: 'select', options: states.map((s) => s.name) },
          { key: 'industry', label: 'Industry', type: 'select', options: industries.map((i) => i.name) },
          { key: 'salaryMin', label: 'Salary Min (LPA)', type: 'number' },
          { key: 'salaryMax', label: 'Salary Max (LPA)', type: 'number' },
          { key: 'experienceMin', label: 'Exp Min (years)', type: 'number' },
          { key: 'experienceMax', label: 'Exp Max (years)', type: 'number' },
          { key: 'skills', label: 'Skills (comma-separated)', type: 'text' },
          { key: 'demand', label: 'Demand', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'] },
        ];
      case 'skills':
        return [
          { key: 'name', label: 'Skill Name', type: 'text' },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'industry', label: 'Industry', type: 'select', options: industries.map((i) => i.name) },
          { key: 'demand', label: 'Demand Score (0-100)', type: 'number' },
          { key: 'growth', label: 'Growth %', type: 'number' },
        ];
      case 'training':
        return [
          { key: 'name', label: 'Program Name', type: 'text' },
          { key: 'provider', label: 'Provider', type: 'text' },
          { key: 'state', label: 'State', type: 'select', options: states.map((s) => s.name) },
          { key: 'skills', label: 'Skills (comma-separated)', type: 'text' },
          { key: 'duration', label: 'Duration', type: 'text' },
          { key: 'students', label: 'Students', type: 'number' },
          { key: 'employmentRate', label: 'Employment Rate %', type: 'number' },
          { key: 'industryAlignment', label: 'Industry Alignment %', type: 'number' },
        ];
      case 'users':
        return [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'email', label: 'Email', type: 'text' },
          { key: 'role', label: 'Role', type: 'select', options: ['Policymaker', 'Training Institute', 'Industry Partner', 'Student', 'Admin'] },
        ];
      default:
        return [];
    }
  }

  function getRecordData(id: string): Record<string, string> {
    const record = (activeTab === 'jobs' ? jobs : activeTab === 'skills' ? skills : activeTab === 'training' ? trainingPrograms : activeTab === 'users' ? users : []).find((r) => r.id === id) as Record<string, unknown> | undefined;
    if (!record) return {};
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(record)) {
      result[k] = Array.isArray(v) ? v.join(', ') : String(v);
    }
    return result;
  }

  const canEdit = activeTab !== 'reports' && activeTab !== 'industries';

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Manage jobs, skills, training programs, industries, and users" />

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = counts[tab.id];
          return (
            <div key={tab.id} className="stat-card">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
              <p className="text-sm text-gray-500">{tab.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-900 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="card">
        {canEdit && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{counts[activeTab]} records</p>
            <button onClick={openCreate} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Add New
            </button>
          </div>
        )}

        {/* Jobs table */}
        {activeTab === 'jobs' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 dark:border-slate-700">
                <th className="table-header">Company</th><th className="table-header">Role</th><th className="table-header">Location</th><th className="table-header">Industry</th><th className="table-header">Salary</th><th className="table-header">Actions</th>
              </tr></thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-b border-gray-50 dark:border-slate-700/50">
                    <td className="table-cell font-medium">{j.company}</td><td className="table-cell">{j.role}</td><td className="table-cell">{j.location}</td><td className="table-cell">{j.industry}</td><td className="table-cell">₹{j.salaryMin}–{j.salaryMax} LPA</td>
                    <td className="table-cell"><div className="flex gap-2"><button onClick={() => openEdit(j.id, getRecordData(j.id))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><Edit className="w-4 h-4 text-gray-500" /></button><button onClick={() => setDeleteId(j.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Skills table */}
        {activeTab === 'skills' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 dark:border-slate-700">
                <th className="table-header">Skill</th><th className="table-header">Category</th><th className="table-header">Industry</th><th className="table-header">Demand</th><th className="table-header">Growth</th><th className="table-header">Actions</th>
              </tr></thead>
              <tbody>
                {skills.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 dark:border-slate-700/50">
                    <td className="table-cell font-medium">{s.name}</td><td className="table-cell">{s.category}</td><td className="table-cell">{s.industry}</td><td className="table-cell">{s.demand}</td><td className="table-cell">{s.growth}%</td>
                    <td className="table-cell"><div className="flex gap-2"><button onClick={() => openEdit(s.id, getRecordData(s.id))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><Edit className="w-4 h-4 text-gray-500" /></button><button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Training table */}
        {activeTab === 'training' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 dark:border-slate-700">
                <th className="table-header">Program</th><th className="table-header">Provider</th><th className="table-header">State</th><th className="table-header">Students</th><th className="table-header">Alignment</th><th className="table-header">Actions</th>
              </tr></thead>
              <tbody>
                {trainingPrograms.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-slate-700/50">
                    <td className="table-cell font-medium">{p.name}</td><td className="table-cell">{p.provider}</td><td className="table-cell">{p.state}</td><td className="table-cell">{p.students}</td><td className="table-cell">{p.industryAlignment}%</td>
                    <td className="table-cell"><div className="flex gap-2"><button onClick={() => openEdit(p.id, getRecordData(p.id))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><Edit className="w-4 h-4 text-gray-500" /></button><button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Industries table */}
        {activeTab === 'industries' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 dark:border-slate-700">
                <th className="table-header">Industry</th><th className="table-header">Demand</th><th className="table-header">Growth</th><th className="table-header">Jobs</th><th className="table-header">Avg Salary</th><th className="table-header">Critical Skills</th>
              </tr></thead>
              <tbody>
                {allIndustries.map((ind) => (
                  <tr key={ind.id} className="border-b border-gray-50 dark:border-slate-700/50">
                    <td className="table-cell font-medium">{ind.name}</td><td className="table-cell">{ind.demandScore}</td><td className="table-cell">{ind.growth}%</td><td className="table-cell">{ind.jobCount}</td><td className="table-cell">₹{ind.avgSalaryMin}–{ind.avgSalaryMax} LPA</td><td className="table-cell">{ind.criticalSkills.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users table */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 dark:border-slate-700">
                <th className="table-header">Name</th><th className="table-header">Email</th><th className="table-header">Role</th><th className="table-header">Created</th><th className="table-header">Actions</th>
              </tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 dark:border-slate-700/50">
                    <td className="table-cell font-medium">{u.name}</td><td className="table-cell">{u.email}</td><td className="table-cell">{u.role}</td><td className="table-cell">{u.createdAt}</td>
                    <td className="table-cell"><div className="flex gap-2"><button onClick={() => openEdit(u.id, getRecordData(u.id))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><Edit className="w-4 h-4 text-gray-500" /></button><button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reports tab */}
        {activeTab === 'reports' && (
          <EmptyState message="Reports can be generated from the Reports page. Admin view shows report metadata only." />
        )}
      </div>

      {/* Edit/Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? `Edit ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`} size="lg">
        <div className="space-y-3">
          {getFields().map((field) => (
            <div key={field.key}>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">{field.label}</label>
              {field.type === 'select' ? (
                <select value={formData[field.key] || ''} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} className="input-field">
                  <option value="">Select {field.label}</option>
                  {field.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={field.type} value={formData[field.key] || ''} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} className="input-field" />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Record" message="Are you sure you want to delete this record? This action cannot be undone." />
    </div>
  );
}
