import { useState, useEffect } from 'react'
import { fetchChannelAnalytics, fetchStudioVideos } from '../services/studio.service'
import type { ChannelAnalytics, LatestVideoStats, StudioVideoRow } from '../types/studio.types'

export function useStudioDashboard() {
  const [videos, setVideos] = useState<StudioVideoRow[]>([])
  const [latestVideo, setLatestVideo] = useState<LatestVideoStats | null>(null)
  const [analytics, setAnalytics] = useState<ChannelAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    Promise.all([fetchStudioVideos(), fetchChannelAnalytics()]).then(([videosData, meta]) => {
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
  }, [])

  return { videos, latestVideo, analytics, isLoading }
}
