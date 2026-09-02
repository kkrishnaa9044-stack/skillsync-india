import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color, suffix }: { label: string; value: string | number; icon: React.ElementType; color: string; suffix?: string }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}{suffix}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="card mb-6">
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

export function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field min-w-[140px]"
      >
        <option value="">All {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card text-center py-12">
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

export function Badge({ status }: { status: string }) {
  let cls = 'badge-blue';
  if (status === 'Aligned' || status === 'High') cls = 'badge-green';
  else if (status === 'Partial Gap' || status === 'Medium') cls = 'badge-yellow';
  else if (status === 'Critical Gap' || status === 'Critical' || status === 'Low') cls = status === 'Low' ? 'badge-blue' : 'badge-red';
  return <span className={`badge ${cls}`}>{status}</span>;
}
