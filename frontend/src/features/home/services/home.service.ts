import { apiClient } from '../../../common/api/apiClient'
import type { VideoFeedItem } from '../types/home.types'

interface PagedVideoFeedResponse {
  items: VideoFeedItem[]
  nextCursor?: string | null
}

function mapRawFeedItem(item: any): VideoFeedItem {
  const durationMs = item.durationMs || 0
  const durationMinutes = Math.floor(durationMs / 60000)
  const durationSeconds = Math.floor((durationMs % 60000) / 1000)
  const durationFormatted = durationMs > 0
    ? `${durationMinutes}:${String(durationSeconds).padStart(2, '0')}`
    : item.duration || '0:00'

  return {
    id: item.id,
    title: item.title || 'Untitled Video',
    thumbnailUrl: item.thumbnailUrl || '',
    duration: durationFormatted,
    views: item.views || '0 views',
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US') : 'Just now',
    badge: item.badge,
    uploader: {
      id: item.uploader?.id || 'channel-default',
      name: item.uploader?.name || 'Creator',
      avatar: item.uploader?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      isVerified: item.uploader?.isVerified ?? false,
    },
  }
}

export async function fetchHomeFeed(
  category?: string,
  cursor?: string,
): Promise<VideoFeedItem[]> {
  try {
    const { data } = await apiClient.get<PagedVideoFeedResponse | any[]>('/videos', {
      params: {
        category: category && category !== 'Tất cả' && category !== 'All' ? category : undefined,
        cursor: cursor || undefined,
      },
    })

    const rawList = Array.isArray(data) ? data : data?.items
    if (Array.isArray(rawList)) {
      return rawList.map(mapRawFeedItem)
    }

    return []
  } catch {
    return []
  }
}
