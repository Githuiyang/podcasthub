'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { businessApi } from '@/lib/api'
import type { BusinessContact } from '@/lib/types'
import { ContactInfo } from '@/app/components/ContactInfo'
import { TagList } from '@/app/components/TagList'
import { LoadingState } from '@/app/components/LoadingState'

export default function BusinessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contact, setContact] = useState<BusinessContact | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    businessApi
      .detail(Number(params.id))
      .then(res => setContact(res.data))
      .catch(() => setContact(null))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <LoadingState />
  if (!contact) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">商务信息不存在</p>
        <button onClick={() => router.push('/business')} className="mt-4 text-sm text-podcast-600 hover:underline">
          返回列表
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 sm:pb-0">
      <div className="max-w-2xl mx-auto">
      <button onClick={() => router.push('/business')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← 返回商务列表
      </button>

      {/* 基本信息卡片 */}
      <div className="card-section flex items-start gap-5">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden">
          {contact.avatar ? <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" /> : '🤝'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
          {contact.company && <p className="text-sm text-gray-500 mt-0.5">{contact.company}</p>}
          {contact.title && <p className="text-sm text-gray-500">{contact.title}</p>}
          {contact.business_type && (
            <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded mt-1.5">
              {contact.business_type}
            </span>
          )}
          <div className="mt-2">
            <TagList tags={contact.tags} color="bg-blue-50 text-blue-700" />
          </div>
        </div>
      </div>

      {/* 简介 */}
      {contact.bio && (
        <div className="card-section">
          <h2 className="card-section-title">📝 简介</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{contact.bio}</p>
        </div>
      )}

      {/* 合作信息 */}
      {(contact.budget_range || (contact.cooperation_types && contact.cooperation_types.length > 0)) && (
        <div className="card-section">
          <h2 className="card-section-title">💼 合作信息</h2>
          {contact.budget_range && (
            <p className="text-sm text-gray-700 mb-3">预算范围: <span className="font-medium text-blue-600">{contact.budget_range}</span></p>
          )}
          {contact.cooperation_types && contact.cooperation_types.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">合作类型</p>
              <TagList tags={contact.cooperation_types} color="bg-blue-50 text-blue-700" />
            </div>
          )}
          {contact.industry && <p className="text-sm text-gray-500 mt-3">行业: {contact.industry}</p>}
        </div>
      )}

      {/* 合作案例 */}
      {contact.reference_podcasts && contact.reference_podcasts.length > 0 && (
        <div className="card-section">
          <h2 className="card-section-title">📻 合作播客</h2>
          <div className="flex flex-wrap gap-2">
            {contact.reference_podcasts.map((name, i) => (
              <span key={i} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">{name}</span>
            ))}
          </div>
        </div>
      )}

      {/* 案例图片 */}
      {contact.case_images && contact.case_images.length > 0 && (
        <div className="card-section">
          <h2 className="card-section-title">📸 合作案例</h2>
          <div className="grid grid-cols-2 gap-3">
            {contact.case_images.map((img, i) => (
              <div key={i} className="h-32 rounded-lg overflow-hidden bg-gray-100">
                <img src={img} alt={`案例 ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 联系方式 */}
      {(contact.contact_phone || contact.contact_wechat || contact.contact_email) && (
        <div className="card-section">
          <h2 className="card-section-title">📞 联系方式</h2>
          <ContactInfo phone={contact.contact_phone} wechat={contact.contact_wechat} email={contact.contact_email} />
        </div>
      )}
    </div>
    </div>
  )
}