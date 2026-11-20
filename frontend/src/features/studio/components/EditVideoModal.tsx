import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { updateStudioVideo, uploadThumbnail } from '../services/studio.service'
import type { StudioVideoRow } from '../types/studio.types'

interface EditVideoModalProps {
  video: StudioVideoRow | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedVideo: StudioVideoRow) => void
}

export function EditVideoModal({
  video,
  isOpen,
  onClose,
  onSuccess,
}: EditVideoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(video?.title || '')
  const [description, setDescription] = useState(video?.subtitle || '')
  const [visibility, setVisibility] = useState<'Công khai' | 'Riêng tư'>(
    video?.visibility === 'Riêng tư' ? 'Riêng tư' : 'Công khai'
  )
  const [thumbnailUrl] = useState(video?.thumbnailUrl || '')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [previewThumbUrl, setPreviewThumbUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
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

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WebP).')
        return
      }
      setThumbnailFile(file)
      setPreviewThumbUrl(URL.createObjectURL(file))
      setErrorMessage(null)
    }
  }

  async function handleSave() {
    if (!video) return
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setErrorMessage('Tiêu đề video không được để trống.')
      return
    }

    setIsSaving(true)
    setErrorMessage(null)

    try {
      let finalThumbUrl = thumbnailUrl
      if (thumbnailFile) {
        const uploadedThumb = await uploadThumbnail(video.id, thumbnailFile)
        if (uploadedThumb) {
          finalThumbUrl = uploadedThumb
        }
      }

      const ok = await updateStudioVideo(video.id, {
        title: trimmedTitle,
        description: description.trim(),
        isPrivate: visibility === 'Riêng tư',
        thumbnailUrl: finalThumbUrl,
      })

      if (ok) {
        onSuccess({
          ...video,
          title: trimmedTitle,
          subtitle: description.trim(),
          visibility,
          thumbnailUrl: finalThumbUrl,
        })
        onClose()
      } else {
        setErrorMessage('Không thể cập nhật thông tin video. Vui lòng thử lại sau.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đã xảy ra lỗi khi lưu thông tin video.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        if (!isSaving) onClose()
      }}
      className="backdrop:bg-black/80 backdrop:backdrop-blur-md bg-transparent p-0 m-auto rounded-[32px] shadow-2xl open:animate-in open:fade-in open:zoom-in-95 duration-200 z-50 max-w-xl w-full"
    >
      <div className="bg-[#121217]/95 border border-white/15 backdrop-blur-3xl rounded-[32px] p-6 sm:p-8 text-white shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <span className="material-symbols-outlined text-[22px]">edit_note</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Chỉnh sửa thông tin video
              </h3>
              <p className="text-xs text-white/50">Cập nhật tiêu đề, mô tả và chế độ hiển thị</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              Tiêu đề video <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
              maxLength={150}
              placeholder="Nhập tiêu đề video..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/10 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              Mô tả video
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              rows={3}
              placeholder="Thêm mô tả cho video của bạn..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/10 transition-all resize-none"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              Chế độ hiển thị
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('Công khai')}
                disabled={isSaving}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  visibility === 'Công khai'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">public</span>
                <div>
                  <p className="text-xs font-bold text-white">Công khai</p>
                  <p className="text-[10px] text-white/40">Mọi người đều có thể xem</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('Riêng tư')}
                disabled={isSaving}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  visibility === 'Riêng tư'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <div>
                  <p className="text-xs font-bold text-white">Riêng tư</p>
                  <p className="text-[10px] text-white/40">Chỉ mình bạn xem được</p>
                </div>
              </button>
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              Hình thu nhỏ (Thumbnail)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-28 aspect-video rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0 relative shadow-sm">
                <img
                  src={previewThumbUrl || thumbnailUrl}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
                {previewThumbUrl && (
                  <span className="absolute top-1 left-1 bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                    MỚI
                  </span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  ref={thumbnailInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Thay đổi ảnh thumbnail...</span>
                </button>
                <p className="text-[10px] text-white/40 mt-1 font-mono">
                  Định dạng PNG, JPG hoặc WebP (Tối đa 5MB)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 transition-all shadow-lg shadow-rose-600/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>LƯU THAY ĐỔI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  )
}
