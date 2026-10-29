import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  getChecklists,
  type Checklist,
} from '../../services/checklists';

export default function Checklists() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadChecklists = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getChecklists();

      setChecklists(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to load safety checklists.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChecklists();
  }, [loadChecklists]);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <ClipboardCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-blue-400">
                K3 Management
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-white">
                Safety Checklists
              </h1>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            Manage reusable safety inspection checklists.
          </p>
        </div>

        <Link
          to="/checklists/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          New Checklist
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading checklists...
          </div>
        </div>
      ) : checklists.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <ClipboardCheck className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-white">
            No safety checklist yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            Create a safety checklist first. The checklist
            will then be available when creating a safety
            inspection.
          </p>

          <Link
            to="/checklists/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Create Checklist
          </Link>
        </div>
      ) : (
        /* Checklist list */
        <div className="grid gap-4 md:grid-cols-2">
          {checklists.map((checklist) => (
            <div
              key={checklist.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-white">
                      {checklist.name}
                    </h2>

                    {checklist.description && (
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {checklist.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-800 pt-4 text-xs text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />

                <span>
                  {checklist.items?.length ?? 0} checklist
                  items
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}