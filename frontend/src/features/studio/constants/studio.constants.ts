import type { ChannelAnalytics, LatestVideoStats, StudioVideoRow } from '../types/studio.types'

export const DEFAULT_LATEST_VIDEO: LatestVideoStats = {
  title: 'Tàn Tro Ánh Sáng: Kiến Trúc Serverless Transcoding & Distributed Edge CDN 4K',
  thumbnailUrl:
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
  duration: '18:42',
  rank: '1/10',
  views: '142.500',
  viewsGrowth: '+32%',
  ctr: '8.4%',
  ctrGrowth: '+1.8%',
  avgDuration: '6:18',
}

export const DEFAULT_CHANNEL_ANALYTICS: ChannelAnalytics = {
  subscribers: '420.580',
  subscribersGrowth: '+12.4K',
  views28Days: '1.84 Tr',
  watchTimeHours: '94.2 N',
  estimatedRevenue: '$4,180.50',
  topVideos48h: [
    { title: 'Đỉnh Gió Rỗng (Master Suite 4K)', views: '38.2K' },
    { title: "Hồi Ức Vô Tận (Director's Cut)", views: '24.8K' },
  ],
}

export const DEFAULT_STUDIO_VIDEOS: StudioVideoRow[] = [
  {
    id: 'v1',
    title: 'Tàn Tro Ánh Sáng (Cine-Cut 4K AV1)',
    subtitle: 'Thêm mô tả • 24 thg 10, 2026',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    duration: '18:42',
    visibility: 'Công khai',
    restrictions: 'Không có',
    publishedDate: '24 thg 10, 2026',
    views: '142.500',
    comments: 184,
    likePercentage: '98.6%',
  },
  {
    id: 'v2',
    title: 'Đỉnh Gió Rỗng (Master Suite IMAX 65mm)',
    subtitle: 'HEVC Main10 • 20 thg 10, 2026',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    duration: '24:10',
    visibility: 'Công khai',
    restrictions: 'Không có',
    publishedDate: '20 thg 10, 2026',
    views: '89.420',
    comments: 96,
    likePercentage: '99.1%',
  },
  {
    id: 'v3',
    title: "Hồi Ức Vô Tận (Director's Cut HLS Master)",
    subtitle: 'Surround 5.1 • 15 thg 10, 2026',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    duration: '32:05',
    visibility: 'Công khai',
    restrictions: 'Không có',
    publishedDate: '15 thg 10, 2026',
    views: '64.120',
    comments: 72,
    likePercentage: '97.8%',
  },
  {
    id: 'v4',
    title: 'Âm Vang Đáy Biển (Documentary 4K HDR)',
    subtitle: 'AV1 Multi-bitrate • 08 thg 10, 2026',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    duration: '12:15',
    visibility: 'Công khai',
    restrictions: 'Không có',
    publishedDate: '08 thg 10, 2026',
    views: '41.800',
    comments: 53,
    likePercentage: '98.2%',
  },
]
