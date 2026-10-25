import type { VideoFeedItem } from '../types/home.types'

export const HOME_CATEGORIES = [
  'Tất cả',
  'Kiến trúc Serverless',
  'AWS MediaConvert',
  'HLS Streaming',
  'C# .NET 10',
  'DynamoDB Single-Table',
  'CloudFront CDN',
  'React 19 & Vite',
  'Trực tiếp',
  'Âm nhạc 4K',
  'Trò chơi',
  'Tin tức công nghệ',
] as const

export const DEFAULT_FEED_VIDEOS: VideoFeedItem[] = [
  {
    id: 'v1',
    title: 'Tàn Tro Ánh Sáng: Kiến Trúc Serverless Transcoding & Distributed Edge CDN 4K',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    duration: '18:42',
    views: '142.500',
    createdAt: '2 giờ trước',
    uploader: {
      id: 'u1',
      name: 'AWS Cloud Arch VN',
      avatar:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      isVerified: true,
    },
    badge: 'MỚI ĐĂNG',
  },
  {
    id: 'v2',
    title: 'Đỉnh Gió Rỗng (Master Suite IMAX 65mm HLS QVBR 720p/1080p)',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    duration: '24:10',
    views: '89.420',
    createdAt: '4 ngày trước',
    uploader: {
      id: 'u1',
      name: 'AWS Cloud Arch VN',
      avatar:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      isVerified: true,
    },
  },
  {
    id: 'v3',
    title: "Hồi Ức Vô Tận (Director's Cut HLS Master & Multi-Bitrate)",
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    duration: '32:05',
    views: '64.120',
    createdAt: '1 tuần trước',
    uploader: {
      id: 'u2',
      name: 'Cinema 4K Vietnam',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      isVerified: true,
    },
  },
  {
    id: 'v4',
    title: 'Âm Vang Đáy Biển: Bí ẩn Rãnh Mariana (Documentary 4K HDR AV1)',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    duration: '12:15',
    views: '41.800',
    createdAt: '2 tuần trước',
    uploader: {
      id: 'u3',
      name: 'Discovery World VN',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      isVerified: false,
    },
  },
]
