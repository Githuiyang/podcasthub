/**
 * 录音间数据加载 & 城市列表
 *
 * 职责：
 * - 城市列表加载（从 API 动态获取，按录音室数量排序）
 * - 录音间列表加载（含 sessionStorage 缓存）
 * - 城市切换（自动触发数据重载）
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import type { StudioListItem } from '@/lib/types'
import { studiosApi } from '@/lib/api'
import { extractCityNames } from '@/lib/studioCities'
import { STUDIOS_CACHE_PREFIX, STUDIOS_CACHE_TTL } from '@/lib/constants'

function getStudiosCacheKey(city?: string) {
  return `${STUDIOS_CACHE_PREFIX}${city || 'all'}`
}

export function useStudios() {
  const studiosRequestIdRef = useRef(0)
  const [studios, setStudios] = useState<StudioListItem[]>([])
  const [studiosLoading, setStudiosLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [cities, setCities] = useState<string[]>([])

  const loadStudios = useCallback((city?: string) => {
    studiosRequestIdRef.current += 1
    const requestId = studiosRequestIdRef.current
    const cacheKey = getStudiosCacheKey(city)

    setStudiosLoading(true)

    if (typeof window !== 'undefined') {
      const cached = window.sessionStorage.getItem(cacheKey)
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as { timestamp: number; items: StudioListItem[] }
          if (Date.now() - parsed.timestamp < STUDIOS_CACHE_TTL) {
            setStudios(parsed.items)
            setStudiosLoading(false)
          }
        } catch {
          window.sessionStorage.removeItem(cacheKey)
        }
      }
    }

    return studiosApi.list({ city, size: 100 })
      .then(res => {
        if (studiosRequestIdRef.current === requestId) {
          setStudios(res.data.items)
          setStudiosLoading(false)
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(cacheKey, JSON.stringify({
              timestamp: Date.now(),
              items: res.data.items,
            }))
          }
        }
      })
      .catch(() => {
        if (studiosRequestIdRef.current === requestId) {
          setStudios([])
          setStudiosLoading(false)
        }
      })
  }, [])

  // 加载城市列表
  useEffect(() => {
    studiosApi.cities()
      .then(res => {
        const names = extractCityNames(res.data)
        setCities(names)
        setSelectedCity(prev => prev === null ? (names.length > 0 ? names[0] : '') : prev)
      })
      .catch(() => setSelectedCity(prev => prev === null ? '' : prev))
  }, [])

  // 城市变化时自动加载录音间数据
  useEffect(() => {
    if (selectedCity === null) return
    loadStudios(selectedCity || undefined)
  }, [loadStudios, selectedCity])

  const handleCitySelect = useCallback((city: string) => {
    setSelectedCity(city)
  }, [])

  return {
    studios,
    studiosLoading,
    selectedCity,
    cities,
    handleCitySelect,
  }
}
