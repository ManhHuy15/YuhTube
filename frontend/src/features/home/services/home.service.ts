import { apiClient } from '../../../common/api/apiClient'
import { DEFAULT_FEED_VIDEOS } from '../constants/home.constants'
import type { VideoFeedItem } from '../types/home.types'

export async function fetchHomeFeed(category?: string): Promise<VideoFeedItem[]> {
  try {
    const { data } = await apiClient.get<VideoFeedItem[]>('/videos', {
      params: category && category !== 'Tất cả' ? { category } : undefined,
    })
    return data && data.length > 0 ? data : DEFAULT_FEED_VIDEOS
  } catch {
    // Graceful fallback to rich Stitch design videos when backend feed is pending
    return DEFAULT_FEED_VIDEOS
  }
}
