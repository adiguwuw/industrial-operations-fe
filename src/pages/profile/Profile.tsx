import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  KeyRound,
  Mail,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import type { User } from '../../services/auth';
import UserAvatar from '../../components/UserAvatar';
function formatRole(role: string): string {
  return role
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}



export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await getCurrentUser();

        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch {
        try {
          const storedUser = localStorage.getItem('user');

          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex items-center gap-3 text-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <Shield className="mx-auto h-10 w-10 text-red-400" />

          <h1 className="mt-4 text-lg font-semibold">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Your profile information could not be loaded.
          </p>

          <Link
            to="/incidents"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Incidents
          </Link>
        </div>
      </div>
    );
  }

  const primaryRole = user.roles?.[0] ?? 'user';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <h1 className="text-xl font-semibold text-white">
              Profile
            </h1>
            <p className="text-sm text-slate-500">
              Manage and view your account information
            </p>
          </div>
        </div>

        {/* Profile Hero */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="h-28 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900" />

          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-slate-900 shadow-xl">
                  <UserAvatar
                    user={{
                      ...user,
                      created_at: '',
                      updated_at: '',
                    }}
                    size="lg"
                  />
                </div>

                <div className="pb-1">
                  <h2 className="text-2xl font-semibold text-white">
                    {user.name}
                  </h2>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Active Account
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Personal Information */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 lg:col-span-2">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <UserIcon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    Personal Information
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your registered account details
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Full Name
                </p>

                <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  {user.name}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Email Address
                </p>

                <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200">
                  {user.email}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Account ID
                </p>

                <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-300">
                  #{user.id}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Primary Role
                </p>

                <div className="flex min-h-[46px] items-center rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 text-sm font-medium text-blue-400">
                  {formatRole(primaryRole)}
                </div>
              </div>
            </div>
          </section>

          {/* Account Summary */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                  <Shield className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    Account Summary
                  </h3>
                  <p className="text-xs text-slate-500">
                    Access and permissions
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-6 py-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Roles
                </span>

                <span className="text-sm font-medium text-white">
                  {user.roles?.length ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Permissions
                </span>

                <span className="text-sm font-medium text-white">
                  {user.permissions?.length ?? 0}
                </span>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Authentication active
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Roles & Permissions */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-5">
            <h3 className="font-semibold text-white">
              Roles & Permissions
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Access assigned to your account
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="mb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Assigned Roles
              </p>

              <div className="flex flex-wrap gap-2">
                {user.roles?.length ? (
                  user.roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400"
                    >
                      {formatRole(role)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">
                    No roles assigned
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Permissions
              </p>

              <div className="flex flex-wrap gap-2">
                {user.permissions?.length ? (
                  user.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300"
                    >
                      {permission}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">
                    No permissions assigned
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <KeyRound className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Security
                </h3>
                <p className="text-xs text-slate-500">
                  Account security information
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-slate-500" />

              <div>
                <p className="text-sm font-medium text-slate-200">
                  Authenticated Session
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Your current session is protected by Laravel Sanctum.
                </p>
              </div>
            </div>

            <span className="w-fit rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
              Secure
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
