import useSWR from 'swr'
import { api } from './api'
import type {
  Studio, StudioListItem,
  Editor, EditorListItem,
  BusinessContact, BusinessListItem,
  PaginatedResponse,
  CityWithCount,
} from './types'

// 通用 fetcher
const fetcher = <T>(url: string) => api.get<T>(url).then(r => r.data)

// SWR key 工厂
export const keys = {
  studiosList: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams()
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') query.set(k, String(v))
      }
    }
    const qs = query.toString()
    return `/api/studios/list${qs ? `?${qs}` : ''}`
  },
  studioDetail: (id: number) => `/api/studios/detail/${id}`,
  cities: '/api/studios/cities',
  editorsList: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams()
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') query.set(k, String(v))
      }
    }
    const qs = query.toString()
    return `/api/editors/list${qs ? `?${qs}` : ''}`
  },
  editorDetail: (id: number) => `/api/editors/detail/${id}`,
  businessList: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams()
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') query.set(k, String(v))
      }
    }
    const qs = query.toString()
    return `/api/business/list${qs ? `?${qs}` : ''}`
  },
  reviews: (studioId: number) => `/api/reviews/studio/${studioId}`,
}

// SWR Hooks
export function useCities() {
  return useSWR<CityWithCount[]>(keys.cities, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })
}

export function useStudiosList(params?: { city?: string; search?: string; page?: number; size?: number }) {
  return useSWR<PaginatedResponse<StudioListItem>>(
    keys.studiosList(params as Record<string, string | number | undefined>),
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  )
}

export function useStudioDetail(id: number | null) {
  return useSWR<Studio>(id ? keys.studioDetail(id) : null, fetcher, {
    revalidateOnFocus: false,
  })
}

export function useEditorsList(params?: { search?: string; page?: number; size?: number }) {
  return useSWR<PaginatedResponse<EditorListItem>>(
    keys.editorsList(params as Record<string, string | number | undefined>),
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  )
}

export function useBusinessList(params?: { search?: string; page?: number; size?: number }) {
  return useSWR<PaginatedResponse<BusinessListItem>>(
    keys.businessList(params as Record<string, string | number | undefined>),
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  )
}
