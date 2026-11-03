import { useState, useEffect } from 'react'
import { fetchVideoComments, fetchVideoDetail } from '../services/watch.service'
import { useAuthStore } from '../../auth/hooks/useAuthStore'
import type { WatchComment, WatchVideoDetail } from '../types/watch.types'

export function useWatchVideo(videoId: string) {
  const [video, setVideo] = useState<WatchVideoDetail | null>(null)
  const [comments, setComments] = useState<WatchComment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    Promise.all([fetchVideoDetail(videoId), fetchVideoComments(videoId)])
      .then(([videoData, commentData]) => {
        if (!isCancelled) {
          setVideo(videoData)
          setComments(commentData)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setVideo(null)
          setComments([])
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [videoId])

  function addComment(content: string) {
    const user = useAuthStore.getState().user
    const authorName = user?.name || user?.email?.split('@')[0] || 'You'
    const newComment: WatchComment = {
      id: `c_${Date.now()}`,
      authorName,
      authorAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`,
      content,
      createdAt: 'Just now',
      likes: 0,
    }
    setComments((prev) => [newComment, ...prev])
  }

  return { video, comments, isLoading, addComment }
}
