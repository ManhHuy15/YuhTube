import { useState } from 'react'
import type { WatchComment } from '../types/watch.types'

interface CommentSectionProps {
  comments: WatchComment[]
  onAddComment: (text: string) => void
}

export function CommentSection({ comments, onAddComment }: CommentSectionProps) {
  const [commentInput, setCommentInput] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!commentInput.trim()) return
    onAddComment(commentInput.trim())
    setCommentInput('')
  }

  return (
    <section className="pt-6 space-y-5">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-bold text-white">{comments.length + 181} bình luận</h3>
        <button className="flex items-center gap-1 text-xs text-white/70 hover:text-white cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">sort</span>
          <span>Sắp xếp theo</span>
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-start">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
          Y
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Viết bình luận công khai..."
            className="w-full bg-transparent border-b border-white/20 focus:border-white py-1 text-sm text-white focus:outline-none transition-colors"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCommentInput('')}
              className="px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-full text-xs font-semibold text-white transition-all shadow-md shadow-red-600/30 cursor-pointer disabled:cursor-not-allowed"
            >
              Bình luận
            </button>
          </div>
        </div>
      </form>

      {/* List */}
      <div className="space-y-4 pt-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3 group">
            <img
              src={comment.authorAvatar}
              alt={comment.authorName}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{comment.authorName}</span>
                <span className="text-[11px] text-white/40">{comment.createdAt}</span>
              </div>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">{comment.content}</p>
              <div className="flex items-center gap-4 mt-2 text-white/50 text-xs">
                <button className="flex items-center gap-1 hover:text-red-400 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                  <span>{comment.likes}</span>
                </button>
                <button className="hover:text-white transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">thumb_down</span>
                </button>
                <button className="font-semibold hover:text-white transition-colors cursor-pointer">
                  Phản hồi
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
