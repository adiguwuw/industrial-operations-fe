import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Incidents from './pages/incidents/Incidents';
import IncidentDetail from './pages/incidents/IncidentDetail';
import ReportIncident from './pages/incidents/ReportIncident';
import Profile from './pages/profile/Profile';
import Users from './pages/users/Users';
import UserForm from './pages/users/UserForm';

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

function DashboardRoute() {
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const roles = user?.roles ?? [];

  const canAccessDashboard =
    roles.includes('admin') ||
    roles.includes('k3-officer') ||
    roles.includes('supervisor');

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
    roles.includes('supervisor');

  return (
    <Navigate
      to={canAccessDashboard ? '/dashboard' : '/incidents'}
      replace
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<DashboardRoute />} />

      <Route
        path="/incidents"
        element={
          <ProtectedRoute>
            <Incidents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/incidents/:id"
        element={
          <ProtectedRoute>
            <IncidentDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/incidents/report"
        element={
          <ProtectedRoute>
            <ReportIncident />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
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

      <Route path="/" element={<HomeRedirect />} />

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}