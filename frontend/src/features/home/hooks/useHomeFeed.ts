import { useState, useEffect, useMemo } from 'react'
import { fetchHomeFeed } from '../services/home.service'
import type { VideoFeedItem } from '../types/home.types'
import { extractCategoriesFromVideos, filterVideosByCategory } from '../utils/categoryHelper'

export function useHomeFeed(selectedCategory: string = 'Tất cả') {
  const [allVideos, setAllVideos] = useState<VideoFeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    fetchHomeFeed()
      .then((data) => {
        if (!isCancelled) {
          setAllVideos(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setAllVideos([])
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [])

  // Dynamically extract categories that actually exist in real video data
  const categories = useMemo(() => {
    return extractCategoriesFromVideos(allVideos)
  }, [allVideos])

  // Filter/sort videos strictly according to the selected category
  const filteredVideos = useMemo(() => {
    return filterVideosByCategory(allVideos, selectedCategory)
  }, [allVideos, selectedCategory])

  return {
    allVideos,
    videos: filteredVideos,
    categories,
    isLoading,
  }
}
