'use client'

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-podcast-200 border-t-podcast-500 rounded-full animate-spin" />
        <span className="text-xs text-gray-300">加载中</span>
      </div>
    </div>
  )
}
