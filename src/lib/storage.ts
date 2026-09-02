import type {
  Job,
  Skill,
  Industry,
  TrainingProgram,
  Notification,
  User,
  StudentProfile,
} from './types';
import {
  jobs as defaultJobs,
  skills as defaultSkills,
  industries as defaultIndustries,
  trainingPrograms as defaultTrainingPrograms,
  defaultNotifications,
  defaultUsers,
} from './demoData';

const KEYS = {
  jobs: 'skillsync_jobs',
  skills: 'skillsync_skills',
  industries: 'skillsync_industries',
  trainingPrograms: 'skillsync_training_programs',
  notifications: 'skillsync_notifications',
  users: 'skillsync_users',
  students: 'skillsync_students',
  theme: 'skillsync_theme',
};

function load<T>(key: string, defaults: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    // ignore
  }
  return defaults;
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const storage = {
  getJobs: () => load<Job>(KEYS.jobs, defaultJobs),
  saveJobs: (d: Job[]) => save(KEYS.jobs, d),

  getSkills: () => load<Skill>(KEYS.skills, defaultSkills),
  saveSkills: (d: Skill[]) => save(KEYS.skills, d),

  getIndustries: () => load<Industry>(KEYS.industries, defaultIndustries),
  saveIndustries: (d: Industry[]) => save(KEYS.industries, d),

  getTrainingPrograms: () => load<TrainingProgram>(KEYS.trainingPrograms, defaultTrainingPrograms),
  saveTrainingPrograms: (d: TrainingProgram[]) => save(KEYS.trainingPrograms, d),

  getNotifications: () => load<Notification>(KEYS.notifications, defaultNotifications),
  saveNotifications: (d: Notification[]) => save(KEYS.notifications, d),

  getUsers: () => load<User>(KEYS.users, defaultUsers),
  saveUsers: (d: User[]) => save(KEYS.users, d),

  getStudents: () => load<StudentProfile>(KEYS.students, []),
  saveStudents: (d: StudentProfile[]) => save(KEYS.students, d),

  getTheme: () => localStorage.getItem(KEYS.theme) || 'light',
  saveTheme: (theme: string) => localStorage.setItem(KEYS.theme, theme),
};

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
