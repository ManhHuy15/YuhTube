import { useState, useEffect, useCallback } from 'react'
import {
  fetchVideoComments,
  fetchVideoDetail,
  fetchVideoLikeStatus,
  postVideoComment,
  deleteVideoComment,
  toggleVideoLike,
} from '../services/watch.service'
import { useAuthStore } from '../../auth/hooks/useAuthStore'
import type { WatchComment, WatchVideoDetail } from '../types/watch.types'

export function useWatchVideo(videoId: string) {
  const [video, setVideo] = useState<WatchVideoDetail | null>(null)
  const [comments, setComments] = useState<WatchComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    let isCancelled = false

    fetchVideoDetail(videoId)
      .then(async (detailResult) => {
        if (isCancelled) return

        if (!detailResult) {
          setVideo(null)
          setComments([])
          setIsLoading(false)
          return
        }

        const { video: vid, initialComments } = detailResult
        setVideo(vid)
        setLikesCount(vid.likesCount)
        setHasLiked(Boolean(vid.isLiked))

        // First set initial comments from video pre-join if present
        let currentComments = initialComments
        setComments(currentComments)
        setIsLoading(false)

        // Then concurrently refresh comments and like status from social API
        try {
          const [freshComments, likeStatus] = await Promise.all([
            fetchVideoComments(videoId),
            fetchVideoLikeStatus(videoId).catch(() => null),
          ])

          if (!isCancelled) {
            if (freshComments.length > 0 || currentComments.length === 0) {
              setComments(freshComments)
            }
            if (likeStatus) {
              setHasLiked(likeStatus.isLiked)
              setLikesCount(likeStatus.likesCount)
            }
          }
        } catch {
          // Keep existing comments on error
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

  const toggleLike = useCallback(async () => {
    const { isAuthenticated, openModal } = useAuthStore.getState()
    if (!isAuthenticated) {
      openModal('signin')
      return
    }

    if (isLiking) return
    setIsLiking(true)

    // Optimistic update
    const prevHasLiked = hasLiked
    const prevCount = likesCount
    const nextHasLiked = !prevHasLiked
    const nextCount = prevHasLiked ? Math.max(0, prevCount - 1) : prevCount + 1

    setHasLiked(nextHasLiked)
    setLikesCount(nextCount)

    try {
      const result = await toggleVideoLike(videoId)
      setHasLiked(result.isLiked)
      setLikesCount(result.likesCount)
    } catch (err) {
      // Revert optimistic update on error
      setHasLiked(prevHasLiked)
      setLikesCount(prevCount)
      console.error('Failed to toggle like:', err)
    } finally {
      setIsLiking(false)
    }
  }, [videoId, hasLiked, likesCount, isLiking])

  const addComment = useCallback(
    async (content: string) => {
      const { isAuthenticated, openModal } = useAuthStore.getState()
      if (!isAuthenticated) {
        openModal('signin')
        return
      }

      const trimmed = content.trim()
      if (!trimmed || isSubmittingComment) return

      setIsSubmittingComment(true)
      try {
        const newComment = await postVideoComment(videoId, trimmed)
        setComments((prev) => [newComment, ...prev])
      } catch (err) {
        console.error('Failed to post comment:', err)
      } finally {
        setIsSubmittingComment(false)
      }
    },
    [videoId, isSubmittingComment]
  )

  const deleteComment = useCallback(
    async (commentId: string) => {
      const { isAuthenticated, openModal } = useAuthStore.getState()
      if (!isAuthenticated) {
        openModal('signin')
        return
      }

      try {
        await deleteVideoComment(videoId, commentId)
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      } catch (err) {
        console.error('Failed to delete comment:', err)
      }
    },
    [videoId]
  )

  return {
    video,
    comments,
    isLoading,
    isLiking,
    isSubmittingComment,
    hasLiked,
    likesCount,
    toggleLike,
    addComment,
    deleteComment,
  }
}
