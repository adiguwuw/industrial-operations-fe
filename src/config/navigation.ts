import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  ListChecks,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type AppRole =
  | 'admin'
  | 'k3-officer'
  | 'supervisor'
  | 'employee';

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: AppRole[];
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export const navigation: NavigationSection[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: BarChart3,
        roles: ['admin', 'k3-officer', 'supervisor', 'employee'],
      },
    ],
  },
  {
    label: 'K3 Management',
    items: [
      {
        label: 'Incidents',
        path: '/incidents',
        icon: AlertTriangle,
        roles: ['admin', 'k3-officer', 'supervisor', 'employee'],
      },
      {
        label: 'Safety Inspection',
        path: '/inspections',
        icon: ClipboardCheck,
        roles: ['admin', 'k3-officer'],
      },
      {
        label: 'Checklists',
        path: '/checklists',
        icon: ListChecks,
        roles: ['admin', 'k3-officer'],
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        label: 'Task Management',
        path: '/tasks',
        icon: CheckCircle2,
        roles: ['admin', 'supervisor', 'employee'],
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'User Management',
        path: '/users',
        icon: Users,
        roles: ['admin'],
      },
    ],
  },
];