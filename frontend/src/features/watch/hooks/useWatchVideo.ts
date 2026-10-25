import { useState, useEffect } from 'react'
import { fetchVideoComments, fetchVideoDetail } from '../services/watch.service'
import type { WatchComment, WatchVideoDetail } from '../types/watch.types'

export function useWatchVideo(videoId: string) {
  const [video, setVideo] = useState<WatchVideoDetail | null>(null)
  const [comments, setComments] = useState<WatchComment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    Promise.all([fetchVideoDetail(videoId), fetchVideoComments(videoId)]).then(
      ([videoData, commentData]) => {
        if (!isCancelled) {
          setVideo(videoData)
          setComments(commentData)
          setIsLoading(false)
        }
      },
    )

    return () => {
      isCancelled = true
    }
  }, [videoId])

  function addComment(content: string) {
    const newComment: WatchComment = {
      id: `c_${Date.now()}`,
      authorName: 'Bạn (Creator)',
      authorAvatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuASxYM5-T6NbQ6NVDHtC0CTKx7iEqZhF_raLim3LHhqOmpcS2k8jMZmlgDP7zFJf2zex4dGlg40gsPKxVQj6q-gRGJxZM3BzfDHYFN7QP3Ln0pB6DuD8JxGZJeBOJPKgh_EdH-mS82O9Dx2qxkaJATc8QVrOMkT6SAuVf3rfNi4141NeVL0jiyMglcEqrNaZHc_LdKij1c--19s0TDbmwAeLS4CWN6spjRzc05tEGc',
      content,
      createdAt: 'Vừa xong',
      likes: 0,
    }
    setComments((prev) => [newComment, ...prev])
  }

  return { video, comments, isLoading, addComment }
}
