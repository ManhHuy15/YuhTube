import { apiClient } from '../../../common/api/apiClient'
import { formatRelativeTime } from '../../../common/utils/timeAgo'
import type { WatchComment, WatchVideoDetail } from '../types/watch.types'

export async function fetchVideoDetail(videoId: string): Promise<WatchVideoDetail | null> {
  try {
    const { data } = await apiClient.get<Record<string, any>>(`/videos/${videoId}`)
    if (!data || !data.id) return null

    return {
      id: data.id,
      title: data.title || 'Untitled Video',
      description: data.description ?? '',
      playbackUrl: data.playbackUrl || '',
      posterUrl: data.posterUrl || data.thumbnailUrl || '',
      views: data.views ? (String(data.views).includes('lượt xem') ? data.views : `${data.views} lượt xem`) : '0 lượt xem',
      publishedAt: data.publishedAt || (data.createdAt ? formatRelativeTime(data.createdAt) : 'Vừa xong'),
      duration: data.duration || (data.durationMs ? `${Math.floor(data.durationMs / 60000)}:${String(Math.floor((data.durationMs % 60000) / 1000)).padStart(2, '0')}` : '0:00'),
      likesCount: typeof data.likesCount === 'number' ? data.likesCount : 0,
      uploader: {
        id: data.uploader?.id || 'channel-default',
        name: data.uploader?.name || 'Creator',
        avatar: data.uploader?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.uploader?.name || 'Creator')}`,
        subscribers: data.uploader?.subscribers || '0 subscribers',
        isVerified: data.uploader?.isVerified ?? false,
      },
    }
  } catch {
    return null
  }
}

export async function fetchVideoComments(videoId: string): Promise<WatchComment[]> {
  try {
    const { data } = await apiClient.get<WatchComment[]>(`/videos/${videoId}/comments`)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
