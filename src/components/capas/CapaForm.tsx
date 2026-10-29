import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

import { createCapa } from '../../services/capas';
import type {
  Capa,
  CapaType,
} from '../../services/capas';

interface CapaFormProps {
  findingId: number;
  onSuccess?: (capa: Capa) => void;
}

const capaTypes: CapaType[] = [
  'corrective',
  'preventive',
];

const formatCapaType = (type: CapaType) =>
  type.charAt(0).toUpperCase() + type.slice(1);

export default function CapaForm({
  findingId,
  onSuccess,
}: CapaFormProps) {
  const [type, setType] =
    useState<CapaType>('corrective');

  const [action, setAction] =
    useState('');

  const [responsibleUserId, setResponsibleUserId] =
    useState('');

  const [dueDate, setDueDate] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await createCapa(
        findingId,
        {
          type,
          action,
          responsible_user_id:
            Number(responsibleUserId),
          due_date: dueDate,
        },
      );

      setSuccess(
        'CAPA created successfully.',
      );

      onSuccess?.(response.data);
    } catch (err: any) {
      const validationErrors =
        err?.response?.data?.errors;

      if (validationErrors) {
        const firstError =
          Object.values(validationErrors)
            .flat()
            .find(
              (
                message,
              ): message is string =>
                typeof message === 'string',
            );

        setError(
          firstError ??
            'Please check the submitted data.',
        );
      } else {
        setError(
          err?.response?.data?.message ??
            'Failed to create CAPA.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Corrective &amp; Preventive Action
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Define the action required to address
              this finding.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6"
      >
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            CAPA Type
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            {capaTypes.map((capaType) => (
              <button
                key={capaType}
                type="button"
                onClick={() =>
                  setType(capaType)
                }
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  type === capaType
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {formatCapaType(capaType)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="action"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Action
          </label>

          <textarea
            id="action"
            value={action}
            onChange={(event) =>
              setAction(event.target.value)
            }
            required
            rows={4}
            placeholder="Describe the corrective or preventive action..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="responsible-user"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Responsible User
          </label>

          <input
            id="responsible-user"
            type="number"
            value={responsibleUserId}
            onChange={(event) =>
              setResponsibleUserId(
                event.target.value,
              )
            }
            required
            min={1}
            placeholder="Enter user ID"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="due-date"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Due Date
          </label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              required
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {loading
              ? 'Creating...'
              : 'Create CAPA'}
          </button>
        </div>
      </form>
    </section>
  );
}