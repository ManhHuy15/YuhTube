import { apiClient } from '../../../common/api/apiClient'
import { formatRelativeTime, formatViewCount } from '../../../common/utils/timeAgo'
import type { LikeResponse, WatchComment, WatchVideoDetail } from '../types/watch.types'

function mapRawComment(item: Record<string, any>): WatchComment {
  const authorName = item.userName || item.authorName || 'Người dùng'
  const authorAvatar =
    item.userAvatar ||
    item.authorAvatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`

  return {
    id: item.id || `c_${Date.now()}`,
    authorName,
    authorAvatar,
    content: item.content || '',
    createdAt: item.createdAt ? formatRelativeTime(item.createdAt) : 'Vừa xong',
    likes: typeof item.likes === 'number' ? item.likes : 0,
    userId: item.userId,
  }
}

export async function fetchVideoDetail(videoId: string): Promise<{
  video: WatchVideoDetail
  initialComments: WatchComment[]
} | null> {
  try {
    const { data } = await apiClient.get<Record<string, any>>(`/videos/${videoId}`)
    if (!data || !data.id) return null

    const initialComments: WatchComment[] = Array.isArray(data.comments)
      ? data.comments.map(mapRawComment)
      : []

    const video: WatchVideoDetail = {
      id: data.id,
      title: data.title || 'Untitled Video',
      description: data.description ?? '',
      playbackUrl: data.playbackUrl || '',
      posterUrl: data.posterUrl || data.thumbnailUrl || '',
      views: formatViewCount(data.views),
      publishedAt: data.publishedAt || (data.createdAt ? formatRelativeTime(data.createdAt) : 'Vừa xong'),
      duration:
        data.duration ||
        (data.durationMs
          ? `${Math.floor(data.durationMs / 60000)}:${String(Math.floor((data.durationMs % 60000) / 1000)).padStart(2, '0')}`
          : '0:00'),
      likesCount: typeof data.likesCount === 'number' ? data.likesCount : 0,
      isLiked: Boolean(data.isLiked),
      uploader: {
        id: data.uploader?.id || 'channel-default',
        name: data.uploader?.name || 'Creator',
        avatar:
          data.uploader?.avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.uploader?.name || 'Creator')}`,
        subscribers: data.uploader?.subscribers || '0 subscribers',
        isVerified: data.uploader?.isVerified ?? false,
      },
    }

    return { video, initialComments }
  } catch {
    return null
  }
}

export async function fetchVideoComments(videoId: string): Promise<WatchComment[]> {
  try {
    const { data } = await apiClient.get<Record<string, any>[]>(`/videos/${videoId}/comments`)
    return Array.isArray(data) ? data.map(mapRawComment) : []
  } catch {
    return []
  }
}

export async function postVideoComment(videoId: string, content: string): Promise<WatchComment> {
  const { data } = await apiClient.post<Record<string, any>>(`/videos/${videoId}/comments`, {
    content,
  })
  return mapRawComment(data)
}

export async function deleteVideoComment(videoId: string, commentId: string): Promise<void> {
  await apiClient.delete(`/videos/${videoId}/comments/${commentId}`)
}

export async function toggleVideoLike(videoId: string): Promise<LikeResponse> {
  const { data } = await apiClient.post<LikeResponse>(`/videos/${videoId}/like`)
  return data
}

export async function fetchVideoLikeStatus(videoId: string): Promise<LikeResponse> {
  const { data } = await apiClient.get<LikeResponse>(`/videos/${videoId}/like`)
  return data
}
