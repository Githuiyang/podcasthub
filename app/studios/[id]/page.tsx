'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { studiosApi } from '@/lib/api'
import type { Studio } from '@/lib/types'
import { TagList } from '@/app/components/TagList'
import { LoadingState } from '@/app/components/LoadingState'
import { StudioTransitGrid } from '@/app/components/StudioTransitGrid'
import { StudioReviewSection } from '@/app/components/StudioReviewSection'
import { StudioReviewModal } from '@/app/components/StudioReviewModal'
import { FeedbackModal } from '@/app/components/FeedbackModal'
import {
  getStudioDisplayAddress,
  getStudioBookingSummary,
  getStudioContactSummary,
  getStudioDescriptionBody,
  getStudioOpenHours,
  getStudioPriceSupplement,
  getStudioPriceText,
  shouldShowChargingMethodAsSupplement,
  getStudioCapacityText,
  getStudioVideoEquipmentText,
} from '@/lib/studioPresentation'

export default function StudioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [studio, setStudio] = useState<Studio | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

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
        <p className="text-sm text-slate-400 mb-4">录音间不存在</p>
        <button onClick={() => router.push('/studios')} className="text-sm text-podcast-500 hover:underline">返回列表</button>
      </div>
    )
  }

  const address = getStudioDisplayAddress(studio)
  const bookingSummary = getStudioBookingSummary(studio)
  const contactSummary = getStudioContactSummary(studio)
  const descriptionBody = getStudioDescriptionBody(studio)
  const openHours = getStudioOpenHours(studio)
  const priceSupplement = getStudioPriceSupplement(studio)
  const priceText = getStudioPriceText(studio)
  const showChargingMethod = shouldShowChargingMethodAsSupplement(studio)
  const capacityText = getStudioCapacityText(studio)
  const videoEquipText = getStudioVideoEquipmentText(studio)
  const hasContact = Boolean(contactSummary)
  const hasPrice = studio.price_per_hour || studio.price_per_day || studio.price_note || studio.charging_method
  const hasEquipment = studio.equipment && studio.equipment.length > 0
  const hasRoomInfo = Boolean(capacityText || videoEquipText || (studio.room_count && studio.room_count > 1))
  const hasBooking = Boolean(studio.booking_url || bookingSummary || studio.booking_qr_image)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 sm:pb-0 animate-fade-in-up">
      <div className="max-w-xl mx-auto">
        {/* 返回 */}
        <button
          onClick={() => router.push('/studios')}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mb-3 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回录音间
        </button>

        {/* 封面图 */}
        <div className="h-52 sm:h-64 bg-gradient-to-br from-studio-100 via-studio-50 to-amber-50 rounded-2xl overflow-hidden mb-5 relative">
          {studio.cover_image ? (
            <img src={studio.cover_image} alt={studio.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl opacity-40">🎙</span>
            </div>
          )}
        </div>

        {/* ── 1. 名称 + 地址 ── */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{studio.name}</h1>
          {studio.city && (
            <span className="text-xs text-slate-400 mt-0.5 inline-block">{studio.city}{studio.district ? ` · ${studio.district}` : ''}</span>
          )}
          {address && (
            <p className="text-sm text-slate-500 mt-1.5 flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {address}
            </p>
          )}
          {studio.tags && studio.tags.length > 0 && (
            <div className="mt-3">
              <TagList tags={studio.tags} color="bg-studio-50 text-studio-600" />
            </div>
          )}
        </div>

        {/* ── 2. 价格 ── */}
        {hasPrice && (
          <div className="mb-5 pb-5 border-b border-slate-100">
            <div className="text-sm">
              <span className="font-bold text-slate-900 text-base">{priceText}</span>
              {showChargingMethod && (
                <span className="ml-2 text-sm text-slate-400">{studio.charging_method}</span>
              )}
            </div>
            {priceSupplement && priceSupplement !== priceText && (
              <p className="text-xs text-slate-400 mt-1.5">{priceSupplement}</p>
            )}
          </div>
        )}

        {/* ── 3. 预约与联系（核心决策区块） ── */}
        {(hasBooking || hasContact) && (
          <div className="mb-5 pb-5 border-b border-slate-100 space-y-3">
            {/* 预约链接 CTA */}
            {studio.booking_url && (
              <a
                href={studio.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                前往预约
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            )}

            {/* 预约二维码 */}
            {studio.booking_qr_image && (
              <div className="flex items-start gap-3">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-white border border-slate-100 shrink-0">
                  <img src={studio.booking_qr_image} alt="预约二维码" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">扫码预约</p>
                  <p className="text-[11px] text-slate-400 mt-1">微信扫码即可打开预约页</p>
                </div>
              </div>
            )}

            {/* 预约说明 */}
            {bookingSummary && (
              <p className="text-sm text-slate-500">{bookingSummary}</p>
            )}

            {/* 联系方式 */}
            {hasContact && (
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 mt-0.5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span>{contactSummary}</span>
              </div>
            )}

            {/* 无预约无联系时的兜底 */}
            {!hasBooking && !hasContact && (
              <p className="text-sm text-slate-400">暂无预约与联系信息</p>
            )}
          </div>
        )}

        {/* ── 4. 开放时间 ── */}
        {openHours && (
          <div className="mb-5 pb-5 border-b border-slate-100">
            <div className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 mb-1.5">开放时间</div>
            <p className="text-sm text-slate-600">{openHours}</p>
          </div>
        )}

        {/* ── 5. 设备 + 房间（合并） ── */}
        {(hasEquipment || hasRoomInfo) && (
          <div className="mb-5 pb-5 border-b border-slate-100">
            {hasEquipment && (
              <div className="mb-3">
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 mb-2">设备</div>
                <TagList tags={studio.equipment!} color="bg-slate-50 text-slate-600" />
              </div>
            )}
            {hasRoomInfo && (
              <div>
                {!hasEquipment && <div className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 mb-2">房间信息</div>}
                <div className="flex flex-wrap gap-2">
                  {capacityText && <span className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-500">{capacityText}</span>}
                  {videoEquipText && <span className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-500">{videoEquipText}</span>}
                  {studio.room_count > 1 && <span className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-500">共 {studio.room_count} 间</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 6. 介绍 ── */}
        {descriptionBody && (
          <div className="mb-5 pb-5 border-b border-slate-100">
            <div className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 mb-2">介绍</div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{descriptionBody}</p>
          </div>
        )}

        {/* ── 7. 交通枢纽 ── */}
        <StudioTransitGrid studio={studio} title="交通枢纽距离与打车时间" />

        {/* ── 8. 作品图 ── */}
        {studio.portfolio_images && studio.portfolio_images.length > 0 && (
          <div className="mt-5 pb-5 border-b border-slate-100">
            <div className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 mb-2">作品</div>
            <div className="grid grid-cols-2 gap-2">
              {studio.portfolio_images.map((img, i) => (
                <div key={i} className="h-28 rounded-xl overflow-hidden bg-slate-50">
                  <img src={img} alt={`作品 ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 9. 体验反馈 ── */}
        <StudioReviewSection studioId={studio.id} onWriteReview={() => setReviewModalOpen(true)} />

        {/* ── 10. 信息反馈弱入口 ── */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            onClick={() => setFeedbackOpen(true)}
            className="text-xs text-slate-300 hover:text-slate-500 transition-colors"
          >
            信息有误？告诉我们
          </button>
        </div>
      </div>

      <StudioReviewModal
        studioId={studio.id}
        studioName={studio.name}
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={() => {}}
      />

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        studioContext={{ studio_id: studio.id, studio_name: studio.name, source: 'web_detail' }}
      />
    </div>
  )
}
