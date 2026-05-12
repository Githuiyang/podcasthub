'use client'

import Link from 'next/link'
import type { EditorListItem } from '@/lib/types'

interface EditorCardProps {
  editor: EditorListItem
}

export function EditorCard({ editor }: EditorCardProps) {
  return (
    <Link href={`/editors/${editor.id}`}>
      <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 flex flex-col items-center text-center">
        {/* 头像 */}
        <div className="w-18 h-18 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden mb-3 w-[72px] h-[72px]">
          {editor.avatar ? (
            <img src={editor.avatar} alt={editor.name} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-8 h-8 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          )}
        </div>

        {/* 姓名 */}
        <h3 className="text-sm font-semibold text-slate-900">{editor.name}</h3>

        {/* 类型 + 状态 */}
        <div className="flex items-center gap-1.5 mt-1">
          {editor.editor_type && (
            <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full">{editor.editor_type}</span>
          )}
          {editor.availability_status && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              editor.availability_status === '可接单'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-slate-50 text-slate-400'
            }`}>
              {editor.availability_status}
            </span>
          )}
        </div>

        {/* 简介 */}
        {editor.bio && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{editor.bio}</p>
        )}

        {/* 代表作 */}
        {editor.portfolio_works && (
          <p className="text-xs text-slate-400 mt-2 line-clamp-1 italic">「{editor.portfolio_works.split(/[，,、\n]/)[0]}」</p>
        )}

        {/* 报价 */}
        {editor.price_per_episode ? (
          <p className="text-sm font-medium text-slate-900 mt-3">
            ¥{editor.price_per_episode}<span className="text-xs text-slate-400 font-normal">/期</span>
          </p>
        ) : editor.price_note ? (
          <p className="text-xs text-slate-400 mt-3">{editor.price_note}</p>
        ) : null}
      </div>
    </Link>
  )
}
