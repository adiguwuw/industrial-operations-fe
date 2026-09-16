import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/notifications';

import type { AppNotification } from '../services/notifications';

const formatNotificationTime = (date: string) => {
  const value = new Date(date);

  return value.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();

      setNotifications(data.data);
      setUnreadCount(data.unread_count);
    } catch {
      // Authentication interceptor handles 401.
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(loadNotifications, 30000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (
    notification: AppNotification
  ) => {
    if (!notification.read_at) {
      try {
        await markNotificationAsRead(notification.id);

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, read_at: new Date().toISOString() }
              : item
          )
        );

        setUnreadCount((current) => Math.max(0, current - 1));
      } catch {
        // Keep navigation working even if marking as read fails.
      }
    }

    setOpen(false);

    navigate(`/incidents/${notification.data.incident_id}`);
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      setLoading(true);

      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read_at: notification.read_at ?? new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-slate-950">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Notifications
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount !== 1 ? 's' : ''
                    }`
                  : 'All caught up'}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-400 transition hover:text-blue-300 disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Bell className="mx-auto h-8 w-8 text-slate-700" />

                <p className="mt-3 text-sm text-slate-500">
                  No notifications yet.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                  className={`flex w-full gap-3 border-b border-slate-800 px-4 py-4 text-left transition hover:bg-slate-800/70 ${
                    notification.read_at
                      ? ''
                      : 'bg-blue-500/5'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      notification.read_at
                        ? 'bg-slate-800 text-slate-500'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white">
                        {notification.data.commenter_name}
                      </p>

                      {!notification.read_at && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      commented on{' '}
                      <span className="font-medium text-slate-300">
                        {notification.data.incident_number}
                      </span>
                    </p>

                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                      {notification.data.comment}
                    </p>

                    <p className="mt-2 text-[11px] text-slate-600">
                      {formatNotificationTime(
                        notification.created_at
                      )}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}