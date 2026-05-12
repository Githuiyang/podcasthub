'use client'

import type { Studio } from '@/lib/types'

interface StudioDetailImageTabProps {
  studio: Studio
}

/**
 * 图片 Tab
 *
 * 承载封面图或空状态，作为次级查看内容。
 */
export function StudioDetailImageTab({ studio }: StudioDetailImageTabProps) {
  return (
    <div className="flex items-center justify-center py-8">
      {studio.cover_image ? (
        <img
          src={studio.cover_image}
          alt={studio.name}
          className="w-full max-h-[60vh] object-contain rounded-2xl"
        />
      ) : (
        <div className="rounded-[24px] border border-black/5 bg-neutral-50 px-10 py-8 text-center">
          <div className="text-5xl opacity-50">🎙</div>
          <div className="mt-3 text-sm text-slate-400">录音间实景图待补充</div>
        </div>
      )}
    </div>
  )
}
