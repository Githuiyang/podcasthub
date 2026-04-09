'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { editorsApi } from '@/lib/api'
import type { Editor } from '@/lib/types'
import { ContactInfo } from '@/app/components/ContactInfo'
import { TagList } from '@/app/components/TagList'
import { LoadingState } from '@/app/components/LoadingState'

export default function EditorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [editor, setEditor] = useState<Editor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    editorsApi
      .detail(Number(params.id))
      .then(res => setEditor(res.data))
      .catch(() => setEditor(null))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <LoadingState />
  if (!editor) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">剪辑师不存在</p>
        <button onClick={() => router.push('/editors')} className="mt-4 text-sm text-podcast-600 hover:underline">
          返回列表
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 sm:pb-0">
        <div className="max-w-2xl mx-auto">
      <button onClick={() => router.push('/editors')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← 返回剪辑师列表
      </button>

      {/* 头像和基本信息 */}
      <div className="card-section flex items-start gap-5">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden">
          {editor.avatar ? <img src={editor.avatar} alt={editor.name} className="w-full h-full object-cover" /> : '✂️'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{editor.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{editor.experience_years} 年经验</p>
          <TagList tags={editor.tags} color="bg-emerald-50 text-emerald-700" />
        </div>
      </div>

      {/* 简介 */}
      {editor.bio && (
        <div className="card-section">
          <h2 className="card-section-title">📝 简介</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{editor.bio}</p>
        </div>
      )}

      {/* 技能 */}
      {(editor.skills && editor.skills.length > 0) || (editor.software && editor.software.length > 0) ? (
        <div className="card-section">
          <h2 className="card-section-title">🛠 专业能力</h2>
          {editor.skills && editor.skills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">技能</p>
              <TagList tags={editor.skills} color="bg-emerald-50 text-emerald-700" />
            </div>
          )}
          {editor.software && editor.software.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">软件</p>
              <TagList tags={editor.software} color="bg-gray-100 text-gray-700" />
            </div>
          )}
          {editor.specialties && editor.specialties.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">专长领域</p>
              <TagList tags={editor.specialties} color="bg-purple-50 text-purple-700" />
            </div>
          )}
        </div>
      ) : null}

      {/* 价格 */}
      {(editor.price_per_episode || editor.price_per_hour) && (
        <div className="card-section">
          <h2 className="card-section-title">💰 报价</h2>
          <div className="flex gap-6">
            {editor.price_per_episode && (
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">¥{editor.price_per_episode}</p>
                <p className="text-xs text-gray-500">每期</p>
              </div>
            )}
            {editor.price_per_hour && (
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">¥{editor.price_per_hour}</p>
                <p className="text-xs text-gray-500">每小时</p>
              </div>
            )}
          </div>
          {editor.price_note && <p className="text-sm text-gray-500 mt-3">{editor.price_note}</p>}
        </div>
      )}

      {/* 作品 */}
      {editor.portfolio_images && editor.portfolio_images.length > 0 && (
        <div className="card-section">
          <h2 className="card-section-title">📸 作品</h2>
          <div className="grid grid-cols-2 gap-3">
            {editor.portfolio_images.map((img, i) => (
              <div key={i} className="h-32 rounded-lg overflow-hidden bg-gray-100">
                <img src={img} alt={`作品 ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 联系方式 */}
      {(editor.contact_phone || editor.contact_wechat || editor.contact_email) && (
        <div className="card-section">
          <h2 className="card-section-title">📞 联系方式</h2>
          <ContactInfo phone={editor.contact_phone} wechat={editor.contact_wechat} email={editor.contact_email} />
        </div>
      )}
    </div>
    </div>
  )
}