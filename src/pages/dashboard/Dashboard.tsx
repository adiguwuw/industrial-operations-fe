import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldAlert,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts';

import { getDashboard } from '../../services/dashboard';
import type { DashboardData } from '../../services/dashboard';
import UserProfileMenu from '../../components/UserProfileMenu';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const user = getStoredUser();
  const isAdmin = user?.roles?.includes('admin');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const dashboard = await getDashboard();
        setData(dashboard);
      } catch {
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-red-400">
        {error || 'Unable to load dashboard.'}
      </div>
    );
  }

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

  const severityData = [
    {
      name: 'Critical',
      total: data.incidents.severity.critical,
    },
    {
      name: 'High',
      total: data.incidents.severity.high,
    },
    {
      name: 'Medium',
      total: data.incidents.severity.medium,
    },
    {
      name: 'Low',
      total: data.incidents.severity.low,
    },
  ];

  const trendData = data.trend.items.map((item) => ({
    period: new Date(`${item.period}-01`).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    total: item.total,
  }));

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex h-screen">

        {/* Sidebar */}
        <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 lg:flex">

          {/* Logo */}
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
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">

            <a
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl bg-blue-600/10 px-4 py-3 text-sm font-medium text-blue-400"
            >
              <BarChart3 className="h-5 w-5" />
              Dashboard
            </a>

            <a
              href="/incidents"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <AlertTriangle className="h-5 w-5" />
              Incidents
            </a>

            {isAdmin && (
              <a
                href="/users"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <Users className="h-5 w-5" />
                User Management
              </a>
            )}

          </nav>

          {/* Profile / Logout */}
          <UserProfileMenu />

        </aside>

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* Header */}
          <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/70 px-6 lg:px-8">
            <div>
              <h1 className="text-lg font-semibold text-white">
                Operations Overview
              </h1>

              <p className="text-sm text-slate-500">
                Monitor incidents and operational safety.
              </p>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-6 lg:p-8">

              {/* Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-500">
                            {stat.label}
                          </p>

                          <p className="mt-2 text-3xl font-bold text-white">
                            {stat.value}
                          </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                          <Icon className="h-5 w-5 text-blue-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts */}
              <div className="grid gap-6 xl:grid-cols-2">

                {/* Incident Trend */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <div className="mb-6">
                    <h2 className="font-semibold text-white">
                      Incident Trend
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Monthly incident reports
                    </p>
                  </div>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                        />

                        <XAxis
                          dataKey="period"
                          stroke="#64748b"
                          tick={{ fontSize: 12 }}
                        />

                        <YAxis
                          stroke="#64748b"
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Severity */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <div className="mb-6">
                    <h2 className="font-semibold text-white">
                      Severity Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Incidents by severity level
                    </p>
                  </div>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={severityData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                        />

                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          tick={{ fontSize: 12 }}
                        />

                        <YAxis
                          stroke="#64748b"
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                          }}
                        />

                        <Bar
                          dataKey="total"
                          radius={[6, 6, 0, 0]}
                          fill="#3b82f6"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

              </div>

              {/* Categories */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="mb-6">
                  <h2 className="font-semibold text-white">
                    Incidents by Category
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Distribution across incident categories
                  </p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.categories}
                      layout="vertical"
                      margin={{ left: 30, right: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                      />

                      <XAxis
                        type="number"
                        allowDecimals={false}
                        stroke="#64748b"
                      />

                      <YAxis
                        type="category"
                        dataKey="category"
                        width={150}
                        stroke="#64748b"
                        tick={{ fontSize: 12 }}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                        }}
                      />

                      <Bar
                        dataKey="total"
                        radius={[0, 6, 6, 0]}
                        fill="#3b82f6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}