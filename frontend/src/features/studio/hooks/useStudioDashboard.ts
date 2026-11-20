import { useState, useEffect, useCallback } from 'react'
import { computeChannelAnalytics, fetchStudioVideos } from '../services/studio.service'
import { useAuthStore } from '../../auth/hooks/useAuthStore'
import type { ChannelAnalytics, LatestVideoStats, StudioVideoRow } from '../types/studio.types'

export function useStudioDashboard() {
  const user = useAuthStore((state) => state.user)
  const [videos, setVideos] = useState<StudioVideoRow[]>([])
  const [latestVideo, setLatestVideo] = useState<LatestVideoStats | null>(null)
  const [analytics, setAnalytics] = useState<ChannelAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const reloadVideos = useCallback(async () => {
    setIsLoading(true)
    const data = await fetchStudioVideos(user?.id)
    setVideos(data)
    const { latestVideo: latest, analytics: computed } = computeChannelAnalytics(data)
    setLatestVideo(latest)
    setAnalytics(computed)
    setIsLoading(false)
  }, [user?.id])

  useEffect(() => {
    let isCancelled = false

    fetchStudioVideos(user?.id).then((videosData) => {
      if (!isCancelled) {
        setVideos(videosData)
        const { latestVideo: latest, analytics: computed } = computeChannelAnalytics(videosData)
        setLatestVideo(latest)
        setAnalytics(computed)
        setIsLoading(false)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [user?.id])

  return { videos, setVideos, reloadVideos, latestVideo, analytics, isLoading }
}
