import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Filter,
  Loader2,
  Plus,
  Upload,
  UserRound,
} from 'lucide-react';

import TaskForm from '../../components/tasks/TaskForm';
import {
  getTasks,
  updateTaskStatus,
  submitTask,
  reviewTask,
  type Task,
  type TaskStatus,
  type TaskReviewDecision,
} from '../../services/tasks';

type TaskFilter = 'all' | TaskStatus;
type PhotoType = 'before' | 'after';

function getEvidenceUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `/storage/${path}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'open':
      return 'Open';
    case 'in_progress':
      return 'In Progress';
    case 'pending_review':
      return 'Pending Review';
    case 'validated':
      return 'Validated';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

function getStatusClass(status: TaskStatus): string {
  switch (status) {
    case 'open':
      return 'border-slate-700 bg-slate-800 text-slate-300';
    case 'in_progress':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
    case 'pending_review':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
    case 'validated':
    case 'completed':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    default:
      return 'border-slate-700 bg-slate-800 text-slate-300';
  }
}

function getSourceLabel(task: Task): string {
  switch (task.source_type) {
    case 'capa':
      return 'K3 / CAPA';
    case 'direct':
      return 'Direct Assignment';
    case 'incident':
      return 'Incident';
    case 'inspection':
      return 'Inspection';
    case 'maintenance':
      return 'Maintenance';
    case 'hr':
      return 'HR';
    default:
      return 'Operational Task';
  }
}

function getSourceClass(task: Task): string {
  switch (task.source_type) {
    case 'capa':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
    case 'direct':
      return 'border-violet-500/30 bg-violet-500/10 text-violet-400';
    default:
      return 'border-slate-700 bg-slate-800 text-slate-300';
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as { response?: { data?: { message?: string } } }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return fallback;
}

function hasReviewerRole(): boolean {
  try {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    const roles: string[] = Array.isArray(user.roles) ? user.roles : [];

    return roles.some((role) => ['admin', 'supervisor'].includes(role));
  } catch {
    return false;
  }
}

const FILTER_OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'validated', label: 'Validated' },
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [modalError, setModalError] = useState('');

  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  const [reviewingTaskId, setReviewingTaskId] = useState<number | null>(null);

  const canReviewTasks = hasReviewerRole();

  async function loadTasks() {
    try {
      setLoading(true);
      setError('');

      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat task. Periksa koneksi dan akses akunmu.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  function clearPhotoPreviews() {
    if (beforePreview) URL.revokeObjectURL(beforePreview);
    if (afterPreview) URL.revokeObjectURL(afterPreview);
  }

  function openCompletion(task: Task) {
    setSelectedTask(task);
    setBeforePhoto(null);
    setAfterPhoto(null);
    setCompletionNotes('');
    setModalError('');
    setBeforePreview(null);
    setAfterPreview(null);
  }

  function closeCompletion() {
    clearPhotoPreviews();
    setSelectedTask(null);
    setBeforePhoto(null);
    setAfterPhoto(null);
    setBeforePreview(null);
    setAfterPreview(null);
    setCompletionNotes('');
    setModalError('');
  }

  function handlePhotoChange(
    type: PhotoType,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setModalError('Foto harus berformat JPG, PNG, atau WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalError('Ukuran maksimal setiap foto adalah 5 MB.');
      event.target.value = '';
      return;
    }

    const oldPreview =
      type === 'before' ? beforePreview : afterPreview;

    if (oldPreview) URL.revokeObjectURL(oldPreview);

    const preview = URL.createObjectURL(file);

    if (type === 'before') {
      setBeforePhoto(file);
      setBeforePreview(preview);
    } else {
      setAfterPhoto(file);
      setAfterPreview(preview);
    }

    setModalError('');
  }

  async function handleStartTask(task: Task) {
    try {
      setUpdatingTaskId(task.id);
      setError('');

      const updatedTask = await updateTaskStatus(task.id, 'in_progress');

      setTasks((current) =>
        current.map((item) =>
          item.id === updatedTask.id ? updatedTask : item,
        ),
      );
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Gagal memulai task.'));
    } finally {
      setUpdatingTaskId(null);
    }
  }

  async function handleSubmitTask() {
    if (!selectedTask) return;

    if (!beforePhoto || !afterPhoto || !completionNotes.trim()) {
      setModalError(
        'Foto sebelum, foto sesudah, dan catatan pengerjaan wajib diisi.',
      );
      return;
    }

    try {
      setUpdatingTaskId(selectedTask.id);
      setModalError('');

      const updatedTask = await submitTask(selectedTask.id, {
        before_photo: beforePhoto,
        after_photo: afterPhoto,
        completion_notes: completionNotes.trim(),
      });

      setTasks((current) =>
        current.map((item) =>
          item.id === updatedTask.id ? updatedTask : item,
        ),
      );

      closeCompletion();
    } catch (err) {
      console.error(err);
      setModalError(
        getErrorMessage(err, 'Gagal mengirim task untuk review.'),
      );
    } finally {
      setUpdatingTaskId(null);
    }
  }

  async function handleReviewTask(
    task: Task,
    decision: TaskReviewDecision,
  ) {
    const notes = (reviewNotes[task.id] ?? '').trim();

    if (!notes) {
      setError('Catatan review wajib diisi.');
      return;
    }

    try {
      setReviewingTaskId(task.id);
      setError('');

      const updatedTask = await reviewTask(task.id, {
        decision,
        validation_notes: notes,
      });

      setTasks((current) =>
        current.map((item) =>
          item.id === updatedTask.id ? updatedTask : item,
        ),
      );

      setReviewNotes((current) => ({
        ...current,
        [task.id]: '',
      }));
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Gagal memproses review task.'));
    } finally {
      setReviewingTaskId(null);
    }
  }

  const openTasks = tasks.filter(
    (task) => task.status === 'open',
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === 'in_progress',
  ).length;

  const pendingReviewTasks = tasks.filter(
    (task) => task.status === 'pending_review',
  ).length;

  const completedTasks = tasks.filter(
    (task) =>
      task.status === 'validated' || task.status === 'completed',
  ).length;

  const filteredTasks = tasks.filter((task) =>
    filter === 'all' ? true : task.status === filter,
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Task Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Kelola pekerjaan operasional dan tindak lanjut task.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm((current) => !current)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          {showCreateForm ? 'Close Form' : 'Create Task'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="mb-6">
          <TaskForm
            onSuccess={(task) => {
              setTasks((current) => [task, ...current]);
              setShowCreateForm(false);
            }}
          />
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-400">Open</p>
              <p
                data-testid="task-summary-open"
                className="text-2xl font-semibold text-white"
              >
                {openTasks}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-sm text-slate-400">In Progress</p>
              <p
                data-testid="task-summary-in-progress"
                className="text-2xl font-semibold text-white"
              >
                {inProgressTasks}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <FileCheck2 className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm text-slate-400">Pending Review</p>
              <p
                data-testid="task-summary-pending-review"
                className="text-2xl font-semibold text-white"
              >
                {pendingReviewTasks}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm text-slate-400">Validated</p>
              <p
                data-testid="task-summary-completed"
                className="text-2xl font-semibold text-white"
              >
                {completedTasks}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="mr-2 flex items-center gap-2 text-sm text-slate-400">
          <Filter className="h-4 w-4" />
          Filter:
        </div>

        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              filter === value
                ? 'bg-blue-600 text-white'
                : 'border border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          role="status"
          aria-label="Loading tasks"
          className="flex items-center justify-center py-16"
        >
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <FileCheck2 className="mx-auto mb-3 h-10 w-10 text-slate-600" />
          <p className="text-slate-300">
            {filter === 'all'
              ? 'Belum ada task.'
              : `Tidak ada task dengan status ${getStatusLabel(filter)}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const beforeUrl = getEvidenceUrl(task.before_photo_path);
            const afterUrl = getEvidenceUrl(task.after_photo_path);
            const taskPhotoUrl = getEvidenceUrl(task.task_photo_path);

            return (
              <div
                key={task.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-medium text-white">
                        {task.title}
                      </h2>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(task.status)}`}
                      >
                        {getStatusLabel(task.status)}
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getSourceClass(task)}`}
                      >
                        {getSourceLabel(task)}
                      </span>
                    </div>

                    {task.description && (
                      <p className="mb-4 text-sm leading-6 text-slate-400">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Due:
                        <span className="text-slate-300">
                          {formatDate(task.due_date)}
                        </span>
                      </span>

                      {(task.assignedUser || task.assigned_user) && (
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound className="h-3.5 w-3.5" />
                          Assigned to:
                          <span className="text-slate-300">
                            {(task.assignedUser || task.assigned_user)?.name}
                          </span>
                        </span>
                      )}

                      {task.capa && (
                        <span className="inline-flex items-center gap-1.5">
                          <ClipboardCheck className="h-3.5 w-3.5" />
                          CAPA #{task.capa.id}
                        </span>
                      )}
                    </div>

                    {taskPhotoUrl && (
                      <div className="mt-5">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                          Task Photo
                        </p>
                        <a
                          href={taskPhotoUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={taskPhotoUrl}
                            alt="Task reference"
                            className="h-32 w-48 rounded-lg border border-slate-700 object-cover"
                          />
                        </a>
                      </div>
                    )}

                    {(beforeUrl || afterUrl) && (
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        {beforeUrl && (
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                              Before
                            </p>
                            <a
                              href={beforeUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={beforeUrl}
                                alt="Before task"
                                className="h-40 w-full rounded-lg border border-slate-700 object-cover"
                              />
                            </a>
                          </div>
                        )}

                        {afterUrl && (
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                              After
                            </p>
                            <a
                              href={afterUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={afterUrl}
                                alt="After task"
                                className="h-40 w-full rounded-lg border border-slate-700 object-cover"
                              />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {task.completion_notes && (
                      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          Completion Notes
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-slate-300">
                          {task.completion_notes}
                        </p>
                      </div>
                    )}

                    {task.validation_notes && (
                      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          Review Notes
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-slate-300">
                          {task.validation_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    {task.status === 'open' && (
                      <button
                        type="button"
                        onClick={() => void handleStartTask(task)}
                        disabled={updatingTaskId === task.id}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingTaskId === task.id
                          ? 'Processing...'
                          : 'Start Task'}
                      </button>
                    )}

                    {task.status === 'in_progress' && (
                      <button
                        type="button"
                        onClick={() => openCompletion(task)}
                        disabled={updatingTaskId === task.id}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Submit for Review
                      </button>
                    )}

                    {task.status === 'pending_review' && (
                      <div className="w-full min-w-64 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                          <Clock3 className="h-4 w-4" />
                          Awaiting Review
                        </div>

                        {canReviewTasks && (
                          <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-950 p-4">
                            <label
                              htmlFor={`review-notes-${task.id}`}
                              className="block text-sm font-medium text-slate-300"
                            >
                              Catatan Review{' '}
                              <span className="text-red-400">*</span>
                            </label>

                            <textarea
                              id={`review-notes-${task.id}`}
                              value={reviewNotes[task.id] ?? ''}
                              onChange={(event) =>
                                setReviewNotes((current) => ({
                                  ...current,
                                  [task.id]: event.target.value,
                                }))
                              }
                              maxLength={5000}
                              rows={3}
                              placeholder="Berikan catatan hasil pemeriksaan..."
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                            />

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleReviewTask(task, 'validate')
                                }
                                disabled={
                                  reviewingTaskId === task.id ||
                                  !(reviewNotes[task.id] ?? '').trim()
                                }
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {reviewingTaskId === task.id
                                  ? 'Processing...'
                                  : 'Validate'}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleReviewTask(task, 'revise')
                                }
                                disabled={
                                  reviewingTaskId === task.id ||
                                  !(reviewNotes[task.id] ?? '').trim()
                                }
                                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Request Revision
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {(task.status === 'validated' ||
                      task.status === 'completed') && (
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Validated
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-submission-heading"
            className="my-6 w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="mb-5">
              <h2
                id="task-submission-heading"
                className="text-lg font-semibold text-white"
              >
                Submit Task for Review
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {selectedTask.title}
              </p>
            </div>

            {modalError && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {modalError}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="task-before-photo"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Foto Sebelum <span className="text-red-400">*</span>
                </label>
                <label
                  htmlFor="task-before-photo"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 p-5 text-center hover:border-slate-600"
                >
                  <Upload className="mb-2 h-6 w-6 text-slate-500" />
                  <span className="text-sm text-slate-300">
                    {beforePhoto ? beforePhoto.name : 'Pilih foto sebelum'}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    JPG, PNG, WEBP · Maks. 5 MB
                  </span>
                </label>
                <input
                  id="task-before-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => handlePhotoChange('before', event)}
                  className="sr-only"
                />
                {beforePreview && (
                  <img
                    src={beforePreview}
                    alt="Preview foto sebelum"
                    className="mt-3 max-h-48 w-full rounded-lg border border-slate-700 object-contain"
                  />
                )}
              </div>

              <div>
                <label
                  htmlFor="task-after-photo"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Foto Sesudah <span className="text-red-400">*</span>
                </label>
                <label
                  htmlFor="task-after-photo"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 p-5 text-center hover:border-slate-600"
                >
                  <Upload className="mb-2 h-6 w-6 text-slate-500" />
                  <span className="text-sm text-slate-300">
                    {afterPhoto ? afterPhoto.name : 'Pilih foto sesudah'}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    JPG, PNG, WEBP · Maks. 5 MB
                  </span>
                </label>
                <input
                  id="task-after-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => handlePhotoChange('after', event)}
                  className="sr-only"
                />
                {afterPreview && (
                  <img
                    src={afterPreview}
                    alt="Preview foto sesudah"
                    className="mt-3 max-h-48 w-full rounded-lg border border-slate-700 object-contain"
                  />
                )}
              </div>

              <div>
                <label
                  htmlFor="task-completion-notes"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Catatan Pengerjaan{' '}
                  <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="task-completion-notes"
                  value={completionNotes}
                  onChange={(event) =>
                    setCompletionNotes(event.target.value)
                  }
                  maxLength={5000}
                  rows={4}
                  placeholder="Jelaskan pekerjaan yang sudah dilakukan..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                />
              </div>

              <p className="text-xs leading-5 text-slate-500">
                Task akan masuk ke Pending Review setelah dikirim.
                Supervisor atau admin perlu meninjau hasil pengerjaan.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCompletion}
                disabled={updatingTaskId === selectedTask.id}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleSubmitTask()}
                disabled={
                  updatingTaskId === selectedTask.id ||
                  !beforePhoto ||
                  !afterPhoto ||
                  !completionNotes.trim()
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingTaskId === selectedTask.id && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {updatingTaskId === selectedTask.id
                  ? 'Submitting...'
                  : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}