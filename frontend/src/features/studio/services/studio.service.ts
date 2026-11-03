import { apiClient } from '../../../common/api/apiClient'
import { formatRelativeTime } from '../../../common/utils/timeAgo'
import { uploadThumbnail, updateVideoMetadata } from '../../upload/services/upload.service'
import {
  DEFAULT_CHANNEL_ANALYTICS,
  DEFAULT_LATEST_VIDEO,
} from '../constants/studio.constants'
import type { ChannelAnalytics, LatestVideoStats, StudioVideoRow, UpdateVideoMetadataPayload } from '../types/studio.types'

export { uploadThumbnail, updateVideoMetadata }

export async function deleteVideo(videoId: string): Promise<boolean> {
  try {
    await apiClient.delete(`/videos/${videoId}`)
    return true
  } catch {
    return false
  }
}

export async function updateStudioVideo(
  videoId: string,
  payload: UpdateVideoMetadataPayload,
): Promise<boolean> {
  try {
    await updateVideoMetadata(videoId, payload)
    return true
  } catch {
    return false
  }
}

export async function fetchStudioVideos(uploaderId?: string): Promise<StudioVideoRow[]> {
  try {
    const url = uploaderId ? `/videos?uploaderId=${encodeURIComponent(uploaderId)}` : '/videos'
    const { data } = await apiClient.get<{ items: any[] }>(url)
    if (Array.isArray(data?.items)) {
      return data.items.map((item) => ({
        id: item.id,
        title: item.title || 'Untitled',
        subtitle: item.title || '',
        thumbnailUrl: item.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&auto=format&fit=crop&q=80',
        duration: item.durationMs ? `${Math.floor(item.durationMs / 60000)}:${String(Math.floor((item.durationMs % 60000) / 1000)).padStart(2, '0')}` : '0:00',
        visibility: item.isPrivate ? 'Riêng tư' : 'Công khai',
        restrictions: 'Không có',
        publishedDate: formatRelativeTime(item.createdAt),
        views: '0',
        comments: 0,
        likePercentage: '100%',
      }))
    }
    return []
  } catch {
    return []
  }
}

export async function fetchChannelAnalytics(): Promise<{
  latestVideo: LatestVideoStats
  analytics: ChannelAnalytics
}> {
  return {
    latestVideo: DEFAULT_LATEST_VIDEO,
    analytics: DEFAULT_CHANNEL_ANALYTICS,
  }
}
