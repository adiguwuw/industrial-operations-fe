
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { DashboardData } from '../../../services/dashboard';
import DashboardSection from '../components/DashboardSection';

interface Props {
  data: DashboardData;
}

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '12px',
};

export default function IncidentAnalyticsSection({ data }: Props) {
  const trendData = data.trend.items.map((item) => ({
    period: new Date(`${item.period}-01`).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    total: item.total,
  }));

  const severityData = [
    { name: 'Critical', total: data.incidents.severity.critical },
    { name: 'High', total: data.incidents.severity.high },
    { name: 'Medium', total: data.incidents.severity.medium },
    { name: 'Low', total: data.incidents.severity.low },
  ];

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardSection
          title="Incident Trend"
          description="Monthly incident reports"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#64748b" />
                <YAxis
                  stroke="#64748b"
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
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
        </DashboardSection>

        <DashboardSection
          title="Severity Overview"
          description="Incidents by severity level"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="total"
                  radius={[6, 6, 0, 0]}
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>
      </div>

      <DashboardSection
        title="Incidents by Category"
        description="Distribution across incident categories"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.categories}
              layout="vertical"
              margin={{ left: 30, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" allowDecimals={false} stroke="#64748b" />
              <YAxis
                type="category"
                dataKey="category"
                width={150}
                stroke="#64748b"
                tick={{ fontSize: 12 }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="total"
                radius={[0, 6, 6, 0]}
                fill="#3b82f6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardSection>
    </>
  );
}
