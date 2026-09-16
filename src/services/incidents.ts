import api from '../lib/api';

export interface Incident {
  id: string;
  incident_number: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'investigating' | 'resolved';

  location: {
    address: string | null;
    latitude: string | number | null;
    longitude: string | number | null;
  };

  reported_at: string;
  resolved_at: string | null;

  category: {
    id: string;
    name: string;
  };

  reporter: {
    id: number;
    name: string;
  };

  created_at: string;
  updated_at: string;
}

export interface IncidentsResponse {
  data: Incident[];

  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };

  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export const getIncidents = async (
  page = 1,
): Promise<IncidentsResponse> => {
  const response = await api.get<IncidentsResponse>(
    `/incidents?page=${page}`,
  );

  return response.data;
};

export const getIncident = async (
  id: string,
): Promise<Incident> => {
  const response = await api.get<{ data: Incident }>(
    `/incidents/${id}`,
  );

  return response.data.data;
};

export interface CreateIncidentPayload {
  category_id: string;
  title: string;
  description: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const createIncident = async (
  payload: CreateIncidentPayload,
): Promise<Incident> => {
  const response = await api.post<{ data: Incident }>(
    '/incidents',
    payload,
  );

  return response.data.data;
};

export const investigateIncident = async (
  id: string,
  notes?: string,
  photo?: File,
): Promise<Incident> => {
  const formData = new FormData();

  if (notes) {
    formData.append('notes', notes);
  }

  if (photo) {
    formData.append('photo', photo);
  }

  const response = await api.post<{ data: Incident }>(
    `/incidents/${id}/investigate`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data.data;
};

export const resolveIncident = async (
  id: string,
  notes: string,
  photo?: File,
): Promise<Incident> => {
  const formData = new FormData();

  formData.append('notes', notes);

  if (photo) {
    formData.append('photo', photo);
  }

  const response = await api.post<{ data: Incident }>(
    `/incidents/${id}/resolve`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data.data;
};
// ==============================
// Comments
// ==============================

export interface IncidentComment {
  id: string;
  comment: string;

  user: {
    id: number;
    name: string;
  };

  photos: IncidentPhoto[];

  created_at: string;
}

interface IncidentCommentsResponse {
  data: IncidentComment[];
}

export const getIncidentComments = async (
  id: string,
): Promise<IncidentComment[]> => {
  const response = await api.get<IncidentCommentsResponse>(
    `/incidents/${id}/comments`,
  );

  return response.data.data;
};

export const createIncidentComment = async (
  id: string,
  comment: string,
  photo?: File,
): Promise<IncidentComment> => {
  const formData = new FormData();

  formData.append('comment', comment);

  if (photo) {
    formData.append('photo', photo);
  }

  const response = await api.post<{ data: IncidentComment }>(
    `/incidents/${id}/comments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data.data;
};
// ==============================
// Incident Photos
// ==============================

export interface IncidentPhoto {
  id: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  created_at: string;
}

interface IncidentPhotosResponse {
  data: IncidentPhoto[];
}

export const getIncidentPhotos = async (
  id: string,
): Promise<IncidentPhoto[]> => {
  const response = await api.get<IncidentPhotosResponse>(
    `/incidents/${id}/photos`,
  );

  return response.data.data;
};

export const uploadIncidentPhoto = async (
  id: string,
  photo: File,
): Promise<IncidentPhoto> => {
  const formData = new FormData();

  formData.append('photo', photo);

  const response = await api.post<{ data: IncidentPhoto }>(
    `/incidents/${id}/photos`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data.data;
};

export const deleteIncidentPhoto = async (
  incidentId: string,
  photoId: string,
): Promise<void> => {
  await api.delete(
    `/incidents/${incidentId}/photos/${photoId}`,
  );
};

export const getIncidentPhotoFile = async (
  url: string,
): Promise<Blob> => {
  const response = await api.get<Blob>(url, {
    responseType: 'blob',
  });

  return response.data;
};

export interface IncidentStatusHistory {
  id: string;

  from_status: string;
  to_status: string;
  notes: string | null;

  changed_by: {
    id: number;
    name: string;
  };

  photos: IncidentPhoto[];

  created_at: string;
}

interface IncidentHistoryResponse {
  data: IncidentStatusHistory[];
}

export const getIncidentHistory = async (
  id: string,
): Promise<IncidentStatusHistory[]> => {
  const response = await api.get<IncidentHistoryResponse>(
    `/incidents/${id}/history`,
  );

  return response.data.data;
};