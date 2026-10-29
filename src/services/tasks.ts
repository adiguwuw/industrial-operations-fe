import api from '../lib/api';

export type TaskSourceType =
  | 'direct'
  | 'capa'
  | 'incident'
  | 'inspection'
  | 'maintenance'
  | 'hr';

export type TaskStatus =
  | 'open'
  | 'in_progress'
  | 'pending_review'
  | 'validated'
  | 'completed';

export interface TaskUser {
  id: number;
  name: string;
  email: string;
}

export interface TaskCapa {
  id: number;
  finding_id: number;
  action: string;
  status: string;
}

export interface Task {
  id: number;
  capa_id: number | null;
  source_type: TaskSourceType;
  source_id: number | null;
  title: string;
  description: string | null;
  assigned_to: number;
  assigned_by?: number;
  due_date: string;
  status: TaskStatus;
  task_photo_path?: string | null;
  evidence_photo_path: string | null;
  before_photo_path?: string | null;
  after_photo_path?: string | null;
  completion_notes?: string | null;
  started_at?: string | null;
  submitted_at?: string | null;
  validated_by?: number | null;
  validated_at?: string | null;
  validation_notes?: string | null;
  assigned_user?: TaskUser;
  assignedUser?: TaskUser;
  capa?: TaskCapa | null;
  created_at?: string;
  updated_at?: string;
}

interface TasksResponse {
  data: Task[];
}

interface TaskResponse {
  data: Task;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assigned_to: number;
  due_date: string;
}

export interface CreateDirectTaskPayload extends CreateTaskPayload {
  task_photo?: File;
}

export interface SubmitTaskPayload {
  before_photo: File;
  after_photo: File;
  completion_notes: string;
}

export type TaskReviewDecision = 'validate' | 'revise';

export interface ReviewTaskPayload {
  decision: TaskReviewDecision;
  validation_notes: string;
}

export interface CreateTaskResponse {
  message: string;
  data: Task;
}

export async function getTasks(): Promise<Task[]> {
  const response = await api.get<TasksResponse>('/tasks');

  return response.data.data;
}

export async function getTask(id: number): Promise<Task> {
  const response = await api.get<TaskResponse>(`/tasks/${id}`);

  return response.data.data;
}

export async function updateTaskStatus(
  id: number,
  status: TaskStatus,
): Promise<Task> {
  const response = await api.patch<TaskResponse>(
    `/tasks/${id}/status`,
    { status },
  );

  return response.data.data;
}

export async function createDirectTask(
  payload: CreateDirectTaskPayload,
): Promise<Task> {
  const formData = new FormData();

  formData.append('title', payload.title);
  formData.append('assigned_to', String(payload.assigned_to));
  formData.append('due_date', payload.due_date);

  if (payload.description) {
    formData.append('description', payload.description);
  }

  if (payload.task_photo) {
    formData.append('task_photo', payload.task_photo);
  }

  const response = await api.post<CreateTaskResponse>(
    '/tasks',
    formData,
  );

  return response.data.data;
}

export async function createCapaTask(
  capaId: number,
  payload: CreateTaskPayload,
): Promise<Task> {
  const response = await api.post<CreateTaskResponse>(
    `/capas/${capaId}/tasks`,
    payload,
  );

  return response.data.data;
}

export async function submitTask(
  id: number,
  payload: SubmitTaskPayload,
): Promise<Task> {
  const formData = new FormData();

  formData.append('before_photo', payload.before_photo);
  formData.append('after_photo', payload.after_photo);
  formData.append('completion_notes', payload.completion_notes);

  const response = await api.post<TaskResponse>(
    `/tasks/${id}/submit`,
    formData,
  );

  return response.data.data;
}

export async function reviewTask(
  id: number,
  payload: ReviewTaskPayload,
): Promise<Task> {
  const response = await api.patch<TaskResponse>(
    `/tasks/${id}/review`,
    payload,
  );

  return response.data.data;
}

export async function createTask(
  capaId: number,
  payload: CreateTaskPayload,
): Promise<Task> {
  return createCapaTask(capaId, payload);
}
