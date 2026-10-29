
import { useMemo } from 'react';
import {
  CheckCircle2,
  Clock3,
  ListTodo,
  AlertTriangle,
} from 'lucide-react';

import type { Task } from '../../../services/tasks';
import DashboardSection from '../components/DashboardSection';
import StatCard from '../components/StatCard';

interface Props {
  tasks: Task[];
  isEmployee: boolean;
}

const statusLabels: Record<Task['status'], string> = {
  open: 'Open',
  in_progress: 'In Progress',
  pending_review: 'Pending Review',
  validated: 'Validated',
  completed: 'Completed',
};

const statusStyles: Record<Task['status'], string> = {
  open: 'bg-slate-800 text-slate-300',
  in_progress: 'bg-blue-950 text-blue-300',
  pending_review: 'bg-amber-950 text-amber-300',
  validated: 'bg-emerald-950 text-emerald-300',
  completed: 'bg-emerald-950 text-emerald-300',
};

export default function MyTasksSection({
  tasks,
  isEmployee,
}: Props) {
  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unfinished = tasks.filter(
      (task) =>
        task.status !== 'validated' &&
        task.status !== 'completed',
    );

    const overdue = unfinished.filter((task) => {
      if (!task.due_date) return false;

      return new Date(`${task.due_date}T00:00:00`) < today;
    });

    return {
      total: tasks.length,
      active: tasks.filter(
        (task) =>
          task.status === 'open' ||
          task.status === 'in_progress',
      ).length,
      pendingReview: tasks.filter(
        (task) => task.status === 'pending_review',
      ).length,
      overdue: overdue.length,
    };
  }, [tasks]);

  const stats = [
    {
      label: isEmployee ? 'My Tasks' : 'Total Tasks',
      value: summary.total,
      icon: ListTodo,
    },
    {
      label: 'Active Tasks',
      value: summary.active,
      icon: Clock3,
    },
    {
      label: 'Pending Review',
      value: summary.pendingReview,
      icon: CheckCircle2,
    },
    {
      label: 'Overdue Tasks',
      value: summary.overdue,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <DashboardSection
        title={isEmployee ? 'My Tasks' : 'Team Tasks'}
        description={
          isEmployee
            ? 'Tasks assigned to you and their current status.'
            : 'Tasks available to your role and their current status.'
        }
      >
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
            <ListTodo className="mx-auto h-8 w-8 text-slate-500" />
            <p className="mt-3 font-medium text-white">
              No tasks found
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Tasks will appear here when available.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {tasks
              .slice()
              .sort((a, b) => {
                const aDate = a.due_date || '9999-12-31';
                const bDate = b.due_date || '9999-12-31';

                return aDate.localeCompare(bDate);
              })
              .slice(0, 6)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-white">
                      {task.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Due:{' '}
                      {task.due_date
                        ? new Date(
                            `${task.due_date}T00:00:00`,
                          ).toLocaleDateString()
                        : 'Not set'}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${statusStyles[task.status]}`}
                  >
                    {statusLabels[task.status]}
                  </span>
                </div>
              ))}
          </div>
        )}
      </DashboardSection>
    </div>
  );
}
