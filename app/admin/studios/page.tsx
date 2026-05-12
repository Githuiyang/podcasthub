'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { studiosApi } from '@/lib/api'
import type { Studio, StudioListItem } from '@/lib/types'
import { createEmptyStudioForm, serializeStudioForm, studioToForm, type StudioFormState } from '@/lib/studioForm'

const CHARGING_OPTIONS = ['免费', '按小时收费', '按天收费', '按时段收费', '咨询后报价']
const EQUIPMENT_VIDEO_OPTIONS = [
  { value: '', label: '未设置' },
  { value: 'yes', label: '需要自带' },
  { value: 'no', label: '无需自带' },
]

export default function AdminStudiosPage() {
  const [studios, setStudios] = useState<StudioListItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null)
  const [form, setForm] = useState<StudioFormState>(createEmptyStudioForm())
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrFileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingQr, setUploadingQr] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 轻量 toast 提示，2 秒后自动消失
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2000)
  }

  // 动态城市列表：从全量数据中提取，保持稳定排序
  const availableCities = useMemo(() => {
    const citySet = new Set<string>()
    studios.forEach(s => { if (s.city) citySet.add(s.city) })
    return Array.from(citySet).sort()
  }, [studios])

  // 先按城市筛选，再按搜索过滤
  const visibleStudios = useMemo(() => {
    let filtered = studios
    if (selectedCity) {
      filtered = filtered.filter(s => s.city === selectedCity)
    }
    const keyword = search.trim().toLowerCase()
    if (keyword) {
      filtered = filtered.filter(studio =>
        [studio.name, studio.address]
          .filter(Boolean)
          .some(value => value?.toLowerCase().includes(keyword))
      )
    }
    return filtered
  }, [selectedCity, search, studios])

  // 切换城市后，如果当前 selectedId 不在筛选结果中，自动跳到第一条
  useEffect(() => {
    if (visibleStudios.length === 0) return
    if (selectedId && visibleStudios.some(s => s.id === selectedId)) return
    setSelectedId(visibleStudios[0].id)
  }, [selectedCity, visibleStudios, selectedId])

  useEffect(() => {
    studiosApi
      .list({ size: 100 })
      .then(res => {
        setStudios(res.data.items)
        if (res.data.items.length > 0) {
          setSelectedId(current => current ?? res.data.items[0].id)
        }
      })
      .catch(() => setStudios([]))
      .finally(() => setLoadingList(false))
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setSelectedStudio(null)
      setForm(createEmptyStudioForm())
      return
    }

    setLoadingDetail(true)
    studiosApi
      .detail(selectedId)
      .then(res => {
        setSelectedStudio(res.data)
        setForm(studioToForm(res.data))
      })
      .catch(() => {
        setSelectedStudio(null)
        setForm(createEmptyStudioForm())
      })
      .finally(() => setLoadingDetail(false))
  }, [selectedId])

  const updateField = (field: keyof StudioFormState, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const refreshList = async () => {
    setLoadingList(true)
    try {
      const res = await studiosApi.list({ size: 100 })
      setStudios(res.data.items)
    } finally {
      setLoadingList(false)
    }
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedId) return

    setSaving(true)
    try {
      const res = await studiosApi.update(selectedId, serializeStudioForm(form))
      setSelectedStudio(res.data)
      setForm(studioToForm(res.data))
      showToast('已保存线上录音室信息')
      refreshList() // 非阻塞：不 await，先反馈用户
    } catch {
      showToast('保存失败，请稍后重试', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedId) return

    setUploading(true)
    try {
      const res = await studiosApi.upload(selectedId, file)
      setSelectedStudio(res.data)
      setForm(prev => ({ ...prev, cover_image: res.data.cover_image || '' }))
      showToast('封面图片已更新')
      refreshList() // 非阻塞
    } catch {
      showToast('图片上传失败，请重试', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleUploadQr = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedId) return

    setUploadingQr(true)
    try {
      const res = await studiosApi.uploadQr(selectedId, file)
      setForm(prev => ({ ...prev, booking_qr_image: res.data.url || '' }))
      showToast('预约二维码已上传')
    } catch {
      showToast('二维码上传失败，请重试', 'error')
    } finally {
      setUploadingQr(false)
      if (qrFileInputRef.current) qrFileInputRef.current.value = ''
    }
  }

  // 软删除录音室（调用 DELETE /api/studios/delete/{id}，后端设置 is_active=false）
  const handleDelete = async () => {
    if (!selectedId) return
    setDeleting(true)
    try {
      await studiosApi.delete(selectedId)
      showToast('录音室已移除（软删除）')
      // 刷新列表
      const res = await studiosApi.list({ size: 100 })
      setStudios(res.data.items)
      // 自动选中下一条，或清空
      const remaining = res.data.items.filter(
        (s: StudioListItem) => selectedCity ? s.city === selectedCity : true
      )
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id)
      } else {
        setSelectedId(null)
        setSelectedStudio(null)
        setForm(createEmptyStudioForm())
      }
    } catch {
      showToast('移除失败，请稍后重试', 'error')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const chargingMethod = form.charging_method
  const showHourlyPrice = chargingMethod === '按小时收费'
  const showDailyPrice = chargingMethod === '按天收费'
  const showPriceNote = chargingMethod === '按时段收费' || showHourlyPrice || showDailyPrice

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 animate-fade-in-up relative">
      {/* 轻量 toast 提示 */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all animate-fade-in-up ${
          toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Admin</div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">录音室管理后台</h1>
          <p className="text-sm text-gray-500 mt-1">直接编辑线上录音室数据，保存后立即生效。</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/feishu-sync" className="px-3.5 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-xl hover:bg-green-100 transition-colors">
            飞书同步
          </Link>
          <Link href="/admin/change-requests" className="px-3.5 py-2 bg-amber-50 text-amber-700 text-xs font-medium rounded-xl hover:bg-amber-100 transition-colors">
            变更审核
          </Link>
          <Link href="/studios" className="px-3.5 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-200 transition-colors">
            返回录音间
          </Link>
          <button onClick={refreshList} className="px-3.5 py-2 bg-black text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition-colors">
            刷新列表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-black/6 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">录音室列表</div>
          <input
            type="text"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="搜索名称 / 地址"
            className="mt-3 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-300 focus:bg-white"
          />
          {availableCities.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setSelectedCity('')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCity === '' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                全部
              </button>
              {availableCities.map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedCity === city ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
          <div className="mt-4 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {loadingList ? (
              <div className="text-sm text-gray-400 py-6 text-center">正在加载录音室...</div>
            ) : visibleStudios.length === 0 ? (
              <div className="text-sm text-gray-400 py-6 text-center">
                {selectedCity && !search
                  ? `${selectedCity} 暂无录音室`
                  : '没有匹配的录音室'}
              </div>
            ) : (
              visibleStudios.map(studio => (
                <button
                  key={studio.id}
                  type="button"
                  onClick={() => setSelectedId(studio.id)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left transition-colors ${
                    selectedId === studio.id
                      ? 'border-black bg-black text-white'
                      : 'border-black/6 bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="text-sm font-semibold">{studio.name}</div>
                  <div className={`mt-1 text-xs ${selectedId === studio.id ? 'text-white/70' : 'text-gray-400'}`}>
                    {studio.address || '未标注地址'}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="rounded-3xl border border-black/6 bg-white p-5 shadow-sm">
          {loadingDetail ? (
            <div className="py-24 text-center text-sm text-gray-400">正在加载录音室详情...</div>
          ) : selectedStudio ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-400">正在编辑</div>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedStudio.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedStudio.address || '未标注地址'}
                  </p>
                </div>
                <Link href={`/studios/${selectedStudio.id}`} className="text-sm text-gray-500 hover:text-gray-700">
                  查看前台详情
                </Link>
              </div>

              {/* 基本信息 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">基本信息</h3>
                <input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="录音室名称" className="input-field" />
                <input value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="详细地址" className="input-field" />

                {/* 封面图片上传 */}
                <div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2.5 rounded-2xl bg-studio-500 text-white text-sm font-medium hover:bg-studio-600 disabled:opacity-50 transition-colors"
                    >
                      {uploading ? '上传中...' : '上传封面图片'}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                    {form.cover_image && (
                      <span className="text-xs text-gray-400 truncate max-w-[200px]">已上传</span>
                    )}
                  </div>
                  {form.cover_image && (
                    <div className="mt-2 relative w-32 h-24 rounded-xl overflow-hidden bg-gray-100">
                      <img src={form.cover_image} alt="封面" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">开放时间</label>
                  <input value={form.open_hours} onChange={e => updateField('open_hours', e.target.value)} placeholder="如 周一至周五 10:00-22:00，周末 9:00-21:00" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">补充介绍</label>
                  <textarea rows={5} value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="录音室环境、特色等补充说明" className="input-field" />
                </div>
              </div>

              {/* 收费方式 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">收费方式</h3>
                <select
                  value={form.charging_method}
                  onChange={e => updateField('charging_method', e.target.value)}
                  className="input-field"
                >
                  <option value="">请选择</option>
                  {CHARGING_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                {showHourlyPrice && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">每小时价格（元）</label>
                      <input type="number" value={form.price_per_hour} onChange={e => updateField('price_per_hour', e.target.value)} placeholder="如 80" className="input-field" />
                    </div>
                  </div>
                )}

                {showDailyPrice && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">每天价格（元）</label>
                      <input type="number" value={form.price_per_day} onChange={e => updateField('price_per_day', e.target.value)} placeholder="如 500" className="input-field" />
                    </div>
                  </div>
                )}

                {showPriceNote && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">价格说明</label>
                    <input value={form.price_note} onChange={e => updateField('price_note', e.target.value)} placeholder="如 工作日 80 元/小时，晚间 120 元/小时" className="input-field" />
                  </div>
                )}
              </div>

              {/* 预约说明 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">预约说明</h3>
                <input value={form.booking_url} onChange={e => updateField('booking_url', e.target.value)} placeholder="预约链接（如有）" className="input-field" />
                <input value={form.booking_note} onChange={e => updateField('booking_note', e.target.value)} placeholder="预约说明（如 微信预约 / 公众号预约）" className="input-field" />
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">预约二维码图片（可上传小程序码或公众号二维码）</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => qrFileInputRef.current?.click()}
                      disabled={uploadingQr}
                      className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      {uploadingQr ? '上传中...' : '上传二维码'}
                    </button>
                    <input ref={qrFileInputRef} type="file" accept="image/*" onChange={handleUploadQr} className="hidden" />
                    {form.booking_qr_image && (
                      <span className="text-xs text-gray-400 truncate max-w-[200px]">已上传</span>
                    )}
                  </div>
                  {form.booking_qr_image && (
                    <div className="mt-2 flex items-start gap-3">
                      <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={form.booking_qr_image} alt="预约二维码" className="w-full h-full object-contain" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, booking_qr_image: '' }))}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                      >
                        移除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 联系方式 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">联系方式</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.contact_name} onChange={e => updateField('contact_name', e.target.value)} placeholder="联系人" className="input-field" />
                  <input value={form.contact_info} onChange={e => updateField('contact_info', e.target.value)} placeholder="联系方式（电话/微信）" className="input-field" />
                </div>
              </div>

              {/* 房间信息 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">房间信息</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">容纳人数</label>
                    <input type="number" value={form.capacity} onChange={e => updateField('capacity', e.target.value)} placeholder="如 4" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">拍视频是否需自带设备</label>
                    <select
                      value={form.need_own_equipment_for_video}
                      onChange={e => updateField('need_own_equipment_for_video', e.target.value)}
                      className="input-field"
                    >
                      {EQUIPMENT_VIDEO_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <input value={form.equipment} onChange={e => updateField('equipment', e.target.value)} placeholder="设备列表，逗号分隔" className="input-field" />
                <input value={form.tags} onChange={e => updateField('tags', e.target.value)} placeholder="标签，逗号分隔" className="input-field" />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2.5 rounded-2xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  移除录音室
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-400">保存后立即更新线上数据</div>
                  <button type="submit" disabled={saving} className="px-5 py-3 rounded-2xl bg-black text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50">
                    {saving ? '保存中...' : '保存线上数据'}
                  </button>
                </div>
              </div>

              {/* 删除确认弹窗 */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-float animate-fade-in-up">
                    <h3 className="text-base font-semibold text-gray-900">确认移除录音室</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      确定移除「{selectedStudio?.name}」？此操作为软删除，录音室将从列表中隐藏，但数据不会物理清除。
                    </p>
                    <div className="mt-5 flex justify-end gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        {deleting ? '移除中...' : '确认移除'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="py-24 text-center text-sm text-gray-400">请选择左侧录音室开始编辑。</div>
          )}
        </section>
      </div>
    </div>
  )
}
