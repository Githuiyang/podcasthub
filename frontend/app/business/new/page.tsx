'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { businessApi } from '@/lib/api'

export default function NewBusinessPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', company: '', title: '', bio: '',
    business_type: '', industry: '', budget_range: '',
    cooperation_types: '', contact_phone: '', contact_wechat: '', contact_email: '',
    reference_podcasts: '', tags: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await businessApi.create({
        ...form,
        cooperation_types: form.cooperation_types ? form.cooperation_types.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        reference_podcasts: form.reference_podcasts ? form.reference_podcasts.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      })
      router.push('/business')
    } catch { alert('创建失败') } finally { setSubmitting(false) }
  }

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 sm:pb-0">
      <div className="max-w-2xl mx-auto">
      <button onClick={() => router.push('/business')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">← 返回</button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">添加商务</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-section space-y-4">
          <h2 className="card-section-title">基本信息</h2>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
            <input type="text" required value={form.name} onChange={e => updateField('name', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">公司</label>
              <input type="text" value={form.company} onChange={e => updateField('company', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">职位</label>
              <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
            <textarea rows={3} value={form.bio} onChange={e => updateField('bio', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
        </div>
        <div className="card-section space-y-4">
          <h2 className="card-section-title">业务信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">业务类型</label>
              <input type="text" placeholder="赞助商, MCN, 平台" value={form.business_type} onChange={e => updateField('business_type', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">行业</label>
              <input type="text" value={form.industry} onChange={e => updateField('industry', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">预算范围</label>
            <input type="text" placeholder="5k-20k/期" value={form.budget_range} onChange={e => updateField('budget_range', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">合作类型（逗号分隔）</label>
            <input type="text" placeholder="冠名, 口播, 植入" value={form.cooperation_types} onChange={e => updateField('cooperation_types', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
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
          <div><label className="block text-sm font-medium text-gray-700 mb-1">合作过的播客（逗号分隔）</label>
            <input type="text" value={form.reference_podcasts} onChange={e => updateField('reference_podcasts', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
            <input type="text" value={form.tags} onChange={e => updateField('tags', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-podcast-300" /></div>
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.push('/business')} className="px-6 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">取消</button>
          <button type="submit" disabled={submitting} className="px-6 py-2.5 text-sm text-white bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50">{submitting ? '提交中...' : '创建'}</button>
        </div>
      </form>
    </div>
    </div>
  )
}
