'use client'

import { useState, useEffect } from 'react'
import { editorsApi } from '@/lib/api'
import type { EditorListItem } from '@/lib/types'
import { EditorCard } from '@/app/components/EditorCard'
import { SearchBar } from '@/app/components/SearchBar'
import { LoadingState } from '@/app/components/LoadingState'
import Link from 'next/link'

export default function EditorsPage() {
  const [editors, setEditors] = useState<EditorListItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    editorsApi
      .list({ search: search || undefined })
      .then(res => {
        setEditors(res.data.items)
        setTotal(res.data.total)
      })
      .catch(() => setEditors([]))
      .finally(() => setLoading(false))
  }, [search])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 sm:pb-0 animate-fade-in-up">
      {/* 标题区 */}
      <div className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">剪辑师 / 制作人</h1>
            <p className="text-sm text-slate-400 mt-1">
              {total > 0 ? `共 ${total} 位制作人` : '发现你的播客剪辑合作伙伴'}
            </p>
          </div>
          <Link
            href="/business"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            商务合作 &rarr;
          </Link>
        </div>
      </div>

      {/* 搜索 */}
      <div className="mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="搜索剪辑师..." />
      </div>

      {loading ? (
        <LoadingState />
      ) : editors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <p className="text-slate-500 mb-2">暂无剪辑师信息</p>
          <p className="text-xs text-slate-400">正在征集优秀的播客剪辑师，敬请期待</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {editors.map(editor => (
            <EditorCard key={editor.id} editor={editor} />
          ))}
        </div>
      )}

      {/* 报名入口 */}
      <div className="mt-10 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">你也是播客剪辑师？</p>
        <a
          href="https://www.wjx.top/vm/YOUR_FORM_ID.aspx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-slate-700 mt-1 inline-block transition-colors"
        >
          加入制作人名录 &rarr;
        </a>
      </div>
    </div>
  )
}
