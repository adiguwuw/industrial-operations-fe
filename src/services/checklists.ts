import api from '../lib/api';

export interface ChecklistItem {
  id: number;
  checklist_id: number;
  question: string;
  sort_order: number;
  is_required: boolean;
}

export interface Checklist {
  id: number;
  name: string;
  description: string | null;
  items?: ChecklistItem[];
}

export interface ChecklistsResponse {
  data: Checklist[];
}

export interface ChecklistResponse {
  message?: string;
  data: Checklist;
}

export interface ChecklistItemResponse {
  message?: string;
  data: ChecklistItem;
}

export interface CreateChecklistPayload {
  name: string;
  description?: string;
}

export interface CreateChecklistItemPayload {
  question: string;
  sort_order: number;
  is_required: boolean;
}

export const getChecklists = async (): Promise<ChecklistsResponse> => {
  const response = await api.get<ChecklistsResponse>(
    '/checklists',
  );

  return response.data;
};

export const createChecklist = async (
  payload: CreateChecklistPayload,
): Promise<ChecklistResponse> => {
  const response = await api.post<ChecklistResponse>(
    '/checklists',
    payload,
  );

  return response.data;
};

export const createChecklistItem = async (
  checklistId: number,
  payload: CreateChecklistItemPayload,
): Promise<ChecklistItemResponse> => {
  const response = await api.post<ChecklistItemResponse>(
    `/checklists/${checklistId}/items`,
    payload,
  );

  return response.data;
};  