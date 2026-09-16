import api from '../lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  profile_photo_url: string | null;
}

interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/login', {
    email,
    password,
  });

  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{ user: User }>('/user');

  return response.data.user;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};