import type { Studio } from './types'

export interface StudioFormState {
  name: string
  address: string
  description: string
  open_hours: string
  equipment: string
  capacity: string | number
  need_own_equipment_for_video: string
  charging_method: string
  price_per_hour: string | number
  price_per_day: string | number
  price_note: string
  booking_url: string
  booking_note: string
  booking_qr_image: string
  contact_name: string
  contact_info: string
  cover_image: string
  tags: string
}

function listToInput(value?: string[] | null) {
  return value?.join(', ') || ''
}

function inputToList(value: string) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

export function createEmptyStudioForm(): StudioFormState {
  return {
    name: '',
    address: '',
    description: '',
    open_hours: '',
    equipment: '',
    capacity: '',
    need_own_equipment_for_video: '',
    charging_method: '',
    price_per_hour: '',
    price_per_day: '',
    price_note: '',
    booking_url: '',
    booking_note: '',
    booking_qr_image: '',
    contact_name: '',
    contact_info: '',
    cover_image: '',
    tags: '',
  }
}

export function studioToForm(studio: Studio): StudioFormState {
  return {
    name: studio.name || '',
    address: studio.address || '',
    description: studio.description || '',
    open_hours: studio.open_hours || '',
    equipment: listToInput(studio.equipment),
    capacity: studio.capacity ?? '',
    need_own_equipment_for_video: studio.need_own_equipment_for_video === null ? '' : studio.need_own_equipment_for_video ? 'yes' : 'no',
    charging_method: studio.charging_method || '',
    price_per_hour: studio.price_per_hour ?? '',
    price_per_day: studio.price_per_day ?? '',
    price_note: studio.price_note || '',
    booking_url: studio.booking_url || '',
    booking_note: studio.booking_note || '',
    booking_qr_image: studio.booking_qr_image || '',
    contact_name: studio.contact_name || '',
    contact_info: studio.contact_info || '',
    cover_image: studio.cover_image || '',
    tags: listToInput(studio.tags),
  }
}

export function serializeStudioForm(form: StudioFormState): Partial<Studio> {
  return {
    name: form.name.trim() || undefined,
    address: form.address.trim() || undefined,
    description: form.description.trim() || undefined,
    open_hours: form.open_hours.trim() || undefined,
    equipment: form.equipment ? inputToList(form.equipment) : undefined,
    capacity: form.capacity ? Number(form.capacity) : undefined,
    need_own_equipment_for_video: form.need_own_equipment_for_video === '' ? undefined : form.need_own_equipment_for_video === 'yes',
    charging_method: form.charging_method.trim() || undefined,
    price_per_hour: form.charging_method === '按小时收费' && form.price_per_hour ? Number(form.price_per_hour) : undefined,
    price_per_day: form.charging_method === '按天收费' && form.price_per_day ? Number(form.price_per_day) : undefined,
    price_note: form.price_note.trim() || undefined,
    booking_url: form.booking_url.trim() || undefined,
    booking_note: form.booking_note.trim() || undefined,
    booking_qr_image: form.booking_qr_image.trim() || undefined,
    contact_name: form.contact_name.trim() || undefined,
    contact_info: form.contact_info.trim() || undefined,
    cover_image: form.cover_image.trim() || undefined,
    tags: form.tags ? inputToList(form.tags) : undefined,
  }
}
