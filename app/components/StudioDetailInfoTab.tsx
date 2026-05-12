'use client'

import Link from 'next/link'
import type { Studio } from '@/lib/types'
import {
  getStudioDisplayAddress,
  getStudioBookingSummary,
  getStudioContactSummary,
  getStudioDescriptionBody,
  getStudioOpenHours,
  getStudioPriceSupplement,
  getStudioPriceText,
  shouldShowChargingMethodAsSupplement,
} from '@/lib/studioPresentation'
import { StudioTransitGrid } from '@/app/components/StudioTransitGrid'
import { StudioDetailSection } from '@/app/components/StudioDetailSection'

interface StudioDetailInfoTabProps {
  studio: Studio
  onClose: () => void
  onStudioFeedback?: () => void
}

/**
 * 录音室信息 Tab
 *
 * 内容按优先级排布：
 * 1. 名称 + 描述
 * 2. 地址
 * 3. 预约方式 / 开放时间 / 价格（"使用与预约"信息组）
 * 4. 联系方式
 * 5. 交通枢纽预估
 */
export function StudioDetailInfoTab({ studio, onClose, onStudioFeedback }: StudioDetailInfoTabProps) {
  const descriptionBody = getStudioDescriptionBody(studio)
  const address = getStudioDisplayAddress(studio)
  const openHours = getStudioOpenHours(studio)
  const bookingSummary = getStudioBookingSummary(studio)
  const priceSupplement = getStudioPriceSupplement(studio)
  const contactSummary = getStudioContactSummary(studio)
  const hasContact = Boolean(contactSummary)

  const priceText = getStudioPriceText(studio)
  const showChargingMethodAsSupplement = shouldShowChargingMethodAsSupplement(studio)

  return (
    <div className="space-y-6">
      {/* ── 第 1 区块：名称 + 描述 ── */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {studio.name}
        </h2>
        {studio.room_count != null && studio.room_count > 1 && (
          <span className="mt-1.5 inline-block text-xs text-slate-400">
            {studio.room_count} 间录音室
          </span>
        )}
        <p className="mt-2 text-sm leading-relaxed text-slate-500 whitespace-pre-line">
          {descriptionBody || '暂无补充介绍'}
        </p>
      </div>

      {/* ── 第 2 区块：地址 ── */}
      <StudioDetailSection title="地址">
        <p className="text-sm text-slate-700">{address || '地址待补充'}</p>
      </StudioDetailSection>

      {/* ── 第 3 区块：预约与使用信息 ── */}
      <StudioDetailSection title="预约与使用">
        <div className="space-y-3">
          {/* 价格 */}
          <div>
            <div className="text-xs text-slate-400 mb-1">价格</div>
            <div className="text-sm">
              <span className="font-semibold text-slate-900">{priceText}</span>
              {showChargingMethodAsSupplement && (
                <span className="ml-2 text-slate-500">{studio.charging_method}</span>
              )}
            </div>
            {priceSupplement && priceSupplement !== priceText && (
              <div className="mt-1 text-sm text-slate-500">{priceSupplement}</div>
            )}
          </div>

          {/* 开放时间 */}
          <div>
            <div className="text-xs text-slate-400 mb-1">开放时间</div>
            <p className="text-sm text-slate-700">
              {openHours || '建议预约前联系确认开放时段'}
            </p>
          </div>

          {/* 预约方式 */}
          <div>
            <div className="text-xs text-slate-400 mb-1">预约方式</div>
            <div className="space-y-2">
              {studio.booking_url && (
                <a
                  href={studio.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  立即预约
                </a>
              )}
              {studio.booking_qr_image && (
                <div className="mt-2">
                  <p className="text-xs text-slate-500 mb-1.5">扫码预约</p>
                  <div className="w-32 h-32 rounded-xl overflow-hidden bg-white border border-slate-100">
                    <img src={studio.booking_qr_image} alt="预约二维码" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
              <p className="text-sm leading-relaxed text-slate-500">
                {bookingSummary || (!studio.booking_url && !studio.booking_qr_image ? '请通过联系方式确认预约方式。' : '')}
              </p>
            </div>
          </div>
        </div>
      </StudioDetailSection>

      {/* ── 第 4 区块：联系方式 ── */}
      <StudioDetailSection title="联系方式">
        <p className="text-sm text-slate-700">
          {hasContact
            ? contactSummary
            : '暂无公开联系方式'}
        </p>
      </StudioDetailSection>

      {/* ── 第 5 区块：交通枢纽预估 ── */}
      <StudioTransitGrid studio={studio} />

      {/* ── 底部操作 ── */}
      <div className="flex gap-3 pt-2">
        <Link
          href={`/studios/${studio.id}`}
          className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          打开独立详情页
        </Link>
        <button
          onClick={onClose}
          className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
        >
          关闭
        </button>
      </div>

      {/* ── 信息反馈弱入口 ── */}
      {onStudioFeedback && (
        <div className="text-center pt-3">
          <button
            onClick={onStudioFeedback}
            className="text-[11px] text-slate-300 hover:text-slate-500 transition-colors"
          >
            信息有误？告诉我们
          </button>
        </div>
      )}
    </div>
  )
}
