'use client'

interface TagListProps {
  tags: string[] | null
  color?: string
}

export function TagList({ tags, color = 'bg-purple-50 text-purple-600' }: TagListProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex gap-1.5 flex-wrap">
      {tags.map(tag => (
        <span key={tag} className={`text-xs px-2 py-0.5 rounded ${color}`}>
          {tag}
        </span>
      ))}
    </div>
  )
}
