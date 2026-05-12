'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { studiosApi } from '@/lib/api'
import type { Studio, StudioListItem } from '@/lib/types'
import {
  getCityHubs,
  formatDistance,
  formatTaxiMinutes,
  getStudioTransitItems,
} from '@/lib/studioTransport'
import { getStudioDisplayAddress } from '@/lib/studioPresentation'
import { extractCityNames } from '@/lib/studioCities'
import { StudioRecruitmentFab } from '@/app/components/StudioRecruitmentFab'
import { StudioDetailInfoTab } from '@/app/components/StudioDetailInfoTab'
import { StudioDetailImageTab } from '@/app/components/StudioDetailImageTab'
import { FeedbackModal } from '@/app/components/FeedbackModal'

const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_JS_KEY || ''

// 已知的城市中心坐标（新增城市时追加即可，API 动态城市的 fallback 按录音室坐标平均值计算）
const CITY_CENTERS: Record<string, [number, number]> = {
  '上海': [121.47, 31.23],
  '北京': [116.40, 39.90],
  '深圳': [114.06, 22.55],
  '广州': [113.26, 23.13],
  '成都': [104.07, 30.67],
  '杭州': [120.15, 30.28],
  '福州': [119.30, 26.08],
  '天津': [117.20, 39.13],
  '景德镇': [117.21, 29.29],
}

const NATIONAL_MAP_CENTER: [number, number] = [104.1954, 35.8617]
const NATIONAL_MAP_ZOOM = 4.8

const STUDIOS_CACHE_PREFIX = 'podcasthub:studios:'
const STUDIOS_CACHE_TTL = 5 * 60 * 1000

let amapScriptPromise: Promise<void> | null = null

function createAmapScript() {
  const script = document.createElement('script')
  script.id = 'amap-script'
  script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`
  script.async = true
  script.defer = true
  return script
}

function ensureAmapScript(attempt = 0): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if ((window as any).AMap) return Promise.resolve()
  if (!AMAP_KEY) return Promise.reject(new Error('Missing AMap key'))

  if (amapScriptPromise) return amapScriptPromise

  amapScriptPromise = new Promise<void>((resolve, reject) => {
    let settled = false
    let script = document.getElementById('amap-script') as HTMLScriptElement | null

    const cleanup = () => {
      if (!script) return
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
    }

    const resolveReady = () => {
      if (!settled) {
        settled = true
        cleanup()
        resolve()
      }
    }

    const retryOrReject = (message: string) => {
      if (settled) return
      cleanup()
      amapScriptPromise = null

      if (attempt < 1) {
        if (script?.parentNode) {
          script.parentNode.removeChild(script)
        }
        ensureAmapScript(attempt + 1).then(resolve).catch(reject)
      } else {
        settled = true
        reject(new Error(message))
      }
    }

    const handleLoad = () => {
      window.setTimeout(() => {
        if ((window as any).AMap) {
          resolveReady()
        } else {
          retryOrReject('AMap failed to initialize')
        }
      }, 120)
    }

    const handleError = () => {
      retryOrReject('AMap script failed to load')
    }

    if (script) {
      script.addEventListener('load', handleLoad)
      script.addEventListener('error', handleError)

      // The browser may already have completed the existing script before we attached listeners.
      window.setTimeout(() => {
        if ((window as any).AMap) {
          resolveReady()
        }
      }, 0)
      return
    }

    script = createAmapScript()
    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)
    document.head.appendChild(script)
  })

  return amapScriptPromise
}

function getStudiosCacheKey(city?: string) {
  return `${STUDIOS_CACHE_PREFIX}${city || 'all'}`
}

export default function HomePage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const hubMarkersRef = useRef<any[]>([])
  const hoverInfoRef = useRef<any>(null)
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const studiosRequestIdRef = useRef(0)
  const detailRequestIdRef = useRef(0)
  const [studios, setStudios] = useState<StudioListItem[]>([])
  const [selectedPreview, setSelectedPreview] = useState<StudioListItem | null>(null)
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [mapLoading, setMapLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)
  const [studiosLoading, setStudiosLoading] = useState(true)
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'image'>('info')
  const [studioFeedbackOpen, setStudioFeedbackOpen] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const [cities, setCities] = useState<string[]>([])

  const initMap = useCallback(() => {
    if (!mapContainer.current || !(window as any).AMap) return
    if (mapRef.current) {
      mapRef.current.destroy()
      mapRef.current = null
    }
    const AMap = (window as any).AMap
    const map = new AMap.Map(mapContainer.current, {
      zoom: 11.5,
      center: CITY_CENTERS['上海'],  // 合理的初始中心，cities API 返回后按数据调整
      mapStyle: 'amap://styles/whitesmoke',
      viewMode: '2D',
    })
    hoverInfoRef.current = new AMap.InfoWindow({
      isCustom: true,
      offset: new AMap.Pixel(0, -22),
    })
    map.on('click', () => hoverInfoRef.current?.close())
    mapRef.current = map
    setIsMapReady(true)
  }, [])

  const openStudioModal = useCallback((studio: StudioListItem) => {
    detailRequestIdRef.current += 1
    const requestId = detailRequestIdRef.current
    setSelectedPreview(studio)
    setSelectedStudio(null)
    setActiveDetailTab('info') // 每次打开都从信息 Tab 开始
    setModalOpen(true)
    setModalLoading(true)
    hoverInfoRef.current?.close()

    studiosApi.detail(studio.id)
      .then(res => {
        if (detailRequestIdRef.current === requestId) {
          setSelectedStudio(res.data)
        }
      })
      .catch(() => {
        if (detailRequestIdRef.current === requestId) {
          setSelectedStudio(null)
        }
      })
      .finally(() => {
        if (detailRequestIdRef.current === requestId) {
          setModalLoading(false)
        }
      })
  }, [])

  /** 销毁地图实例和所有关联资源（hover info、定时器、标记） */
  const destroyMap = useCallback(() => {
    setIsMapReady(false)
    // 清除 hover 定时器
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current)
      hoverCloseTimerRef.current = null
    }
    // 关闭 hover 弹窗
    hoverInfoRef.current?.close()
    hoverInfoRef.current = null
    // 清除标记引用（地图 destroy 时自动移除，这里只清空 ref）
    markersRef.current = []
    hubMarkersRef.current = []
    // 销毁地图实例
    if (mapRef.current) {
      mapRef.current.destroy()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setMapLoading(true)
    setMapError(null)

    ensureAmapScript()
      .then(() => {
        if (cancelled) return
        initMap()
        setMapLoading(false)
      })
      .catch((error: Error) => {
        if (cancelled) return
        setMapError(error.message || '地图加载失败')
        setMapLoading(false)
      })

    // 页面卸载时完整释放地图资源
    return () => {
      cancelled = true
      destroyMap()
    }
  }, [initMap, destroyMap])

  const cancelHoverClose = useCallback(() => {
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current)
      hoverCloseTimerRef.current = null
    }
  }, [])

  const scheduleHoverClose = useCallback(() => {
    cancelHoverClose()
    hoverCloseTimerRef.current = setTimeout(() => {
      hoverInfoRef.current?.close()
      hoverCloseTimerRef.current = null
    }, 160)
  }, [cancelHoverClose])

  const escapeMarkerText = useCallback((value: string) => {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }, [])

  const buildStudioHoverContent = useCallback((studio: StudioListItem) => {
    const displayAddress = getStudioDisplayAddress(studio)
    const priceText = studio.price_per_hour
      ? `¥${studio.price_per_hour}/时`
      : studio.price_per_day
        ? `¥${studio.price_per_day}/天`
        : studio.charging_method || '价格详询'

    const transitItems = getStudioTransitItems(studio)

    const hubDistanceHtml = transitItems.length > 0
      ? `
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(148, 163, 184, 0.18);">
          <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.04em; color: #64748b; margin-bottom: 6px;">交通枢纽距离与打车时间</div>
          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px;">
            ${transitItems.map(hub => `
              <div style="background: #f8fafc; border-radius: 10px; padding: 7px 8px;">
                <div style="font-size: 11px; color: #1e293b; font-weight: 600; line-height: 1.3;">${escapeMarkerText(hub.shortName)}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">约 ${formatDistance(hub.distanceKm)}</div>
                <div style="font-size: 10px; color: #475569; margin-top: 2px;">打车约 ${formatTaxiMinutes(hub.taxiMinutes)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `
      : ''

    return `
      <div onmousedown="event.stopPropagation()" onpointerdown="event.stopPropagation()" onmouseenter="window.__podcasthubHoverEnter &amp;&amp; window.__podcasthubHoverEnter()" onmouseleave="window.__podcasthubHoverLeave &amp;&amp; window.__podcasthubHoverLeave()" style="width: 252px; background: rgba(255,255,255,0.96); border: 1px solid rgba(226,232,240,0.85); border-radius: 18px; box-shadow: 0 18px 50px rgba(15,23,42,0.18); backdrop-filter: blur(18px); padding: 14px 14px 12px; cursor: pointer;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <div>
            <div style="font-size: 14px; font-weight: 700; color: #111827; line-height: 1.35;">${escapeMarkerText(studio.name)}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 3px;">${escapeMarkerText(displayAddress || '地址待补充')}</div>
          </div>
          <div style="padding: 5px 8px; border-radius: 999px; background: #fff7ed; color: #d97706; font-size: 11px; font-weight: 700; white-space: nowrap;">${escapeMarkerText(priceText)}</div>
        </div>
        ${hubDistanceHtml}
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(148, 163, 184, 0.18);">
          <button type="button" onclick="event.stopPropagation(); window.__podcasthubOpenStudio &amp;&amp; window.__podcasthubOpenStudio(${studio.id})" style="width:100%; padding:10px 12px; border-radius:12px; border:0; background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; font-size:12px; font-weight:700; cursor:pointer;">点击查看详情</button>
        </div>
      </div>
    `
  }, [escapeMarkerText])

  // 将交互函数挂到 window 上，供高德 InfoWindow HTML 内联事件调用
  useEffect(() => {
    const w = window as any
    w.__podcasthubOpenStudio = (id: number) => {
      const studio = studios.find(s => s.id === id)
      if (studio) openStudioModal(studio)
    }
    w.__podcasthubHoverEnter = () => cancelHoverClose()
    w.__podcasthubHoverLeave = () => scheduleHoverClose()
    return () => {
      delete w.__podcasthubOpenStudio
      delete w.__podcasthubHoverEnter
      delete w.__podcasthubHoverLeave
    }
  }, [studios, openStudioModal, cancelHoverClose, scheduleHoverClose])

  const closeStudioModal = useCallback(() => {
    detailRequestIdRef.current += 1
    setModalOpen(false)
    setSelectedPreview(null)
    setSelectedStudio(null)
    setModalLoading(false)
  }, [])


  const buildHubMarkerContent = useCallback((shortName: string) => {
    return `
      <div style="display:flex; align-items:center; gap:8px;">
        <div style="width:14px; height:14px; border-radius:999px; background:linear-gradient(135deg,#2563eb,#0ea5e9); box-shadow:0 0 0 5px rgba(59,130,246,0.16), 0 8px 18px rgba(37,99,235,0.28); border:2px solid rgba(255,255,255,0.95);"></div>
        <div style="padding:6px 10px; border-radius:999px; background:rgba(255,255,255,0.94); border:1px solid rgba(191,219,254,0.8); box-shadow:0 10px 26px rgba(37,99,235,0.12); color:#1d4ed8; font-size:11px; font-weight:700; white-space:nowrap;">${escapeMarkerText(shortName)}</div>
      </div>
    `
  }, [escapeMarkerText])

  const buildHubHoverContent = useCallback((hubName: string) => {
    return `
      <div style="width: 220px; background: rgba(255,255,255,0.96); border: 1px solid rgba(191,219,254,0.8); border-radius: 18px; box-shadow: 0 18px 50px rgba(15,23,42,0.18); backdrop-filter: blur(18px); padding: 14px 14px 12px;">
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.04em; color: #2563eb; margin-bottom: 6px;">交通枢纽</div>
        <div style="font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.35;">${escapeMarkerText(hubName)}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 6px; line-height: 1.45;">可结合录音间 hover 卡中的距离信息，快速判断来回交通成本。</div>
      </div>
    `
  }, [escapeMarkerText])

  const buildCityAggregateMarkerContent = useCallback((cityName: string, count: number) => {
    return `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translateY(-8px);">
        <div style="display:flex; align-items:center; gap:6px; padding:8px 12px; border-radius:16px; background:rgba(17,24,39,0.94); box-shadow:0 16px 30px rgba(15,23,42,0.18); color:#fff; white-space:nowrap;">
          <div style="font-size:13px; font-weight:700; line-height:1;">${escapeMarkerText(cityName)}</div>
          <div style="min-width:24px; height:24px; padding:0 8px; border-radius:999px; background:#fff; color:#111827; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; line-height:1;">${count}</div>
        </div>
        <div style="margin-top:8px; width:12px; height:12px; border-radius:999px; background:#111827; box-shadow:0 0 0 6px rgba(17,24,39,0.12);"></div>
      </div>
    `
  }, [escapeMarkerText])

  const buildCityAggregateHoverContent = useCallback((cityName: string, count: number) => {
    return `
      <div style="width: 220px; background: rgba(255,255,255,0.98); border: 1px solid rgba(226,232,240,0.9); border-radius: 18px; box-shadow: 0 18px 50px rgba(15,23,42,0.16); padding: 14px 14px 12px;">
        <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.04em; color: #64748b; margin-bottom: 6px;">全国概览</div>
        <div style="font-size: 16px; font-weight: 800; color: #111827; line-height: 1.35;">${escapeMarkerText(cityName)}</div>
        <div style="margin-top: 6px; font-size: 12px; color: #475569; line-height: 1.5;">当前收录 <strong>${count}</strong> 家录音间</div>
        <div style="margin-top: 10px; font-size: 11px; font-weight: 700; color: #111827;">点击查看城市内具体录音间</div>
      </div>
    `
  }, [escapeMarkerText])

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

  // 加载城市列表（从 API 动态获取，按录音室数量排序）
  useEffect(() => {
    studiosApi.cities()
      .then(res => {
        const names = extractCityNames(res.data)
        setCities(names)
        // 首次加载：默认选中录音室数量最多的城市
        setSelectedCity(prev => prev === null ? (names.length > 0 ? names[0] : '') : prev)
        // 调整地图中心到默认城市（在 loading overlay 背后，无视觉闪烁）
        const defaultCity = names.length > 0 ? names[0] : ''
        if (defaultCity && CITY_CENTERS[defaultCity] && mapRef.current) {
          mapRef.current.setCenter(CITY_CENTERS[defaultCity])
          mapRef.current.setZoom(11.5)
        }
      })
      .catch(() => setSelectedCity(prev => prev === null ? '' : prev))
  }, [])

  // 加载录音间数据（等待默认城市确定后再加载）
  useEffect(() => {
    if (selectedCity === null) return
    loadStudios(selectedCity || undefined)
  }, [loadStudios, selectedCity])

  const handleCitySelect = useCallback((city: string) => {
    setSelectedCity(city) // selectedCity effect 会自动触发 loadStudios
    closeStudioModal()
    hoverInfoRef.current?.close()

    if (!mapRef.current) return

    if (!city) {
      mapRef.current.setCenter(NATIONAL_MAP_CENTER)
      mapRef.current.setZoom(NATIONAL_MAP_ZOOM)
      return
    }

    if (CITY_CENTERS[city]) {
      mapRef.current.setCenter(CITY_CENTERS[city])
      mapRef.current.setZoom(11.5)
    }
  }, [closeStudioModal])

  // 更新地图标记（依赖 isMapReady 状态而非 ref，确保地图后 ready 时也能补绘）
  useEffect(() => {
    if (!isMapReady || !mapRef.current || studios.length === 0) return
    const AMap = (window as any).AMap

    // 清除旧标记
    markersRef.current.forEach(m => mapRef.current.remove(m))
    markersRef.current = []
    hubMarkersRef.current.forEach(m => mapRef.current.remove(m))
    hubMarkersRef.current = []

    const validStudios = studios.filter(s => s.longitude && s.latitude)
    if (validStudios.length === 0) return

    if (selectedCity === '') {
      const cityAggregates = Object.values(validStudios.reduce<Record<string, {
        city: string
        count: number
        longitudeSum: number
        latitudeSum: number
      }>>((acc, studio) => {
        const city = studio.city || '未标注城市'
        if (!acc[city]) {
          acc[city] = { city, count: 0, longitudeSum: 0, latitudeSum: 0 }
        }
        acc[city].count += 1
        acc[city].longitudeSum += studio.longitude as number
        acc[city].latitudeSum += studio.latitude as number
        return acc
      }, {}))

      cityAggregates.forEach(aggregate => {
        const fallbackCenter: [number, number] = [
          aggregate.longitudeSum / aggregate.count,
          aggregate.latitudeSum / aggregate.count,
        ]
        const markerPosition = CITY_CENTERS[aggregate.city] || fallbackCenter
        const marker = new AMap.Marker({
          position: markerPosition,
          title: `${aggregate.city} · ${aggregate.count} 家录音间`,
          content: buildCityAggregateMarkerContent(aggregate.city, aggregate.count),
          offset: new AMap.Pixel(-28, -40),
          zIndex: 110,
        })

        marker.on('mouseover', () => {
          cancelHoverClose()
          hoverInfoRef.current?.setContent(buildCityAggregateHoverContent(aggregate.city, aggregate.count))
          hoverInfoRef.current?.open(mapRef.current, markerPosition)
        })

        marker.on('mouseout', () => {
          scheduleHoverClose()
        })

        marker.on('click', () => {
          cancelHoverClose()
          handleCitySelect(aggregate.city)
        })

        mapRef.current.add(marker)
        markersRef.current.push(marker)
      })

      if (markersRef.current.length > 0) {
        mapRef.current.setFitView(markersRef.current, false, [80, 110, 80, 140])
      } else {
        mapRef.current.setCenter(NATIONAL_MAP_CENTER)
        mapRef.current.setZoom(NATIONAL_MAP_ZOOM)
      }
      return
    }

    const hubOverlays: any[] = []
    const cityHubs = getCityHubs(selectedCity)
    if (cityHubs) {
      cityHubs.forEach(hub => {
        const hubMarker = new AMap.Marker({
          position: [hub.longitude, hub.latitude],
          title: hub.name,
          content: buildHubMarkerContent(hub.shortName),
          offset: new AMap.Pixel(-14, -14),
          zIndex: 120,
        })

        hubMarker.on('mouseover', () => {
          cancelHoverClose()
          hoverInfoRef.current?.setContent(buildHubHoverContent(hub.name))
          hoverInfoRef.current?.open(mapRef.current, [hub.longitude, hub.latitude])
        })

        hubMarker.on('mouseout', () => {
          scheduleHoverClose()
        })

        mapRef.current.add(hubMarker)
        hubMarkersRef.current.push(hubMarker)
        hubOverlays.push(hubMarker)
      })
    }

    validStudios.forEach(studio => {
      const marker = new AMap.Marker({
        position: [studio.longitude, studio.latitude],
        title: studio.name,
        content: `<div style="
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 12px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(245,158,11,0.3);
          cursor: pointer;
          font-family: -apple-system, sans-serif;
        ">${escapeMarkerText(studio.name)}</div>`,
        offset: new AMap.Pixel(-30, -15),
      })

      marker.on('mouseover', () => {
        cancelHoverClose()
        hoverInfoRef.current?.setContent(buildStudioHoverContent(studio))
        hoverInfoRef.current?.open(mapRef.current, [studio.longitude, studio.latitude])
      })

      marker.on('mouseout', () => {
        scheduleHoverClose()
      })

      marker.on('click', () => {
        cancelHoverClose()
        openStudioModal(studio)
        mapRef.current.setCenter([studio.longitude, studio.latitude])
      })

      mapRef.current.add(marker)
      markersRef.current.push(marker)
    })

    // 首屏视野优先围绕录音室主分布，交通枢纽不参与 fitView
    // 原因：浦东机场等远距离枢纽会把整体视野拉大，导致录音室被挤到偏左
    if (validStudios.length > 0) {
      mapRef.current.setFitView(markersRef.current, false, [80, 120, 80, 120])
    }
  }, [buildCityAggregateHoverContent, buildCityAggregateMarkerContent, buildHubHoverContent, buildHubMarkerContent, buildStudioHoverContent, cancelHoverClose, handleCitySelect, isMapReady, scheduleHoverClose, selectedCity, studios])

  // 地图总览页
  return (
    <>
      <div className="relative h-[calc(100vh-96px)] sm:h-[calc(100vh-48px)]">
        {/* SEO: 首页主标题，视觉隐藏但搜索引擎可见 */}
        <h1 className="sr-only">PodcastHub - 中国播客录音室展示与选择平台</h1>
        {/* 地图容器 */}
        <div ref={mapContainer} className="w-full h-full" />

        {(mapLoading || studiosLoading || mapError) && (
          <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-white/72 backdrop-blur-[2px]">
            <div className="rounded-3xl border border-black/8 bg-white px-5 py-4 text-center shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                {mapError ? '地图加载受阻' : '地图准备中'}
              </div>
              <div className="mt-2 text-sm text-slate-700">
                {mapError
                  ? '高德地图脚本加载失败，请稍后刷新重试。'
                  : mapLoading
                    ? '正在连接地图服务...'
                    : '正在同步录音间点位...'}
              </div>
            </div>
          </div>
        )}

        {/* 顶部城市筛选（动态城市列表） */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2">
          <div className="flex gap-1.5 overflow-x-auto bg-white/90 backdrop-blur-lg rounded-xl px-2 py-1.5 shadow-sm border border-gray-100/60 city-scroll">
            <button
              onClick={() => handleCitySelect('')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCity === ''
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              全部
            </button>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCity === city
                    ? 'bg-black text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <StudioRecruitmentFab />

        {modalOpen && (
          <div className="absolute inset-0 z-30 bg-black/22 backdrop-blur-[2px] px-4 py-6 sm:px-8 sm:py-10" onClick={closeStudioModal}>
            <div className="mx-auto flex h-full max-w-2xl items-center justify-center">
              <div className="w-full max-h-[88vh] overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.16)]" onClick={e => e.stopPropagation()}>
                {/* 关闭按钮 */}
                <div className="flex items-center justify-between px-6 pt-5 sm:px-8">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveDetailTab('info')}
                      className={`text-sm font-medium pb-1.5 border-b-2 transition-colors ${
                        activeDetailTab === 'info'
                          ? 'text-slate-900 border-slate-900'
                          : 'text-slate-400 border-transparent hover:text-slate-600'
                      }`}
                    >
                      录音室信息
                    </button>
                    <button
                      onClick={() => setActiveDetailTab('image')}
                      className={`text-sm font-medium pb-1.5 border-b-2 transition-colors ${
                        activeDetailTab === 'image'
                          ? 'text-slate-900 border-slate-900'
                          : 'text-slate-400 border-transparent hover:text-slate-600'
                      }`}
                    >
                      图片
                    </button>
                  </div>
                  <button onClick={closeStudioModal} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                    &times;
                  </button>
                </div>

                {/* Tab 内容 */}
                <div className="max-h-[calc(88vh-52px)] overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
                  {selectedStudio ? (
                    activeDetailTab === 'info' ? (
                      <div className="pt-5">
                        <StudioDetailInfoTab
                          studio={selectedStudio}
                          onClose={closeStudioModal}
                          onStudioFeedback={() => setStudioFeedbackOpen(true)}
                        />
                      </div>
                    ) : (
                      <StudioDetailImageTab studio={selectedStudio} />
                    )
                  ) : modalLoading && selectedPreview ? (
                    /* 详情加载中，先用 preview 展示名称 + 地址骨架 */
                    <div className="pt-5 space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{selectedPreview.name}</h2>
                        <p className="mt-2 text-sm text-slate-500">{selectedPreview.address || '地址待补充'}</p>
                      </div>
                      <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-slate-100 rounded w-32" />
                        <div className="h-20 bg-slate-50 rounded-xl" />
                        <div className="h-4 bg-slate-100 rounded w-24" />
                        <div className="h-16 bg-slate-50 rounded-xl" />
                      </div>
                    </div>
                  ) : !modalLoading && !selectedStudio ? (
                    <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
                      <div className="text-4xl">🤷</div>
                      <p className="mt-3 text-sm text-slate-400">详情加载失败，请稍后重试</p>
                    </div>
                  ) : (
                    <div className="flex min-h-[320px] items-center justify-center text-sm text-slate-400">加载详情中...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 录音室信息反馈弹窗 */}
      <FeedbackModal
        open={studioFeedbackOpen}
        onClose={() => setStudioFeedbackOpen(false)}
        studioContext={selectedStudio ? {
          studio_id: selectedStudio.id,
          studio_name: selectedStudio.name,
          source: 'web_modal' as const,
        } : undefined}
      />
    </>
  )
}
