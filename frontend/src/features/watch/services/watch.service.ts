import { apiClient } from '../../../common/api/apiClient'
import { DEFAULT_WATCH_VIDEO, INITIAL_COMMENTS } from '../constants/watch.constants'
import type { WatchComment, WatchVideoDetail } from '../types/watch.types'

export async function fetchVideoDetail(videoId: string): Promise<WatchVideoDetail> {
  try {
    const { data } = await apiClient.get<WatchVideoDetail>(`/videos/${videoId}`)
    return data
  } catch {
    // Fallback to sample video detail from Stitch
    return { ...DEFAULT_WATCH_VIDEO, id: videoId }
  }
}

export async function fetchVideoComments(videoId: string): Promise<WatchComment[]> {
  try {
    const { data } = await apiClient.get<WatchComment[]>(`/videos/${videoId}/comments`)
    return data && data.length > 0 ? data : INITIAL_COMMENTS
  } catch {
    return INITIAL_COMMENTS
  }
}
