import { request } from './request'
import type { Studio, StudioListItem, PaginatedResponse } from '../types'

export async function getCities(): Promise<string[]> {
  return request<string[]>('/api/studios/cities')
}

export async function getStudios(params?: {
  city?: string
  search?: string
  page?: number
  size?: number
}): Promise<PaginatedResponse<StudioListItem>> {
  return request<PaginatedResponse<StudioListItem>>('/api/studios/list', {
    params: {
      city: params?.city || '',
      search: params?.search || '',
      page: params?.page || 1,
      size: params?.size || 10,
    },
  })
}

export async function getStudioDetail(id: number): Promise<Studio> {
  return request<Studio>(`/api/studios/detail/${id}`)
}
