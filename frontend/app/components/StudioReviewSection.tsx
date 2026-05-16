'use client'

import { useEffect, useState } from 'react'
import { reviewsApi } from '@/lib/api'
import type { StudioReview } from '@/lib/types'

interface StudioReviewSectionProps {
  studioId: number
  onWriteReview: () => void
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function StudioReviewSection({ studioId, onWriteReview }: StudioReviewSectionProps) {
  const [reviews, setReviews] = useState<StudioReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    reviewsApi
      .list(studioId)
      .then(res => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [studioId])

  if (loading) {
    return (
      <div className="card-section">
        <h2 className="card-section-title">体验反馈</h2>
        <div className="text-sm text-gray-300 py-3">加载中...</div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="card-section">
        <h2 className="card-section-title">体验反馈</h2>
        <p className="text-sm text-gray-400 py-2">暂无体验反馈</p>
        <button
          onClick={onWriteReview}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1"
        >
          分享你的录音体验
        </button>
      </div>
    )
  }

  return (
    <div className="card-section">
      <h2 className="card-section-title">体验反馈</h2>
      <div className="space-y-3">
        {reviews.slice(0, 5).map(review => (
          <div key={review.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
            <div className="flex items-center gap-2 mb-1">
              {review.rating && (
                <span className="text-amber-400 text-xs">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
              )}
              <span className="text-xs text-gray-400">
                {review.nickname || '匿名用户'}
              </span>
              {review.created_at && (
                <span className="text-xs text-gray-300">{formatDate(review.created_at)}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
          </div>
        ))}
      </div>
      <button
        onClick={onWriteReview}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-3"
      >
        分享你的录音体验
      </button>
    </div>
  )
}
