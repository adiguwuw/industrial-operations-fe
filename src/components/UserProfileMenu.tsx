import { useState } from 'react';
import { ChevronUp, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import UserAvatar from './UserAvatar';

export default function UserProfileMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const name = user?.name || 'Indops admin';
  const role = user?.roles?.[0]
    ? user.roles[0]
        .split('-')
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'User';
  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await api.post('/logout');
    } catch {

    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="relative border-t border-slate-800 p-4">
      {open && (
        <div className="absolute bottom-[calc(100%-8px)] left-4 right-4 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('/profile');
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <User className="h-4 w-4" />
            Profile
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="flex w-full items-center gap-3 border-t border-slate-800 px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-slate-800"
        aria-expanded={open}
      >
        <UserAvatar
          user={{
            id: user?.id,
            name: name,
            profile_photo_url: user?.profile_photo_url || null,
          }}
          size="md"
        />

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">
            {name}
          </div>
          <div className="truncate text-xs text-slate-500">
            {role}
          </div>
        </div>

        <ChevronUp
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
    </div>
  );
}