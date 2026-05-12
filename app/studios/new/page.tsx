'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { studiosApi } from '@/lib/api'
import { createEmptyStudioForm, serializeStudioForm } from '@/lib/studioForm'

const CHARGING_OPTIONS = ['免费', '按小时收费', '按天收费', '按时段收费', '咨询后报价']
const EQUIPMENT_VIDEO_OPTIONS = [
  { value: '', label: '未设置' },
  { value: 'yes', label: '需要自带' },
  { value: 'no', label: '无需自带' },
]

export default function NewStudioPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(createEmptyStudioForm())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await studiosApi.create(serializeStudioForm(form))
      router.push('/studios')
    } catch { alert('提交失败，请重试') } finally { setSubmitting(false) }
  }

  const u = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }))

  const chargingMethod = form.charging_method
  const showHourlyPrice = chargingMethod === '按小时收费'
  const showDailyPrice = chargingMethod === '按天收费'
  const showPriceNote = chargingMethod === '按时段收费' || showHourlyPrice || showDailyPrice

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 sm:pb-0 animate-fade-in-up">
      <div className="max-w-xl mx-auto">
      <button onClick={() => router.push('/studios')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-3">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        返回
      </button>

      <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-5">添加录音间</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 基本信息 */}
        <div className="card-section">
          <h2 className="card-section-title">基本信息</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">名称 *</label>
              <input type="text" required value={form.name} onChange={e => u('name', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">详细地址</label>
              <input type="text" value={form.address} onChange={e => u('address', e.target.value)} placeholder="上海市XX区XX路XX号" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">介绍</label>
              <textarea rows={3} value={form.description} onChange={e => u('description', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        {/* 收费方式 */}
        <div className="card-section">
          <h2 className="card-section-title">收费方式</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">选择收费方式</label>
              <select value={form.charging_method} onChange={e => u('charging_method', e.target.value)} className="input-field">
                <option value="">请选择</option>
                {CHARGING_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            {showHourlyPrice && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">每小时价格（元）</label>
                <input type="number" value={form.price_per_hour} onChange={e => u('price_per_hour', e.target.value)} placeholder="如 80" className="input-field" />
              </div>
            )}
            {showDailyPrice && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">每天价格（元）</label>
                <input type="number" value={form.price_per_day} onChange={e => u('price_per_day', e.target.value)} placeholder="如 500" className="input-field" />
              </div>
            )}
            {showPriceNote && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">价格说明</label>
                <input type="text" placeholder="工作日 80 元/小时，晚间 120 元/小时" value={form.price_note} onChange={e => u('price_note', e.target.value)} className="input-field" />
              </div>
            )}
          </div>
        </div>

        {/* 预约说明 */}
        <div className="card-section">
          <h2 className="card-section-title">预约说明</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">预约链接</label>
              <input type="url" placeholder="https://..." value={form.booking_url} onChange={e => u('booking_url', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">预约说明</label>
              <input type="text" placeholder="微信预约 / 公众号预约" value={form.booking_note} onChange={e => u('booking_note', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        {/* 联系方式 */}
        <div className="card-section">
          <h2 className="card-section-title">联系方式</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">联系人</label>
                <input type="text" value={form.contact_name} onChange={e => u('contact_name', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">联系方式</label>
                <input type="text" placeholder="电话 / 微信" value={form.contact_info} onChange={e => u('contact_info', e.target.value)} className="input-field" />
              </div>
            </div>
          </div>
        </div>

        {/* 房间信息 */}
        <div className="card-section">
          <h2 className="card-section-title">房间信息</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">容纳人数</label>
                <input type="number" value={form.capacity} onChange={e => u('capacity', e.target.value)} placeholder="如 4" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">拍视频是否需自带设备</label>
                <select value={form.need_own_equipment_for_video} onChange={e => u('need_own_equipment_for_video', e.target.value)} className="input-field">
                  {EQUIPMENT_VIDEO_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">设备（逗号分隔）</label>
              <input type="text" placeholder="罗德Caster Pro, 4支podmic话筒" value={form.equipment} onChange={e => u('equipment', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        {/* 标签 */}
        <div className="card-section">
          <label className="block text-xs font-medium text-gray-500 mb-1">标签（逗号分隔）</label>
          <input type="text" placeholder="专业, 播客, 音乐" value={form.tags} onChange={e => u('tags', e.target.value)} className="input-field" />
        </div>

        {/* 提交 */}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => router.push('/studios')} className="flex-1 py-2.5 text-sm text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">取消</button>
          <button type="submit" disabled={submitting} className="flex-1 py-2.5 text-sm text-white bg-studio-500 rounded-xl hover:bg-studio-600 transition-colors disabled:opacity-50 active:scale-[0.98]">
            {submitting ? '提交中...' : '提交审核'}
          </button>
        </div>
      </form>
    </div>
    </div>
  )
}
