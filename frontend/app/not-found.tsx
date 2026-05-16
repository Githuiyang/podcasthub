import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm mx-auto px-4">
        <div className="text-4xl mb-4">🎙</div>
        <h2 className="text-lg font-semibold text-slate-900">页面不存在</h2>
        <p className="mt-2 text-sm text-slate-500">你访问的页面可能已被移除或暂时不可用。</p>
        <Link
          href="/"
          className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}
