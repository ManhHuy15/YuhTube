import { useState, useRef, useEffect } from 'react'
import { deleteVideo } from '../services/studio.service'
import type { StudioVideoRow } from '../types/studio.types'

interface DeleteConfirmModalProps {
  video: StudioVideoRow | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (videoId: string) => void
}

export function DeleteConfirmModal({
  video,
  isOpen,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [isOpen])

  if (!isOpen || !video) return null

  async function handleDelete() {
    if (!video || !isConfirmed) return

    setIsDeleting(true)
    setErrorMessage(null)

    try {
      const ok = await deleteVideo(video.id)
      if (ok) {
        onSuccess(video.id)
        onClose()
      } else {
        setErrorMessage('Không thể xóa video. Vui lòng kiểm tra quyền sở hữu hoặc thử lại sau.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đã xảy ra lỗi khi xóa video.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        if (!isDeleting) onClose()
      }}
      className="backdrop:bg-black/80 backdrop:backdrop-blur-md bg-transparent p-0 m-auto rounded-[32px] shadow-2xl open:animate-in open:fade-in open:zoom-in-95 duration-200 z-50 max-w-lg w-full"
    >
      <div className="bg-[#121217]/95 border border-white/15 backdrop-blur-3xl rounded-[32px] p-6 sm:p-7 text-white shadow-2xl space-y-5">
        <div className="flex items-center gap-3 text-rose-500">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">delete_forever</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Xóa vĩnh viễn video?
            </h3>
            <p className="text-xs text-white/50">Hành động này sẽ thực hiện Hard Delete</p>
          </div>
        </div>

        {/* Video Preview Card */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <div className="w-20 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0 relative border border-white/10 shadow-sm">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-xs text-white truncate">{video.title}</p>
            <p className="text-[11px] text-white/40 mt-0.5 font-mono">
              Thời lượng: {video.duration} • Ngày đăng: {video.publishedDate}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-2">
          <p className="font-bold flex items-center gap-1.5 text-rose-400">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Các tài nguyên sau sẽ bị xóa vĩnh viễn:</span>
          </p>
          <ul className="list-disc list-inside space-y-1 text-white/70 pl-1 text-[11px]">
            <li>Toàn bộ file video gốc và bản phân giải HLS (.ts, .m3u8) trên Amazon S3</li>
            <li>Hình ảnh thumbnail tùy chỉnh trên Amazon S3 và CloudFront cache</li>
            <li>Metadata video, danh sách comment và lượt thích trong Amazon DynamoDB</li>
          </ul>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200">
            {errorMessage}
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer select-none text-xs text-white/80">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            disabled={isDeleting}
            className="mt-0.5 w-4 h-4 rounded bg-white/10 border-white/20 text-rose-600 focus:ring-rose-500"
          />
          <span className="leading-relaxed">
            Tôi hiểu rằng việc xóa này là vĩnh viễn, không thể khôi phục lại video hay các chỉ số tương tác.
          </span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 transition-all shadow-lg shadow-rose-600/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>XÓA VĨNH VIỄN</span>
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  )
}
