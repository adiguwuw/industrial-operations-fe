import api from '../lib/api';

export interface AppNotification {
  id: string;
  type: string;
  data: {
    type: string;
    incident_id: string;
    incident_number: string;
    incident_title: string;
    comment_id: string;
    commenter_id: number;
    commenter_name: string;
    comment: string;
  };
  read_at: string | null;
  created_at: string;
}

interface NotificationsResponse {
  data: AppNotification[];
  unread_count: number;
}

export const getNotifications = async (): Promise<NotificationsResponse> => {
  const response = await api.get<NotificationsResponse>('/notifications');

  return response.data;
};

export const markNotificationAsRead = async (
  id: string
): Promise<void> => {
  await api.post(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.post('/notifications/read-all');
};