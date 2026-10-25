import type { RelatedVideo, WatchComment, WatchVideoDetail } from '../types/watch.types'

export const DEFAULT_WATCH_VIDEO: WatchVideoDetail = {
  id: 'v1',
  title: 'Tàn Tro Ánh Sáng: Kiến Trúc Serverless Transcoding & Distributed Edge CDN 4K',
  description:
    'Trải nghiệm toàn diện nền tảng YuhTube — Serverless Video Streaming với Adaptive Bitrate (HLS), AWS Elemental MediaConvert, S3 Multipart Upload và Single-Table DynamoDB Design. Video được phân phối qua CloudFront Edge CDN với độ trễ tối thiểu và hỗ trợ codec QVBR H.264 / AV1 HW.',
  posterUrl:
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1280&auto=format&fit=crop&q=80',
  views: '142.500 lượt xem',
  publishedAt: '24 thg 10, 2026',
  duration: '18:42',
  likesCount: 4820,
  uploader: {
    id: 'u1',
    name: 'AWS Cloud Arch VN',
    avatar:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    subscribers: '420.580 người đăng ký',
    isVerified: true,
  },
}

export const INITIAL_COMMENTS: WatchComment[] = [
  {
    id: 'c1',
    authorName: 'Trần Hoàng Long',
    authorAvatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    content:
      'Phần pipeline xử lý chunking 5MB chạy mượt thật sự anh ơi! Giải pháp AV1 SVT và QVBR tiết kiệm được bao nhiêu chi phí S3 vậy ạ?',
    createdAt: '12 phút trước',
    likes: 42,
  },
  {
    id: 'c2',
    authorName: 'Vũ Nguyễn Dev',
    authorAvatar:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    content:
      'Chất lượng hình ảnh 4K HDR trên màn OLED xem sướng mắt kinh khủng! Kiến trúc DynamoDB Single-Table đọc trang watch trong 1 Query đỉnh cao thật.',
    createdAt: '1 giờ trước',
    likes: 28,
  },
  {
    id: 'c3',
    authorName: 'CloudArchitect Vietnam',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    content: 'Hệ thống EventBridge trigger Lambda cập nhật status READY chạy real-time quá tuyệt vời.',
    createdAt: '3 giờ trước',
    likes: 15,
  },
]

export const WATCH_RELATED_VIDEOS: RelatedVideo[] = [
  {
    id: 'v2',
    title: 'Đỉnh Gió Rỗng (Master Suite IMAX 65mm HLS)',
    channel: 'AWS Cloud Arch VN',
    views: '89.4K lượt xem',
    time: '4 ngày trước',
    duration: '24:10',
    thumbnail:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'v3',
    title: "Hồi Ức Vô Tận (Director's Cut HLS Master)",
    channel: 'AWS Cloud Arch VN',
    views: '64.1K lượt xem',
    time: '1 tuần trước',
    duration: '32:05',
    thumbnail:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'v4',
    title: 'Âm Vang Đáy Biển (Documentary 4K HDR)',
    channel: 'National Geo VN',
    views: '41.8K lượt xem',
    time: '2 tuần trước',
    duration: '12:15',
    thumbnail:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
  },
]
