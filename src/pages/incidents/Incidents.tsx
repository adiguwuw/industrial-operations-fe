import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Filter,
  Search,
  ShieldAlert,
  User,
} from 'lucide-react';

import { getIncidents } from '../../services/incidents';
import type { Incident } from '../../services/incidents';

const severityStyles: Record<
  Incident['severity'],
  string
> = {
  critical:
    'bg-red-500/10 text-red-400 border-red-500/20',

  high:
    'bg-orange-500/10 text-orange-400 border-orange-500/20',

  medium:
    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',

  low:
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const statusStyles: Record<
  Incident['status'],
  string
> = {
  pending:
    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',

  investigating:
    'bg-blue-500/10 text-blue-400 border-blue-500/20',

  resolved:
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function formatStatus(status: Incident['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatSeverity(severity: Incident['severity']) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export default function Incidents() {

  const navigate = useNavigate();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadIncidents = async (targetPage = page) => {
    try {
      setLoading(true);
      setError('');

      const response = await getIncidents(targetPage);

      setIncidents(response.data);
      setPage(response.meta.current_page);
      setLastPage(response.meta.last_page);
      setTotal(response.meta.total);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          'Failed to load incidents.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents(page);
  }, [page]);

  const filteredIncidents = incidents.filter((incident) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      incident.incident_number
        .toLowerCase()
        .includes(query) ||
      incident.title
        .toLowerCase()
        .includes(query) ||
      incident.description
        .toLowerCase()
        .includes(query) ||
      incident.location.address
        ?.toLowerCase()
        .includes(query) ||
      incident.category.name
        .toLowerCase()
        .includes(query) ||
      incident.reporter.name
        .toLowerCase()
        .includes(query);

    const matchesSeverity =
      !severityFilter ||
      incident.severity === severityFilter;

    const matchesStatus =
      !statusFilter ||
      incident.status === statusFilter;

    return (
      matchesSearch &&
      matchesSeverity &&
      matchesStatus
    );
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
              {/* Page Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Incident Management
                  </h1>
                  <p className="mt-1 text-sm text-slate-400">
                    Monitor and manage industrial incident reports.
                  </p>
                </div>

                <Link
                  to="/incidents/report"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  Report Incident
                </Link>
              </div>


              {/* =================================================
                  SUMMARY CARDS
              ================================================== */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* Total */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Total Incidents
                    </p>

                    <ClipboardList className="h-5 w-5 text-blue-400" />
                  </div>

                  <p className="text-3xl font-bold text-white">
                    {total}
                  </p>
                </div>

                {/* Pending */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Pending
                    </p>

                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>

                  <p className="text-3xl font-bold text-white">
                    {incidents.filter(
                      (incident) =>
                        incident.status === 'pending',
                    ).length}
                  </p>
                </div>

                {/* Investigating */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Investigating
                    </p>

                    <ShieldAlert className="h-5 w-5 text-blue-400" />
                  </div>

                  <p className="text-3xl font-bold text-white">
                    {incidents.filter(
                      (incident) =>
                        incident.status === 'investigating',
                    ).length}
                  </p>
                </div>

                {/* Resolved */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Resolved
                    </p>

                    <ClipboardList className="h-5 w-5 text-emerald-400" />
                  </div>

                  <p className="text-3xl font-bold text-white">
                    {incidents.filter(
                      (incident) =>
                        incident.status === 'resolved',
                    ).length}
                  </p>
                </div>

              </div>

              {/* =================================================
                  FILTERS
              ================================================== */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex flex-col gap-3 lg:flex-row">

                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search incident number, title, category, reporter..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-slate-500" />

                    <select
                      value={severityFilter}
                      onChange={(event) =>
                        setSeverityFilter(event.target.value)
                      }
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500"
                    >
                      <option value="">
                        All Severity
                      </option>

                      <option value="critical">
                        Critical
                      </option>

                      <option value="high">
                        High
                      </option>

                      <option value="medium">
                        Medium
                      </option>

                      <option value="low">
                        Low
                      </option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value)
                      }
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500"
                    >
                      <option value="">
                        All Status
                      </option>

                      <option value="pending">
                        Pending
                      </option>

                      <option value="investigating">
                        Investigating
                      </option>

                      <option value="resolved">
                        Resolved
                      </option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* =================================================
                  INCIDENT TABLE
              ================================================== */}
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

                <div className="overflow-x-auto">
                  <table className="min-w-[1000px] w-full">

                    <thead className="border-b border-slate-800 bg-slate-950/40">
                      <tr className="text-left text-xs uppercase tracking-wider text-slate-500">

                        <th className="px-5 py-4">
                          Incident
                        </th>

                        <th className="px-5 py-4">
                          Category
                        </th>

                        <th className="px-5 py-4">
                          Severity
                        </th>

                        <th className="px-5 py-4">
                          Status
                        </th>

                        <th className="px-5 py-4">
                          Location
                        </th>

                        <th className="px-5 py-4">
                          Reporter
                        </th>

                        <th className="px-5 py-4">
                          Reported
                        </th>

                        <th className="px-5 py-4 text-right">
                          Action
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800">

                      {loading ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-16 text-center text-sm text-slate-500"
                          >
                            Loading incidents...
                          </td>
                        </tr>
                      ) : filteredIncidents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-16 text-center"
                          >
                            <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-700" />

                            <p className="font-medium text-slate-400">
                              No incidents found
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              Try adjusting your search or filters.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredIncidents.map((incident) => (
                          <tr
                            key={incident.id}
                            className="transition hover:bg-slate-800/40"
                          >

                            {/* Incident */}
                            <td className="px-5 py-4">
                              <Link
                                to={`/incidents/${incident.id}`}
                                className="group block"
                              >
                                <p className="text-xs font-medium text-blue-400">
                                  {incident.incident_number}
                                </p>

                                <p className="mt-1 max-w-xs truncate font-medium text-white group-hover:text-blue-400">
                                  {incident.title}
                                </p>
                              </Link>
                            </td>

                            {/* Category */}
                            <td className="px-5 py-4">
                              <span className="text-sm text-slate-300">
                                {incident.category.name}
                              </span>
                            </td>

                            {/* Severity */}
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${severityStyles[incident.severity]}`}
                              >
                                {formatSeverity(
                                  incident.severity,
                                )}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[incident.status]}`}
                              >
                                {formatStatus(
                                  incident.status,
                                )}
                              </span>
                            </td>

                            {/* Location */}
                            <td className="max-w-[220px] px-5 py-4">
                              <p className="truncate text-sm text-slate-400">
                                {incident.location.address ||
                                  'Location not specified'}
                              </p>
                            </td>

                            {/* Reporter */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800">
                                  <User className="h-4 w-4 text-slate-500" />
                                </div>

                                <span className="text-sm text-slate-300">
                                  {incident.reporter.name}
                                </span>

                              </div>
                            </td>

                            {/* Reported */}
                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                              {formatDate(
                                incident.reported_at,
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/incidents/${incident.id}`)
                                }
                                title="View incident detail"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-400"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                            </td>

                          </tr>
                        ))
                      )}

                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    PAGINATION
                ================================================== */}
                {!loading && lastPage > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4">

                    <p className="text-sm text-slate-500">
                      Page{' '}
                      <span className="font-medium text-slate-300">
                        {page}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium text-slate-300">
                        {lastPage}
                      </span>
                    </p>

                    <div className="flex items-center gap-2">

                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() =>
                          setPage((current) =>
                            Math.max(1, current - 1),
                          )
                        }
                        className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        disabled={page >= lastPage}
                        onClick={() =>
                          setPage((current) =>
                            Math.min(
                              lastPage,
                              current + 1,
                            ),
                          )
                        }
                        className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                    </div>
                  </div>
                )}

              </div>

            </div>
  );
}