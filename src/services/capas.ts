import api from '../lib/api';

export type CapaType = 'corrective' | 'preventive';

export type CapaStatus =
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'verified';

export interface Capa {
  id: number;
  finding_id: number;
  type: CapaType;
  action: string;
  responsible_user_id: number;
  due_date: string;
  status: CapaStatus;
  verified_by?: number | null;
  verified_at?: string | null;
  verification_notes?: string | null;
}

export interface CreateCapaPayload {
  type: CapaType;
  action: string;
  responsible_user_id: number;
  due_date: string;
}

export interface CapaResponse {
  message: string;
  data: Capa;
}

export const createCapa = async (
  findingId: number,
  payload: CreateCapaPayload,
): Promise<CapaResponse> => {
  const response = await api.post<CapaResponse>(
    `/findings/${findingId}/capas`,
    payload,
  );

  return response.data;
};