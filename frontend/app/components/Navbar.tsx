'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FeedbackModal } from './FeedbackModal'

/**
 * 顶层导航 — 四个主入口 + 提交录音室 + 反馈
 *
 * 主入口：首页 / 录音间 / 剪辑师 / 商务
 * 桌面端：主入口 + 提交录音室按钮 + 反馈
 * 移动端：顶栏反馈 + 底部 Tab 四入口
 */
const navLinks = [
  { href: '/', label: '首页' },
  { href: '/studios', label: '录音间' },
  { href: '/editors', label: '剪辑师' },
  { href: '/business', label: '商务' },
]

export function Navbar() {
  const pathname = usePathname()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-podcast-400 to-podcast-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">PodcastHub</span>
          </Link>

          {/* 桌面导航 */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-podcast-50 text-podcast-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/submit-studio"
              className="ml-1 rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              添加我的录音室
            </Link>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <button
              onClick={() => setFeedbackOpen(true)}
              className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-podcast-500 hover:bg-podcast-50 transition-colors"
            >
              反馈
            </button>
          </div>

          {/* 移动端顶栏右侧 */}
          <div className="sm:hidden flex items-center gap-2">
            <Link href="/submit-studio" className="rounded-lg bg-black px-2.5 py-1.5 text-[11px] font-semibold text-white">
              添加录音室
            </Link>
            <button
              onClick={() => setFeedbackOpen(true)}
              className="text-xs text-gray-400 px-2 py-1"
            >
              反馈
            </button>
          </div>
        </div>
      </nav>

      {/* 移动端底部 Tab */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-100 pb-safe">
        <div className="flex justify-around h-12">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors ${
                pathname === link.href ? 'text-podcast-600' : 'text-gray-400'
              }`}
            >
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  )
}
