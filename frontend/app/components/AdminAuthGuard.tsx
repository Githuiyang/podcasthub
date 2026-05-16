'use client'

import { useState, useEffect, ReactNode } from 'react'
import { api, API_BASE } from '@/lib/api'

interface AdminAuthGuardProps {
  children: ReactNode
}

const TOKEN_KEY = 'podcasthub_admin_token'
const EXPIRES_KEY = 'podcasthub_admin_expires'

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 检查已有 token
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY)
    const expires = localStorage.getItem(EXPIRES_KEY)
    if (saved && expires && Date.now() / 1000 < Number(expires)) {
      // 验证 token
      api.get(`/api/auth/admin/verify?token=${saved}`)
        .then(res => {
          if (res.data?.valid) {
            setToken(saved)
          } else {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(EXPIRES_KEY)
          }
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(EXPIRES_KEY)
        })
        .finally(() => setLoading(false))
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(EXPIRES_KEY)
      setLoading(false)
    }
  }, [])

  const handleLogin = async () => {
    setError('')
    setSubmitting(true)
    try {
      const res = await api.post('/api/auth/admin/login', { password })
      const { token: newToken, expires_at } = res.data
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(EXPIRES_KEY, String(expires_at))
      setToken(newToken)
    } catch (err: any) {
      setError(err?.response?.data?.detail || '登录失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-sm">验证中...</div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-xs">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-podcast-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-podcast-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">后台管理</h2>
            <p className="text-xs text-gray-400 mb-5">请输入管理密码</p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="管理密码"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-podcast-300 focus:border-transparent mb-3"
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={submitting || !password}
              className="w-full py-2 text-sm font-medium text-white bg-podcast-500 rounded-lg hover:bg-podcast-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '验证中...' : '进入后台'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
