import api from '../lib/api';

export type RiskLevel =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'EXTREME';

export interface Finding {
  id: number;
  safety_inspection_id: number;
  safety_inspection_item_id: number;
  description: string;
  photo_path: string | null;
}

export interface RiskAssessment {
  id: number;
  finding_id: number;
  hazard: string;
  likelihood: number;
  severity: number;
  risk_level: RiskLevel;
  existing_controls: string | null;
  assessment_date: string;
}

export interface CreateRiskAssessmentPayload {
  hazard: string;
  likelihood: number;
  severity: number;
  risk_level: RiskLevel;
  existing_controls?: string;
  assessment_date: string;
}

export interface RiskAssessmentResponse {
  message: string;
  data: RiskAssessment;
}

export interface Capa {
  id: number;
  finding_id: number;
  type: 'corrective' | 'preventive';
  action: string;
  responsible_user_id: number;
  due_date: string;
  status: 'open' | 'in_progress' | 'completed' | 'verified';
}

export interface CapaResponse {
  message: string;
  data: Capa;
}

export const createRiskAssessment = async (
  findingId: number,
  payload: CreateRiskAssessmentPayload,
): Promise<RiskAssessmentResponse> => {
  const response = await api.post<RiskAssessmentResponse>(
    `/findings/${findingId}/risk-assessments`,
    payload,
  );

  return response.data;
};

export const createCapa = async (
  findingId: number,
  payload: {
    type: 'corrective' | 'preventive';
    action: string;
    responsible_user_id: number;
    due_date: string;
  },
): Promise<CapaResponse> => {
  const response = await api.post<CapaResponse>(
    `/findings/${findingId}/capas`,
    payload,
  );

  return response.data;
};