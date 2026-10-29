import { Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function Header({
  title,
  description,
  action,
}: HeaderProps) {
  return (
    <header className="flex min-h-20 shrink-0 items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/70 px-6 lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-white">
          {title}
        </h1>

        {description && (
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {action}

        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}