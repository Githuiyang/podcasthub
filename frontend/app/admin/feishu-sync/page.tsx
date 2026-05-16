'use client'

import { useState } from 'react'
import Link from 'next/link'
import { feishuSyncApi } from '@/lib/api'

interface DiffData {
  feishu_count: number
  online_count: number
  to_create: Record<string, string>[]
  to_update: { id: number; name: string; changes: Record<string, { before: string; after: string }> }[]
  to_delete: { id: number; name: string }[]
  summary: { create: number; update: number; delete: number; unchanged: number }
}

const FIELD_LABELS: Record<string, string> = {
  name: '名称',
  address: '地址',
  description: '描述',
  open_hours: '开放时间',
  price_note: '价格',
  equipment: '设备',
  contact_name: '联系人',
  contact_info: '联系方式',
}

export default function FeishuSyncPage() {
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [diff, setDiff] = useState<DiffData | null>(null)
  const [result, setResult] = useState<{ applied: number; results: { action: string; name?: string; status: string; id?: number }[] } | null>(null)
  const [error, setError] = useState('')

  const handleCompare = async () => {
    setLoading(true)
    setError('')
    setDiff(null)
    setResult(null)
    try {
      const res = await feishuSyncApi.compare()
      setDiff(res.data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '比对失败'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!diff) return
    setApplying(true)
    setError('')
    try {
      const actions: { action: string; studio_id?: number; data?: Record<string, unknown> }[] = []

      // 新增
      for (const item of diff.to_create) {
        actions.push({ action: 'create', data: item })
      }
      // 更新
      for (const item of diff.to_update) {
        const data: Record<string, unknown> = {}
        for (const [field, val] of Object.entries(item.changes)) {
          data[field] = val.after
        }
        actions.push({ action: 'update', studio_id: item.id, data })
      }
      // 软删除
      for (const item of diff.to_delete) {
        actions.push({ action: 'delete', studio_id: item.id })
      }

      const res = await feishuSyncApi.apply(actions)
      setResult(res.data)
      setDiff(null)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '同步失败'
      setError(msg)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-16 animate-fade-in-up">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Admin</div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">飞书数据同步</h1>
          <p className="text-sm text-gray-500 mt-1">从飞书结果表拉取数据，比对差异后同步到线上。</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/studios" className="px-3.5 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-200 transition-colors">
            返回录音室管理
          </Link>
          <Link href="/admin/change-requests" className="px-3.5 py-2 bg-amber-50 text-amber-700 text-xs font-medium rounded-xl hover:bg-amber-100 transition-colors">
            变更审核
          </Link>
        </div>
      </div>

      {/* 工作流说明 */}
      <div className="rounded-3xl border border-black/6 bg-white p-5 shadow-sm mb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400 mb-3">工作流</div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">飞书问卷收集</span>
          <span className="text-gray-300">→</span>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">飞书结果表整理</span>
          <span className="text-gray-300">→</span>
          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">人工确认 diff</span>
          <span className="text-gray-300">→</span>
          <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">同步线上</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-5 py-3 rounded-2xl bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? '比对中...' : '拉取并比对'}
        </button>
        {diff && (
          <button
            onClick={handleApply}
            disabled={applying}
            className="px-5 py-3 rounded-2xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {applying ? '同步中...' : '确认并同步上线'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl mb-4">{error}</div>
      )}

      {/* 比对结果 */}
      {diff && (
        <div className="space-y-4">
          {/* 概览 */}
          <div className="rounded-3xl border border-black/6 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400 mb-3">比对概览</div>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-2xl bg-green-50 p-3 text-center">
                <div className="text-2xl font-bold text-green-700">{diff.summary.create}</div>
                <div className="text-xs text-green-600 mt-1">新增</div>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-center">
                <div className="text-2xl font-bold text-blue-700">{diff.summary.update}</div>
                <div className="text-xs text-blue-600 mt-1">更新</div>
              </div>
              <div className="rounded-2xl bg-red-50 p-3 text-center">
                <div className="text-2xl font-bold text-red-700">{diff.summary.delete}</div>
                <div className="text-xs text-red-600 mt-1">删除</div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-gray-600">{diff.summary.unchanged}</div>
                <div className="text-xs text-gray-500 mt-1">不变</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              飞书结果表 {diff.feishu_count} 条 / 线上 {diff.online_count} 条
            </div>
          </div>

          {/* 新增 */}
          {diff.to_create.length > 0 && (
            <div className="rounded-3xl border border-green-200 bg-green-50/50 p-5">
              <div className="text-xs font-semibold text-green-700 mb-3">新增（{diff.to_create.length} 条）</div>
              <div className="space-y-2">
                {diff.to_create.map((item, i) => (
                  <div key={i} className="rounded-xl bg-white border border-green-100 p-3">
                    <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.address || '未填地址'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 更新 */}
          {diff.to_update.length > 0 && (
            <div className="rounded-3xl border border-blue-200 bg-blue-50/50 p-5">
              <div className="text-xs font-semibold text-blue-700 mb-3">更新（{diff.to_update.length} 条）</div>
              <div className="space-y-2">
                {diff.to_update.map((item) => (
                  <div key={item.id} className="rounded-xl bg-white border border-blue-100 p-3">
                    <div className="text-sm font-semibold text-gray-900 mb-2">{item.name}</div>
                    {Object.entries(item.changes).map(([field, val]) => (
                      <div key={field} className="text-xs mb-1">
                        <span className="text-gray-500">{FIELD_LABELS[field] || field}：</span>
                        <span className="text-red-500 line-through opacity-60 mr-1">{val.before || '(空)'}</span>
                        <span className="text-green-600">{val.after || '(空)'}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 删除 */}
          {diff.to_delete.length > 0 && (
            <div className="rounded-3xl border border-red-200 bg-red-50/50 p-5">
              <div className="text-xs font-semibold text-red-700 mb-3">软删除（{diff.to_delete.length} 条）</div>
              <div className="space-y-2">
                {diff.to_delete.map((item) => (
                  <div key={item.id} className="rounded-xl bg-white border border-red-100 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-400">ID: {item.id}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-600">将从线上隐藏</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-red-400 mt-2">软删除：数据不清除，仅设为不可见。如需恢复可在后台手动操作。</p>
            </div>
          )}

          {diff.summary.create + diff.summary.update + diff.summary.delete === 0 && (
            <div className="rounded-3xl border border-black/6 bg-white p-8 text-center">
              <div className="text-sm text-gray-500">飞书结果表与线上数据完全一致，无需同步。</div>
            </div>
          )}
        </div>
      )}

      {/* 同步结果 */}
      {result && (
        <div className="rounded-3xl border border-green-200 bg-green-50 p-5 mt-4">
          <div className="text-xs font-semibold text-green-700 mb-3">同步完成</div>
          <div className="text-sm text-gray-700">已执行 {result.applied} 项操作：</div>
          <div className="mt-2 space-y-1">
            {result.results.map((r, i) => (
              <div key={i} className="text-xs">
                <span className={`px-1.5 py-0.5 rounded ${r.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {r.status === 'ok' ? '成功' : r.status}
                </span>
                {' '}
                <span className="text-gray-600">
                  {r.action === 'create' ? '新增' : r.action === 'update' ? '更新' : '删除'}
                  {' '}
                  {r.name || `#${r.id}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
