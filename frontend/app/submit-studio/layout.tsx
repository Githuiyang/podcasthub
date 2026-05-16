import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '提交我的录音室 - 收录到 PodcastHub',
  description:
    '将你的播客录音室信息提交到 PodcastHub，经过审核后收录到全国录音室平台，让更多播客创作者找到你的录音空间。',
  openGraph: {
    title: '提交我的录音室 - 收录到 PodcastHub',
    description: '将你的播客录音室信息提交到 PodcastHub，审核后收录到全国录音室平台。',
  },
  alternates: {
    canonical: 'https://podcasthub.daydayup.media/submit-studio',
  },
}

export default function SubmitStudioLayout({ children }: { children: React.ReactNode }) {
  return children
}
