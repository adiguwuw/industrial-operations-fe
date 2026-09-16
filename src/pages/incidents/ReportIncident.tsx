import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  MapPin,
  Send,
} from 'lucide-react';

import { createIncident, uploadIncidentPhoto } from '../../services/incidents';
import type { CreateIncidentPayload } from '../../services/incidents';

import { getIncidentCategories } from '../../services/incidentCategories';
import type { IncidentCategory } from '../../services/incidentCategories';
const severityOptions = [
  {
    value: 'low',
    label: 'Low',
  },
  {
    value: 'medium',
    label: 'Medium',
  },
  {
    value: 'high',
    label: 'High',
  },
  {
    value: 'critical',
    label: 'Critical',
  },
] as const;

export default function ReportIncident() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<IncidentCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | undefined>();

  const [error, setError] = useState('');

  const [form, setForm] = useState<CreateIncidentPayload>({
    category_id: '',
    title: '',
    description: '',
    location_address: '',
    latitude: undefined,
    longitude: undefined,
    severity: 'low',
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getIncidentCategories();
        setCategories(data);
      } catch {
        setError('Failed to load incident categories.');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (
    field: keyof CreateIncidentPayload,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]:
        field === 'latitude' || field === 'longitude'
          ? value === ''
            ? undefined
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      const incident = await createIncident({
        category_id: form.category_id,
        title: form.title,
        description: form.description,
        location_address: form.location_address,
        latitude: form.latitude,
        longitude: form.longitude,
        severity: form.severity,
      });

      if (photo) {
        try {
          await uploadIncidentPhoto(incident.id, photo);
        } catch (uploadError: any) {
          setError(
            uploadError.response?.data?.message ||
              'Incident created, but the photo upload failed. You can add the photo later from the incident workflow.',
          );
          return;
        }
      }

      navigate('/incidents', { replace: true });
    } catch (err: any) {
      const validationErrors = err.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0];

        if (Array.isArray(firstError)) {
          setError(String(firstError[0]));
        } else {
          setError(String(firstError));
        }
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to create incident report.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-800 bg-slate-900 lg:block">
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <span className="text-lg font-bold tracking-wide">
            INDOPS
          </span>
        </div>

        <nav className="space-y-2 p-4">
          <Link
            to="/dashboard"
            className="block rounded-lg px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            Dashboard
          </Link>

          <Link
            to="/incidents"
            className="block rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-white"
          >
            Incidents
          </Link>
        </nav>
      </aside>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <Link
            to="/incidents"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Incidents
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              Report Incident
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Submit a new industrial incident report.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-5 text-lg font-semibold">
                Incident Information
              </h2>

              <div className="grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Title
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      handleChange('title', e.target.value)
                    }
                    placeholder="Enter incident title"
                    minLength={5}
                    maxLength={255}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Category
                  </label>

                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      handleChange('category_id', e.target.value)
                    }
                    required
                    disabled={loadingCategories}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  >
                    <option value="">
                      {loadingCategories
                        ? 'Loading categories...'
                        : 'Select category'}
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Severity
                  </label>

                  <select
                    value={form.severity}
                    onChange={(e) =>
                      handleChange('severity', e.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  >
                    {severityOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleChange(
                        'description',
                        e.target.value
                      )
                    }
                    placeholder="Describe what happened, including relevant details..."
                    minLength={20}
                    rows={6}
                    required
                    className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Minimum 20 characters.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">Photo Evidence</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Optional. Upload one photo as initial evidence for this incident.
                </p>
              </div>

              <label className="block cursor-pointer rounded-lg border border-dashed border-slate-700 bg-slate-950 p-5 text-center transition hover:border-blue-500 hover:bg-slate-900">
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-blue-500/10 p-3">
                    <Send size={20} className="text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    {photo ? photo.name : 'Choose photo evidence'}
                  </span>
                  <span className="text-xs text-slate-500">
                    JPG, PNG, or WEBP · Max 5 MB
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => setPhoto(e.target.files?.[0])}
                  disabled={submitting}
                />
              </label>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-5 flex items-center gap-3">
                <MapPin size={20} className="text-blue-400" />

                <div>
                  <h2 className="text-lg font-semibold">
                    Location
                  </h2>

                  <p className="text-xs text-slate-500">
                    Optional
                  </p>
                </div>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Address
                  </label>

                  <input
                    type="text"
                    value={form.location_address || ''}
                    onChange={(e) =>
                      handleChange(
                        'location_address',
                        e.target.value
                      )
                    }
                    maxLength={255}
                    placeholder="Incident location"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Latitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      value={form.latitude ?? ''}
                      onChange={(e) =>
                        handleChange(
                          'latitude',
                          e.target.value
                        )
                      }
                      placeholder="-7.983908"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Longitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      value={form.longitude ?? ''}
                      onChange={(e) =>
                        handleChange(
                          'longitude',
                          e.target.value
                        )
                      }
                      placeholder="112.630896"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end gap-3">
              <Link
                to="/incidents"
                className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting || loadingCategories}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />

                {submitting
                  ? 'Submitting...'
                  : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}