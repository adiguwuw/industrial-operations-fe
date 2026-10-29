import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';

interface AppShellProps {
  title?: string;
  description?: string;
}

export default function AppShell({
  title = 'Industrial Operations',
  description = 'Operations Platform',
}: AppShellProps) {
  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex h-screen">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            title={title}
            description={description}
          />

          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}