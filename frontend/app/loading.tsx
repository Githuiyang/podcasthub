export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-sm text-slate-400">加载中...</p>
      </div>
    </div>
  )
}
