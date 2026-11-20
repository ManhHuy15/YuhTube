import { apiClient } from '../../../common/api/apiClient'
import { formatRelativeTime } from '../../../common/utils/timeAgo'
import { uploadThumbnail, updateVideoMetadata } from '../../upload/services/upload.service'
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
      return data.items.map((item) => {
        const durationMs = item.durationMs || 0
        const durationFormatted = durationMs > 0
          ? `${Math.floor(durationMs / 60000)}:${String(Math.floor((durationMs % 60000) / 1000)).padStart(2, '0')}`
          : '0:00'

        return {
          id: item.id,
          title: item.title || 'Untitled Video',
          subtitle: item.description || '',
          thumbnailUrl: item.thumbnailUrl || '',
          duration: durationFormatted,
          visibility: item.isPrivate ? 'Riêng tư' : 'Công khai',
          restrictions: 'Không có',
          publishedDate: item.createdAt ? formatRelativeTime(item.createdAt) : 'Vừa xong',
          views: item.views ? String(item.views) : '0',
          comments: typeof item.commentsCount === 'number' ? item.commentsCount : 0,
          likePercentage: '100%',
        }
      })
    }
    return []
  } catch {
    return []
  }
}

export function computeChannelAnalytics(videos: StudioVideoRow[]): {
  latestVideo: LatestVideoStats | null
  analytics: ChannelAnalytics
} {
  if (videos.length === 0) {
    return {
      latestVideo: null,
      analytics: {
        subscribers: '0',
        subscribersGrowth: '0',
        views28Days: '0',
        watchTimeHours: '0.0 h',
        estimatedRevenue: '$0.00',
        topVideos48h: [],
      },
    }
  }

  const latest = videos[0]
  const totalViews = videos.reduce((acc, v) => acc + (parseInt(v.views, 10) || 0), 0)

  return {
    latestVideo: {
      title: latest.title,
      thumbnailUrl: latest.thumbnailUrl,
      duration: latest.duration,
      rank: `1/${videos.length}`,
      views: latest.views,
      viewsGrowth: '+0%',
      ctr: '4.8%',
      ctrGrowth: '+0.0%',
      avgDuration: latest.duration,
    },
    analytics: {
      subscribers: '1',
      subscribersGrowth: '+0',
      views28Days: totalViews.toLocaleString(),
      watchTimeHours: `${(totalViews * 0.05).toFixed(1)} h`,
      estimatedRevenue: '$0.00',
      topVideos48h: videos.slice(0, 3).map((v) => ({
        title: v.title,
        views: v.views,
      })),
    },
  }
}
