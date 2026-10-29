import { ShieldAlert } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { navigation, type AppRole } from '../../config/navigation';
import UserProfileMenu from '../UserProfileMenu';

interface StoredUser {
  name?: string;
  roles?: string[];
}

function getStoredUser(): StoredUser | null {
  try {
    const stored = localStorage.getItem('user');

    if (!stored) {
      return null;
    }

    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export default function Sidebar() {
  const user = getStoredUser();

  const roles = (user?.roles ?? []) as AppRole[];

  const visibleSections = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.roles.some((role) => roles.includes(role)),
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-900 lg:flex">
      {/* Brand */}
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>

        <div>
          <div className="font-semibold text-white">
            Industrial Ops
          </div>

          <div className="text-xs text-slate-500">
            Operations Platform
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {visibleSections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                {section.label}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/dashboard'}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                          isActive
                            ? 'bg-blue-600/10 font-medium text-blue-400'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                        ].join(' ')
                      }
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User */}
      <UserProfileMenu />
    </aside>
  );
}