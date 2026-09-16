import api from '../lib/api';

export interface IncidentCategory {
  id: string;
  name: string;
}

interface IncidentCategoriesResponse {
  data: IncidentCategory[];
}

export const getIncidentCategories = async (): Promise<IncidentCategory[]> => {
  const response = await api.get<IncidentCategoriesResponse>(
    '/incident-categories'
  );

  return response.data.data;
};
