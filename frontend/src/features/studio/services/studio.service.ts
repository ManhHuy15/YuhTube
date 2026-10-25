import { apiClient } from '../../../common/api/apiClient'
import {
  DEFAULT_CHANNEL_ANALYTICS,
  DEFAULT_LATEST_VIDEO,
  DEFAULT_STUDIO_VIDEOS,
} from '../constants/studio.constants'
import type { ChannelAnalytics, LatestVideoStats, StudioVideoRow } from '../types/studio.types'

export async function fetchStudioVideos(): Promise<StudioVideoRow[]> {
  try {
    const { data } = await apiClient.get<StudioVideoRow[]>('/videos/channel/my-videos')
    return data && data.length > 0 ? data : DEFAULT_STUDIO_VIDEOS
  } catch {
    return DEFAULT_STUDIO_VIDEOS
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
