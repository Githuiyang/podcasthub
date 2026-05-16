'use client'

import { useState } from 'react'
import { reviewsApi } from '@/lib/api'

interface StudioReviewModalProps {
  studioId: number
  studioName: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function StudioReviewModal({ studioId, studioName, open, onClose, onSuccess }: StudioReviewModalProps) {
  const [nickname, setNickname] = useState('')
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setError('')
    setSubmitting(true)
    try {
      await reviewsApi.create({
        studio_id: studioId,
        rating: rating || undefined,
        content: content.trim(),
        nickname: nickname.trim() || undefined,
      })
      setDone(true)
      onSuccess()
    } catch {
      setError('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setDone(false)
    setError('')
    setNickname('')
    setRating(0)
    setContent('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-5 shadow-float animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-6">
            <span className="text-3xl block mb-2">✅</span>
            <h3 className="text-base font-semibold text-gray-900 mb-1">感谢你的体验反馈!</h3>
            <p className="text-xs text-gray-400">审核通过后会在详情页展示</p>
            <button onClick={handleClose} className="mt-5 px-5 py-2 text-xs text-white bg-podcast-500 rounded-xl hover:bg-podcast-600 transition-colors">关闭</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">体验反馈</h3>
              <button onClick={handleClose} className="text-gray-300 hover:text-gray-500 text-lg leading-none">&times;</button>
            </div>
            <p className="text-xs text-gray-400 mb-3">关于 <span className="text-gray-600 font-medium">{studioName}</span></p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">评分（可选）</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n === rating ? 0 : n)}
                      className={`text-xl transition-colors ${n <= rating ? 'text-amber-400' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                required
                rows={3}
                placeholder="分享你的录音体验 *"
                value={content}
                onChange={e => setContent(e.target.value)}
                disabled={submitting}
                className="input-field disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="你的称呼（可选）"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                disabled={submitting}
                className="input-field disabled:opacity-50"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="w-full py-2.5 text-xs text-white bg-podcast-500 rounded-xl hover:bg-podcast-600 transition-colors disabled:opacity-50 active:scale-[0.98]"
              >
                {submitting ? '提交中...' : '提交反馈'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
