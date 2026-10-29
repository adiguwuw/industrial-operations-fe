
import type { ReactNode } from 'react';

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function DashboardSection({
  title,
  description,
  children,
  className = '',
}: DashboardSectionProps) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 ${className}`}
    >
      <header className="mb-5">
        <h2 className="font-semibold text-white">{title}</h2>

        {description && (
          <p className="mt-1 text-sm text-slate-400">
            {description}
          </p>
        )}
      </header>

      {children}
    </section>
  );
}
