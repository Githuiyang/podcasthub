import type { Studio } from './types'

type StudioLike = Pick<
  Studio,
  | 'address'
  | 'city'
  | 'district'
  | 'description'
  | 'open_hours'
  | 'price_note'
  | 'charging_method'
  | 'price_per_hour'
  | 'price_per_day'
  | 'booking_url'
  | 'booking_note'
  | 'booking_qr_image'
  | 'contact_name'
  | 'contact_phone'
  | 'contact_wechat'
  | 'contact_info'
  | 'capacity'
  | 'need_own_equipment_for_video'
>

interface StudioContact {
  name: string | null
  info: string | null
}

function trimText(value?: string | null) {
  const text = value?.trim()
  return text ? text : null
}

function normalizeComma(value: string) {
  return value.replace(/[；;]/g, '，')
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function getStudioOpenHours(studio: Pick<StudioLike, 'description' | 'open_hours'>) {
  // 优先读独立字段
  const fromField = trimText(studio.open_hours)
  if (fromField) return fromField

  // 兼容旧数据：从 description 中解析
  const description = trimText(studio.description)
  if (!description) return null
  const match = description.match(/开放时间[:：]\s*([^\n]+)/)
  return trimText(match?.[1])
}

export function getStudioDisplayAddress(studio: Pick<StudioLike, 'address'>) {
  return trimText(studio.address)
}

export function getStudioDescriptionBody(studio: Pick<StudioLike, 'description' | 'open_hours'>) {
  const description = trimText(studio.description)
  if (!description) return null

  // 只有旧数据（open_hours 为空）才需要从 description 中剥离开放时间行
  const hasExplicitOpenHours = trimText(studio.open_hours)
  let cleaned = description
  if (!hasExplicitOpenHours) {
    cleaned = cleaned.replace(/(^|\n)\s*开放时间[:：]\s*[^\n]+/g, '$1')
  }
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim()

  return cleaned || null
}

function getBookingPriceHint(note: string) {
  const normalized = normalizeComma(note)
    .replace(/^(免费|收费)\s*[，,、]?\s*/, '')
    .trim()

  const firstSegment = normalized.split('，')[0]?.trim()
  if (!firstSegment) return null
  if (!/[0-9¥￥rRhHdD时天]/.test(firstSegment)) return null
  return firstSegment
}

export function getStudioContact(studio: Pick<StudioLike, 'contact_name' | 'contact_info'>): StudioContact {
  return {
    name: trimText(studio.contact_name),
    info: trimText(studio.contact_info),
  }
}

export function getStudioContactSummary(studio: Pick<StudioLike, 'contact_name' | 'contact_info'>) {
  const contact = getStudioContact(studio)
  const parts = [contact.name, contact.info].filter(Boolean)
  return parts.length > 0 ? parts.join(' / ') : null
}

export function getStudioPriceSupplement(studio: Pick<StudioLike, 'price_note' | 'booking_note' | 'charging_method' | 'price_per_hour' | 'price_per_day'>) {
  const priceNote = trimText(studio.price_note)
  if (priceNote && !['免费', '收费'].includes(priceNote)) {
    return priceNote
  }

  if (studio.price_per_hour || studio.price_per_day) {
    return null
  }

  const bookingNote = trimText(studio.booking_note)
  if (!bookingNote) return null

  const hint = getBookingPriceHint(bookingNote)
  if (!hint) return null
  if (studio.charging_method && hint.includes(studio.charging_method)) return null
  return hint
}

export function getStudioBookingSummary(studio: Pick<StudioLike, 'booking_note' | 'charging_method' | 'price_note'>) {
  const bookingNote = trimText(studio.booking_note)
  if (!bookingNote) return null

  let cleaned = normalizeComma(bookingNote)

  const leadingTokens = [
    trimText(studio.charging_method),
    trimText(studio.price_note),
    getBookingPriceHint(cleaned),
  ].filter(Boolean) as string[]

  for (const token of leadingTokens) {
    cleaned = cleaned.replace(new RegExp(`^${escapeRegExp(token)}\\s*[，,、]?\\s*`), '')
  }

  cleaned = cleaned.replace(/^[，,、\s]+|[，,、\s]+$/g, '').trim()
  return cleaned || null
}

/**
 * 统一价格主文案 —— 首页详情弹窗和独立详情页共用
 *
 * 规则：
 * - 有明确小时/天价格 → "¥80/时" / "¥300/天"
 * - 无明确价格但有 charging_method → 直接显示 charging_method（如"免费"、"咨询后报价"）
 * - 都没有 → "价格详询"
 */
export function getStudioPriceText(studio: Pick<StudioLike, 'price_per_hour' | 'price_per_day' | 'charging_method'>) {
  if (studio.price_per_hour) return `¥${studio.price_per_hour}/时`
  if (studio.price_per_day) return `¥${studio.price_per_day}/天`
  return studio.charging_method || '价格详询'
}

/**
 * 是否应该把 charging_method 作为次级补充显示
 *
 * 只有"有明确价格 + 有 charging_method"时才补充一次
 * 其他情况下 charging_method 已经是主文案，不需要再重复
 */
export function shouldShowChargingMethodAsSupplement(studio: Pick<StudioLike, 'price_per_hour' | 'price_per_day' | 'charging_method'>) {
  const hasExplicitPrice = studio.price_per_hour != null || studio.price_per_day != null
  return hasExplicitPrice && Boolean(studio.charging_method)
}

export function getStudioCapacityText(studio: Pick<StudioLike, 'capacity'>) {
  if (studio.capacity) return `容纳 ${studio.capacity} 人`
  return null
}

export function getStudioVideoEquipmentText(studio: Pick<StudioLike, 'need_own_equipment_for_video'>) {
  if (studio.need_own_equipment_for_video === true) return '拍视频需自带设备'
  if (studio.need_own_equipment_for_video === false) return '拍视频无需自带设备'
  return null
}
