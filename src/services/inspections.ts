import api from '../lib/api';

export type InspectionStatus = string;

export type InspectionItemResult =
  | 'PASS'
  | 'FAIL'
  | 'N/A'
  | null;

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

export interface SafetyInspectionItem {
  id: number;
  safety_inspection_id: number;
  checklist_item_id: number;
  question: string;
  sort_order: number;
  is_required: boolean;
  result: InspectionItemResult;
}

export interface SafetyInspection {
  id: number;
  checklist_id: number;
  location: string;
  inspection_date: string;
  status: InspectionStatus;
  image_path?: string | null;
  checklist?: Checklist;
  items?: SafetyInspectionItem[];
}

export interface InspectionsResponse {
  data: SafetyInspection[];
}

export interface InspectionResponse {
  data: SafetyInspection;
}

export interface InspectionItemResponse {
  message: string;
  data: SafetyInspectionItem;
}

export interface Finding {
  id: number;
  safety_inspection_id: number;
  safety_inspection_item_id: number;
  description: string;
  photo_path?: string | null;
}

export interface FindingResponse {
  message: string;
  data: Finding;
}

export interface CreateInspectionPayload {
  checklist_id: number;
  location: string;
  inspection_date: string;
  image?: File;
}

export const getChecklists = async (): Promise<ChecklistsResponse> => {
  const response = await api.get<ChecklistsResponse>(
    '/checklists',
  );

  return response.data;
};

export const getInspections = async (): Promise<InspectionsResponse> => {
  const response = await api.get<InspectionsResponse>(
    '/inspections',
  );

  return response.data;
};

export const getInspection = async (
  id: number,
): Promise<InspectionResponse> => {
  const response = await api.get<InspectionResponse>(
    `/inspections/${id}`,
  );

  return response.data;
};

export const createInspection = async (
  payload: CreateInspectionPayload,
): Promise<InspectionResponse> => {
  const formData = new FormData();

  formData.append(
    'checklist_id',
    String(payload.checklist_id),
  );

  formData.append(
    'location',
    payload.location,
  );

  formData.append(
    'inspection_date',
    payload.inspection_date,
  );

  if (payload.image) {
    formData.append('image', payload.image);
  }

  const response = await api.post<InspectionResponse>(
    '/inspections',
    formData,
  );

  return response.data;
};

export const updateInspectionItemResult = async (
  inspectionId: number,
  itemId: number,
  result: Exclude<InspectionItemResult, null>,
): Promise<InspectionItemResponse> => {
  const response = await api.patch<InspectionItemResponse>(
    `/inspections/${inspectionId}/items/${itemId}`,
    { result },
  );

  return response.data;
};

export const createFinding = async (
  inspectionId: number,
  itemId: number,
  description: string,
  photo?: File | null,
): Promise<FindingResponse> => {
  const formData = new FormData();

  formData.append('description', description);

  if (photo) {
    formData.append('photo', photo);
  }

  const response = await api.post<FindingResponse>(
    `/inspections/${inspectionId}/items/${itemId}/findings`,
    formData,
  );

  return response.data;
};