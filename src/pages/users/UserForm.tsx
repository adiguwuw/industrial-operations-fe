import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { AlertTriangle, ArrowLeft, Camera, Loader2, Save, Users } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  createUser,
  getUser,
  updateUser,
  type ManagedUser,
} from '../../services/user';

import UserAvatar from '../../components/UserAvatar';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'k3-officer', label: 'K3 Officer' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'employee', label: 'Employee' },
];

type FormState = {
  name: string;
  email: string;
  password: string;
  role: string;
};

const initialForm: FormState = {
  name: '',
  email: '',
  password: '',
  role: 'employee',
};

function getStoredUser() {
  try {
    const stored = localStorage.getItem('user');

    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [existingUser, setExistingUser] =
    useState<ManagedUser | null>(null);

  const [loadingUser, setLoadingUser] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const currentUser = getStoredUser();
  const isAdmin = currentUser?.roles?.includes('admin');

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    const loadUser = async () => {
      try {
        setLoadingUser(true);
        setError('');

        const user = await getUser(Number(id));

        setExistingUser(user);

        setForm({
          name: user.name,
          email: user.email,
          password: '',
          role: user.roles[0] ?? 'employee',
        });
      } catch (err: any) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            'Failed to load user.',
        );
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [id, isEdit]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePhotoChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = event.target.files?.[0] ?? null;

    setPhoto(selected);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      if (!form.name.trim()) {
        setError('Name is required.');
        return;
      }

      if (!form.email.trim()) {
        setError('Email is required.');
        return;
      }

      if (!isEdit && form.password.length < 8) {
        setError(
          'Password must be at least 8 characters.',
        );
        return;
      }

      if (
        isEdit &&
        form.password &&
        form.password.length < 8
      ) {
        setError(
          'Password must be at least 8 characters.',
        );
        return;
      }

      if (!form.role) {
        setError('Please select a role.');
        return;
      }

      if (photo && photo.size > 5 * 1024 * 1024) {
        setError(
          'Profile photo must not exceed 5 MB.',
        );
        return;
      }

      if (isEdit && id) {
        await updateUser(Number(id), {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password || undefined,
          role: form.role,
          profile_photo: photo,
        });
      } else {
        await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          profile_photo: photo,
        });
      }

      navigate('/users', { replace: true });
    } catch (err: any) {
      console.error(err);

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
            'Failed to save user. Please try again.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-400" />

          <h1 className="text-xl font-semibold text-white">
            Access Denied
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            You do not have permission to manage users.
          </p>

          <button
            type="button"
            onClick={() => navigate('/incidents')}
            className="mt-6 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Back */}
        <Link
          to="/users"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Users
        </Link>

        {/* Title */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Users size={21} />
            </div>

            <h1 className="text-2xl font-semibold text-white">
              {isEdit ? 'Edit User' : 'Add User'}
            </h1>
          </div>

          <p className="text-sm text-slate-400">
            {isEdit
              ? 'Update user information, role, password, or profile photo.'
              : 'Create a new user account for the Industrial Operations platform.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900"
        >
          <div className="space-y-6 p-6">
            {/* Account Information */}
            <div>
              <h2 className="font-semibold text-white">
                Account Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Basic information used for authentication.
              </p>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@company.com"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Role
              </label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500"
              >
                {ROLES.map((role) => (
                  <option
                    key={role.value}
                    value={role.value}
                  >
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password

                {isEdit && (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    Leave blank to keep current password
                  </span>
                )}
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder={
                  isEdit
                    ? 'Enter new password'
                    : 'Minimum 8 characters'
                }
                required={!isEdit}
                minLength={8}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            {/* Profile Photo */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Profile Photo
              </label>

              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Existing / Preview */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800">
                    {photo ? (
                      <img
                        src={URL.createObjectURL(photo)}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : existingUser ? (
                      <UserAvatar
                        user={existingUser}
                        size="lg"
                      />
                    ) : (
                      <Camera className="h-7 w-7 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      id="profile_photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-500"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      JPG, PNG, or WEBP. Maximum 5 MB.
                    </p>

                    {photo && (
                      <p className="mt-1 text-xs text-blue-400">
                        Selected: {photo.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 px-6 py-5 sm:flex-row sm:justify-end">
            <Link
              to="/users"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? 'Save Changes' : 'Create User'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}