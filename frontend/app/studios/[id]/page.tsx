'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { studiosApi } from '@/lib/api'
import type { Studio } from '@/lib/types'
import { ContactInfo } from '@/app/components/ContactInfo'
import { TagList } from '@/app/components/TagList'
import { LoadingState } from '@/app/components/LoadingState'

export default function StudioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [studio, setStudio] = useState<Studio | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studiosApi
      .detail(Number(params.id))
      .then(res => setStudio(res.data))
      .catch(() => setStudio(null))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <LoadingState />
  if (!studio) {
    return (
      <div className="text-center py-20">
        <span className="text-4xl block mb-3">🤷</span>
        <p className="text-sm text-gray-400 mb-4">录音间不存在</p>
        <button onClick={() => router.push('/studios')} className="text-sm text-podcast-500 hover:underline">返回列表</button>
      </div>
    )
  }

  const location = [studio.city, studio.district].filter(Boolean).join(' · ')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 sm:pb-0 animate-fade-in-up">
      <div className="max-w-xl mx-auto">
      {/* 返回 */}
      <button
        onClick={() => router.push('/studios')}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回录音间
      </button>

      {/* 封面图 */}
      <div className="h-52 sm:h-64 bg-gradient-to-br from-studio-100 via-studio-50 to-amber-50 rounded-2xl overflow-hidden mb-4 relative">
        {studio.cover_image ? (
          <img src={studio.cover_image} alt={studio.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-40">🎙</span>
          </div>
        )}
      </div>

      {/* 名片主体 */}
      <div className="space-y-3">
        {/* 名称 + 位置 */}
        <div className="card-section">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-1.5">{studio.name}</h1>
          {location && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {location}
            </p>
          )}
          {studio.address && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              {studio.address}
            </p>
          )}
          {studio.tags && studio.tags.length > 0 && (
            <div className="mt-3">
              <TagList tags={studio.tags} color="bg-studio-50 text-studio-600" />
            </div>
          )}
        </div>

        {/* 价格 */}
        {(studio.price_per_hour || studio.price_per_day || studio.price_note) && (
          <div className="card-section">
            <h2 className="card-section-title">价格</h2>
            <div className="flex gap-5">
              {studio.price_per_hour ? (
                <div>
                  <p className="text-2xl font-bold text-studio-600">¥{studio.price_per_hour}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">每小时</p>
                </div>
              ) : null}
              {studio.price_per_day ? (
                <div>
                  <p className="text-2xl font-bold text-studio-600">¥{studio.price_per_day}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">每天</p>
                </div>
              ) : null}
              {!studio.price_per_hour && !studio.price_per_day && (
                <p className="text-sm text-gray-500">详询</p>
              )}
            </div>
            {studio.price_note && <p className="text-xs text-gray-400 mt-3">{studio.price_note}</p>}
          </div>
        )}

        {/* 介绍 */}
        {studio.description && (
          <div className="card-section">
            <h2 className="card-section-title">介绍</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{studio.description}</p>
          </div>
        )}

        {/* 设备 */}
        {(studio.equipment && studio.equipment.length > 0) && (
          <div className="card-section">
            <h2 className="card-section-title">设备</h2>
            <TagList tags={studio.equipment} color="bg-gray-50 text-gray-600" />
            {studio.room_features && studio.room_features.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] text-gray-300 mb-1.5">房间特性</p>
                <TagList tags={studio.room_features} color="bg-blue-50 text-blue-600" />
              </div>
            )}
            {studio.room_count > 1 && (
              <p className="text-xs text-gray-400 mt-3">共 {studio.room_count} 间录音室</p>
            )}
          </div>
        )}

        {/* 作品 */}
        {studio.portfolio_images && studio.portfolio_images.length > 0 && (
          <div className="card-section">
            <h2 className="card-section-title">作品</h2>
            <div className="grid grid-cols-2 gap-2">
              {studio.portfolio_images.map((img, i) => (
                <div key={i} className="h-28 rounded-xl overflow-hidden bg-gray-50">
                  <img src={img} alt={`作品 ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 报名方式 — 核心CTA */}
        {(studio.booking_url || studio.booking_note) && (
          <div className="card-section">
            {studio.booking_url ? (
              <a
                href={studio.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-studio-400 to-studio-500 text-white text-sm font-semibold rounded-xl hover:from-studio-500 hover:to-studio-600 transition-all active:scale-[0.98] shadow-sm"
              >
                立即预约
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            ) : null}
            {studio.booking_note && (
              <p className="text-xs text-gray-400 mt-2.5 text-center">{studio.booking_note}</p>
            )}
          </div>
        )}

        {/* 联系方式 */}
        {(studio.contact_name || studio.contact_phone || studio.contact_wechat) && (
          <div className="card-section">
            <h2 className="card-section-title">联系方式</h2>
            <ContactInfo
              name={studio.contact_name}
              phone={studio.contact_phone}
              wechat={studio.contact_wechat}
            />
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
