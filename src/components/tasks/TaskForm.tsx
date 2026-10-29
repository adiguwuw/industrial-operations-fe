
import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import {
  CalendarDays,
  ClipboardCheck,
  ImagePlus,
  Loader2,
  UserRound,
} from 'lucide-react';

import {
  createCapaTask,
  createDirectTask,
  type Task,
} from '../../services/tasks';

import {
  getTaskAssignees,
  type ManagedUser,
} from '../../services/user';

interface TaskFormProps {
  capaId?: number;
  onSuccess?: (task: Task) => void;
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export default function TaskForm({
  capaId,
  onSuccess,
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taskPhoto, setTaskPhoto] = useState<File | null>(null);

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersLoadFailed, setUsersLoadFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isCapaTask = capaId !== undefined;

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      setLoadingUsers(true);

      try {
        const employees = await getTaskAssignees();

        if (active) {
          setUsers(employees);
          setUsersLoadFailed(false);
        }
      } catch {
        if (active) {
          setUsersLoadFailed(true);
          setError('Failed to load task assignees.');
        }
      } finally {
        if (active) {
          setLoadingUsers(false);
        }
      }
    };

    void loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const handlePhotoChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;

    setError('');
    setTaskPhoto(null);

    if (!file) {
      return;
    }

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setError('Task photo must be JPG, PNG, or WebP.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setError('Task photo must not exceed 5 MB.');
      event.target.value = '';
      return;
    }

    setTaskPhoto(file);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!isCapaTask && !taskPhoto) {
      setError('Task photo is required for a direct task.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        assigned_to: Number(assignedTo),
        due_date: dueDate,
      };

      const task =
        capaId !== undefined
          ? await createCapaTask(capaId, payload)
          : await createDirectTask({
              ...payload,
              task_photo: taskPhoto!,
            });

      setSuccess('Task created successfully.');
      onSuccess?.(task);
    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(
          validationErrors,
        )[0];

        if (
          Array.isArray(firstError) &&
          firstError.length > 0
        ) {
          setError(String(firstError[0]));
        } else {
          setError('Please check the form fields.');
        }
      } else {
        setError(
          err?.response?.data?.message ||
            'Failed to create task.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-blue-500/10 p-3">
          <ClipboardCheck className="h-5 w-5 text-blue-400" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">
            Create Task
          </h2>

          <p className="text-sm text-slate-400">
            {isCapaTask
              ? 'Assign an action from this CAPA.'
              : 'Assign a task directly to an employee.'}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="task-title"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Title
          </label>

          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="Enter task title"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="task-description"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Description
          </label>

          <textarea
            id="task-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Describe what needs to be done"
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="task-assigned-to"
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300"
          >
            <UserRound className="h-4 w-4" />
            Assigned To
          </label>

          <select
            id="task-assigned-to"
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            required
            disabled={loadingUsers}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">
              {loadingUsers
                ? 'Loading employees...'
                : 'Select an employee'}
            </option>

            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} — {user.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="task-due-date"
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300"
          >
            <CalendarDays className="h-4 w-4" />
            Due Date
          </label>

          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
          />
        </div>

        {!isCapaTask && (
          <div>
            <label
              htmlFor="task-photo"
              className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300"
            >
              <ImagePlus className="h-4 w-4" />
              Task Photo
              <span className="text-red-400">*</span>
            </label>

            <input
              id="task-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"

              onChange={handlePhotoChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:text-white"
            />

            <p className="mt-2 text-xs text-slate-500">
              Upload a JPG, PNG, or WebP image. Maximum size: 5 MB.
            </p>

            {taskPhoto && (
              <p className="mt-2 text-sm text-emerald-400">
                Selected: {taskPhoto.name}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || loadingUsers || usersLoadFailed || users.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}
