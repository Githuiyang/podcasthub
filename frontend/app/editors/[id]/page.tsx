'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
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
        <p className="text-slate-400">剪辑师不存在</p>
        <button onClick={() => router.push('/editors')} className="mt-4 text-sm text-podcast-500 hover:underline">
          返回列表
        </button>
      </div>
    )
  }

  const hasSkills = (editor.skills && editor.skills.length > 0) || (editor.software && editor.software.length > 0) || (editor.specialties && editor.specialties.length > 0)
  const hasPortfolio = editor.portfolio_works || (editor.portfolio_images && editor.portfolio_images.length > 0) || (editor.portfolio_links && editor.portfolio_links.length > 0)
  const hasPrice = editor.price_per_episode || editor.price_per_hour || editor.price_note
  const hasContact = editor.contact_phone || editor.contact_wechat || editor.contact_email

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16 sm:pb-0 animate-fade-in-up">
      <div className="max-w-2xl mx-auto">
        {/* 返回 */}
        <button
          onClick={() => router.push('/editors')}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mb-4 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          返回制作人列表
        </button>

        {/* ── 1. 头部：头像 + 姓名 + 类型 + 简介 ── */}
        <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-slate-100">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden mb-4 ring-4 ring-slate-50">
            {editor.avatar ? (
              <Image src={editor.avatar} alt={editor.name} width={96} height={96} className="w-full h-full object-cover" priority />
            ) : (
              <svg className="w-10 h-10 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-900">{editor.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            {editor.editor_type && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{editor.editor_type}</span>
            )}
            {editor.availability_status && (
              <span className={`text-xs px-2.5 py-1 rounded-full ${
                editor.availability_status === '可接单'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-slate-50 text-slate-400'
              }`}>
                {editor.availability_status}
              </span>
            )}
          </div>
          {editor.bio && (
            <p className="text-sm text-slate-500 mt-3 max-w-md leading-relaxed">{editor.bio}</p>
          )}
          {editor.tags && editor.tags.length > 0 && (
            <div className="mt-3">
              <TagList tags={editor.tags} color="bg-slate-50 text-slate-500" />
            </div>
          )}
        </div>

        {/* ── 2. 统计卡 ── */}
        {(editor.experience_years > 0 || editor.price_per_episode || (editor.portfolio_links && editor.portfolio_links.length > 0)) && (
          <div className="mb-5 pb-5 border-b border-slate-100">
            <div className="flex justify-center gap-10">
              {editor.experience_years > 0 && (
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{editor.experience_years}</p>
                  <p className="text-xs text-slate-400">年经验</p>
                </div>
              )}
              {editor.price_per_episode && (
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">¥{editor.price_per_episode}</p>
                  <p className="text-xs text-slate-400">每期</p>
                </div>
              )}
              {editor.portfolio_links && editor.portfolio_links.length > 0 && (
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{editor.portfolio_links.length}</p>
                  <p className="text-xs text-slate-400">作品</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 3. 擅长方向 ── */}
        {editor.strengths && (
          <div className="mb-5 pb-5 border-b border-slate-100">
            <div className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 mb-2">擅长方向</div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{editor.strengths}</p>
          </div>
        )}

        {/* ── 4. 专业能力 ── */}
        {hasSkills && (
          <div className="mb-5 pb-5 border-b border-slate-100">
            <div className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 mb-3">专业能力</div>
            {editor.skills && editor.skills.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] text-slate-400 mb-1.5">技能</p>
                <TagList tags={editor.skills} color="bg-slate-50 text-slate-600" />
              </div>
            )}
            {editor.software && editor.software.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] text-slate-400 mb-1.5">软件</p>
                <TagList tags={editor.software} color="bg-slate-50 text-slate-500" />
              </div>
            )}
            {editor.specialties && editor.specialties.length > 0 && (
              <div>
                <p className="text-[11px] text-slate-400 mb-1.5">专长领域</p>
                <TagList tags={editor.specialties} color="bg-slate-50 text-slate-600" />
              </div>
            )}
          </div>
        )}

        {/* ── 5. 过往作品 ── */}
        {hasPortfolio && (
          <div className="mb-5 pb-5 border-b border-slate-100">
            <div className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 mb-3">过往作品</div>
            {editor.portfolio_works && (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-3">{editor.portfolio_works}</p>
            )}
            {editor.portfolio_images && editor.portfolio_images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {editor.portfolio_images.map((img, i) => (
                  <div key={i} className="h-28 rounded-xl overflow-hidden bg-slate-50 relative">
                    <Image src={img} alt={`作品 ${i + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 288px" />
                  </div>
                ))}
              </div>
            )}
            {editor.portfolio_links && editor.portfolio_links.length > 0 && (
              <div className="space-y-1">
                {editor.portfolio_links.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-500 hover:text-slate-700 truncate transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            )}
            {editor.portfolio_url && (
              <a href={editor.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mt-2 transition-colors">
                作品集主页 &rarr;
              </a>
            )}
          </div>
        )}

        {/* ── 6. 合作评价 ── */}
        {editor.coop_review && (
          <div className="mb-5 pb-5 border-b border-slate-100">
            <div className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 mb-2">合作评价</div>
            <blockquote className="text-sm text-slate-600 leading-relaxed border-l-2 border-slate-200 pl-4 italic">
              {editor.coop_review}
            </blockquote>
          </div>
        )}

        {/* ── 7. 报价 ── */}
        {hasPrice && (
          <div className="mb-5 pb-5 border-b border-slate-100">
            <div className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 mb-2">报价</div>
            <div className="flex gap-8">
              {editor.price_per_episode && (
                <div>
                  <span className="text-lg font-bold text-slate-900">¥{editor.price_per_episode}</span>
                  <span className="text-xs text-slate-400 ml-1">/期</span>
                </div>
              )}
              {editor.price_per_hour && (
                <div>
                  <span className="text-lg font-bold text-slate-900">¥{editor.price_per_hour}</span>
                  <span className="text-xs text-slate-400 ml-1">/时</span>
                </div>
              )}
            </div>
            {editor.price_note && <p className="text-xs text-slate-400 mt-2">{editor.price_note}</p>}
          </div>
        )}

        {/* ── 8. 联系方式 ── */}
        {hasContact && (
          <div className="mb-5">
            <div className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-400 mb-2">联系方式</div>
            <ContactInfo phone={editor.contact_phone} wechat={editor.contact_wechat} email={editor.contact_email} />
          </div>
        )}
      </div>
    </div>
  )
}
