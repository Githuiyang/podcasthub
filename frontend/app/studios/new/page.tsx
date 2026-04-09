'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { studiosApi } from '@/lib/api'

export default function NewStudioPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', city: '上海', district: '', address: '', description: '',
    equipment: '', room_count: 1, room_features: '',
    price_per_hour: '' as string | number, price_per_day: '' as string | number, price_note: '',
    booking_url: '', booking_note: '',
    contact_name: '', contact_phone: '', contact_wechat: '',
    tags: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await studiosApi.create({
        ...form,
        price_per_hour: form.price_per_hour ? Number(form.price_per_hour) : undefined,
        price_per_day: form.price_per_day ? Number(form.price_per_day) : undefined,
        equipment: form.equipment ? form.equipment.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        room_features: form.room_features ? form.room_features.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      })
      router.push('/studios')
    } catch { alert('提交失败，请重试') } finally { setSubmitting(false) }
  }

  const u = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }))

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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">城市</label>
                <input type="text" value={form.city} onChange={e => u('city', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">区域</label>
                <input type="text" value={form.district} onChange={e => u('district', e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">详细地址</label>
              <input type="text" value={form.address} onChange={e => u('address', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">介绍</label>
              <textarea rows={3} value={form.description} onChange={e => u('description', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        {/* 设备 */}
        <div className="card-section">
          <h2 className="card-section-title">设备</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">设备（逗号分隔）</label>
              <input type="text" placeholder="罗德Caster Pro, 4支podmic话筒" value={form.equipment} onChange={e => u('equipment', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">房间特性（逗号分隔）</label>
              <input type="text" placeholder="隔音, 吸音板" value={form.room_features} onChange={e => u('room_features', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        {/* 价格 */}
        <div className="card-section">
          <h2 className="card-section-title">价格</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">每小时（元）</label>
              <input type="number" value={form.price_per_hour} onChange={e => u('price_per_hour', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">每天（元）</label>
              <input type="number" value={form.price_per_day} onChange={e => u('price_per_day', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        {/* 报名方式 */}
        <div className="card-section">
          <h2 className="card-section-title">报名方式</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">报名链接</label>
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
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">联系人</label>
              <input type="text" value={form.contact_name} onChange={e => u('contact_name', e.target.value)} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">电话</label>
                <input type="text" value={form.contact_phone} onChange={e => u('contact_phone', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">微信</label>
                <input type="text" value={form.contact_wechat} onChange={e => u('contact_wechat', e.target.value)} className="input-field" />
              </div>
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
