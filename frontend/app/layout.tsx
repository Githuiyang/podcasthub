import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from './components/Navbar'

export const metadata: Metadata = {
  title: {
    default: 'PodcastHub - 中国播客录音室展示与选择平台',
    template: '%s | PodcastHub',
  },
  description:
    '查找全国各地播客录音室、播客录制空间。按城市筛选录音棚，查看地址、价格、设备、联系方式和交通便利程度，快速预约适合你的录音空间。',
  keywords: [
    '播客录音室', '录音棚', '播客录制', '录音室预约', '播客录音间',
    '上海录音室', '北京录音室', '杭州录音室', '深圳录音室', '广州录音室',
    '录音空间', '播客录制空间', '城市录音室',
  ],
  openGraph: {
    title: 'PodcastHub - 中国播客录音室展示与选择平台',
    description: '查找全国各地播客录音室，按城市筛选，查看地址、价格、联系方式，快速预约。',
    siteName: 'PodcastHub',
    locale: 'zh_CN',
    type: 'website',
    url: 'https://podcasthub.daydayup.media',
  },
  twitter: {
    card: 'summary',
    title: 'PodcastHub - 中国播客录音室展示与选择平台',
    description: '查找全国各地播客录音室，按城市筛选，查看地址、价格、联系方式，快速预约。',
  },
  alternates: {
    canonical: 'https://podcasthub.daydayup.media',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const AMAP_ORIGINS = [
  'https://webapi.amap.com',
  'https://webapi.amap.com/maps',
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        {AMAP_ORIGINS.map(origin => (
          <link key={origin} rel="preconnect" href={origin} crossOrigin="anonymous" />
        ))}
        {AMAP_ORIGINS.map(origin => (
          <link key={`${origin}-dns`} rel="dns-prefetch" href={origin} />
        ))}
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  name: 'PodcastHub',
                  alternateName: '中国播客录音室展示与选择平台',
                  url: 'https://podcasthub.daydayup.media',
                  description: '查找全国各地播客录音室、播客录制空间。按城市筛选，查看地址、价格、设备、联系方式。',
                  inLanguage: 'zh-CN',
                },
                {
                  '@type': 'Organization',
                  name: 'PodcastHub',
                  url: 'https://podcasthub.daydayup.media',
                },
              ],
            }),
          }}
        />
        <Navbar />
        {children}
      </body>
    </html>
  )
}
