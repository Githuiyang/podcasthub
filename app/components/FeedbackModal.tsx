'use client'

import { useState } from 'react'
import axios from 'axios'
import { api } from '@/lib/api'

interface StudioContext {
  studio_id: number
  studio_name: string
  source: 'web_detail' | 'web_modal'
}

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
  /** 绑定具体录音室时的上下文（可选） */
  studioContext?: StudioContext
}

const STUDIO_CORRECTION_HREF = 'https://my.feishu.cn/wiki/OzEEwyasziC7VFk7YrxcnH8lnre'

export function FeedbackModal({ open, onClose, studioContext }: FeedbackModalProps) {
  const [form, setForm] = useState({ name: '', content: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!open) return null

  const isStudioFeedback = Boolean(studioContext)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = { ...form }
      if (studioContext) {
        payload.source = studioContext.source
        payload.studio_id = studioContext.studio_id
        payload.studio_name = studioContext.studio_name
        payload.feedback_type = 'correction'
      }
      await api.post('/api/feedback', payload)
      setDone(true)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMsg(error.response?.data?.detail || '提交失败，请重试')
      } else {
        setErrorMsg('提交失败，请重试')
      }
    } finally { setSubmitting(false) }
  }

  const handleClose = () => {
    setDone(false)
    setErrorMsg('')
    setForm({ name: '', content: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6 sm:p-7 shadow-float animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-8">
            <span className="text-3xl block mb-3">✅</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">感谢反馈!</h3>
            <p className="text-sm text-gray-400">
              {isStudioFeedback ? '我们会尽快核实并更新录音室信息' : '我们会认真对待每一条反馈'}
            </p>
            <button onClick={handleClose} className="mt-6 px-6 py-2.5 text-sm text-white bg-podcast-500 rounded-xl hover:bg-podcast-600 transition-colors">关闭</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {isStudioFeedback ? '反馈录音室信息' : '意见反馈'}
              </h3>
              <button onClick={handleClose} className="text-gray-300 hover:text-gray-500 text-xl leading-none">&times;</button>
            </div>

            {/* 录音室上下文提示 */}
            {studioContext && (
              <div className="mb-4 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400">正在反馈：</span>
                <span className="text-xs text-slate-700 font-medium ml-1">{studioContext.studio_name}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="你的称呼" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} disabled={submitting} className="input-field disabled:opacity-50" />
              <textarea
                required
                rows={4}
                placeholder={isStudioFeedback
                  ? '地址、价格、预约方式或营业状态是否有变化？'
                  : '反馈详情 *'
                }
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                disabled={submitting}
                className="input-field disabled:opacity-50"
              />
              {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
              <button type="submit" disabled={submitting} className="w-full py-3 text-sm text-white bg-podcast-500 rounded-xl hover:bg-podcast-600 transition-colors disabled:opacity-50 active:scale-[0.98]">
                {submitting ? '提交中...' : '提交反馈'}
              </button>
            </form>

            {isStudioFeedback ? (
              <div className="mt-5 pt-3 border-t border-gray-100">
                <p className="text-center text-[11px] text-gray-300 leading-relaxed">
                  你反馈的信息将帮助其他用户获得更准确的录音室信息。
                </p>
              </div>
            ) : (
              <div className="mt-5 pt-3 border-t border-gray-100">
                <p className="text-center text-[11px] text-gray-300 leading-relaxed">
                  无论是使用的体验还是功能的期待，欢迎提出你的建议。
                </p>
                <p className="text-center mt-2">
                  <a
                    href={STUDIO_CORRECTION_HREF}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-gray-200 hover:text-gray-400 transition-colors"
                  >
                    录音室信息更正
                  </a>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
