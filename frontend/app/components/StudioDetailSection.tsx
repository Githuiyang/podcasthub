import type { ReactNode } from 'react'

interface StudioDetailSectionProps {
  title: string
  children: ReactNode
}

/**
 * 详情弹窗内的信息分区
 *
 * 统一的"小标题 + 内容"容器，保持阅读节奏一致。
 * 视觉克制：不加背景色、不加粗边框，只用一条细分隔线。
 */
export function StudioDetailSection({ title, children }: StudioDetailSectionProps) {
  return (
    <section>
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-2">
        {title}
      </div>
      {children}
    </section>
  )
}
