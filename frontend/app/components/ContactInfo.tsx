'use client'

interface ContactInfoProps {
  name?: string | null
  phone?: string | null
  wechat?: string | null
  email?: string | null
}

export function ContactInfo({ name, phone, wechat, email }: ContactInfoProps) {
  const items = [
    name && { icon: '👤', value: name, href: null },
    phone && { icon: '📱', value: phone, href: `tel:${phone}` },
    wechat && { icon: '💬', value: `微信: ${wechat}`, href: null },
    email && { icon: '📧', value: email, href: `mailto:${email}` },
  ].filter(Boolean) as { icon: string; value: string; href: string | null }[]

  if (items.length === 0) return null

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="text-xs opacity-40">{item.icon}</span>
          {item.href ? (
            <a href={item.href} className="text-podcast-500 hover:underline text-gray-600">{item.value}</a>
          ) : (
            <span className="text-gray-600">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  )
}
