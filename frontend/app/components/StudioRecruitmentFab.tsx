'use client'

import { useState } from 'react'
import Link from 'next/link'

/**
 * 录音室征集悬浮按钮（场景化弱入口）
 *
 * 入口策略：导航栏"添加我的录音室"为全站主入口，本 FAB 为首页地图场景化辅助入口。
 * - 默认：轻量灰色 "+" 按钮（视觉弱于导航栏主按钮）
 * - 桌面端 hover / 移动端 click → 展开征集提示 + 弱 CTA
 * - 离开或再次点击 → 收回
 */
export function StudioRecruitmentFab() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="absolute right-3 top-16 z-10 sm:top-3"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* 展开态 */}
      {expanded && (
        <div className="mb-2 max-w-[240px] rounded-2xl border border-slate-200/80 bg-white/95 px-3.5 py-3 shadow-md backdrop-blur-lg animate-fade-in-up">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            录音室征集
          </div>
          <div className="mt-0.5 text-[13px] leading-5 text-slate-600">
            想把你的播客录音室收录到 PodcastHub？
          </div>
          <Link
            href="/submit-studio"
            className="mt-2.5 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            收录录音室
          </Link>
        </div>
      )}

      {/* 收起态 "+" 按钮 — 轻量灰色，视觉弱于导航栏主入口 */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 border border-slate-200/80 text-slate-400 shadow-sm hover:bg-white hover:text-slate-600 hover:border-slate-300 transition-colors backdrop-blur-lg"
        aria-label="收录录音室"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="8" y1="2" x2="8" y2="14" />
          <line x1="2" y1="8" x2="14" y2="8" />
        </svg>
      </button>
    </div>
  )
}
