'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { editorsApi } from '@/lib/api'

export default function NewEditorPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', bio: '', skills: '', software: '', experience_years: 0,
    specialties: '', price_per_episode: '' as string | number, price_per_hour: '' as string | number,
    price_note: '', contact_phone: '', contact_wechat: '', contact_email: '',
    portfolio_url: '', tags: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await editorsApi.create({
        ...form,
        price_per_episode: form.price_per_episode ? Number(form.price_per_episode) : undefined,
        price_per_hour: form.price_per_hour ? Number(form.price_per_hour) : undefined,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        software: form.software ? form.software.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        specialties: form.specialties ? form.specialties.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      })
      router.push('/editors')
    } catch { alert('创建失败') } finally { setSubmitting(false) }
  }

  const updateField = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 sm:pb-0">
      <div className="max-w-2xl mx-auto">
      <button onClick={() => router.push('/editors')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">← 返回</button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">添加剪辑师</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-section space-y-4">
          <h2 className="card-section-title">基本信息</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
            <input type="text" required value={form.name} onChange={e => updateField('name', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
            <textarea rows={3} value={form.bio} onChange={e => updateField('bio', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">从业年限</label>
            <input type="number" min={0} value={form.experience_years} onChange={e => updateField('experience_years', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
        </div>
        <div className="card-section space-y-4">
          <h2 className="card-section-title">专业能力</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">技能（逗号分隔）</label>
            <input type="text" placeholder="音频剪辑, 混音, 降噪" value={form.skills} onChange={e => updateField('skills', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">软件（逗号分隔）</label>
            <input type="text" placeholder="Audition, Pro Tools" value={form.software} onChange={e => updateField('software', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">专长（逗号分隔）</label>
            <input type="text" placeholder="访谈类, 叙事类" value={form.specialties} onChange={e => updateField('specialties', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
        </div>
        <div className="card-section space-y-4">
          <h2 className="card-section-title">报价</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">每期（元）</label>
              <input type="number" value={form.price_per_episode} onChange={e => updateField('price_per_episode', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">每小时（元）</label>
              <input type="number" value={form.price_per_hour} onChange={e => updateField('price_per_hour', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
          </div>
        </div>
        <div className="card-section space-y-4">
          <h2 className="card-section-title">联系方式</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
              <input type="text" value={form.contact_phone} onChange={e => updateField('contact_phone', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">微信</label>
              <input type="text" value={form.contact_wechat} onChange={e => updateField('contact_wechat', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input type="email" value={form.contact_email} onChange={e => updateField('contact_email', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
            <input type="text" placeholder="专业, 快速, 性价比" value={form.tags} onChange={e => updateField('tags', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.push('/editors')} className="px-6 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">取消</button>
          <button type="submit" disabled={submitting} className="px-6 py-2.5 text-sm text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 disabled:opacity-50">{submitting ? '提交中...' : '创建'}</button>
        </div>
      </form>
    </div>
    </div>
  )
}
