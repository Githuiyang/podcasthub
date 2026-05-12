'use client'

import { useState, useEffect } from 'react'
import { businessApi } from '@/lib/api'
import type { BusinessListItem } from '@/lib/types'
import { BusinessCard } from '@/app/components/BusinessCard'
import { SearchBar } from '@/app/components/SearchBar'
import { EmptyState } from '@/app/components/EmptyState'
import { LoadingState } from '@/app/components/LoadingState'
import Link from 'next/link'

export default function BusinessPage() {
  const [contacts, setContacts] = useState<BusinessListItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    businessApi
      .list({ search: search || undefined })
      .then(res => {
        setContacts(res.data.items)
        setTotal(res.data.total)
      })
      .catch(() => setContacts([]))
      .finally(() => setLoading(false))
  }, [search])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 sm:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">商务合作</h1>
          <p className="text-sm text-slate-400 mt-1">播客生态商务对接</p>
        </div>
        <Link
          href="/business/new"
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors"
        >
          + 添加商务
        </Link>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="搜索商务资源..." />
      </div>

      {loading ? (
        <LoadingState />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon="🤝"
          message="暂无商务信息"
          action={{ label: '添加第一条商务', href: '/business/new' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map(contact => (
            <BusinessCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  )
}
