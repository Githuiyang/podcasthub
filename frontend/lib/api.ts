import axios from 'axios'
import type {
  Studio, StudioListItem,
  Editor, EditorListItem,
  BusinessContact, BusinessListItem,
  PaginatedResponse,
  CityWithCount,
} from './types'

function normalizeApiBase(value?: string) {
  return value?.trim().replace(/\/+$/, '') ?? ''
}

export const API_BASE = normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE)

export const api = axios.create({
  baseURL: API_BASE || undefined,
})

// ==================== 录音间 ====================

export const studiosApi = {
  list: (params?: { city?: string; tag?: string; search?: string; page?: number; size?: number }) =>
    api.get<PaginatedResponse<StudioListItem>>('/api/studios/list', { params }),

  cities: () =>
    api.get<CityWithCount[]>('/api/studios/cities'),

  detail: (id: number) =>
    api.get<Studio>(`/api/studios/detail/${id}`),

  create: (data: Partial<Studio>) =>
    api.post<Studio>('/api/studios/create', data),

  update: (id: number, data: Partial<Studio>) =>
    api.put<Studio>(`/api/studios/update/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/studios/delete/${id}`),

  upload: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<Studio>(`/api/studios/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadQr: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ url: string }>(`/api/studios/${id}/upload-qr`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ==================== 剪辑师 ====================

export const editorsApi = {
  list: (params?: { skill?: string; tag?: string; search?: string; page?: number; size?: number }) =>
    api.get<PaginatedResponse<EditorListItem>>('/api/editors/list', { params }),

  detail: (id: number) =>
    api.get<Editor>(`/api/editors/detail/${id}`),

  create: (data: Partial<Editor>) =>
    api.post<Editor>('/api/editors/create', data),

  update: (id: number, data: Partial<Editor>) =>
    api.put<Editor>(`/api/editors/update/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/editors/delete/${id}`),
}

// ==================== 商务 ====================

export const reviewsApi = {
  create: (data: { studio_id: number; rating?: number; content: string; nickname?: string }) =>
    api.post('/api/reviews', data),

  list: (studioId: number) =>
    api.get(`/api/reviews/studio/${studioId}`),

  count: (studioId: number) =>
    api.get<{ studio_id: number; count: number }>(`/api/reviews/studio/${studioId}/count`),

  counts: () =>
    api.get<Record<string, number>>('/api/reviews/counts'),
}

export const changeRequestsApi = {
  list: (params?: { status?: string; page?: number; size?: number }) =>
    api.get('/api/change-requests/list', { params }),

  detail: (id: number) =>
    api.get(`/api/change-requests/detail/${id}`),

  create: (data: { studio_id?: number; request_type: string; source?: string; applicant_name?: string; applicant_note?: string; proposed_data: Record<string, unknown> }) =>
    api.post('/api/change-requests/create', data),

  approve: (id: number, data?: { review_note?: string }) =>
    api.put(`/api/change-requests/approve/${id}`, data || {}),

  reject: (id: number, data?: { review_note?: string }) =>
    api.put(`/api/change-requests/reject/${id}`, data || {}),

  apply: (id: number) =>
    api.put(`/api/change-requests/apply/${id}`),

  diff: (id: number) =>
    api.get(`/api/change-requests/diff/${id}`),
}

// ==================== 飞书同步 ====================

export const feishuSyncApi = {
  records: () =>
    api.get<{ count: number; records: Record<string, string>[] }>('/api/feishu-sync/records'),

  compare: () =>
    api.get<{
      feishu_count: number
      online_count: number
      to_create: Record<string, string>[]
      to_update: { id: number; name: string; changes: Record<string, { before: string; after: string }> }[]
      to_delete: { id: number; name: string }[]
      summary: { create: number; update: number; delete: number; unchanged: number }
    }>('/api/feishu-sync/compare'),

  apply: (actions: { action: string; studio_id?: number; data?: Record<string, unknown> }[]) =>
    api.post('/api/feishu-sync/apply', { actions }),
}

export const businessApi = {
  list: (params?: { business_type?: string; industry?: string; search?: string; page?: number; size?: number }) =>
    api.get<PaginatedResponse<BusinessListItem>>('/api/business/list', { params }),

  detail: (id: number) =>
    api.get<BusinessContact>(`/api/business/detail/${id}`),

  create: (data: Partial<BusinessContact>) =>
    api.post<BusinessContact>('/api/business/create', data),

  update: (id: number, data: Partial<BusinessContact>) =>
    api.put<BusinessContact>(`/api/business/update/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/business/delete/${id}`),
}
