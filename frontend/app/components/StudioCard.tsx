'use client'

import Link from 'next/link'
import type { StudioListItem } from '@/lib/types'

interface StudioCardProps {
  studio: StudioListItem
}

export function StudioCard({ studio }: StudioCardProps) {
  const location = [studio.city, studio.district].filter(Boolean).join(' · ')

  return (
    <Link href={`/studios/${studio.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100/60 card-lift">
        {/* 封面区 */}
        <div className="h-40 sm:h-44 bg-gradient-to-br from-studio-100 via-studio-50 to-amber-50 relative">
          {studio.cover_image ? (
            <img src={studio.cover_image} alt={studio.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-60">🎙</span>
            </div>
          )}
          {/* 城市标签 */}
          {location && (
            <span className="absolute top-3 left-3 bg-white/85 backdrop-blur-sm text-[11px] font-medium text-gray-600 px-2 py-1 rounded-lg shadow-sm">
              {location}
            </span>
          )}
        </div>

        {/* 信息区 */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 truncate leading-snug">
            {studio.name}
          </h3>

          {/* 价格 */}
          <div className="flex items-baseline gap-1.5 mb-2.5">
            {studio.price_per_hour ? (
              <>
                <span className="text-lg font-bold text-studio-600">¥{studio.price_per_hour}</span>
                <span className="text-[10px] text-gray-400">/小时</span>
              </>
            ) : studio.price_per_day ? (
              <>
                <span className="text-lg font-bold text-studio-600">¥{studio.price_per_day}</span>
                <span className="text-[10px] text-gray-400">/天</span>
              </>
            ) : (
              <span className="text-xs text-gray-400">价格详询</span>
            )}
          </div>

          {/* 标签 */}
          {studio.tags && studio.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {studio.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
