
import type { AppRole } from '../../../config/navigation';

export type DashboardSectionId =
  | 'incident-overview'
  | 'incident-analytics'
  | 'task-overview'
  | 'my-tasks';

export interface DashboardSectionConfig {
  id: DashboardSectionId;
  title: string;
  allowedRoles: AppRole[];
}

export const dashboardSections: DashboardSectionConfig[] = [
  {
    id: 'incident-overview',
    title: 'Safety Overview',
    allowedRoles: ['admin', 'k3-officer', 'supervisor'],
  },
  {
    id: 'incident-analytics',
    title: 'Incident Analytics',
    allowedRoles: ['admin', 'k3-officer', 'supervisor'],
  },
  {
    id: 'task-overview',
    title: 'Task Overview',
    allowedRoles: ['admin', 'supervisor'],
  },
  {
    id: 'my-tasks',
    title: 'My Tasks',
    allowedRoles: ['employee'],
  },
];

export function getVisibleDashboardSections(
  roles: AppRole[],
): DashboardSectionConfig[] {
  return dashboardSections.filter((section) =>
    section.allowedRoles.some((role) => roles.includes(role)),
  );
}
