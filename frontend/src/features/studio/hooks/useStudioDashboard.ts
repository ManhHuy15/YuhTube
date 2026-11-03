import { useState, useEffect } from 'react'
import { fetchChannelAnalytics, fetchStudioVideos } from '../services/studio.service'
import { useAuthStore } from '../../auth/hooks/useAuthStore'
import type { ChannelAnalytics, LatestVideoStats, StudioVideoRow } from '../types/studio.types'

export function useStudioDashboard() {
  const user = useAuthStore((state) => state.user)
  const [videos, setVideos] = useState<StudioVideoRow[]>([])
  const [latestVideo, setLatestVideo] = useState<LatestVideoStats | null>(null)
  const [analytics, setAnalytics] = useState<ChannelAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const reloadVideos = async () => {
    const data = await fetchStudioVideos(user?.id)
    setVideos(data)
  }

  useEffect(() => {
    let isCancelled = false

    Promise.all([fetchStudioVideos(user?.id), fetchChannelAnalytics()]).then(([videosData, meta]) => {
      if (!isCancelled) {
        setVideos(videosData)
        setLatestVideo(meta.latestVideo)
        setAnalytics(meta.analytics)
        setIsLoading(false)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [user?.id])

  return { videos, setVideos, reloadVideos, latestVideo, analytics, isLoading }
}
