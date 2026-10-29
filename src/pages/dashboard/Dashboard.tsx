
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import type { AppRole } from '../../config/navigation';
import { getDashboard } from '../../services/dashboard';
import type { DashboardData } from '../../services/dashboard';
import { getTasks } from '../../services/tasks';
import type { Task } from '../../services/tasks';

import DashboardSection from './components/DashboardSection';
import IncidentOverviewSection from './sections/IncidentOverviewSection';
import IncidentAnalyticsSection from './sections/IncidentAnalyticsSection';
import MyTasksSection from './sections/MyTasksSection';
import TaskOverviewSection from './sections/TaskOverviewSection';
import { getVisibleDashboardSections } from './config/dashboardSections';

function getStoredRoles(): AppRole[] {
  try {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) return [];

    const user = JSON.parse(storedUser);
    const allowedRoles: AppRole[] = [
      'admin',
      'k3-officer',
      'supervisor',
      'employee',
    ];

    return Array.isArray(user.roles)
      ? user.roles.filter(
          (role: unknown): role is AppRole =>
            typeof role === 'string' &&
            allowedRoles.includes(role as AppRole),
        )
      : [];
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const [roles] = useState<AppRole[]>(getStoredRoles);
  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const visibleSections = getVisibleDashboardSections(roles);

  // Selaraskan permintaan API dengan izin backend, bukan hanya section UI.
  const canViewIncidents = roles.some((role) =>
    ['admin', 'k3-officer', 'supervisor'].includes(role),
  );

  const canViewTasks = roles.some((role) =>
    ['admin', 'supervisor', 'employee'].includes(role),
  );

  const isEmployee = roles.includes('employee');
  const isTeamManager = roles.some((role) =>
    ['admin', 'supervisor'].includes(role),
  );

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setErrors([]);

      const nextErrors: string[] = [];
      const requests: Promise<void>[] = [];

      if (canViewIncidents) {
        requests.push(
          getDashboard()
            .then((data) => {
              if (!cancelled) setDashboardData(data);
            })
            .catch(() => {
              nextErrors.push('Unable to load incident analytics.');
            }),
        );
      }

      if (canViewTasks) {
        requests.push(
          getTasks()
            .then((data) => {
              if (!cancelled) setTasks(data);
            })
            .catch(() => {
              nextErrors.push('Unable to load task data.');
            }),
        );
      }

      await Promise.all(requests);

      if (!cancelled) {
        setErrors(nextErrors);
        setLoading(false);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [canViewIncidents, canViewTasks]);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Operational overview based on your role.
        </p>
      </header>

      {errors.map((error) => (
        <div
          key={error}
          role="alert"
          className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      ))}

      {visibleSections.map((section) => {
        switch (section.id) {
          case 'incident-overview':
            return dashboardData ? (
              <DashboardSection
                key={section.id}
                title={section.title}
                description="Current incident status at a glance."
              >
                <IncidentOverviewSection data={dashboardData} />
              </DashboardSection>
            ) : null;

          case 'incident-analytics':
            return dashboardData ? (
              <div key={section.id}>
                <IncidentAnalyticsSection data={dashboardData} />
              </div>
            ) : null;

          case 'task-overview':
            return isTeamManager ? (
              <TaskOverviewSection key={section.id} tasks={tasks} />
            ) : null;

          case 'my-tasks':
            return isEmployee ? (
              <div key={section.id}>
                <MyTasksSection tasks={tasks} isEmployee />
              </div>
            ) : null;

          default:
            return null;
        }
      })}

      {visibleSections.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
          No dashboard sections are available for your role.
        </div>
      )}
    </div>
  );
}
