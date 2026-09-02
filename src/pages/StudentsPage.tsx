import { useState, useMemo } from 'react';
import { UserPlus, Trash2, Edit, Target, TrendingUp, AlertCircle, GraduationCap } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { PageHeader, Select, EmptyState, ProgressBar } from '@/components/UI';
import { Modal, ConfirmModal } from '@/components/Modal';
import { states } from '@/lib/demoData';
import { storage, uid } from '@/lib/storage';
import { useApp } from '@/context/AppContext';
import {
  getRequiredSkills, computeAlignment, computeSkillGaps, generateLearningPath,
} from '@/lib/aiEngine';
import type { StudentProfile } from '@/lib/types';

const allSkillsList = ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics', 'Tableau', 'Cloud (AWS)', 'React', 'Node.js', 'Machine Learning', 'Generative AI', 'Linux', 'Networking', 'Docker', 'Kubernetes', 'Cybersecurity', 'IoT', 'Robotics', 'PLC Programming', 'CAD/CAM', 'EV Technology', 'Embedded Systems', 'Financial Analysis', 'Supply Chain Mgmt', 'Solar Technology', 'Nursing', 'Medical Lab Tech'];

const careerInterests = ['Data Analyst', 'Cybersecurity Analyst', 'Cloud Engineer', 'Full Stack Developer', 'AI Engineer', 'DevOps Engineer', 'Data Scientist', 'ML Engineer', 'EV Engineer', 'Robotics Engineer', 'Financial Analyst', 'Healthcare Data Analyst', 'Solar Energy Engineer', 'Supply Chain Analyst', 'Network Engineer'];

export function StudentsPage() {
  const { addNotification } = useApp();
  const [profiles, setProfiles] = useState<StudentProfile[]>(() => storage.getStudents());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StudentProfile | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null);

  const [form, setForm] = useState({
    name: '', education: 'B.Tech', state: 'Uttar Pradesh', district: '', skills: [] as string[],
    careerInterest: 'Data Analyst', experience: 0,
  });

  function resetForm() {
    setForm({ name: '', education: 'B.Tech', state: 'Uttar Pradesh', district: '', skills: [], careerInterest: 'Data Analyst', experience: 0 });
    setEditing(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(p: StudentProfile) {
    setForm({ name: p.name, education: p.education, state: p.state, district: p.district, skills: p.skills, careerInterest: p.careerInterest, experience: p.experience });
    setEditing(p);
    setShowForm(true);
  }

  function saveProfile() {
    if (!form.name.trim()) return;
    if (editing) {
      const updated = profiles.map((p) => (p.id === editing.id ? { ...editing, ...form } : p));
      setProfiles(updated);
      storage.saveStudents(updated);
      addNotification({ title: 'Student Profile Updated', message: `${form.name}'s profile has been updated.`, type: 'info' });
    } else {
      const newProfile: StudentProfile = { id: uid('stu'), ...form, createdAt: new Date().toISOString() };
      const updated = [newProfile, ...profiles];
      setProfiles(updated);
      storage.saveStudents(updated);
      addNotification({ title: 'Student Profile Created', message: `${form.name}'s profile has been created.`, type: 'success' });
    }
    setShowForm(false);
    resetForm();
  }

  function deleteProfile() {
    if (!deleteId) return;
    const updated = profiles.filter((p) => p.id !== deleteId);
    setProfiles(updated);
    storage.saveStudents(updated);
    addNotification({ title: 'Student Profile Deleted', message: 'Student profile has been removed.', type: 'info' });
    setDeleteId(null);
  }

  function toggleSkill(skill: string) {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }));
  }

  const availableDistricts = useMemo(() => {
    const s = states.find((s) => s.name === form.state);
    return s ? s.districts : [];
  }, [form.state]);

  // Analysis for selected profile
  const analysis = useMemo(() => {
    if (!selectedProfile) return null;
    const required = getRequiredSkills(selectedProfile.careerInterest, 'IT & Software');
    const alignment = computeAlignment(selectedProfile.skills, required);
    const gaps = computeSkillGaps(selectedProfile.skills, required);
    const missing = gaps.filter((g) => g.gap >= 15).map((g) => g.skill);
    const learningPath = generateLearningPath(missing, selectedProfile.careerInterest);

    const radarData = required.map((s) => ({
      skill: s.slice(0, 8),
      Student: selectedProfile.skills.includes(s) ? 100 : 0,
      Required: 80,
    }));

    return { required, alignment, gaps, missing, learningPath, radarData };
  }, [selectedProfile]);

  return (
    <div>
      <PageHeader title="Student Profiles" subtitle="AI-powered career guidance with skill match analysis">
        <button onClick={openCreate} className="btn-primary text-sm">
          <UserPlus className="w-4 h-4" /> Add Student
        </button>
      </PageHeader>

      {profiles.length === 0 ? (
        <EmptyState message="No student profiles yet. Click 'Add Student' to create one." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => {
            const required = getRequiredSkills(p.careerInterest, 'IT & Software');
            const match = computeAlignment(p.skills, required);
            return (
              <div key={p.id} className="card card-hover" onClick={() => setSelectedProfile(p)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-semibold">
                      {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.education} · {p.state}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Target: {p.careerInterest}</span>
                    <span className={`text-sm font-bold ${match >= 70 ? 'text-green-600' : match >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {match}% Match
                    </span>
                  </div>
                  <ProgressBar value={match} color={match >= 70 ? 'bg-green-500' : match >= 50 ? 'bg-amber-500' : 'bg-red-500'} />
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.skills.slice(0, 4).map((s) => (
                    <span key={s} className="badge badge-blue">{s}</span>
                  ))}
                  {p.skills.length > 4 && <span className="badge badge-blue">+{p.skills.length - 4}</span>}
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editing ? 'Edit Student Profile' : 'Add Student Profile'} size="lg">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Student name" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Education</label>
              <select value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} className="input-field">
                {['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'B.Com', 'MBA', 'Diploma', '12th Pass'].map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">State</label>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value, district: '' })} className="input-field">
                {states.map((s) => <option key={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">District</label>
              <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="input-field">
                <option value="">Select district</option>
                {availableDistricts.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Career Interest</label>
              <select value={form.careerInterest} onChange={(e) => setForm({ ...form, careerInterest: e.target.value })} className="input-field">
                {careerInterests.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Experience (years)</label>
              <input type="number" min={0} max={20} value={form.experience} onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })} className="input-field" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Skills ({form.skills.length} selected)</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
              {allSkillsList.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`badge cursor-pointer transition-all ${form.skills.includes(s) ? 'badge-blue ring-2 ring-blue-300' : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary">Cancel</button>
            <button onClick={saveProfile} className="btn-primary">{editing ? 'Update' : 'Create'} Profile</button>
          </div>
        </div>
      </Modal>

      {/* Analysis Modal */}
      <Modal isOpen={!!selectedProfile} onClose={() => setSelectedProfile(null)} title={selectedProfile ? `${selectedProfile.name} — Career Analysis` : ''} size="xl">
        {selectedProfile && analysis && (
          <div>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Target Job</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedProfile.careerInterest}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Skill Match</p>
                <p className={`text-lg font-bold ${analysis.alignment >= 70 ? 'text-green-600' : analysis.alignment >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                  {analysis.alignment}% Match
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Skill Radar</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={analysis.radarData}>
                    <PolarGrid stroke="#e5e7eb" className="dark:opacity-20" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <PolarRadiusAxis tick={{ fontSize: 9 }} stroke="#9ca3af" />
                    <Radar name="Student" dataKey="Student" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                    <Radar name="Required" dataKey="Required" stroke="#0d9488" fill="#0d9488" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" /> Missing Skills
                </h4>
                {analysis.missing.length === 0 ? (
                  <p className="text-sm text-green-600">All required skills covered!</p>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {analysis.missing.map((s) => (
                      <span key={s} className="badge badge-red">{s}</span>
                    ))}
                  </div>
                )}

                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-500" /> Recommended Learning Path
                </h4>
                <div className="space-y-2">
                  {analysis.learningPath.map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-900 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteProfile}
        title="Delete Student Profile"
        message="Are you sure you want to delete this student profile? This action cannot be undone."
      />
    </div>
  );
}
