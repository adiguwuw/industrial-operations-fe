
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ListTodo,
} from 'lucide-react';

import type { Task } from '../../../services/tasks';
import DashboardSection from '../components/DashboardSection';
import StatCard from '../components/StatCard';

interface TaskOverviewSectionProps {
  tasks: Task[];
}

function isOverdue(task: Task): boolean {
  if (['validated', 'completed'].includes(task.status)) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${task.due_date}T00:00:00`);

  return !Number.isNaN(dueDate.getTime()) && dueDate < today;
}

export default function TaskOverviewSection({
  tasks,
}: TaskOverviewSectionProps) {
  const activeTasks = tasks.filter((task) =>
    ['open', 'in_progress'].includes(task.status),
  ).length;

  const pendingReview = tasks.filter(
    (task) => task.status === 'pending_review',
  ).length;

  const overdueTasks = tasks.filter(isOverdue).length;

  return (
    <DashboardSection
      title="Task Overview"
      description="Ringkasan tugas tim berdasarkan data yang dapat Anda akses."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Tasks"
          value={tasks.length}
          icon={ListTodo}
          description="Seluruh tugas dalam hasil API"
        />

        <StatCard
          label="Active Tasks"
          value={activeTasks}
          icon={Clock3}
          description="Open atau sedang dikerjakan"
        />

        <StatCard
          label="Pending Review"
          value={pendingReview}
          icon={CheckCircle2}
          description="Menunggu validasi"
        />

        <StatCard
          label="Overdue Tasks"
          value={overdueTasks}
          icon={AlertTriangle}
          description="Melewati tenggat dan belum selesai"
        />
      </div>
    </DashboardSection>
  );
}
