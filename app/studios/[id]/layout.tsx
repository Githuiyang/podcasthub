import type { Metadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'https://api.daydayup.media'

  try {
    const res = await fetch(`${baseUrl}/api/studios/detail/${id}`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('not found')
    const studio = await res.json()
    const name = studio.name || '录音室'
    const city = studio.city || ''
    const district = studio.district || ''
    const area = [city, district].filter(Boolean).join('')
    const priceText = studio.charging_method || studio.price_note || ''

    const title = `${name} - ${area}播客录音室详情`
    const description = [
      `${name}位于${area || '中国'}`,
      priceText ? `收费方式：${priceText}` : '',
      studio.address ? `地址：${studio.address}` : '',
      studio.open_hours ? `开放时间：${studio.open_hours}` : '',
      '查看详细设备、联系方式和交通信息，预约你的播客录制空间。',
    ].filter(Boolean).join('。')

    return {
      title,
      description,
      openGraph: {
        title: `${title} | PodcastHub`,
        description,
        ...(studio.cover_image ? { images: [studio.cover_image] } : {}),
      },
      alternates: {
        canonical: `https://podcasthub.daydayup.media/studios/${id}`,
      },
    }
  } catch {
    return {
      title: '播客录音室详情',
      description: '查看播客录音室的详细信息，包括地址、价格、设备、联系方式和交通信息。',
    }
  }
}

export default function StudioDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
