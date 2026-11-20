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
    <section className="rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl p-5 sm:p-7 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Bình luận ({comments.length.toLocaleString()})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-white/40">Phản hồi cộng đồng</span>
      </div>

      {/* Comment Input Box */}
      <form onSubmit={handleSubmit} className="flex gap-3.5 items-start">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || 'User'}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white/10 shadow-md"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-600/30">
            {user?.name ? user.name[0].toUpperCase() : 'Y'}
          </div>
        )}

        <div className="flex-1 space-y-2.5">
          <div className="relative rounded-2xl bg-white/[0.03] border border-white/[0.1] focus-within:border-rose-500/50 focus-within:ring-2 focus-within:ring-rose-500/10 transition-all p-3 shadow-inner">
            <input
              type="text"
              value={commentInput}
              onFocus={handleFocus}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={
                isAuthenticated
                  ? 'Thêm bình luận công khai...'
                  : 'Đăng nhập để tham gia thảo luận về video này...'
              }
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none tracking-tight"
            />
          </div>

          {(isFocused || commentInput.trim().length > 0) && (
            <div className="flex justify-end items-center gap-2 pt-1 animate-fadeIn">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!commentInput.trim() || isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 rounded-full text-xs font-bold text-white transition-all shadow-lg shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed active:scale-95"
              >
                {isSubmitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>ĐĂNG BÌNH LUẬN</span>
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-4 pt-2">
        {comments.length === 0 ? (
          <div className="py-10 text-center text-white/40 text-xs sm:text-sm space-y-2">
            <span className="material-symbols-outlined text-[28px] text-white/20">chat_bubble_outline</span>
            <p>Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOwner = Boolean(user?.id && comment.userId && user.id === comment.userId)

            return (
              <div
                key={comment.id}
                className="flex items-start gap-3.5 group p-3 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-all"
              >
                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10 shadow-sm"
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
                        className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-white/90 mt-1.5 leading-relaxed whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-4 mt-2.5 text-white/50 text-xs">
                    <button className="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[15px]">thumb_up</span>
                      <span className="font-mono">{comment.likes > 0 ? comment.likes : ''}</span>
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
