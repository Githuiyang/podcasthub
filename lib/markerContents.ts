/**
 * 高德地图标记 HTML 内容构建函数（纯函数，无 React 依赖）
 */
import type { StudioListItem } from './types'
import { getStudioDisplayAddress } from './studioPresentation'
import { getStudioTransitItems, formatDistance, formatTaxiMinutes } from './studioTransport'

/** HTML 转义，防止 XSS */
export function escapeMarkerText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function buildStudioHoverContent(studio: StudioListItem): string {
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
}

export function buildHubMarkerContent(shortName: string): string {
  return `
    <div style="display:flex; align-items:center; gap:8px;">
      <div style="width:14px; height:14px; border-radius:999px; background:linear-gradient(135deg,#2563eb,#0ea5e9); box-shadow:0 0 0 5px rgba(59,130,246,0.16), 0 8px 18px rgba(37,99,235,0.28); border:2px solid rgba(255,255,255,0.95);"></div>
      <div style="padding:6px 10px; border-radius:999px; background:rgba(255,255,255,0.94); border:1px solid rgba(191,219,254,0.8); box-shadow:0 10px 26px rgba(37,99,235,0.12); color:#1d4ed8; font-size:11px; font-weight:700; white-space:nowrap;">${escapeMarkerText(shortName)}</div>
    </div>
  `
}

export function buildHubHoverContent(hubName: string): string {
  return `
    <div style="width: 220px; background: rgba(255,255,255,0.96); border: 1px solid rgba(191,219,254,0.8); border-radius: 18px; box-shadow: 0 18px 50px rgba(15,23,42,0.18); backdrop-filter: blur(18px); padding: 14px 14px 12px;">
      <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.04em; color: #2563eb; margin-bottom: 6px;">交通枢纽</div>
      <div style="font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.35;">${escapeMarkerText(hubName)}</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 6px; line-height: 1.45;">可结合录音间 hover 卡中的距离信息，快速判断来回交通成本。</div>
    </div>
  `
}

export function buildCityAggregateMarkerContent(cityName: string, count: number): string {
  return `
    <div style="display:flex; flex-direction:column; align-items:center; transform: translateY(-8px);">
      <div style="display:flex; align-items:center; gap:6px; padding:8px 12px; border-radius:16px; background:rgba(17,24,39,0.94); box-shadow:0 16px 30px rgba(15,23,42,0.18); color:#fff; white-space:nowrap;">
        <div style="font-size:13px; font-weight:700; line-height:1;">${escapeMarkerText(cityName)}</div>
        <div style="min-width:24px; height:24px; padding:0 8px; border-radius:999px; background:#fff; color:#111827; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; line-height:1;">${count}</div>
      </div>
      <div style="margin-top:8px; width:12px; height:12px; border-radius:999px; background:#111827; box-shadow:0 0 0 6px rgba(17,24,39,0.12);"></div>
    </div>
  `
}

export function buildCityAggregateHoverContent(cityName: string, count: number): string {
  return `
    <div style="width: 220px; background: rgba(255,255,255,0.98); border: 1px solid rgba(226,232,240,0.9); border-radius: 18px; box-shadow: 0 18px 50px rgba(15,23,42,0.16); padding: 14px 14px 12px;">
      <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.04em; color: #64748b; margin-bottom: 6px;">全国概览</div>
      <div style="font-size: 16px; font-weight: 800; color: #111827; line-height: 1.35;">${escapeMarkerText(cityName)}</div>
      <div style="margin-top: 6px; font-size: 12px; color: #475569; line-height: 1.5;">当前收录 <strong>${count}</strong> 家录音间</div>
      <div style="margin-top: 10px; font-size: 11px; font-weight: 700; color: #111827;">点击查看城市内具体录音间</div>
    </div>
  `
}
