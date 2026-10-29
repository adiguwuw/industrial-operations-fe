
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
} from 'lucide-react';

import type { DashboardData } from '../../../services/dashboard';
import StatCard from '../components/StatCard';

interface Props {
  data: DashboardData;
}

export default function IncidentOverviewSection({ data }: Props) {
  const stats = [
    {
      label: 'Total Incidents',
      value: data.incidents.total,
      icon: BarChart3,
    },
    {
      label: 'Pending',
      value: data.incidents.status.pending,
      icon: Clock3,
    },
    {
      label: 'Investigating',
      value: data.incidents.status.investigating,
      icon: AlertTriangle,
    },
    {
      label: 'Resolved',
      value: data.incidents.status.resolved,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
