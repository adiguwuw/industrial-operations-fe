import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

import { createRiskAssessment } from '../../services/riskAssessments';
import type { RiskAssessment, RiskLevel } from '../../services/riskAssessments';

interface RiskAssessmentFormProps {
  findingId: number;
  onSuccess?: (riskAssessment: RiskAssessment) => void;
}

const riskLevels: RiskLevel[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'EXTREME',
];

const riskLevelStyles: Record<RiskLevel, string> = {
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-700',
  HIGH: 'border-orange-200 bg-orange-50 text-orange-700',
  EXTREME: 'border-red-200 bg-red-50 text-red-700',
};

const formatRiskLevel = (level: RiskLevel) =>
  level.charAt(0) + level.slice(1).toLowerCase();

const getToday = () => new Date().toISOString().split('T')[0];

export default function RiskAssessmentForm({
  findingId,
  onSuccess,
}: RiskAssessmentFormProps) {
  const [hazard, setHazard] = useState('');
  const [likelihood, setLikelihood] = useState(1);
  const [severity, setSeverity] = useState(1);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  const [existingControls, setExistingControls] = useState('');
  const [assessmentDate, setAssessmentDate] = useState(getToday());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await createRiskAssessment(findingId, {
        hazard,
        likelihood,
        severity,
        risk_level: riskLevel,
        existing_controls: existingControls || undefined,
        assessment_date: assessmentDate,
      });

      setSuccess('Risk assessment created successfully.');

      onSuccess?.(response.data);
    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors)
          .flat()
          .find((message): message is string => typeof message === 'string');

        setError(firstError ?? 'Please check the submitted data.');
      } else {
        setError(
          err?.response?.data?.message ??
            'Failed to create risk assessment.',
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
          <div className="rounded-xl bg-orange-50 p-2.5">
            <ShieldAlert className="h-5 w-5 text-orange-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Risk Assessment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Assess the potential risk associated with this finding.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
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
          <label
            htmlFor="hazard"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Hazard
          </label>

          <textarea
            id="hazard"
            value={hazard}
            onChange={(event) => setHazard(event.target.value)}
            required
            rows={3}
            placeholder="Describe the potential hazard..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="likelihood"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Likelihood
            </label>

            <select
              id="likelihood"
              value={likelihood}
              onChange={(event) =>
                setLikelihood(Number(event.target.value))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="severity"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Severity
            </label>

            <select
              id="severity"
              value={severity}
              onChange={(event) =>
                setSeverity(Number(event.target.value))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="risk-level"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Risk Level
          </label>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {riskLevels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setRiskLevel(level)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  riskLevel === level
                    ? riskLevelStyles[level]
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {formatRiskLevel(level)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="existing-controls"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Existing Controls
          </label>

          <textarea
            id="existing-controls"
            value={existingControls}
            onChange={(event) => setExistingControls(event.target.value)}
            rows={3}
            placeholder="Describe existing controls, if any..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="assessment-date"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Assessment Date
          </label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              id="assessment-date"
              type="date"
              value={assessmentDate}
              onChange={(event) => setAssessmentDate(event.target.value)}
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

            {loading ? 'Creating...' : 'Create Risk Assessment'}
          </button>
        </div>
      </form>
    </section>
  );
}