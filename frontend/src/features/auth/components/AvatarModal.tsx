import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from 'react'
import { useAuthStore } from '../hooks/useAuthStore'

export function AvatarModal() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user, isAvatarModalOpen, closeAvatarModal, updateProfile } = useAuthStore()

  const [channelName, setChannelName] = useState(user?.name || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const currentAvatar = user?.avatar || (user?.name
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
    : 'https://api.dicebear.com/7.x/initials/svg?seed=User')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isAvatarModalOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [isAvatarModalOpen])

  function handleClose() {
    setSelectedFile(null)
    setPreviewUrl('')
    setErrorMsg(null)
    setChannelName(user?.name || '')
    closeAvatarModal()
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG hoặc WebP).')
        return
      }
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setErrorMsg(null)
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setErrorMsg(null)
    }
  }

  async function handleSave() {
    const trimmedName = channelName.trim()
    if (!trimmedName) {
      setErrorMsg('Tên kênh không được để trống.')
      return
    }

    setIsSaving(true)
    setErrorMsg(null)

    try {
      const ok = await updateProfile(trimmedName, selectedFile)
      if (!ok) {
        setErrorMsg('Không thể lưu thông tin kênh. Vui lòng thử lại sau.')
        setIsSaving(false)
        return
      }
      handleClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi khi cập nhật thông tin kênh.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAvatarModalOpen) return null

  const hasChanges = (channelName.trim() !== (user?.name || '')) || (selectedFile !== null)

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        handleClose()
      }}
      aria-labelledby="avatar-modal-title"
      className="m-auto p-0 rounded-2xl bg-[#1e1e1e] text-[#f1f1f1] border border-white/10 shadow-2xl backdrop:bg-black/75 max-w-lg w-full overflow-hidden"
    >
      <div className="p-6 flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
            </div>
            <div>
              <h2 id="avatar-modal-title" className="text-base font-bold text-white">
                Tùy chỉnh thông tin kênh
              </h2>
              <p className="text-xs text-white/50">Cập nhật tên kênh và ảnh đại diện</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Channel Name Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white/80">
              Tên kênh <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-white/40">{channelName.length}/50</span>
          </div>
          <input
            type="text"
            value={channelName}
            maxLength={50}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Nhập tên kênh của bạn..."
            disabled={isSaving}
            className="w-full bg-[#121214] border border-white/15 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
          />
          <p className="text-[11px] text-white/40">
            Tên kênh này sẽ hiển thị công khai trên tất cả video bạn đã tải lên.
          </p>
        </div>

        {/* Current & Preview Avatar */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/80">Ảnh đại diện (Avatar)</label>
          <div className="flex items-center justify-center gap-6 py-3 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-medium text-white/40 mb-1.5 uppercase tracking-wider">Hiện tại</span>
              <img
                src={currentAvatar}
                alt="Current Avatar"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10 bg-[#2b2b2b]"
              />
            </div>
            <span className="material-symbols-outlined text-white/20 text-[20px]">arrow_forward</span>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-medium text-red-400 mb-1.5 uppercase tracking-wider">Mới</span>
              <div className="relative">
                <img
                  src={previewUrl || currentAvatar}
                  alt="New Avatar Preview"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-red-500 shadow-md shadow-red-500/20 bg-[#2b2b2b]"
                />
                {previewUrl && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-red-500 bg-red-500/10'
                : 'border-white/15 hover:border-white/30 bg-white/[0.02]'
            }`}
          >
            <span className="material-symbols-outlined text-[28px] text-white/40 mb-1">add_photo_alternate</span>
            <p className="text-xs font-medium text-white">Click hoặc kéo thả ảnh đại diện mới vào đây</p>
            <p className="text-[10px] text-white/40 mt-0.5">Hỗ trợ PNG, JPG, WebP (Tối đa 5MB)</p>
            {selectedFile && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white">
                <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
                <span>{selectedFile.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-400">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-medium"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasChanges || !channelName.trim()}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-md shadow-red-600/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {isSaving && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>LƯU THAY ĐỔI</span>
          </button>
        </div>
      </div>
    </dialog>
  )
}
