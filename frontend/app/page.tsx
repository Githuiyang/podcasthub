'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { studiosApi } from '@/lib/api'
import type { Studio, StudioListItem } from '@/lib/types'

const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_JS_KEY || ''

const CITIES = [
  { label: '全部', value: '' },
  { label: '上海', value: '上海' },
  { label: '北京', value: '北京' },
  { label: '深圳', value: '深圳' },
  { label: '广州', value: '广州' },
  { label: '成都', value: '成都' },
  { label: '杭州', value: '杭州' },
]

const SHANGHAI_HUBS = [
  { name: '虹桥机场 / 虹桥火车站', shortName: '虹桥', longitude: 121.3274, latitude: 31.1979 },
  { name: '上海站', shortName: '上海站', longitude: 121.4626, latitude: 31.2533 },
  { name: '上海南站', shortName: '南站', longitude: 121.4296, latitude: 31.1547 },
  { name: '浦东机场', shortName: '浦东', longitude: 121.7998, latitude: 31.1518 },
] as const

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
  const [activeTab, setActiveTab] = useState<'map' | 'editors' | 'business'>('map')
  const [selectedCity, setSelectedCity] = useState('')

  // 加载地图脚本
  useEffect(() => {
    if (activeTab !== 'map') return
    const existing = document.getElementById('amap-script')
    if (existing) {
      initMap()
      return
    }
    const script = document.createElement('script')
    script.id = 'amap-script'
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`
    script.onload = () => initMap()
    document.head.appendChild(script)
  }, [activeTab])

  const initMap = useCallback(() => {
    if (!mapContainer.current || !(window as any).AMap) return
    if (mapRef.current) {
      mapRef.current.destroy()
      mapRef.current = null
    }
    const AMap = (window as any).AMap
    const map = new AMap.Map(mapContainer.current, {
      zoom: 12,
      center: [121.47, 31.23],
      mapStyle: 'amap://styles/whitesmoke',
      viewMode: '2D',
    })
    hoverInfoRef.current = new AMap.InfoWindow({
      isCustom: true,
      offset: new AMap.Pixel(0, -22),
    })
    map.on('click', () => hoverInfoRef.current?.close())
    mapRef.current = map
  }, [])

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

  useEffect(() => {
    if (activeTab === 'map') return

    cancelHoverClose()
    hoverInfoRef.current?.close()
    hoverInfoRef.current = null
    markersRef.current = []
    hubMarkersRef.current = []

    if (mapRef.current) {
      mapRef.current.destroy()
      mapRef.current = null
    }
  }, [activeTab, cancelHoverClose])

  const escapeMarkerText = useCallback((value: string) => {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }, [])

  const formatDistance = useCallback((distanceKm: number) => {
    return distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`
  }, [])

  const calculateDistanceKm = useCallback((lng1: number, lat1: number, lng2: number, lat2: number) => {
    const toRadians = (value: number) => value * Math.PI / 180
    const earthRadiusKm = 6371
    const dLat = toRadians(lat2 - lat1)
    const dLng = toRadians(lng2 - lng1)
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return earthRadiusKm * c
  }, [])

  const buildStudioHoverContent = useCallback((studio: StudioListItem) => {
    const location = [studio.city, studio.district].filter(Boolean).join(' · ')
    const priceText = studio.price_per_hour
      ? `¥${studio.price_per_hour}/时`
      : studio.price_per_day
        ? `¥${studio.price_per_day}/天`
        : '价格详询'

    const hubDistances = studio.longitude && studio.latitude
      ? SHANGHAI_HUBS.map(hub => ({
          ...hub,
          distanceKm: calculateDistanceKm(studio.longitude as number, studio.latitude as number, hub.longitude, hub.latitude),
        }))
      : []

    const hubDistanceHtml = hubDistances.length > 0
      ? `
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(148, 163, 184, 0.18);">
          <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.04em; color: #64748b; margin-bottom: 6px;">交通枢纽距离</div>
          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px;">
            ${hubDistances.map(hub => `
              <div style="background: #f8fafc; border-radius: 10px; padding: 7px 8px;">
                <div style="font-size: 11px; color: #1e293b; font-weight: 600; line-height: 1.3;">${escapeMarkerText(hub.shortName)}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">约 ${formatDistance(hub.distanceKm)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `
      : ''

    return `
      <div style="width: 252px; background: rgba(255,255,255,0.96); border: 1px solid rgba(226,232,240,0.85); border-radius: 18px; box-shadow: 0 18px 50px rgba(15,23,42,0.18); backdrop-filter: blur(18px); padding: 14px 14px 12px; cursor: pointer;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <div>
            <div style="font-size: 14px; font-weight: 700; color: #111827; line-height: 1.35;">${escapeMarkerText(studio.name)}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 3px;">${escapeMarkerText(location || '上海')}</div>
          </div>
          <div style="padding: 5px 8px; border-radius: 999px; background: #fff7ed; color: #d97706; font-size: 11px; font-weight: 700; white-space: nowrap;">${escapeMarkerText(priceText)}</div>
        </div>
        ${studio.address ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 8px; line-height: 1.45;">${escapeMarkerText(studio.address)}</div>` : ''}
        ${hubDistanceHtml}
        <div style="margin-top: 10px; font-size: 11px; font-weight: 600; color: #d97706;">点击卡片查看录音间详情</div>
      </div>
    `
  }, [calculateDistanceKm, escapeMarkerText, formatDistance])

  const openStudioModal = useCallback((studio: StudioListItem) => {
    detailRequestIdRef.current += 1
    const requestId = detailRequestIdRef.current
    setSelectedPreview(studio)
    setSelectedStudio(null)
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

  const closeStudioModal = useCallback(() => {
    detailRequestIdRef.current += 1
    setModalOpen(false)
    setSelectedPreview(null)
    setSelectedStudio(null)
    setModalLoading(false)
  }, [])

  const buildStudioHoverNode = useCallback((studio: StudioListItem) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = buildStudioHoverContent(studio)
    const card = wrapper.firstElementChild as HTMLDivElement | null
    if (!card) return wrapper

    card.addEventListener('mouseenter', () => {
      cancelHoverClose()
      hoverInfoRef.current?.open(mapRef.current, [studio.longitude, studio.latitude])
    })

    card.addEventListener('mouseleave', () => {
      scheduleHoverClose()
    })

    card.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      openStudioModal(studio)
    })

    const footer = document.createElement('div')
    footer.style.marginTop = '10px'
    footer.style.paddingTop = '10px'
    footer.style.borderTop = '1px solid rgba(148, 163, 184, 0.18)'

    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = '点击查看详情'
    button.style.width = '100%'
    button.style.padding = '10px 12px'
    button.style.borderRadius = '12px'
    button.style.border = '0'
    button.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)'
    button.style.color = '#fff'
    button.style.fontSize = '12px'
    button.style.fontWeight = '700'
    button.style.cursor = 'pointer'
    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      openStudioModal(studio)
    })

    footer.appendChild(button)
    card.appendChild(footer)
    return card
  }, [buildStudioHoverContent, cancelHoverClose, openStudioModal, scheduleHoverClose])

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

  const getStudioOpenHours = useCallback((studio: Studio | null) => {
    if (!studio?.description) return null
    const match = studio.description.match(/开放时间[:：]\s*([^\n]+)/)
    return match?.[1]?.trim() || null
  }, [])

  const loadStudios = useCallback((city?: string) => {
    studiosRequestIdRef.current += 1
    const requestId = studiosRequestIdRef.current

    return studiosApi.list({ city, size: 100 })
      .then(res => {
        if (studiosRequestIdRef.current === requestId) {
          setStudios(res.data.items)
        }
      })
      .catch(() => {
        if (studiosRequestIdRef.current === requestId) {
          setStudios([])
        }
      })
  }, [])

  // 加载录音间数据
  useEffect(() => {
    if (activeTab !== 'map') return
    loadStudios()
  }, [activeTab, loadStudios])

  // 更新地图标记
  useEffect(() => {
    const AMap = (window as any).AMap
    if (!AMap || !mapRef.current || studios.length === 0) return

    // 清除旧标记
    markersRef.current.forEach(m => mapRef.current.remove(m))
    markersRef.current = []
    hubMarkersRef.current.forEach(m => mapRef.current.remove(m))
    hubMarkersRef.current = []

    const validStudios = studios.filter(s => s.longitude && s.latitude)
    if (validStudios.length === 0) return

    const hubOverlays: any[] = []
    if (selectedCity === '' || selectedCity === '上海') {
      SHANGHAI_HUBS.forEach(hub => {
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
        hoverInfoRef.current?.setContent(buildStudioHoverNode(studio))
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

    // 自适应缩放，刚好容纳所有标记
    if (validStudios.length > 0) {
      mapRef.current.setFitView([...markersRef.current, ...hubOverlays], false, [50, 50, 50, 350])
    }
  }, [buildHubHoverContent, buildHubMarkerContent, buildStudioHoverNode, cancelHoverClose, escapeMarkerText, openStudioModal, scheduleHoverClose, selectedCity, studios])

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    closeStudioModal()
    hoverInfoRef.current?.close()
    loadStudios(city || undefined)

    // 移动地图到对应城市
    const cityCenters: Record<string, [number, number]> = {
      '上海': [121.47, 31.23],
      '北京': [116.40, 39.90],
      '深圳': [114.06, 22.55],
      '广州': [113.26, 23.13],
      '成都': [104.07, 30.67],
      '杭州': [120.15, 30.28],
    }
    if (city && cityCenters[city] && mapRef.current) {
      mapRef.current.setCenter(cityCenters[city])
      mapRef.current.setZoom(12)
    }
  }

  // 地图 Tab
  if (activeTab === 'map') {
    return (
      <div className="relative h-[calc(100vh-48px)] sm:h-[calc(100vh-48px)] -m-4 sm:-m-6">
        {/* 地图容器 */}
        <div ref={mapContainer} className="w-full h-full" />

        {/* 顶部城市筛选 */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2">
          <div className="flex gap-1.5 overflow-x-auto bg-white/90 backdrop-blur-lg rounded-xl px-2 py-1.5 shadow-sm border border-gray-100/60 city-scroll">
            {CITIES.map(c => (
              <button
                key={c.value}
                onClick={() => handleCitySelect(c.value)}
                className="px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all text-gray-500 hover:bg-gray-50"
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-white/90 backdrop-blur-lg rounded-xl px-1 py-1 shadow-sm border border-gray-100/60">
            <button onClick={() => setActiveTab('map')} className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-600">录音间</button>
            <button onClick={() => setActiveTab('editors')} className="px-3 py-1 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-600">剪辑师</button>
            <button onClick={() => setActiveTab('business')} className="px-3 py-1 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-600">商务</button>
          </div>
        </div>

        {modalOpen && (
          <div className="absolute inset-0 z-30 bg-black/22 backdrop-blur-[2px] px-4 py-6 sm:px-8 sm:py-10" onClick={closeStudioModal}>
            <div className="mx-auto flex h-full max-w-5xl items-center justify-center">
              <div className="w-full max-h-full overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.16)]" onClick={e => e.stopPropagation()}>
                <div className="grid max-h-[88vh] grid-cols-1 overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="relative min-h-[260px] bg-gradient-to-br from-neutral-100 via-neutral-50 to-white lg:min-h-[620px]">
                    {selectedStudio?.cover_image ? (
                      <img src={selectedStudio.cover_image} alt={selectedStudio.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="rounded-[24px] border border-black/5 bg-white px-8 py-6 text-center shadow-sm">
                          <div className="text-6xl opacity-70">🎙</div>
                          <div className="mt-3 text-sm font-medium text-slate-500">录音间实景图待补充</div>
                        </div>
                      </div>
                    )}
                    <button onClick={closeStudioModal} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-xl text-slate-500 shadow-sm hover:text-slate-700">
                      &times;
                    </button>
                  </div>

                  <div className="max-h-[88vh] overflow-y-auto p-6 sm:p-7 lg:p-8">
                    {modalLoading ? (
                      <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-400">加载详情中...</div>
                    ) : selectedStudio ? (
                      <div className="space-y-5">
                        <div>
                          <div className="mb-3 inline-flex rounded-full border border-black/10 bg-black px-3 py-1 text-[11px] font-semibold text-white">录音间详情</div>
                          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{selectedStudio.name}</h2>
                          <p className="mt-2 text-sm text-slate-500">{[selectedStudio.city, selectedStudio.district].filter(Boolean).join(' · ') || '上海'}</p>
                          {selectedStudio.address && <p className="mt-1 text-sm leading-relaxed text-slate-400">{selectedStudio.address}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">价格</div>
                            <div className="mt-1 text-base font-bold text-slate-900">
                              {selectedStudio.price_per_hour ? `¥${selectedStudio.price_per_hour}/时` : selectedStudio.price_per_day ? `¥${selectedStudio.price_per_day}/天` : '价格详询'}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">房间数</div>
                            <div className="mt-1 text-base font-bold text-slate-800">{selectedStudio.room_count || 1} 间</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">开放时间</div>
                            <div className="mt-1 text-sm font-medium leading-6 text-slate-700">
                              {getStudioOpenHours(selectedStudio) || selectedStudio.booking_note || '建议预约前联系确认开放时段'}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">联系方式</div>
                            <div className="mt-1 space-y-1 text-sm leading-6 text-slate-700">
                              {selectedStudio.contact_name && <p>联系人：{selectedStudio.contact_name}</p>}
                              {selectedStudio.contact_phone && <p>电话：{selectedStudio.contact_phone}</p>}
                              {selectedStudio.contact_wechat && <p>微信：{selectedStudio.contact_wechat}</p>}
                              {!selectedStudio.contact_name && !selectedStudio.contact_phone && !selectedStudio.contact_wechat && (
                                <p>暂无公开联系方式，可先通过预约方式或详情页进一步确认。</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-black/6 bg-neutral-50 p-4">
                          <div className="text-xs font-semibold tracking-[0.08em] text-slate-500">地点信息</div>
                          <div className="mt-2 space-y-2 text-sm text-slate-600">
                            <p>城市区域：{[selectedStudio.city, selectedStudio.district].filter(Boolean).join(' / ') || '待补充'}</p>
                            <p>详细地址：{selectedStudio.address || '待补充'}</p>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-black/6 bg-white p-4">
                          <div className="text-xs font-semibold tracking-[0.08em] text-slate-500">具体描述</div>
                          <p className="mt-2 text-sm leading-7 text-slate-600 whitespace-pre-line">{selectedStudio.description || '暂无详细描述，建议联系主理人确认录音环境、设备和档期。'}</p>
                        </div>

                        <div className="rounded-3xl border border-black/6 bg-neutral-50 p-4">
                          <div className="text-xs font-semibold tracking-[0.08em] text-slate-500">预约方式</div>
                          <div className="mt-3 space-y-3">
                            {selectedStudio.booking_url ? (
                              <a href={selectedStudio.booking_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-2xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                                立即预约
                              </a>
                            ) : (
                              <div className="rounded-2xl border border-black/6 bg-white px-4 py-3 text-sm text-slate-500">暂无线上预约链接</div>
                            )}
                            <p className="text-sm leading-6 text-slate-600">{selectedStudio.booking_note || '可通过页面联系方式进一步确认预约方式。'}</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Link href={`/studios/${selectedStudio.id}`} className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800">
                            打开独立详情页
                          </Link>
                          <button onClick={closeStudioModal} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200">
                            关闭
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                        <div className="text-4xl">🤷</div>
                        <p className="mt-3 text-sm text-slate-400">详情加载失败，请稍后重试</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 移动端底部 Tab */}
        <div className="sm:hidden absolute bottom-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-lg border-t border-gray-100 pb-safe">
          <div className="flex justify-around h-11">
            <button onClick={() => setActiveTab('map')} className="flex flex-col items-center justify-center flex-1 text-amber-600"><span className="text-[10px] font-medium">录音间</span></button>
            <button onClick={() => setActiveTab('editors')} className="flex flex-col items-center justify-center flex-1 text-gray-400"><span className="text-[10px] font-medium">剪辑师</span></button>
            <button onClick={() => setActiveTab('business')} className="flex flex-col items-center justify-center flex-1 text-gray-400"><span className="text-[10px] font-medium">商务</span></button>
          </div>
        </div>
      </div>
    )
  }

  // 剪辑师 Tab
  if (activeTab === 'editors') {
    return (
      <div className="py-8 text-center animate-fade-in-up">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">剪辑师</h1>
        <p className="text-sm text-gray-400 mb-6">功能开发中，敬请期待</p>
        <Link href="/editors" className="text-sm text-purple-500 hover:underline">查看剪辑师列表 →</Link>
      </div>
    )
  }

  // 商务 Tab
  return (
    <div className="py-8 text-center animate-fade-in-up">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">商务资源</h1>
      <p className="text-sm text-gray-400 mb-6">功能开发中，敬请期待</p>
      <Link href="/business" className="text-sm text-blue-500 hover:underline">查看商务列表 →</Link>
    </div>
  )
}
