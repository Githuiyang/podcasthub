import { request } from './request'
import type { EditorListItem, Editor, BusinessListItem, Business, PaginatedResponse } from '../types'

// === Editor (剪辑师) ===

export async function getEditors(params?: {
  skill?: string
  tag?: string
  search?: string
  page?: number
  size?: number
}): Promise<PaginatedResponse<EditorListItem>> {
  return request<PaginatedResponse<EditorListItem>>('/api/editors/list', {
    params: {
      skill: params?.skill || '',
      tag: params?.tag || '',
      search: params?.search || '',
      page: params?.page || 1,
      size: params?.size || 20,
    },
  })
}

export async function getEditorDetail(id: number): Promise<Editor> {
  return request<Editor>(`/api/editors/detail/${id}`)
}

// === Business (商务/制作人) ===

export async function getBusinessList(params?: {
  business_type?: string
  industry?: string
  search?: string
  page?: number
  size?: number
}): Promise<PaginatedResponse<BusinessListItem>> {
  return request<PaginatedResponse<BusinessListItem>>('/api/business/list', {
    params: {
      business_type: params?.business_type || '',
      industry: params?.industry || '',
      search: params?.search || '',
      page: params?.page || 1,
      size: params?.size || 20,
    },
  })
}

export async function getBusinessDetail(id: number): Promise<Business> {
  return request<Business>(`/api/business/detail/${id}`)
}
