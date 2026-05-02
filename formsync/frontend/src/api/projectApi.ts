import { apiClient } from './schemaApi';
import { ExtractedUserStory } from './schemaApi';

export interface SrsProject {
  id: string;
  name: string;
  description?: string;
  userId: string;
  userStories: StoredUserStory[];
  _count?: { userStories: number };
  createdAt: string;
  updatedAt: string;
}

export interface StoredUserStory {
  id: string;
  title: string;
  role: string;
  action: string;
  benefit: string;
  acceptanceCriteria: string[];
  suggestedFields: any[];
  featureArea: string;
  confidence: number;
  status: 'draft' | 'generated';
  generatedSchemaId?: string;
  rawText: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const projectApi = {
  create: (token: string, data: { name: string; description?: string; userStories: Partial<ExtractedUserStory>[] }) =>
    apiClient.post<SrsProject>('/project', data, { headers: authHeaders(token) }),

  list: (token: string) =>
    apiClient.get<SrsProject[]>('/project', { headers: authHeaders(token) }),

  getOne: (token: string, id: string) =>
    apiClient.get<SrsProject>(`/project/${id}`, { headers: authHeaders(token) }),

  delete: (token: string, id: string) =>
    apiClient.delete(`/project/${id}`, { headers: authHeaders(token) }),

  updateStoryStatus: (token: string, projectId: string, storyId: string, status: 'draft' | 'generated', generatedSchemaId?: string) =>
    apiClient.patch<StoredUserStory>(
      `/project/${projectId}/stories/${storyId}/status`,
      { status, generatedSchemaId },
      { headers: authHeaders(token) },
    ),
};
