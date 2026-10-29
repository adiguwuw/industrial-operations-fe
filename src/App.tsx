
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import AppShell from './components/layout/AppShell';

const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Incidents = lazy(() => import('./pages/incidents/Incidents'));
const IncidentDetail = lazy(() => import('./pages/incidents/IncidentDetail'));
const ReportIncident = lazy(() => import('./pages/incidents/ReportIncident'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Users = lazy(() => import('./pages/users/Users'));
const UserForm = lazy(() => import('./pages/users/UserForm'));
const Tasks = lazy(() => import('./pages/tasks/Tasks'));
const Inspections = lazy(() => import('./pages/inspections/Inspections'));
const InspectionDetail = lazy(() => import('./pages/inspections/InspectionDetail'));
const InspectionForm = lazy(() => import('./pages/inspections/InspectionForm'));
const Checklists = lazy(() => import('./pages/checklists/Checklists'));
const ChecklistForm = lazy(() => import('./pages/checklists/ChecklistForm'));

function PageLoader() {
  return (
    <div className="flex min-h-96 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );
}

type User = {
  roles?: string[];
};

function getStoredUser(): User | null {
  try {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.roles?.includes('admin');

  if (!isAdmin) {
    return <Navigate to="/incidents" replace />;
  }

  return children;
}

function K3ManagementRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = localStorage.getItem('token');
  const user = getStoredUser();
  const roles = user?.roles ?? [];

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const canAccess =
    roles.includes('admin') ||
    roles.includes('k3-officer');

  if (!canAccess) {
    return <Navigate to="/incidents" replace />;
  }

  return children;
}

function DashboardRoute() {
  const user = getStoredUser();
  const roles = user?.roles ?? [];

  const canAccessDashboard =
    roles.includes('admin') ||
    roles.includes('k3-officer') ||
    roles.includes('supervisor') ||
    roles.includes('employee');

  if (!canAccessDashboard) {
    return <Navigate to="/incidents" replace />;
  }

  return <Dashboard />;
}


function HomeRedirect() {
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const roles = user?.roles ?? [];

  const canAccessDashboard =
    roles.includes('admin') ||
    roles.includes('k3-officer') ||
    roles.includes('supervisor') ||
    roles.includes('employee');

  return (
    <Navigate
      to={canAccessDashboard ? '/dashboard' : '/incidents'}
      replace
    />
  );
}



export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected application shell */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<DashboardRoute />}
          />

          {/* Incident Management */}
          <Route
            path="/incidents"
            element={<Incidents />}
          />

          <Route
            path="/incidents/:id"
            element={<IncidentDetail />}
          />

          <Route
            path="/incidents/report"
            element={<ReportIncident />}
          />

          {/* Safety Inspection */}
          <Route
            path="/inspections"
            element={
              <K3ManagementRoute>
                <Inspections />
              </K3ManagementRoute>
            }
          />

          <Route
            path="/inspections/new"
            element={
              <K3ManagementRoute>
                <InspectionForm />
              </K3ManagementRoute>
            }
          />

          <Route
            path="/inspections/:id"
            element={
              <K3ManagementRoute>
                <InspectionDetail />
              </K3ManagementRoute>
            }
          />

          {/* Checklists */}
          <Route
            path="/checklists"
            element={
              <K3ManagementRoute>
                <Checklists />
              </K3ManagementRoute>
            }
          />

          <Route
            path="/checklists/new"
            element={
              <K3ManagementRoute>
                <ChecklistForm />
              </K3ManagementRoute>
            }
          />

          {/* Task Management */}
          <Route
            path="/tasks"
            element={<Tasks />}
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={<Profile />}
          />

          {/* Administration: Admin only */}
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />

          <Route
            path="/users/new"
            element={
              <AdminRoute>
                <UserForm />
              </AdminRoute>
            }
          />

          <Route
            path="/users/:id/edit"
            element={
              <AdminRoute>
                <UserForm />
              </AdminRoute>
            }
          />
        </Route>

        {/* Root */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Unknown routes */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Suspense>
  );
}
