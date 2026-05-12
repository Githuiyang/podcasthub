'use client'

interface EmptyStateProps {
  icon?: string
  message: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon = '📭', message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-gray-500 mb-4">{message}</p>
      {action && (
        <a
          href={action.href}
          className="text-sm text-podcast-600 hover:text-podcast-700 font-medium"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
