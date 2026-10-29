import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Edit,
  Plus,
  Search,
  Trash2,
  Users as UsersIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  deleteUser,
  getUserPhotoUrl,
  getUsers,
  type ManagedUser,
} from '../../services/user';

const ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'k3-officer', label: 'K3 Officer' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'employee', label: 'Employee' },
];

const roleLabel = (role: string) => {
  const found = ROLES.find((item) => item.value === role);

  return found?.label ?? role;
};

const roleBadgeClass = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-500/10 text-purple-300 border-purple-400/20';

    case 'k3-officer':
      return 'bg-orange-500/10 text-orange-300 border-orange-400/20';

    case 'supervisor':
      return 'bg-blue-500/10 text-blue-300 border-blue-400/20';

    default:
      return 'bg-slate-500/10 text-slate-300 border-slate-400/20';
  }
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));

export default function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem('user');

      if (!stored) {
        return null;
      }

      return JSON.parse(stored);
    } catch {
      return null;
    }
  };

  const currentUser = getStoredUser();
  const isAdmin = currentUser?.roles?.includes('admin');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getUsers(search, role, page);

      setUsers(response.data);
      setLastPage(response.last_page);
      setTotal(response.total);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to load users. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [search, role, page]);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      loadUsers();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [loadUsers, isAdmin]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRole(value);
    setPage(1);
  };

  const handleDelete = async (user: ManagedUser) => {
    const confirmed = window.confirm(
      `Delete user "${user.name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteUser(user.id);

      if (users.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadUsers();
      }
    } catch (err: any) {
      window.alert(
        err?.response?.data?.message ||
          'Failed to delete user. Please try again.',
      );
    }
  };

  /*
   * Safety:
   * User Management is intended for admin only.
   * Backend also enforces role:admin.
   */
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-400" />

          <h1 className="text-xl font-semibold text-white">
            Access Denied
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            You do not have permission to access User Management.
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

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <UsersIcon size={21} />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white">
              User Management
            </h1>
          </div>

          <p className="text-sm text-slate-400">
            Manage system users, roles, and access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/users/new')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <select
            value={role}
            onChange={(event) => handleRoleChange(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500"
          >
            {ROLES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="font-medium text-white">
              Users
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {total} {total === 1 ? 'user' : 'users'} total
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-slate-400">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          /* Empty */
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <UsersIcon
              size={32}
              className="mb-3 text-slate-600"
            />

            <p className="font-medium text-slate-300">
              No users found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or role filter.
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-slate-800 bg-slate-950/40">
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-medium">
                      User
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Role
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Created
                    </th>

                    <th className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => {
                    const primaryRole =
                      user.roles[0] ?? 'employee';

                    const photoUrl = getUserPhotoUrl(user);

                    return (
                      <tr
                        key={user.id}
                        className="transition hover:bg-slate-800/30"
                      >
                        {/* User */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={user.name}
                                className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300">
                                {user.name
                                  .split(' ')
                                  .map((part) => part[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-slate-100">
                                {user.name}
                              </p>

                              <p className="mt-0.5 text-sm text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${roleBadgeClass(
                              primaryRole,
                            )}`}
                          >
                            {roleLabel(primaryRole)}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-5 py-4 text-sm text-slate-400">
                          {formatDate(user.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/users/${user.id}/edit`,
                                )
                              }
                              title="Edit user"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-400"
                            >
                              <Edit size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              title="Delete user"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4">
              <p className="text-sm text-slate-500">
                Page {page} of {lastPage}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) => current - 1)
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= lastPage}
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}