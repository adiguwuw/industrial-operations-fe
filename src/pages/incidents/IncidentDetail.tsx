import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Image,
  Loader2,
  MapPin,
  ShieldAlert,
  Upload,
  User,
  X,
} from 'lucide-react';

import {
  createIncidentComment,
  getIncident,
  getIncidentComments,
  getIncidentPhotoFile,
  getIncidentPhotos,
  investigateIncident,
  resolveIncident,
  getIncidentHistory,
} from '../../services/incidents';

import NotificationBell from '../../components/NotificationBell';

import type {
  Incident,
  IncidentComment,
  IncidentPhoto,
  IncidentStatusHistory,
} from '../../services/incidents';

const severityStyles: Record<Incident['severity'], string> = {
  critical:
    'bg-red-500/10 text-red-400 border border-red-500/20',
  high:
    'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  medium:
    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  low:
    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
};

const statusStyles: Record<Incident['status'], string> = {
  pending:
    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  investigating:
    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  resolved:
    'bg-green-500/10 text-green-400 border border-green-500/20',
};

const formatDateTime = (date: string | null) => {
  if (!date) return '-';

  return new Date(date).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const capitalize = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionModal, setActionModal] = useState<
  'investigate' | 'resolve' | null
>(null);

const [actionNotes, setActionNotes] = useState('');
const [comments, setComments] = useState<IncidentComment[]>([]);
const [incidentHistory, setIncidentHistory] = useState<
  IncidentStatusHistory[]
>([]);
const [commentPhoto, setCommentPhoto] = useState<File | undefined>();
const [actionPhoto, setActionPhoto] = useState<File | undefined>();
const [commentsLoading, setCommentsLoading] = useState(false);
const [commentText, setCommentText] = useState('');
const [commentSubmitting, setCommentSubmitting] = useState(false);

const [photos, setPhotos] = useState<IncidentPhoto[]>([]);
const [photosLoading, setPhotosLoading] = useState(false);
const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});


  useEffect(() => {
    if (!id) {
      setError('Incident ID is missing.');
      setLoading(true);
      setCommentsLoading(true);
      return;
    }

    const loadIncident = async () => {
    setLoading(true);
    setPhotosLoading(true);
    setError('');

    try {
      const data = await getIncident(id);
      setIncident(data);

      const [incidentComments, incidentPhotos, incidentHistory] =
      await Promise.all([
        getIncidentComments(id),
        getIncidentPhotos(id),
        getIncidentHistory(id),
      ]);

      setComments(incidentComments);
      setPhotos(incidentPhotos);
      setIncidentHistory(incidentHistory);

      incidentComments.forEach((comment) => {
        comment.photos?.forEach((photo) => {
          void loadPhotoUrl(photo);
        });
      });

      incidentPhotos.forEach((photo) => {
          void loadPhotoUrl(photo);
        });

        incidentHistory.forEach((item) => {
          item.photos?.forEach((photo) => {
            void loadPhotoUrl(photo);
          });
        });

    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Unable to load incident details.',
      );
    } finally {
      setLoading(false);
      setCommentsLoading(false);
      setPhotosLoading(false);
    }
  };

    loadIncident();
  }, [id]);

  useEffect(() => {
    return () => {
      Object.values(photoUrls).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [photoUrls]);

  const openActionModal = (action: 'investigate' | 'resolve') => {
    setActionNotes('');
    setActionPhoto(undefined);
    setError('');
    setActionModal(action);
  };

  const closeActionModal = () => {
    if (actionLoading) return;
    setActionModal(null);
    setActionNotes('');
    setActionPhoto(undefined);
  };

  const handleActionSubmit = async () => {
    if (!id || !incident || !actionModal) return;

    const notes = actionNotes.trim();

    if (actionModal === 'resolve' && notes.length < 10) {
      setError('Resolution notes must be at least 10 characters.');
      return;
    }

    if (notes.length > 500) {
      setError('Notes must not exceed 500 characters.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      const updatedIncident =
    actionModal === 'investigate'
      ? await investigateIncident(
          id,
          notes || undefined,
          actionPhoto,
        )
      : await resolveIncident(
          id,
          notes,
          actionPhoto,
        );
        setIncident(updatedIncident);

        const updatedHistory = await getIncidentHistory(id);
        setIncidentHistory(updatedHistory);

        updatedHistory.forEach((item) => {
          item.photos?.forEach((photo) => {
            void loadPhotoUrl(photo);
          });
        });

        setActionModal(null);
        setActionNotes('');
        setActionPhoto(undefined);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to update incident.');
      } finally {
        setActionLoading(false);
      }
    };

  const loadPhotoUrl = async (photo: IncidentPhoto) => {
    try {
      const blob = await getIncidentPhotoFile(photo.url);
      const objectUrl = URL.createObjectURL(blob);

      setPhotoUrls((current) => ({
        ...current,
        [photo.id]: objectUrl,
      }));
    } catch {
      setError('Unable to load incident photo.');
    }
  };

  const handleCommentSubmit = async () => {
    if (!id) return;

    const comment = commentText.trim();

    if (comment.length < 3) {
      setError('Comment must be at least 3 characters.');
      return;
    }

    if (comment.length > 1000) {
      setError('Comment must not exceed 1000 characters.');
      return;
    }

    try {
      setCommentSubmitting(true);
      setError('');

      const newComment = await createIncidentComment(
        id,
        comment,
        commentPhoto,
      );
      setComments((current) => [newComment, ...current]);
      newComment.photos?.forEach((photo) => {
      void loadPhotoUrl(photo);
    });
      setCommentText('');
      setCommentPhoto(undefined);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Unable to add comment.'
      );
    } finally {
      setCommentSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading incident...
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-400" />
          <h2 className="mt-4 text-lg font-semibold">Unable to load incident</h2>
          <p className="mt-2 text-sm text-slate-400">
            {error || 'The requested incident could not be found.'}
          </p>
          <Link
            to="/incidents"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Incidents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 lg:block">
          <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
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

          <nav className="space-y-1 p-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              to="/incidents"
              className="flex items-center gap-3 rounded-xl bg-blue-600/10 px-4 py-3 text-sm font-medium text-blue-400"
            >
              Incidents
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <header className="flex min-h-20 items-center justify-between border-b border-slate-800 bg-slate-900/70 px-6 py-4 lg:px-8">
            <div>
              <h1 className="text-lg font-semibold text-white">
                Incident Details
              </h1>

              <p className="text-sm text-slate-500">
                Review incident information and status.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="hidden text-right sm:block">
                <div className="text-sm font-medium text-white">
                  Indops admin
                </div>

                <div className="text-xs text-slate-500">
                  Administrator
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                IA
              </div>
            </div>
          </header>

          <div className="space-y-6 p-6 lg:p-8">
            {/* Back */}
            <Link
              to="/incidents"
              className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Incidents
            </Link>

            {/* Title */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-start">
              <div>
                <div className="text-sm font-medium text-blue-400">
                  {incident.incident_number}
                </div>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  {incident.title}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Reported on {formatDateTime(incident.reported_at)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                    className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-medium ${severityStyles[incident.severity]}`}
                >
                    {capitalize(incident.severity)}
                </span>

                <span
                    className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-medium ${statusStyles[incident.status]}`}
                >
                    {capitalize(incident.status)}
                </span>

                {incident.status === 'pending' && (
                    <button
                    type="button"
                    onClick={() => openActionModal('investigate')}
                    disabled={actionLoading}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                    {actionLoading ? 'Processing...' : 'Investigate'}
                    </button>
                )}

                {incident.status === 'investigating' && (
                    <button
                    type="button"
                    onClick={() => openActionModal('resolve')}
                    disabled={actionLoading}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                    {actionLoading ? 'Processing...' : 'Resolve'}
                    </button>
                )}
              </div>
            </div>

            {/* Information */}
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-base font-semibold text-white">
                  Incident Information
                </h3>

                <div className="mt-6 space-y-5">
                  <div className="flex gap-3">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

                    <div>
                      <div className="text-xs text-slate-500">
                        Category
                      </div>

                      <div className="mt-1 text-sm text-slate-200">
                        {incident.category.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <User className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

                    <div>
                      <div className="text-xs text-slate-500">
                        Reporter
                      </div>

                      <div className="mt-1 text-sm text-slate-200">
                        {incident.reporter.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

                    <div>
                      <div className="text-xs text-slate-500">
                        Reported At
                      </div>

                      <div className="mt-1 text-sm text-slate-200">
                        {formatDateTime(incident.reported_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

                    <div>
                      <div className="text-xs text-slate-500">
                        Resolved At
                      </div>

                      <div className="mt-1 text-sm text-slate-200">
                        {formatDateTime(incident.resolved_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-base font-semibold text-white">
                  Location
                </h3>

                <div className="mt-6 flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

                  <div>
                    <div className="text-xs text-slate-500">
                      Address
                    </div>

                    <div className="mt-1 text-sm text-slate-200">
                      {incident.location.address || 'No address provided'}
                    </div>

                    {(incident.location.latitude !== null ||
                      incident.location.longitude !== null) && (
                      <div className="mt-2 text-xs text-slate-500">
                        Coordinates:{' '}
                        {incident.location.latitude ?? '-'},
                        {' '}
                        {incident.location.longitude ?? '-'}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Description */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-base font-semibold text-white">
                Description
              </h3>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {incident.description}
              </p>
            </section>

            {/* Incident Photos */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Incident Photos
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Initial photo evidence submitted with this incident report.
                </p>
              </div>

              {photosLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                </div>
              ) : photos.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-800 py-10 text-center">
                  <Image className="mx-auto h-8 w-8 text-slate-700" />
                  <p className="mt-3 text-sm text-slate-500">
                    No photos attached to this incident.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                    >
                      {photoUrls[photo.id] ? (
                        <img
                          src={photoUrls[photo.id]}
                          alt={photo.original_name}
                          className="aspect-square w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                        </div>
                      )}

                      <div className="border-t border-slate-800 px-3 py-2">
                        <p
                          className="truncate text-xs text-slate-300"
                          title={photo.original_name}
                        >
                          {photo.original_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Activity & Comments */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Activity & Comments
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Discussion and updates related to this incident.
                    </p>
                  </div>

                  <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                    {comments.length} comment{comments.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Add Comment */}
                <div className="mt-6">
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    maxLength={1000}
                    rows={3}
                    disabled={commentSubmitting}
                    placeholder="Write a comment..."
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-600">
                      {commentText.length}/1000
                    </span>

                    <div className="mt-3">
                      <label
                        htmlFor="comment-photo"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
                      >
                        <Upload className="h-4 w-4" />
                        Attach Photo

                        <input
                          id="comment-photo"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={commentSubmitting}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setCommentPhoto(event.target.files?.[0])
                          }
                        />
                      </label>

                      {commentPhoto && (
                        <span className="ml-3 text-xs text-slate-500">
                          {commentPhoto.name}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCommentSubmit}
                      disabled={commentSubmitting || commentText.trim().length < 3}
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {commentSubmitting ? 'Posting...' : 'Add Comment'}
                    </button>
                  </div>
                </div>
                
                {/* Activity History */}
<div className="mt-8">
  <h4 className="text-sm font-semibold text-white">
    Activity History
  </h4>

  {incidentHistory.length === 0 ? (
    <div className="mt-4 rounded-xl border border-dashed border-slate-800 py-6 text-center">
      <p className="text-sm text-slate-500">
        No activity history yet.
      </p>
    </div>
  ) : (
    <div className="mt-4 space-y-4">
      {incidentHistory.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-white">
                {capitalize(item.from_status)} →{' '}
                {capitalize(item.to_status)}
              </div>

              <div className="mt-1 text-xs text-slate-600">
                {item.changed_by.name} ·{' '}
                {formatDateTime(item.created_at)}
              </div>
            </div>
          </div>

          {item.notes && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {item.notes}
            </p>
          )}

          {item.photos?.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {item.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                >
                  {photoUrls[photo.id] ? (
                    <img
                      src={photoUrls[photo.id]}
                      alt={photo.original_name}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                    </div>
                  )}

                  <div className="px-3 py-2">
                    <p
                      className="truncate text-xs text-slate-400"
                      title={photo.original_name}
                    >
                      {photo.original_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>

                {/* Comments */}
                <div className="mt-8 space-y-4">
                  {commentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-800 py-8 text-center">
                      <p className="text-sm text-slate-500">
                        No comments yet.
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                              {comment.user.name
                                .split(' ')
                                .map((part) => part[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>

                            <div>
                              <div className="text-sm font-medium text-white">
                                {comment.user.name}
                              </div>

                              <div className="text-xs text-slate-600">
                                {formatDateTime(comment.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                          {comment.comment}
                        </p>
                        {comment.photos?.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {comment.photos.map((photo) => (
                            <div
                              key={photo.id}
                              className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                            >
                              {photoUrls[photo.id] ? (
                                <img
                                  src={photoUrls[photo.id]}
                                  alt={photo.original_name}
                                  className="aspect-square w-full object-cover"
                                />
                              ) : (
                                <div className="flex aspect-square items-center justify-center">
                                  <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                                </div>
                              )}

                              <div className="px-3 py-2">
                                <p
                                  className="truncate text-xs text-slate-400"
                                  title={photo.original_name}
                                >
                                  {photo.original_name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      </div>
                    ))
                  )}
                </div>
              </section>

            {/* Metadata */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-base font-semibold text-white">
                Record Information
              </h3>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-500">
                    Created
                  </div>

                  <div className="mt-1 text-sm text-slate-300">
                    {formatDateTime(incident.created_at)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">
                    Last Updated
                  </div>

                  <div className="mt-1 text-sm text-slate-300">
                    {formatDateTime(incident.updated_at)}
                  </div>
                </div>
              </div>
            </section>
            {actionModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="action-modal-title">
                  <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                    <div>
                      <h3 id="action-modal-title" className="text-base font-semibold text-white">
                        {actionModal === 'investigate' ? 'Investigate Incident' : 'Resolve Incident'}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {incident.incident_number} · {incident.title}
                      </p>
                    </div>
                    <button type="button" onClick={closeActionModal} disabled={actionLoading} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50" aria-label="Close modal">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="p-6">
                    <label htmlFor="action-notes" className="block text-sm font-medium text-slate-200">
                      {actionModal === 'investigate' ? 'Investigation Notes' : 'Resolution Notes'}
                    </label>
                    <textarea id="action-notes" value={actionNotes} onChange={(event) => setActionNotes(event.target.value)} maxLength={500} rows={5} disabled={actionLoading} autoFocus placeholder={actionModal === 'investigate' ? 'Add investigation notes (optional)...' : 'Explain how the incident was resolved...'} className="mt-3 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    <div className="mt-4">
                        <label
                          htmlFor="action-photo"
                          className="block text-sm font-medium text-slate-200"
                        >
                          Photo Evidence
                        </label>

                        <input
                          id="action-photo"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={actionLoading}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setActionPhoto(event.target.files?.[0])
                          }
                          className="mt-3 block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-500"
                        />

                        {actionPhoto && (
                          <p className="mt-2 text-xs text-slate-500">
                            Selected: {actionPhoto.name}
                          </p>
                        )}
                      </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>{actionModal === 'resolve' ? 'Minimum 10 characters required.' : 'Optional. Maximum 500 characters.'}</span>
                      <span>{actionNotes.length}/500</span>
                    </div>
                    {error && <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
                    <div className="mt-6 flex justify-end gap-3">
                      <button type="button" onClick={closeActionModal} disabled={actionLoading} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50">Cancel</button>
                      <button type="button" onClick={handleActionSubmit} disabled={actionLoading || (actionModal === 'resolve' && actionNotes.trim().length < 10)} className={`rounded-xl px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 ${actionModal === 'investigate' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'}`}>
                        {actionLoading ? 'Processing...' : actionModal === 'investigate' ? 'Start Investigation' : 'Resolve Incident'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}