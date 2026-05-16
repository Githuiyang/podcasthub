'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm mx-auto px-4">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-lg font-semibold text-slate-900">出了点问题</h2>
        <p className="mt-2 text-sm text-slate-500">页面加载遇到了错误，请稍后重试。</p>
        <button
          onClick={reset}
          className="mt-4 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          重新加载
        </button>
      </div>
    </div>
  )
}
