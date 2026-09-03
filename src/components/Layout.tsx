import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, GitCompareArrows, Briefcase, Building2, MapPin, GraduationCap,
  Sparkles, Users, FileText, Settings, Shield, Menu, X, Bell, Search,
  Moon, Sun, TrendingUp, ChevronRight, Home, FileSearch,
  User as UserIcon, LogOut, FileSearch as ResumeIcon,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/lib/storage';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/skill-gap', label: 'Skill Gap Analysis', icon: GitCompareArrows },
  { path: '/jobs', label: 'Job Market', icon: Briefcase },
  { path: '/industry', label: 'Industry Demand', icon: Building2 },
  { path: '/regional', label: 'Regional Insights', icon: MapPin },
  { path: '/training', label: 'Training Programs', icon: GraduationCap },
  { path: '/recommendations', label: 'AI Recommendations', icon: Sparkles },
  { path: '/resume-analyzer', label: 'AI Resume Analyzer', icon: FileSearch },
  { path: '/students', label: 'Student Profiles', icon: Users },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SearchResult {
  type: 'job' | 'skill' | 'industry' | 'training' | 'state';
  label: string;
  sublabel: string;
  path: string;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, notifications, unreadCount, markNotificationRead, markAllRead } = useApp();
  const { user, isAuthenticated, logout } = useAuth();

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSidebarOpen(false);
    setSearchOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    storage.getJobs().forEach((job) => {
      if (job.role.toLowerCase().includes(q) || job.company.toLowerCase().includes(q) || job.location.toLowerCase().includes(q)) {
        results.push({ type: 'job', label: `${job.role} — ${job.company}`, sublabel: `${job.location} · ${job.industry}`, path: '/jobs' });
      }
    });

    storage.getSkills().forEach((skill) => {
      if (skill.name.toLowerCase().includes(q)) {
        results.push({ type: 'skill', label: skill.name, sublabel: `${skill.category} · ${skill.industry}`, path: '/skill-gap' });
      }
    });

    storage.getIndustries().forEach((ind) => {
      if (ind.name.toLowerCase().includes(q)) {
        results.push({ type: 'industry', label: ind.name, sublabel: `Demand: ${ind.demandScore} · ${ind.jobCount} jobs`, path: '/industry' });
      }
    });

    storage.getTrainingPrograms().forEach((tp) => {
      if (tp.name.toLowerCase().includes(q) || tp.provider.toLowerCase().includes(q)) {
        results.push({ type: 'training', label: tp.name, sublabel: `${tp.provider} · ${tp.state}`, path: '/training' });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery]);

  const typeIcons = {
    job: Briefcase,
    skill: TrendingUp,
    industry: Building2,
    training: GraduationCap,
    state: MapPin,
  };

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || user?.role === 'Government/Administrator');

  const initials = user ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'U';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 z-40 flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100 dark:border-slate-700 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-900 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">SkillSync India</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">SIH26134</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <Link to="/" className="sidebar-link">
            <Home className="w-4.5 h-4.5 shrink-0" />
            <span>Home</span>
          </Link>
          {isAuthenticated && visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}>
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Government of India Initiative</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Global Search */}
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, skills, industries..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  className="w-64 md:w-80 pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
              {searchOpen && searchQuery.trim() && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-700 rounded-xl shadow-xl border border-gray-100 dark:border-slate-600 overflow-hidden max-h-96 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">No results found for "{searchQuery}"</div>
                  ) : (
                    searchResults.map((result, i) => {
                      const Icon = typeIcons[result.type];
                      return (
                        <button
                          key={i}
                          onClick={() => { navigate(result.path); setSearchOpen(false); setSearchQuery(''); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors text-left border-b border-gray-50 dark:border-slate-600 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-600 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.sublabel}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 ml-auto shrink-0" />
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-300" />}
            </button>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-700 rounded-xl shadow-xl border border-gray-100 dark:border-slate-600 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-600">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-gray-50 dark:border-slate-600 last:border-0 transition-colors ${n.read ? 'bg-transparent' : 'bg-blue-50/50 dark:bg-slate-600/50'}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User profile menu */}
            {isAuthenticated && user ? (
              <div ref={profileRef} className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {initials}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{user.role}</p>
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-700 rounded-xl shadow-xl border border-gray-100 dark:border-slate-600 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-600">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors text-left">
                        <UserIcon className="w-4 h-4" /> Profile
                      </button>
                      <button onClick={() => navigate('/resume-analyzer')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors text-left">
                        <ResumeIcon className="w-4 h-4" /> My Resume Analysis
                      </button>
                      <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors text-left">
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                    </div>
                    <div className="border-t border-gray-100 dark:border-slate-600 py-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm">Login</Link>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
