import api from '../lib/api';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface RiskAssessment {
  id: number;
  finding_id: number;
  hazard: string;
  likelihood: number;
  severity: number;
  risk_level: RiskLevel;
  existing_controls: string | null;
  assessment_date: string;
  created_at?: string;
  updated_at?: string;
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