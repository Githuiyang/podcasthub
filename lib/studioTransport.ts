import type { Studio, StudioListItem } from './types'

// ---------------------------------------------------------------------------
// 城市交通枢纽注册表（按需启用）
//
// 设计原则：
// 1. 只有当前有录音棚的城市才注册枢纽数据
// 2. 没有录音棚的城市不会出现在此表中，不会生成任何枢纽数据
// 3. 新增城市时，只需在此表追加一条记录即可启用交通枢纽
// 4. 上海是参考模板，其他城市结构相同
// ---------------------------------------------------------------------------

export interface TransportHub {
  /** 完整名称（用于地图 hover 提示） */
  name: string
  /** 短名称（用于卡片展示） */
  shortName: string
  longitude: number
  latitude: number
}

const cityTransportHubs: Record<string, readonly TransportHub[]> = {
  '上海': [
    { name: '虹桥机场 / 虹桥火车站', shortName: '虹桥枢纽（机场/火车站）', longitude: 121.3274, latitude: 31.1979 },
    { name: '上海站', shortName: '上海站', longitude: 121.4626, latitude: 31.2533 },
    { name: '上海南站', shortName: '上海南站', longitude: 121.4296, latitude: 31.1547 },
    { name: '浦东机场', shortName: '浦东机场', longitude: 121.7998, latitude: 31.1518 },
  ],
  '北京': [
    { name: '首都国际机场', shortName: '首都国际机场', longitude: 116.5844, latitude: 40.0801 },
    { name: '北京南站', shortName: '北京南站', longitude: 116.3789, latitude: 39.8654 },
  ],
  '杭州': [
    { name: '萧山国际机场', shortName: '萧山国际机场', longitude: 120.4343, latitude: 30.2345 },
    { name: '杭州东站', shortName: '杭州东站', longitude: 120.2131, latitude: 30.2908 },
    { name: '杭州站', shortName: '杭州站', longitude: 120.1771, latitude: 30.2430 },
    { name: '杭州西站', shortName: '杭州西站', longitude: 120.0558, latitude: 30.2939 },
  ],
  '广州': [
    { name: '白云国际机场', shortName: '白云国际机场', longitude: 113.2989, latitude: 23.3925 },
    { name: '广州南站', shortName: '广州南站', longitude: 113.2244, latitude: 22.9924 },
    { name: '广州站', shortName: '广州站', longitude: 113.2565, latitude: 23.1497 },
    { name: '广州东站', shortName: '广州东站', longitude: 113.3295, latitude: 23.1454 },
  ],
  '成都': [
    { name: '双流国际机场', shortName: '双流国际机场', longitude: 103.9472, latitude: 30.5785 },
    { name: '成都东站', shortName: '成都东站', longitude: 104.1368, latitude: 30.6309 },
    { name: '成都南站', shortName: '成都南站', longitude: 104.0658, latitude: 30.6142 },
    { name: '成都站', shortName: '成都站', longitude: 104.0719, latitude: 30.6913 },
  ],
  '深圳': [
    { name: '宝安国际机场', shortName: '宝安国际机场', longitude: 113.8147, latitude: 22.6398 },
    { name: '深圳北站', shortName: '深圳北站', longitude: 114.0308, latitude: 22.6095 },
    { name: '深圳站', shortName: '深圳站', longitude: 114.1170, latitude: 22.5329 },
  ],
  '福州': [
    { name: '长乐国际机场', shortName: '长乐国际机场', longitude: 119.6633, latitude: 25.9351 },
    { name: '福州站', shortName: '福州站', longitude: 119.2844, latitude: 26.0829 },
    { name: '福州南站', shortName: '福州南站', longitude: 119.3684, latitude: 25.9823 },
  ],
  '天津': [
    { name: '滨海国际机场', shortName: '滨海国际机场', longitude: 117.3472, latitude: 39.1244 },
    { name: '天津站', shortName: '天津站', longitude: 117.2108, latitude: 39.1341 },
    { name: '天津西站', shortName: '天津西站', longitude: 117.1433, latitude: 39.1503 },
  ],
  '武汉': [
    { name: '天河国际机场', shortName: '天河国际机场', longitude: 114.2081, latitude: 30.7838 },
    { name: '武汉站', shortName: '武汉站', longitude: 114.4313, latitude: 30.5106 },
    { name: '汉口站', shortName: '汉口站', longitude: 114.2439, latitude: 30.6277 },
    { name: '武昌站', shortName: '武昌站', longitude: 114.3155, latitude: 30.5297 },
  ],
  '南京': [
    { name: '禄口国际机场', shortName: '禄口国际机场', longitude: 118.8619, latitude: 31.7417 },
    { name: '南京南站', shortName: '南京南站', longitude: 118.7954, latitude: 31.9722 },
    { name: '南京站', shortName: '南京站', longitude: 118.8028, latitude: 32.0897 },
  ],
  '景德镇': [
    { name: '罗家机场', shortName: '罗家机场', longitude: 117.1833, latitude: 29.3333 },
    { name: '景德镇北站', shortName: '景德镇北站', longitude: 117.2085, latitude: 29.3172 },
  ],
}

// ---------------------------------------------------------------------------
// 公共 API
// ---------------------------------------------------------------------------

export interface StudioTransitItem {
  name: string
  shortName: string
  distanceKm: number
  taxiMinutes: number
}

/** 获取某城市的枢纽配置；没有录音棚的城市返回 undefined */
export function getCityHubs(city: string | null | undefined): readonly TransportHub[] | undefined {
  if (!city) return undefined
  return cityTransportHubs[city]
}

/** 判断某城市是否启用了交通枢纽 */
export function isCityTransitEnabled(city: string | null | undefined): boolean {
  return Boolean(city && cityTransportHubs[city])
}

function toRadians(value: number) {
  return value * Math.PI / 180
}

export function calculateDistanceKm(lng1: number, lat1: number, lng2: number, lat2: number) {
  const earthRadiusKm = 6371
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

export function estimateTaxiMinutes(distanceKm: number) {
  const averageSpeed = distanceKm <= 8 ? 22 : distanceKm <= 20 ? 28 : 35
  const bufferMinutes = distanceKm <= 8 ? 8 : distanceKm <= 20 ? 10 : 12
  return Math.max(10, Math.round(distanceKm / averageSpeed * 60 + bufferMinutes))
}

export function formatDistance(distanceKm: number) {
  return distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`
}

export function formatTaxiMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainMinutes = minutes % 60
    return remainMinutes > 0 ? `${hours}小时${remainMinutes}分钟` : `${hours}小时`
  }
  return `${minutes}分钟`
}

/**
 * 计算某录音室到其所在城市各交通枢纽的距离与打车时间
 *
 * 只返回该城市已注册的枢纽，没有注册枢纽的城市返回空数组
 */
export function getStudioTransitItems(studio: Pick<Studio | StudioListItem, 'city' | 'longitude' | 'latitude'>) {
  const hubs = getCityHubs(studio.city)
  if (!hubs || !studio.longitude || !studio.latitude) {
    return []
  }

  return hubs.map(hub => {
    const distanceKm = calculateDistanceKm(studio.longitude as number, studio.latitude as number, hub.longitude, hub.latitude)
    return {
      ...hub,
      distanceKm,
      taxiMinutes: estimateTaxiMinutes(distanceKm),
    }
  })
}
