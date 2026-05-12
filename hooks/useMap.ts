/**
 * 高德地图生命周期管理
 *
 * 职责：
 * - AMap JS SDK 脚本动态加载（含重试）
 * - 地图实例初始化 & 销毁
 * - hover 弹窗时序控制
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { AMAP_KEY, CITY_CENTERS } from '@/lib/constants'

// ---- 脚本加载（模块级单例，避免重复加载） ----

let amapScriptPromise: Promise<void> | null = null

function createAmapScript(): HTMLScriptElement {
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

// ---- Hook ----

export function useMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const hoverInfoRef = useRef<any>(null)
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [mapLoading, setMapLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  const initMap = useCallback(() => {
    if (!mapContainer.current || !(window as any).AMap) return
    if (mapRef.current) {
      mapRef.current.destroy()
      mapRef.current = null
    }
    const AMap = (window as any).AMap
    const map = new AMap.Map(mapContainer.current, {
      zoom: 11.5,
      center: CITY_CENTERS['上海'],
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

  const destroyMap = useCallback(() => {
    setIsMapReady(false)
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current)
      hoverCloseTimerRef.current = null
    }
    hoverInfoRef.current?.close()
    hoverInfoRef.current = null
    if (mapRef.current) {
      mapRef.current.destroy()
      mapRef.current = null
    }
  }, [])

  // 地图加载 & 销毁
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

    return () => {
      cancelled = true
      destroyMap()
    }
  }, [initMap, destroyMap])

  // hover 时序控制
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

  return {
    mapContainer,
    mapRef,
    hoverInfoRef,
    isMapReady,
    mapLoading,
    mapError,
    cancelHoverClose,
    scheduleHoverClose,
  }
}
