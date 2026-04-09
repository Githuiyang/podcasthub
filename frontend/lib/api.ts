import axios from 'axios'
import type {
  Studio, StudioListItem,
  Editor, EditorListItem,
  BusinessContact, BusinessListItem,
  PaginatedResponse,
} from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

const api = axios.create({ baseURL: API_BASE })

// ==================== 录音间 ====================

export const studiosApi = {
  list: (params?: { city?: string; tag?: string; search?: string; page?: number; size?: number }) =>
    api.get<PaginatedResponse<StudioListItem>>('/api/studios/list', { params }),

  cities: () =>
    api.get<string[]>('/api/studios/cities'),

  detail: (id: number) =>
    api.get<Studio>(`/api/studios/detail/${id}`),

  create: (data: Partial<Studio>) =>
    api.post<Studio>('/api/studios/create', data),

  update: (id: number, data: Partial<Studio>) =>
    api.put<Studio>(`/api/studios/update/${id}`, data),

  delete: (id: number) =>
    api.delete(`/api/studios/delete/${id}`),
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
