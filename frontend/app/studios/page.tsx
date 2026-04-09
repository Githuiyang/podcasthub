'use client'

import { useState, useEffect } from 'react'
import { studiosApi } from '@/lib/api'
import type { StudioListItem } from '@/lib/types'
import { StudioCard } from '@/app/components/StudioCard'
import { CityFilter } from '@/app/components/CityFilter'
import { SearchBar } from '@/app/components/SearchBar'
import { EmptyState } from '@/app/components/EmptyState'
import { LoadingState } from '@/app/components/LoadingState'
import Link from 'next/link'

export default function StudiosPage() {
  const [studios, setStudios] = useState<StudioListItem[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    studiosApi.cities().then(res => setCities(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    studiosApi
      .list({ city: selectedCity || undefined, search: search || undefined })
      .then(res => {
        setStudios(res.data.items)
        setTotal(res.data.total)
      })
      .catch(() => setStudios([]))
      .finally(() => setLoading(false))
  }, [selectedCity, search])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 sm:pb-0 animate-fade-in-up">
      {/* 页头 */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">录音间</h1>
          <p className="text-xs text-gray-400 mt-1">
            {loading ? '加载中...' : `共 ${total} 个录音间`}
          </p>
        </div>
        <Link
          href="/studios/new"
          className="px-3.5 py-2 bg-studio-500 text-white text-xs font-medium rounded-xl hover:bg-studio-600 transition-colors active:scale-[0.97]"
        >
          + 添加
        </Link>
      </div>

      {/* 搜索 */}
      <div className="mb-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="搜索录音间..."
        />
      </div>

      {/* 城市筛选 */}
      {cities.length > 0 && (
        <div className="mb-5">
          <CityFilter
            cities={cities}
            selected={selectedCity}
            onSelect={setSelectedCity}
          />
        </div>
      )}

      {/* 内容 */}
      {loading ? (
        <LoadingState />
      ) : studios.length === 0 ? (
        <EmptyState
          icon="🎙"
          message={selectedCity ? `${selectedCity}暂无录音间` : '暂无录音间信息'}
          action={{ label: '添加第一个录音间', href: '/studios/new' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {studios.map((studio, i) => (
            <div key={studio.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <StudioCard studio={studio} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
