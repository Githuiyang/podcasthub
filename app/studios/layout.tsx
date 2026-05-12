import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '查找播客录音室 - 城市筛选与预约信息',
  description:
    '浏览全国播客录音室列表。按城市筛选录音棚，查看地址、价格、设备、开放时间和联系方式，找到最适合你的播客录制空间。',
  openGraph: {
    title: '查找播客录音室 - 城市筛选与预约信息 | PodcastHub',
    description: '浏览全国播客录音室列表，按城市筛选，查看地址、价格、联系方式。',
  },
  alternates: {
    canonical: 'https://podcasthub.daydayup.media/studios',
  },
}

export default function StudiosLayout({ children }: { children: React.ReactNode }) {
  return children
}
