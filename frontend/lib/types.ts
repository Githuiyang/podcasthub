// TypeScript 类型定义

export interface Studio {
  id: number
  name: string
  cover_image: string | null
  description: string | null
  city: string | null
  district: string | null
  address: string | null
  equipment: string[] | null
  room_count: number
  room_features: string[] | null
  price_per_hour: number | null
  price_per_day: number | null
  price_note: string | null
  booking_url: string | null
  booking_note: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_wechat: string | null
  portfolio_images: string[] | null
  portfolio_links: string[] | null
  tags: string[] | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export interface StudioListItem {
  id: number
  name: string
  cover_image: string | null
  city: string | null
  district: string | null
  address: string | null
  longitude: number | null
  latitude: number | null
  price_per_hour: number | null
  price_per_day: number | null
  tags: string[] | null
  is_active: boolean
}

export interface Editor {
  id: number
  name: string
  avatar: string | null
  bio: string | null
  skills: string[] | null
  software: string[] | null
  experience_years: number
  specialties: string[] | null
  price_per_episode: number | null
  price_per_hour: number | null
  price_note: string | null
  contact_phone: string | null
  contact_wechat: string | null
  contact_email: string | null
  portfolio_url: string | null
  portfolio_images: string[] | null
  portfolio_links: string[] | null
  tags: string[] | null
  rating: number
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export interface EditorListItem {
  id: number
  name: string
  avatar: string | null
  skills: string[] | null
  experience_years: number
  price_per_episode: number | null
  tags: string[] | null
  is_active: boolean
}

export interface BusinessContact {
  id: number
  name: string
  avatar: string | null
  company: string | null
  title: string | null
  bio: string | null
  business_type: string | null
  industry: string | null
  budget_range: string | null
  cooperation_types: string[] | null
  contact_phone: string | null
  contact_wechat: string | null
  contact_email: string | null
  case_images: string[] | null
  case_links: string[] | null
  reference_podcasts: string[] | null
  tags: string[] | null
  rating: number
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export interface BusinessListItem {
  id: number
  name: string
  avatar: string | null
  company: string | null
  business_type: string | null
  budget_range: string | null
  cooperation_types: string[] | null
  tags: string[] | null
  is_active: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}
