import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import {
  createInspection,
  getChecklists,
  type Checklist,
} from '../../services/inspections';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export default function InspectionForm() {
  const navigate = useNavigate();

  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [checklistId, setChecklistId] = useState('');
  const [location, setLocation] = useState('');
  const [inspectionDate, setInspectionDate] = useState(getToday());

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [loadingChecklists, setLoadingChecklists] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadChecklists = async () => {
      try {
        setLoadingChecklists(true);
        setError('');

        const response = await getChecklists();

        setChecklists(response.data);

        if (response.data.length > 0) {
          setChecklistId(String(response.data[0].id));
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'Failed to load safety checklists.',
        );
      } finally {
        setLoadingChecklists(false);
      }
    };

    loadChecklists();
  }, []);

  const selectedChecklist = checklists.find(
    (checklist) => String(checklist.id) === checklistId,
  );

  const canSubmit =
    !saving &&
    !loadingChecklists &&
    Boolean(checklistId) &&
    Boolean(location.trim()) &&
    Boolean(inspectionDate);

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = event.target.files?.[0] ?? null;

    if (!selected) {
      setImage(null);
      setImagePreview('');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError('Inspection photo must not exceed 5 MB.');

      event.target.value = '';
      setImage(null);
      setImagePreview('');

      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(selected.type)) {
      setError(
        'Inspection photo must be JPG, PNG, or WEBP.',
      );

      event.target.value = '';
      setImage(null);
      setImagePreview('');

      return;
    }

    setError('');
    setImage(selected);

    const previewUrl = URL.createObjectURL(selected);
    setImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!checklistId) {
      setError('Please select a checklist.');
      return;
    }

    if (!location.trim()) {
      setError('Inspection location is required.');
      return;
    }

    if (!inspectionDate) {
      setError('Inspection date is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await createInspection({
        checklist_id: Number(checklistId),
        location: location.trim(),
        inspection_date: inspectionDate,
        image: image ?? undefined,
      });

      navigate(`/inspections/${response.data.id}`);
    } catch (err: any) {
      const validationErrors =
        err?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(
          validationErrors,
        )[0] as string[] | undefined;

        setError(
          firstError?.[0] ||
            'Please check the submitted data.',
        );
      } else {
        setError(
          err?.response?.data?.message ||
            'Failed to create safety inspection.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6 text-slate-100 lg:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Back */}
        <Link
          to="/inspections"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Safety Inspections
        </Link>

        {/* Header */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <ClipboardCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-blue-400">
                Inspection Management
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-white">
                New Safety Inspection
              </h1>
            </div>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Create a new safety inspection using an existing
            checklist.
          </p>
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
        >
          <div className="space-y-7 p-6 lg:p-8">
            {/* Checklist */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-blue-400" />

                <label
                  htmlFor="checklist_id"
                  className="text-sm font-semibold text-slate-200"
                >
                  Safety Checklist
                </label>
              </div>

              {loadingChecklists ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading checklists...
                </div>
              ) : checklists.length === 0 ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

                    <div>
                      <p className="text-sm font-medium text-amber-300">
                        No checklist available
                      </p>

                      <p className="mt-1 text-sm text-amber-200/70">
                        Create at least one safety checklist
                        before creating an inspection.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <select
                    id="checklist_id"
                    name="checklist_id"
                    value={checklistId}
                    onChange={(event) =>
                      setChecklistId(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-blue-500"
                  >
                    <option value="">
                      Select a safety checklist
                    </option>

                    {checklists.map((checklist) => (
                      <option
                        key={checklist.id}
                        value={checklist.id}
                      >
                        {checklist.name}
                      </option>
                    ))}
                  </select>

                  {selectedChecklist?.description && (
                    <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Checklist Description
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {selectedChecklist.description}
                      </p>
                    </div>
                  )}

                  {selectedChecklist && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />

                      <span>
                        {selectedChecklist.items?.length ?? 0}{' '}
                        checklist items
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Location */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" />

                <label
                  htmlFor="location"
                  className="text-sm font-semibold text-slate-200"
                >
                  Inspection Location
                </label>
              </div>

              <input
                id="location"
                name="location"
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="Example: Production Area A"
                maxLength={255}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Specify the area, facility, or workplace being
                inspected.
              </p>
            </div>

            {/* Inspection Date */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-400" />

                <label
                  htmlFor="inspection_date"
                  className="text-sm font-semibold text-slate-200"
                >
                  Inspection Date
                </label>
              </div>

              <input
                id="inspection_date"
                name="inspection_date"
                type="date"
                value={inspectionDate}
                onChange={(event) =>
                  setInspectionDate(event.target.value)
                }
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
              />
            </div>

            {/* Inspection Photo */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Camera className="h-4 w-4 text-blue-400" />

                <label
                  htmlFor="inspection_image"
                  className="text-sm font-semibold text-slate-200"
                >
                  Inspection Photo
                </label>
              </div>

              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-5">
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-xl border border-slate-800">
                      <img
                        src={imagePreview}
                        alt="Inspection preview"
                        className="max-h-80 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950/80 text-slate-300 backdrop-blur transition hover:bg-red-500 hover:text-white"
                        aria-label="Remove inspection photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-300">
                        {image?.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {image
                          ? `${(
                              image.size /
                              1024 /
                              1024
                            ).toFixed(2)} MB`
                          : ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="inspection_image"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl px-6 py-10 text-center transition hover:bg-slate-900"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <ImagePlus className="h-6 w-6" />
                    </div>

                    <p className="mt-4 text-sm font-medium text-slate-200">
                      Upload inspection photo
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      JPG, PNG, or WEBP. Maximum 5 MB.
                    </p>

                    <span className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">
                      Choose Photo
                    </span>

                    <input
                      id="inspection_image"
                      name="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Upload a photo showing the condition of the area
                being inspected.
              </p>
            </div>

            {/* Information */}
            <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
              <div className="flex items-start gap-3">
                <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

                <div>
                  <p className="text-sm font-medium text-blue-300">
                    What happens next?
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    After creating the inspection, the selected
                    checklist items will be copied into the
                    inspection. You can then evaluate each item
                    as PASS, FAIL, or N/A.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 px-6 py-5 sm:flex-row sm:justify-end lg:px-8">
            <Link
              to="/inspections"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Inspection
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}