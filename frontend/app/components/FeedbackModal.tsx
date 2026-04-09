'use client'

import { useState } from 'react'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [form, setForm] = useState({ name: '', contact: '', type: 'general', content: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post(`${API_BASE}/api/feedback`, form)
      setDone(true)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.detail || '提交失败，请重试')
      } else {
        alert('提交失败，请重试')
      }
    } finally { setSubmitting(false) }
  }

  const handleClose = () => {
    setDone(false)
    setForm({ name: '', contact: '', type: 'general', content: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-5 shadow-float animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-6">
            <span className="text-3xl block mb-2">✅</span>
            <h3 className="text-base font-semibold text-gray-900 mb-1">感谢反馈!</h3>
            <p className="text-xs text-gray-400">我们会认真对待每一条反馈</p>
            <button onClick={handleClose} className="mt-5 px-5 py-2 text-xs text-white bg-podcast-500 rounded-xl hover:bg-podcast-600 transition-colors">关闭</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">意见反馈</h3>
              <button onClick={handleClose} className="text-gray-300 hover:text-gray-500 text-lg leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="input-field">
                <option value="general">一般反馈</option>
                <option value="suggestion">功能建议</option>
                <option value="bug">Bug 反馈</option>
              </select>
              <input type="text" placeholder="你的称呼（选填）" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
              <input type="text" placeholder="联系方式（选填）" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} className="input-field" />
              <textarea required rows={3} placeholder="反馈内容 *" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="input-field" />
              <button type="submit" disabled={submitting} className="w-full py-2.5 text-xs text-white bg-podcast-500 rounded-xl hover:bg-podcast-600 transition-colors disabled:opacity-50 active:scale-[0.98]">
                {submitting ? '提交中...' : '提交反馈'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
