import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  MapPin,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { getInspections } from '../../services/inspections';
import type { SafetyInspection } from '../../services/inspections';

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const statusStyles: Record<string, string> = {
  draft: 'border-slate-700 bg-slate-800 text-slate-300',
  in_progress: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  completed: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
};

const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function Inspections() {
  const [inspections, setInspections] = useState<SafetyInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInspections = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getInspections();
        setInspections(response.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            'Failed to load safety inspections.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadInspections();
  }, []);

  return (
    <div className="space-y-6 p-6 text-slate-100 lg:p-8">
{/* Header */}
<div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
  <div>
    <div className="mb-2 flex items-center gap-2 text-sm text-blue-600">
      <ClipboardCheck className="h-4 w-4" />
      <span>Inspection Management</span>
    </div>

    <h2 className="text-2xl font-bold tracking-tight text-white">
      Safety Inspections
    </h2>

    <p className="mt-1 text-sm text-slate-400">
      Monitor and review safety inspection activities.
    </p>
  </div>

  <Link
    to="/inspections/new"
    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
  >
    <Plus className="h-4 w-4" />
    New Inspection
  </Link>
</div>

{/* Summary */}
<div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
    <p className="text-sm text-slate-400">Total Inspections</p>
    <p className="mt-2 text-2xl font-bold text-white">
      {inspections.length}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
    <p className="text-sm text-slate-400">Draft</p>
    <p className="mt-2 text-2xl font-bold text-white">
      {inspections.filter((item) => item.status === 'draft').length}
    </p>
  </div>

  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
    <p className="text-sm text-slate-400">In Progress</p>
    <p className="mt-2 text-2xl font-bold text-white">
      {
        inspections.filter(
          (item) => item.status === 'in_progress',
        ).length
      }
    </p>
  </div>

  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
    <p className="text-sm text-slate-400">Completed</p>
    <p className="mt-2 text-2xl font-bold text-white">
      {
        inspections.filter(
          (item) => item.status === 'completed',
        ).length
      }
    </p>
  </div>
</div>

{/* Content */}
<section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
  {loading && (
    <div className="flex min-h-64 items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading inspections...
      </div>
    </div>
  )}

  {!loading && error && (
    <div className="flex min-h-64 items-center justify-center px-6">
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400"
      >
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <span>{error}</span>
      </div>
    </div>
  )}

  {!loading && !error && inspections.length === 0 && (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <div className="rounded-2xl bg-slate-800 p-4">
        <ClipboardCheck className="h-8 w-8 text-slate-400" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-white">
        No inspections yet
      </h3>

      <p className="mt-1 max-w-md text-sm text-slate-400">
        Safety inspections will appear here once they have been
        created.
      </p>
    </div>
  )}

  {!loading && !error && inspections.length > 0 && (
    <div className="divide-y divide-slate-100">
      {inspections.map((inspection) => (
        <Link
          key={inspection.id}
          to={`/inspections/${inspection.id}`}
          className="group block px-6 py-5 transition hover:bg-slate-50"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  Inspection #{inspection.id}
                </span>

                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                    statusStyles[inspection.status] ??
                    'border-slate-700 bg-slate-800 text-slate-300'
                  }`}
                >
                  {formatStatus(inspection.status)}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:gap-5">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {inspection.location}
                </span>

                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(inspection.inspection_date)}
                </span>

                <span>
                  {inspection.items?.length ?? 0} checklist items
                </span>
              </div>
            </div>

            <ChevronRight className="hidden h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600 lg:block" />
          </div>
        </Link>
      ))}
    </div>
  )}
</section>
    </div>
  );
}
