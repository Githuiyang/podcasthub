'use client'

import Link from 'next/link'
import type { EditorListItem } from '@/lib/types'

interface EditorCardProps {
  editor: EditorListItem
}

export function EditorCard({ editor }: EditorCardProps) {
  return (
    <Link href={`/editors/${editor.id}`}>
      <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
        <div className="flex items-start gap-4">
          {/* 头像 */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
            {editor.avatar ? (
              <img src={editor.avatar} alt={editor.name} className="w-full h-full object-cover" />
            ) : (
              '✂️'
            )}
          </div>
          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{editor.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{editor.experience_years} 年经验</p>
            {editor.price_per_episode && (
              <p className="text-sm font-medium text-emerald-600 mt-1">¥{editor.price_per_episode}/期</p>
            )}
            {editor.skills && editor.skills.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-2">
                {editor.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
