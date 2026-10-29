import api from '../lib/api';

export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  current_page: number;
  data: ManagedUser[];
  first_page_url: string;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  per_page: number;
  total: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  profile_photo?: File | null;
}

export interface UpdateUserData {
  name: string;
  email: string;
  password?: string;
  role: string;
  profile_photo?: File | null;
}

export const getUsers = async (
  search = '',
  role = '',
  page = 1,
): Promise<UserListResponse> => {
  const response = await api.get<UserListResponse>('/users', {
    params: {
      ...(search ? { search } : {}),
      ...(role ? { role } : {}),
      page,
    },
  });

  return response.data;
};

export const getUser = async (
  id: number,
): Promise<ManagedUser> => {
  const response = await api.get<{ data: ManagedUser }>(
    `/users/${id}`,
  );

  return response.data.data;
};

export const createUser = async (
  data: CreateUserData,
): Promise<ManagedUser> => {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('role', data.role);

  if (data.profile_photo) {
    formData.append(
      'profile_photo',
      data.profile_photo,
    );
  }

  const response = await api.post<{ data: ManagedUser }>(
    '/users',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data.data;
};

export const updateUser = async (
  id: number,
  data: UpdateUserData,
): Promise<ManagedUser> => {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('role', data.role);

  if (data.password) {
    formData.append('password', data.password);
  }

  if (data.profile_photo) {
    formData.append(
      'profile_photo',
      data.profile_photo,
    );
  }

  formData.append('_method', 'PUT');

  const response = await api.post<{ data: ManagedUser }>(
    `/users/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data.data;
};

export const deleteUser = async (
  id: number,
): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const getUserPhotoUrl = (
  user: ManagedUser,
): string | null => {
  if (!user.profile_photo_url) {
    return null;
  }

  const baseUrl = 'http://127.0.0.1:8000/api';

  return `${baseUrl}${user.profile_photo_url}`;
};

export const getUserPhotoBlob = async (
  user: ManagedUser,
): Promise<Blob | null> => {
  if (!user.profile_photo_url) {
    return null;
  }

  const response = await api.get<Blob>(
    user.profile_photo_url,
    {
      responseType: 'blob',
    },
  );

  return response.data;
};

export const getTaskAssignees = async (): Promise<ManagedUser[]> => {
  const response = await api.get<{ data: ManagedUser[] }>(
    '/task-assignees',
  );

  return response.data.data;
};