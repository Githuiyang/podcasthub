"""Pydantic 请求/响应模型"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ==================== 录音间 ====================

class StudioCreate(BaseModel):
    name: str
    cover_image: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    equipment: Optional[List[str]] = None
    room_count: int = 1
    room_features: Optional[List[str]] = None
    price_per_hour: Optional[int] = None
    price_per_day: Optional[int] = None
    price_note: Optional[str] = None
    booking_url: Optional[str] = None
    booking_note: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_wechat: Optional[str] = None
    portfolio_images: Optional[List[str]] = None
    portfolio_links: Optional[List[str]] = None
    tags: Optional[List[str]] = None


class StudioUpdate(BaseModel):
    name: Optional[str] = None
    cover_image: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    equipment: Optional[List[str]] = None
    room_count: Optional[int] = None
    room_features: Optional[List[str]] = None
    price_per_hour: Optional[int] = None
    price_per_day: Optional[int] = None
    price_note: Optional[str] = None
    booking_url: Optional[str] = None
    booking_note: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_wechat: Optional[str] = None
    portfolio_images: Optional[List[str]] = None
    portfolio_links: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None


class StudioResponse(BaseModel):
    id: int
    name: str
    cover_image: Optional[str]
    description: Optional[str]
    city: Optional[str]
    district: Optional[str]
    address: Optional[str]
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    equipment: Optional[List[str]]
    room_count: int
    room_features: Optional[List[str]]
    price_per_hour: Optional[int]
    price_per_day: Optional[int]
    price_note: Optional[str]
    booking_url: Optional[str]
    booking_note: Optional[str]
    contact_name: Optional[str]
    contact_phone: Optional[str]
    contact_wechat: Optional[str]
    portfolio_images: Optional[List[str]]
    portfolio_links: Optional[List[str]]
    tags: Optional[List[str]]
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StudioListItem(BaseModel):
    id: int
    name: str
    cover_image: Optional[str]
    city: Optional[str]
    district: Optional[str]
    address: Optional[str] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    price_per_hour: Optional[int]
    price_per_day: Optional[int]
    tags: Optional[List[str]]
    is_active: bool

    class Config:
        from_attributes = True


# ==================== 剪辑师 ====================

class EditorCreate(BaseModel):
    name: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    software: Optional[List[str]] = None
    experience_years: int = 0
    specialties: Optional[List[str]] = None
    price_per_episode: Optional[int] = None
    price_per_hour: Optional[int] = None
    price_note: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_wechat: Optional[str] = None
    contact_email: Optional[str] = None
    portfolio_url: Optional[str] = None
    portfolio_images: Optional[List[str]] = None
    portfolio_links: Optional[List[str]] = None
    tags: Optional[List[str]] = None


class EditorUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    software: Optional[List[str]] = None
    experience_years: Optional[int] = None
    specialties: Optional[List[str]] = None
    price_per_episode: Optional[int] = None
    price_per_hour: Optional[int] = None
    price_note: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_wechat: Optional[str] = None
    contact_email: Optional[str] = None
    portfolio_url: Optional[str] = None
    portfolio_images: Optional[List[str]] = None
    portfolio_links: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None


class EditorResponse(BaseModel):
    id: int
    name: str
    avatar: Optional[str]
    bio: Optional[str]
    skills: Optional[List[str]]
    software: Optional[List[str]]
    experience_years: int
    specialties: Optional[List[str]]
    price_per_episode: Optional[int]
    price_per_hour: Optional[int]
    price_note: Optional[str]
    contact_phone: Optional[str]
    contact_wechat: Optional[str]
    contact_email: Optional[str]
    portfolio_url: Optional[str]
    portfolio_images: Optional[List[str]]
    portfolio_links: Optional[List[str]]
    tags: Optional[List[str]]
    rating: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EditorListItem(BaseModel):
    id: int
    name: str
    avatar: Optional[str]
    skills: Optional[List[str]]
    experience_years: int
    price_per_episode: Optional[int]
    tags: Optional[List[str]]
    is_active: bool

    class Config:
        from_attributes = True


# ==================== 商务 ====================

class BusinessCreate(BaseModel):
    name: str
    avatar: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    budget_range: Optional[str] = None
    cooperation_types: Optional[List[str]] = None
    contact_phone: Optional[str] = None
    contact_wechat: Optional[str] = None
    contact_email: Optional[str] = None
    case_images: Optional[List[str]] = None
    case_links: Optional[List[str]] = None
    reference_podcasts: Optional[List[str]] = None
    tags: Optional[List[str]] = None


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    budget_range: Optional[str] = None
    cooperation_types: Optional[List[str]] = None
    contact_phone: Optional[str] = None
    contact_wechat: Optional[str] = None
    contact_email: Optional[str] = None
    case_images: Optional[List[str]] = None
    case_links: Optional[List[str]] = None
    reference_podcasts: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None


class BusinessResponse(BaseModel):
    id: int
    name: str
    avatar: Optional[str]
    company: Optional[str]
    title: Optional[str]
    bio: Optional[str]
    business_type: Optional[str]
    industry: Optional[str]
    budget_range: Optional[str]
    cooperation_types: Optional[List[str]]
    contact_phone: Optional[str]
    contact_wechat: Optional[str]
    contact_email: Optional[str]
    case_images: Optional[List[str]]
    case_links: Optional[List[str]]
    reference_podcasts: Optional[List[str]]
    tags: Optional[List[str]]
    rating: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BusinessListItem(BaseModel):
    id: int
    name: str
    avatar: Optional[str]
    company: Optional[str]
    business_type: Optional[str]
    budget_range: Optional[str]
    cooperation_types: Optional[List[str]]
    tags: Optional[List[str]]
    is_active: bool

    class Config:
        from_attributes = True


# ==================== 通用 ====================

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    size: int
