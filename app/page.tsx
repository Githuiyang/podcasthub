'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { studiosApi } from '@/lib/api'
import type { Studio, StudioListItem } from '@/lib/types'
import { CITY_CENTERS, NATIONAL_MAP_CENTER, NATIONAL_MAP_ZOOM } from '@/lib/constants'
import { useMap } from '@/hooks/useMap'
import { useStudios } from '@/hooks/useStudios'
import { useMapMarkers } from '@/hooks/useMapMarkers'
import { StudioRecruitmentFab } from '@/app/components/StudioRecruitmentFab'
import { StudioDetailInfoTab } from '@/app/components/StudioDetailInfoTab'
import { StudioDetailImageTab } from '@/app/components/StudioDetailImageTab'
import { FeedbackModal } from '@/app/components/FeedbackModal'

export default function HomePage() {
  // ---- 地图生命周期 ----
  const {
    mapContainer, mapRef, hoverInfoRef,
    isMapReady, mapLoading, mapError,
    cancelHoverClose, scheduleHoverClose,
  } = useMap()

  // ---- 数据加载 ----
  const {
    studios, studiosLoading,
    selectedCity, cities,
    handleCitySelect: setSelectedCity,
  } = useStudios()

  // ---- 弹窗状态 ----
  const detailRequestIdRef = useRef(0)
  const [selectedPreview, setSelectedPreview] = useState<StudioListItem | null>(null)
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'image'>('info')
  const [studioFeedbackOpen, setStudioFeedbackOpen] = useState(false)

  const openStudioModal = useCallback((studio: StudioListItem) => {
    detailRequestIdRef.current += 1
    const requestId = detailRequestIdRef.current
    setSelectedPreview(studio)
    setSelectedStudio(null)
    setActiveDetailTab('info')
    setModalOpen(true)
    setModalLoading(true)
    hoverInfoRef.current?.close()

    studiosApi.detail(studio.id)
      .then(res => {
        if (detailRequestIdRef.current === requestId) setSelectedStudio(res.data)
      })
      .catch(() => {
        if (detailRequestIdRef.current === requestId) setSelectedStudio(null)
      })
      .finally(() => {
        if (detailRequestIdRef.current === requestId) setModalLoading(false)
      })
  }, [hoverInfoRef])

  const closeStudioModal = useCallback(() => {
    detailRequestIdRef.current += 1
    setModalOpen(false)
    setSelectedPreview(null)
    setSelectedStudio(null)
    setModalLoading(false)
  }, [])

  // ---- 窗口事件（高德 InfoWindow 内联事件桥接） ----
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

  // ---- 城市切换（含地图居中） ----
  const handleCitySelect = useCallback((city: string) => {
    setSelectedCity(city)
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
  }, [setSelectedCity, closeStudioModal, hoverInfoRef, mapRef])

  // ---- 地图标记渲染 ----
  useMapMarkers({
    mapRef, isMapReady, studios, selectedCity,
    hoverInfoRef, cancelHoverClose, scheduleHoverClose,
    onCitySelect: handleCitySelect,
    onStudioOpen: openStudioModal,
  })

  // ---- 渲染 ----
  return (
    <>
      <div className="relative h-[calc(100vh-96px)] sm:h-[calc(100vh-48px)]">
        <h1 className="sr-only">PodcastHub - 中国播客录音室展示与选择平台</h1>
        <div ref={mapContainer} className="w-full h-full" />

        {/* 加载 / 错误覆盖层 */}
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

        {/* 顶部城市筛选 */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2">
          <div className="flex gap-1.5 overflow-x-auto bg-white/90 backdrop-blur-lg rounded-xl px-2 py-1.5 shadow-sm border border-gray-100/60 city-scroll">
            <button
              onClick={() => handleCitySelect('')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCity === '' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              全部
            </button>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCity === city ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <StudioRecruitmentFab />

        {/* 详情弹窗 */}
        {modalOpen && (
          <div
            className="absolute inset-0 z-30 bg-black/22 backdrop-blur-[2px] px-4 py-6 sm:px-8 sm:py-10"
            onClick={closeStudioModal}
          >
            <div className="mx-auto flex h-full max-w-2xl items-center justify-center">
              <div
                className="w-full max-h-[88vh] overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.16)]"
                onClick={e => e.stopPropagation()}
              >
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
                  <button
                    onClick={closeStudioModal}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                  >
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
                    <div className="flex min-h-[320px] items-center justify-center text-sm text-slate-400">
                      加载详情中...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
