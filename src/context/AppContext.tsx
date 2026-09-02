import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Notification } from '@/lib/types';
import { storage, uid } from '@/lib/storage';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (storage.getTheme() as 'light' | 'dark') || 'light');
  const [notifications, setNotifications] = useState<Notification[]>(() => storage.getNotifications());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    storage.saveNotifications(notifications);
  }, [notifications]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    setNotifications((prev) => [
      { ...n, id: uid('n'), createdAt: new Date().toISOString(), read: false },
      ...prev,
    ]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{ theme, toggleTheme, notifications, unreadCount, markNotificationRead, markAllRead, addNotification }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
