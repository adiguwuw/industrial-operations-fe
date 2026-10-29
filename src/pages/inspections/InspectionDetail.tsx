import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  MapPin,
  ShieldAlert,
  XCircle,
} from 'lucide-react';

import {
  createFinding,
  getInspection,
  updateInspectionItemResult,
} from '../../services/inspections';
import type {
  InspectionItemResult,
  SafetyInspection,
  SafetyInspectionItem,
} from '../../services/inspections';
import RiskAssessmentForm from '../../components/risk-assessments/RiskAssessmentForm';

import CapaForm from '../../components/capas/CapaForm';
import TaskForm from '../../components/tasks/TaskForm';

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const resultStyles: Record<
  Exclude<InspectionItemResult, null>,
  string
> = {
  PASS: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  FAIL: 'border-red-500/20 bg-red-500/100/10 text-red-400',
  'N/A': 'border-slate-800 bg-slate-800 text-slate-400',
};

const resultLabels: Record<
  Exclude<InspectionItemResult, null>,
  string
> = {
  PASS: 'Pass',
  FAIL: 'Fail',
  'N/A': 'N/A',
};

export default function InspectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState<SafetyInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const [findingItem, setFindingItem] =
    useState<SafetyInspectionItem | null>(null);

  const [createdFindingId, setCreatedFindingId] =
    useState<number | null>(null);

  const [riskAssessmentCreated, setRiskAssessmentCreated] =
    useState(false);

  const [createdCapaId, setCreatedCapaId] =
      useState<number | null>(null);

  const [findingDescription, setFindingDescription] =
    useState('');

  const [findingPhoto, setFindingPhoto] =
    useState<File | null>(null);

  const [findingPhotoPreview, setFindingPhotoPreview] =
    useState<string | null>(null);

  const [findingLoading, setFindingLoading] =
    useState(false);

  const [findingError, setFindingError] =
    useState('');

  const [findingSuccess, setFindingSuccess] =
    useState('');

  useEffect(() => {
    if (!id) {
      setError('Inspection ID is missing.');
      setLoading(false);
      return;
    }

    const loadInspection = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getInspection(Number(id));
        setInspection(response.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ??
            'Failed to load inspection detail.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadInspection();
  }, [id]);

  const handleResultChange = async (
    item: SafetyInspectionItem,
    result: Exclude<InspectionItemResult, null>,
  ) => {
    if (!id || updatingItemId !== null) {
      return;
    }

    try {
      setUpdatingItemId(item.id);
      setError('');

      const response = await updateInspectionItemResult(
        Number(id),
        item.id,
        result,
      );

      setInspection((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          items: current.items?.map((currentItem) =>
            currentItem.id === item.id ? response.data : currentItem,
          ),
        };
      });

      if (result !== 'FAIL' && findingItem?.id === item.id) {
        setFindingItem(null);
        setFindingDescription('');
        setFindingError('');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Failed to update inspection result.',
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  const openFindingForm = (item: SafetyInspectionItem) => {
    setFindingItem(item);
    setCreatedFindingId(null);
    setCreatedCapaId(null);
    setRiskAssessmentCreated(false);
    setFindingDescription('');
    setFindingPhoto(null);
    setFindingPhotoPreview(null);
    setFindingError('');
    setFindingSuccess('');
  };

  const closeFindingForm = () => {
    if (findingLoading) {
      return;
    }

    if (findingPhotoPreview) {
      URL.revokeObjectURL(findingPhotoPreview);
    }

    setFindingItem(null);
    setCreatedFindingId(null);
    setCreatedCapaId(null);
    setRiskAssessmentCreated(false);
    setFindingDescription('');
    setFindingPhoto(null);
    setFindingPhotoPreview(null);
    setFindingError('');
    setFindingSuccess('');
  };

  const handleFindingPhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (
      ![
        'image/jpeg',
        'image/png',
        'image/webp',
      ].includes(file.type)
    ) {
      setFindingError(
        'Finding photo harus berupa JPG, PNG, atau WEBP.',
      );

      event.target.value = '';

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFindingError(
        'Ukuran finding photo maksimal 5 MB.',
      );

      event.target.value = '';

      return;
    }

    if (findingPhotoPreview) {
      URL.revokeObjectURL(findingPhotoPreview);
    }

    setFindingPhoto(file);
    setFindingPhotoPreview(
      URL.createObjectURL(file),
    );
    setFindingError('');
  };

  const handleFindingSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!id || !findingItem) {
      return;
    }

    if (!findingDescription.trim()) {
      setFindingError('Finding description is required.');
      return;
    }

    try {
      setFindingLoading(true);
      setFindingError('');
      setFindingSuccess('');

      const response = await createFinding(
        Number(id),
        findingItem.id,
        findingDescription.trim(),
        findingPhoto,
      );

      setCreatedFindingId(response.data.id);

      setFindingSuccess(
        'Finding created successfully.',
      );

      setFindingDescription('');
      setFindingPhoto(null);

      if (findingPhotoPreview) {
        URL.revokeObjectURL(findingPhotoPreview);
      }

      setFindingPhotoPreview(null);

    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(validationErrors)
          .flat()
          .find(
            (message): message is string =>
              typeof message === 'string',
          );

        setFindingError(
          firstError ?? 'Please check the submitted data.',
        );
      } else {
        setFindingError(
          err?.response?.data?.message ??
            'Failed to create finding.',
        );
      }
    } finally {
      setFindingLoading(false);
    }
  };

  const items = inspection?.items ?? [];

  const passedCount = items.filter(
    (item) => item.result === 'PASS',
  ).length;

  const failedCount = items.filter(
    (item) => item.result === 'FAIL',
  ).length;

  const naCount = items.filter(
    (item) => item.result === 'N/A',
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-800">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading inspection...
        </div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-800 px-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-slate-900 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-500/10 p-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>

            <div>
              <h1 className="font-semibold text-white">
                Unable to load inspection
              </h1>

              <p className="mt-1 text-sm text-red-400">
                {error || 'Inspection not found.'}
              </p>
            </div>
          </div>

          <Link
            to="/inspections"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to inspections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <button
        type="button"
        onClick={() => navigate('/inspections')}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to inspections
      </button>

      {/* Inspection information */}
      <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3">
                <ClipboardCheck className="h-6 w-6 text-blue-400" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  {inspection.checklist?.name ??
                    `Inspection #${inspection.id}`}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Inspection #{inspection.id}
                </p>
              </div>
            </div>

            {inspection.checklist?.description && (
              <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-400">
                {inspection.checklist.description}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-800 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <MapPin className="h-4 w-4" />
                Location
              </div>

              <p className="mt-1 text-sm font-semibold text-white">
                {inspection.location}
              </p>
            </div>

            <div className="rounded-xl bg-slate-800 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <CalendarDays className="h-4 w-4" />
                Inspection Date
              </div>

              <p className="mt-1 text-sm font-semibold text-white">
                {formatDate(inspection.inspection_date)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
          <p className="text-sm text-slate-400">Checklist Items</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {items.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-sm">
          <p className="text-sm text-emerald-400">Pass</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {passedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/100/10 p-5 shadow-sm">
          <p className="text-sm text-red-400">Fail</p>
          <p className="mt-2 text-2xl font-bold text-red-400">
            {failedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
          <p className="text-sm text-slate-400">N/A</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {naCount}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/100/10 px-4 py-3 text-sm text-red-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Checklist */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
        <div className="border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-blue-400" />

            <div>
              <h2 className="font-semibold text-white">
                Inspection Checklist
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Evaluate each checklist item and record findings for failed items.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {items.map((item, index) => (
            <div key={item.id} className="p-6">
              <div className="flex flex-col gap-5">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-semibold text-slate-400">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start gap-2">
                      <p className="text-sm font-semibold leading-6 text-white">
                        {item.question}
                      </p>

                      {item.is_required && (
                        <span className="rounded-full bg-red-500/10 px-2 py-1 text-[11px] font-medium text-red-400">
                          Required
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      Item #{item.id}
                    </p>
                  </div>
                </div>

                {/* Result controls */}
                <div className="ml-0 flex flex-wrap gap-2 lg:ml-12">
                  {(['PASS', 'FAIL', 'N/A'] as const).map((result) => {
                    const selected = item.result === result;
                    const updating = updatingItemId === item.id;

                    return (
                      <button
                        key={result}
                        type="button"
                        disabled={updating}
                        onClick={() => handleResultChange(item, result)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                          selected
                            ? resultStyles[result]
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:bg-slate-800'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {result === 'PASS' && <CheckCircle2 className="h-4 w-4" />}
                        {result === 'FAIL' && <XCircle className="h-4 w-4" />}
                        {result === 'N/A' && <span className="text-xs">—</span>}

                        {updating && selected ? 'Saving...' : resultLabels[result]}
                      </button>
                    );
                  })}
                </div>

                {/* Finding */}
                {item.result === 'FAIL' && (
                  <div className="ml-0 rounded-xl border border-red-500/20 bg-red-500/100/10 p-4 lg:ml-12">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-red-400">
                          Finding required
                        </p>

                        <p className="mt-1 text-xs text-red-400">
                          This failed inspection item can be recorded as a safety finding.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openFindingForm(item)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        Create Finding
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="px-6 py-16 text-center">
              <ClipboardCheck className="mx-auto h-8 w-8 text-slate-400" />

              <p className="mt-3 text-sm font-medium text-slate-400">
                No checklist items
              </p>

              <p className="mt-1 text-sm text-slate-400">
                This inspection does not contain any checklist items.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Finding modal */}
      {findingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-red-500/10 p-2.5">
                  <ShieldAlert className="h-5 w-5 text-red-400" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">Create Finding</h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Record the safety issue identified during inspection.
                  </p>
                </div>
              </div>
            </div>

            {!createdFindingId ? (
              <form onSubmit={handleFindingSubmit} className="space-y-5 p-6">
              <div className="rounded-xl border border-red-500/20 bg-red-500/100/10 px-4 py-3">
                <p className="text-xs font-medium text-red-400">
                  Failed checklist item
                </p>

                <p className="mt-1 text-sm font-medium leading-6 text-red-300">
                  {findingItem.question}
                </p>
              </div>

              {findingError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/100/10 px-4 py-3 text-sm text-red-400"
                >
                  {findingError}
                </div>
              )}

              {findingSuccess && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
                >
                  {findingSuccess}
                </div>
              )}

              <div>
                <label
                  htmlFor="finding-description"
                  className="mb-2 block text-sm font-medium text-slate-400"
                >
                  Finding Description
                </label>

                <textarea
                  id="finding-description"
                  value={findingDescription}
                  onChange={(event) => setFindingDescription(event.target.value)}
                  required
                  rows={5}
                  placeholder="Describe the safety issue or non-conformity found..."
                  className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="finding-photo"
                  className="mb-2 block text-sm font-medium text-slate-400"
                >
                  Evidence Photo
                </label>

                <label
                  htmlFor="finding-photo"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-center transition hover:border-slate-600"
                >
                  <Camera className="mb-2 h-6 w-6 text-slate-500" />

                  <span className="text-sm text-slate-300">
                    Pilih foto kondisi temuan
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    JPG, PNG, WEBP · Maks. 5 MB
                  </span>

                  <input
                    id="finding-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFindingPhotoChange}
                    className="hidden"
                  />
                </label>

                {findingPhotoPreview && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Preview
                    </p>

                    <img
                      src={findingPhotoPreview}
                      alt="Finding evidence preview"
                      className="max-h-64 w-full rounded-xl border border-slate-700 object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={closeFindingForm}
                  disabled={findingLoading}
                  className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-slate-800 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={findingLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {findingLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {findingLoading ? 'Creating...' : 'Create Finding'}
                </button>
              </div>
            </form>
              ) : (
                <div className="space-y-6 p-6">
                  <RiskAssessmentForm
                    findingId={createdFindingId}
                    onSuccess={() => {
                      setRiskAssessmentCreated(true);

                      setFindingSuccess(
                        'Risk assessment created successfully.',
                      );
                    }}
                  />

                  {riskAssessmentCreated && (
                    <>
                      <CapaForm
                        findingId={createdFindingId}
                        onSuccess={(capa) => {
                          setCreatedCapaId(capa.id);

                          setFindingSuccess(
                            'CAPA created successfully.',
                          );
                        }}
                      />

                      {createdCapaId && (
                        <TaskForm
                          capaId={createdCapaId}
                          onSuccess={() => {
                            setFindingSuccess(
                              'Task created successfully.',
                            );
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
