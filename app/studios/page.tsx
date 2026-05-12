'use client'

import { useState, useEffect } from 'react'
import { studiosApi } from '@/lib/api'
import type { StudioListItem } from '@/lib/types'
import { StudioCard } from '@/app/components/StudioCard'
import { CityFilter } from '@/app/components/CityFilter'
import { extractCityNames } from '@/lib/studioCities'
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
    studiosApi.cities().then(res => setCities(extractCityNames(res.data))).catch(() => {})
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
      <div className="mb-6">
        <div className="flex items-end justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">查找播客录音室</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/submit-studio"
              className="px-3.5 py-2 border border-slate-200 text-slate-500 text-xs font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-colors"
            >
              提交录音室信息
            </Link>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          浏览、搜索和对比全国录音间，找到最适合你的那一个
        </p>
      </div>

      {/* 搜索 */}
      <div className="mb-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="按名称搜索录音间..."
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

      {/* 结果统计 */}
      {!loading && studios.length > 0 && (
        <div className="text-xs text-slate-400 mb-4">
          {selectedCity ? `${selectedCity} · ` : ''}共 {total} 个录音间
        </div>
      )}

      {/* 内容 */}
      {loading ? (
        <LoadingState />
      ) : studios.length === 0 ? (
        <EmptyState
          icon="🎙"
          message={selectedCity ? `${selectedCity}暂无录音间` : '暂无录音间信息'}
          action={{ label: '提交录音室信息', href: '/submit-studio' }}
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
