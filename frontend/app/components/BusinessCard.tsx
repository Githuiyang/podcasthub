'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { BusinessListItem } from '@/lib/types'

interface BusinessCardProps {
  contact: BusinessListItem
}

export function BusinessCard({ contact }: BusinessCardProps) {
  return (
    <Link href={`/business/${contact.id}`}>
      <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
        <div className="flex items-start gap-4">
          {/* 头像 */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
            {contact.avatar ? (
              <Image src={contact.avatar} alt={contact.name} width={56} height={56} className="w-full h-full object-cover" />
            ) : (
              '🤝'
            )}
          </div>
          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{contact.name}</h3>
            {contact.company && (
              <p className="text-xs text-gray-500 mt-0.5">{contact.company}</p>
            )}
            {contact.business_type && (
              <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded mt-1.5">
                {contact.business_type}
              </span>
            )}
            {contact.budget_range && (
              <p className="text-sm text-gray-600 mt-1.5">预算: {contact.budget_range}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
