/**
 * 城市排序与默认选中 — 共享逻辑
 *
 * 所有涉及城市列表展示的页面都应通过本模块获取排序后的城市名列表，
 * 不要在各页面单独实现排序。
 */

import type { CityWithCount } from './types'

/**
 * 按录音室数量降序排列城市列表。
 * 数量相同时按城市名升序（localeCompare zh-CN）作为稳定次级排序。
 */
export function sortCitiesByCount(cities: CityWithCount[]): CityWithCount[] {
  return [...cities].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.city.localeCompare(b.city, 'zh-CN')
  })
}

/**
 * 从后端返回的 {city, count}[] 中提取排序后的城市名数组。
 * 后端已按 count DESC 排序，这里再兜底保证前端一致性。
 */
export function extractCityNames(cities: CityWithCount[]): string[] {
  return sortCitiesByCount(cities).map(c => c.city)
}

/**
 * 获取默认推荐城市（录音室数量最多的城市）。
 * 如果没有任何城市，返回空字符串（降级为"全部"模式）。
 */
export function getDefaultCity(cities: CityWithCount[]): string {
  const sorted = sortCitiesByCount(cities)
  return sorted.length > 0 ? sorted[0].city : ''
}
