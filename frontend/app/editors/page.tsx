'use client'

import { useState, useEffect } from 'react'
import { editorsApi } from '@/lib/api'
import type { EditorListItem } from '@/lib/types'
import { EditorCard } from '@/app/components/EditorCard'
import { SearchBar } from '@/app/components/SearchBar'
import { EmptyState } from '@/app/components/EmptyState'
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 sm:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">剪辑师</h1>
          <p className="text-sm text-gray-500 mt-1">共 {total} 位剪辑师</p>
        </div>
        <Link
          href="/editors/new"
          className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors"
        >
          + 添加剪辑师
        </Link>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="搜索剪辑师..." />
      </div>

      {loading ? (
        <LoadingState />
      ) : editors.length === 0 ? (
        <EmptyState
          icon="✂️"
          message="暂无剪辑师信息"
          action={{ label: '添加第一位剪辑师', href: '/editors/new' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {editors.map(editor => (
            <EditorCard key={editor.id} editor={editor} />
          ))}
        </div>
      )}
    </div>
  )
}
