import api from '../lib/api';

export interface DashboardData {
  incidents: {
    total: number;
    status: {
      pending: number;
      investigating: number;
      resolved: number;
    };
    severity: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  };

  categories: {
    category_id: string;
    category: string;
    total: number;
  }[];

  trend: {
    period: string;
    items: {
      period: string;
      total: number;
    }[];
  };
}

export const getDashboard = async (): Promise<DashboardData> => {
  const response = await api.get<{ data: DashboardData }>('/dashboard');

  return response.data.data;
};