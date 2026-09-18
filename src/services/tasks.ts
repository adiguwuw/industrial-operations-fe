import api from '../lib/api';

export interface Task {
  id: number;
  capa_id: number;
  title: string;
  description: string | null;
  assigned_to: number;
  due_date: string;
  status: 'open' | 'in_progress' | 'completed';
}

export interface TasksResponse {
  data: Task[];
}

export const getTasks = async (): Promise<TasksResponse> => {
  const response = await api.get<TasksResponse>('/tasks');

  return response.data;
};

export const getTask = async (id: number): Promise<{ data: Task }> => {
  const response = await api.get<{ data: Task }>(`/tasks/${id}`);

  return response.data;
};

export const updateTaskStatus = async (
  id: number,
  status: Task['status'],
): Promise<{ data: Task }> => {
  const response = await api.patch<{ data: Task }>(
    `/tasks/${id}/status`,
    { status },
  );

  return response.data;
};