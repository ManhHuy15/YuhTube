import { useState, useEffect } from 'react'
import { fetchHomeFeed } from '../services/home.service'
import type { VideoFeedItem } from '../types/home.types'

export function useHomeFeed(category: string) {
  const [videos, setVideos] = useState<VideoFeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    fetchHomeFeed(category)
      .then((data) => {
        if (!isCancelled) {
          setVideos(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setVideos([])
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [category])

  return { videos, isLoading }
}
