'use client'

import { useState, useEffect, useCallback } from 'react'
import { changeRequestsApi } from '@/lib/api'
import Link from 'next/link'

interface ChangeRequest {
  id: number
  studio_id: number | null
  request_type: string
  source: string
  applicant_name: string | null
  applicant_note: string | null
  proposed_data: Record<string, unknown>
  status: string
  review_note: string | null
  diff_snapshot: Record<string, unknown> | null
  created_at: string | null
  reviewed_at: string | null
  applied_at: string | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'bg-amber-50 text-amber-700' },
  approved: { label: '已审批', color: 'bg-blue-50 text-blue-700' },
  applied: { label: '已上线', color: 'bg-green-50 text-green-700' },
  rejected: { label: '已拒绝', color: 'bg-red-50 text-red-700' },
}

export default function ChangeRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([])
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [diffData, setDiffData] = useState<Record<string, unknown> | null>(null)
  const [applying, setApplying] = useState<number | null>(null)

  const loadList = useCallback(() => {
    setLoading(true)
    changeRequestsApi
      .list({ status: statusFilter || undefined, size: 100 })
      .then(res => {
        setRequests(res.data.items)
        setTotal(res.data.total)
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { loadList() }, [loadList])

  const selected = requests.find(r => r.id === selectedId)

  const handleApprove = async (id: number) => {
    await changeRequestsApi.approve(id)
    loadList()
  }

  const handleReject = async (id: number) => {
    await changeRequestsApi.reject(id)
    loadList()
  }

  const handleApply = async (id: number) => {
    setApplying(id)
    try {
      await changeRequestsApi.apply(id)
      loadList()
    } finally {
      setApplying(null)
    }
  }

  const handlePreviewDiff = async (id: number) => {
    const res = await changeRequestsApi.diff(id)
    setDiffData(res.data)
  }

  return (
    <div className="flex h-[calc(100vh-48px)]">
      {/* 左侧列表 */}
      <div className="w-80 border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-900">变更申请</h2>
            <span className="text-xs text-gray-400">{total} 条</span>
          </div>
          <div className="flex gap-1">
            {['', 'pending', 'approved', 'applied', 'rejected'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                  statusFilter === s ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === '' ? '全部' : STATUS_LABELS[s]?.label || s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-xs text-gray-400">加载中...</div>
          ) : requests.length === 0 ? (
            <div className="p-4 text-xs text-gray-400">暂无变更申请</div>
          ) : (
            requests.map(req => {
              const st = STATUS_LABELS[req.status] || { label: req.status, color: 'bg-gray-100 text-gray-600' }
              return (
                <button
                  key={req.id}
                  onClick={() => { setSelectedId(req.id); setDiffData(null) }}
                  className={`w-full text-left px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selectedId === req.id ? 'bg-podcast-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-900 truncate">
                      {req.request_type === 'create' ? '新建' : '修改'} #{req.id}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${st.color}`}>{st.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {(req.proposed_data?.name as string) || `录音室 #${req.studio_id || '?'}`}
                    {req.applicant_name && ` — ${req.applicant_name}`}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {req.created_at ? new Date(req.created_at).toLocaleDateString('zh-CN') : ''}
                  </p>
                </button>
              )
            })
          )}
        </div>
        <div className="p-2 border-t border-gray-100 flex gap-2">
          <Link href="/admin/studios" className="text-[11px] text-gray-500 hover:text-gray-700">返回录音室管理</Link>
        </div>
      </div>

      {/* 右侧详情 */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            选择左侧申请查看详情
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* 基本信息 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  {selected.request_type === 'create' ? '新建录音室' : '修改录音室'} — 申请 #{selected.id}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${(STATUS_LABELS[selected.status] || { color: '' }).color}`}>
                  {(STATUS_LABELS[selected.status] || { label: selected.status }).label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>类型: {selected.request_type === 'create' ? '新建' : '修改'}</div>
                <div>来源: {selected.source}</div>
                {selected.studio_id && <div>目标录音室 ID: {selected.studio_id}</div>}
                {selected.applicant_name && <div>申请人: {selected.applicant_name}</div>}
                <div>创建时间: {selected.created_at ? new Date(selected.created_at).toLocaleString('zh-CN') : '-'}</div>
              </div>
              {selected.applicant_note && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">{selected.applicant_note}</div>
              )}
            </div>

            {/* 拟写入数据 */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">拟写入数据</h4>
              <div className="space-y-1">
                {Object.entries(selected.proposed_data || {}).map(([key, value]) => (
                  <div key={key} className="flex text-xs">
                    <span className="w-32 text-gray-400 flex-shrink-0">{key}</span>
                    <span className="text-gray-700 break-all">{JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* diff 预览 */}
            {diffData && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 mb-2">差异预览</h4>
                {diffData.action === 'create' ? (
                  <p className="text-xs text-gray-600">新建操作，无对比基线</p>
                ) : diffData.diff ? (
                  <div className="space-y-1.5">
                    {Object.entries(diffData.diff as Record<string, { before: unknown; after: unknown }>).map(([key, val]) => (
                      <div key={key} className="text-xs">
                        <span className="text-gray-500 font-medium">{key}</span>
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-red-600 line-through opacity-60">{JSON.stringify(val.before)}</span>
                          <span className="text-green-600">{JSON.stringify(val.after)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">无差异</p>
                )}
              </div>
            )}

            {/* 已应用的 diff */}
            {selected.diff_snapshot && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 mb-2">已应用变更记录</h4>
                <pre className="text-[11px] text-gray-600 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selected.diff_snapshot, null, 2)}
                </pre>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2">
              {selected.status === 'pending' && (
                <>
                  <button
                    onClick={() => handlePreviewDiff(selected.id)}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    预览差异
                  </button>
                  <button
                    onClick={() => handleApprove(selected.id)}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                  >
                    审批通过
                  </button>
                  <button
                    onClick={() => handleReject(selected.id)}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    拒绝
                  </button>
                </>
              )}
              {selected.status === 'approved' && (
                <button
                  onClick={() => handleApply(selected.id)}
                  disabled={applying === selected.id}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {applying === selected.id ? '应用中...' : '确认并同步上线'}
                </button>
              )}
            </div>

            {selected.review_note && (
              <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                <span className="font-medium">审批备注:</span> {selected.review_note}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
