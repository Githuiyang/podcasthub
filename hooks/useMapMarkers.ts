/**
 * 地图标记渲染
 *
 * 根据录音间数据、当前城市、地图状态，自动更新高德地图上的标记（含交通枢纽标记）。
 */
import { useEffect, useRef } from 'react'
import type { StudioListItem } from '@/lib/types'
import { CITY_CENTERS, NATIONAL_MAP_CENTER, NATIONAL_MAP_ZOOM } from '@/lib/constants'
import {
  escapeMarkerText,
  buildStudioHoverContent,
  buildHubMarkerContent,
  buildHubHoverContent,
  buildCityAggregateMarkerContent,
  buildCityAggregateHoverContent,
} from '@/lib/markerContents'
import { getCityHubs } from '@/lib/studioTransport'

interface UseMapMarkersParams {
  mapRef: React.MutableRefObject<any>
  isMapReady: boolean
  studios: StudioListItem[]
  selectedCity: string | null
  hoverInfoRef: React.MutableRefObject<any>
  cancelHoverClose: () => void
  scheduleHoverClose: () => void
  onCitySelect: (city: string) => void
  onStudioOpen: (studio: StudioListItem) => void
}

export function useMapMarkers({
  mapRef, isMapReady, studios, selectedCity,
  hoverInfoRef, cancelHoverClose, scheduleHoverClose,
  onCitySelect, onStudioOpen,
}: UseMapMarkersParams) {
  const markersRef = useRef<any[]>([])
  const hubMarkersRef = useRef<any[]>([])

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
      // 全国概览：按城市聚合
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

        marker.on('mouseout', () => scheduleHoverClose())

        marker.on('click', () => {
          cancelHoverClose()
          onCitySelect(aggregate.city)
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

    // 单城市视图：交通枢纽 + 录音间标记
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

        hubMarker.on('mouseout', () => scheduleHoverClose())

        mapRef.current.add(hubMarker)
        hubMarkersRef.current.push(hubMarker)
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

      marker.on('mouseout', () => scheduleHoverClose())

      marker.on('click', () => {
        cancelHoverClose()
        onStudioOpen(studio)
        mapRef.current.setCenter([studio.longitude, studio.latitude])
      })

      mapRef.current.add(marker)
      markersRef.current.push(marker)
    })

    if (validStudios.length > 0) {
      mapRef.current.setFitView(markersRef.current, false, [80, 120, 80, 120])
    }
  }, [
    isMapReady, studios, selectedCity,
    cancelHoverClose, scheduleHoverClose,
    onCitySelect, onStudioOpen,
  ])
}
