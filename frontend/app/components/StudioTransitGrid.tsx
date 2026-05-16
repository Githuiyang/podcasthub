'use client'

import { formatDistance, formatTaxiMinutes, getStudioTransitItems } from '@/lib/studioTransport'
import type { Studio, StudioListItem } from '@/lib/types'

interface StudioTransitGridProps {
  studio: Pick<Studio | StudioListItem, 'city' | 'longitude' | 'latitude'>
  title?: string
}

export function StudioTransitGrid({ studio, title = '交通枢纽预估' }: StudioTransitGridProps) {
  const transitItems = getStudioTransitItems(studio)

  if (transitItems.length === 0) return null

  return (
    <div className="rounded-3xl border border-black/6 bg-neutral-50 p-4">
      <div className="text-xs font-semibold tracking-[0.08em] text-slate-500">{title}</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {transitItems.map(item => (
          <div key={item.name} className="rounded-2xl border border-black/6 bg-white px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">{item.shortName}</div>
            <div className="mt-1 text-sm text-slate-500">约 {formatDistance(item.distanceKm)}</div>
            <div className="mt-1 text-sm font-medium text-slate-700">打车约 {formatTaxiMinutes(item.taxiMinutes)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
