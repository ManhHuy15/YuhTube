import { useState } from 'react'
import type { WatchComment } from '../types/watch.types'
import { useAuthStore } from '../../auth/hooks/useAuthStore'

interface CommentSectionProps {
  comments: WatchComment[]
  onAddComment: (text: string) => Promise<void> | void
  onDeleteComment?: (commentId: string) => Promise<void> | void
  isSubmitting?: boolean
}

export function CommentSection({
  comments,
  onAddComment,
  onDeleteComment,
  isSubmitting = false,
}: CommentSectionProps) {
  const [commentInput, setCommentInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { user, isAuthenticated, openModal } = useAuthStore()

  function handleFocus() {
    if (!isAuthenticated) {
      openModal('signin')
      return
    }
    setIsFocused(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isAuthenticated) {
      openModal('signin')
      return
    }
    const trimmed = commentInput.trim()
    if (!trimmed || isSubmitting) return

    await onAddComment(trimmed)
    setCommentInput('')
    setIsFocused(false)
  }

  function handleCancel() {
    setCommentInput('')
    setIsFocused(false)
  }

  return (
    <section className="pt-6 space-y-6">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-bold text-white tracking-tight">
          {comments.length.toLocaleString()} bình luận
        </h3>
      </div>

      {/* Comment Input Box */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-start">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || 'User'}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-md shadow-red-600/20">
            {user?.name ? user.name[0].toUpperCase() : 'Y'}
          </div>
        )}

        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={commentInput}
            onFocus={handleFocus}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder={
              isAuthenticated
                ? 'Viết bình luận công khai...'
                : 'Đăng nhập để bình luận về video này...'
            }
            className="w-full bg-transparent border-b border-white/20 focus:border-red-500 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none transition-colors"
          />

          {(isFocused || commentInput.trim().length > 0) && (
            <div className="flex justify-end items-center gap-2 pt-1 animate-fadeIn">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!commentInput.trim() || isSubmitting}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-full text-xs font-semibold text-white transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>Bình luận</span>
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-4 pt-2">
        {comments.length === 0 ? (
          <div className="py-8 text-center text-white/40 text-sm">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận về video này!
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = Boolean(user?.id && comment.userId && user.id === comment.userId)

            return (
              <div key={comment.id} className="flex items-start gap-3 group">
                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-tight">
                        {comment.authorName}
                      </span>
                      <span className="text-[11px] text-white/40 font-mono">
                        {comment.createdAt}
                      </span>
                    </div>

                    {isOwner && onDeleteComment && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        title="Xóa bình luận"
                        className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 p-1 rounded transition-opacity cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-white/90 mt-1 leading-relaxed whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-white/50 text-xs">
                    <button className="flex items-center gap-1 hover:text-red-400 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[15px]">thumb_up</span>
                      <span>{comment.likes > 0 ? comment.likes : ''}</span>
                    </button>
                    <button className="hover:text-white transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[15px]">thumb_down</span>
                    </button>
                    <button
                      onClick={handleFocus}
                      className="font-medium hover:text-white transition-colors cursor-pointer"
                    >
                      Phản hồi
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
