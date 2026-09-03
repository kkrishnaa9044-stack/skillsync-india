export type UserRole = 'Student' | 'Job Seeker' | 'Trainer' | 'Industry Professional' | 'Government/Administrator';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  education?: string;
  state?: string;
  district?: string;
  careerInterest?: string;
  createdAt: string;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
}

const USERS_KEY = 'skillsync_auth_users';
const SESSION_KEY = 'skillsync_auth_session';

function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash)}`;
}

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw) as StoredUser[];
  } catch {
    // ignore
  }
  return [];
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function genId(): string {
  return `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function ensureDemoUser(): void {
  const users = loadUsers();
  const exists = users.find((u) => u.email === 'demo@skillsync.in');
  if (!exists) {
    users.push({
      id: 'demo_user',
      name: 'Demo User',
      email: 'demo@skillsync.in',
      role: 'Student',
      education: 'B.Tech Computer Science',
      state: 'Karnataka',
      district: 'Bengaluru',
      careerInterest: 'Data Analyst',
      createdAt: new Date().toISOString(),
      passwordHash: simpleHash('demo123'),
    });
    saveUsers(users);
  }
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: AuthUser;
}

function stripPassword(u: StoredUser): AuthUser {
  const { passwordHash: _ph, ...rest } = u;
  void _ph;
  return rest;
}

export const authService = {
  registerUser(name: string, email: string, password: string, role: UserRole): AuthResult {
    ensureDemoUser();
    const users = loadUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const newUser: StoredUser = {
      id: genId(),
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
      passwordHash: simpleHash(password),
    };
    users.push(newUser);
    saveUsers(users);
    const sessionUser = stripPassword(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true, message: 'Account created successfully. Welcome to SkillSync India!', user: sessionUser };
  },

  loginUser(email: string, password: string): AuthResult {
    ensureDemoUser();
    const users = loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'No account found with this email.' };
    }
    if (user.passwordHash !== simpleHash(password)) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }
    const sessionUser = stripPassword(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true, message: 'Login successful.', user: sessionUser };
  },

  loginDemo(): AuthResult {
    ensureDemoUser();
    return this.loginUser('demo@skillsync.in', 'demo123');
  },

  logoutUser(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw) as AuthUser;
    } catch {
      // ignore
    }
    return null;
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  updateUser(updates: Partial<Omit<AuthUser, 'id' | 'createdAt'>>): AuthResult {
    const current = this.getCurrentUser();
    if (!current) {
      return { success: false, message: 'Not logged in.' };
    }
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx === -1) {
      return { success: false, message: 'User not found.' };
    }
    const updated: StoredUser = { ...users[idx], ...updates };
    users[idx] = updated;
    saveUsers(users);
    const sessionUser = stripPassword(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true, message: 'Profile updated successfully.', user: sessionUser };
  },

  resetPassword(email: string): AuthResult {
    ensureDemoUser();
    const users = loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'No account found with this email.' };
    }
    return { success: true, message: 'Password reset instructions have been sent to your email.' };
  },

  getUserResumeStorageKey(): string {
    const user = this.getCurrentUser();
    return user ? `resumeAnalysis_${user.id}` : 'skillsync_resume_analysis';
  },
};

ensureDemoUser();
