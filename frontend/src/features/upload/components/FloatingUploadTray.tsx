import { useNavigate, useLocation } from 'react-router-dom'
import { useUploadStore } from '../hooks/useUploadStore'

export function FloatingUploadTray() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    title,
    progress,
    isUploading,
    isCompleted,
    isMinimized,
    error,
    videoId,
    resumedFromParts,
    totalPartCount,
    maximize,
    cancelUpload,
    dismiss,
  } = useUploadStore()

  // Only show the floating tray if:
  // 1. There is an active upload or newly completed upload, AND
  // 2. Either the user explicitly minimized it OR user navigated away from the /upload workstation
  const isCurrentlyOnUploadPage = location.pathname === '/upload'
  const shouldShowTray = (isUploading || isCompleted || error) && (isMinimized || !isCurrentlyOnUploadPage)

  if (!shouldShowTray) {
    return null
  }

  function handleOpenWorkstation() {
    maximize()
    if (!isCurrentlyOnUploadPage) {
      navigate('/upload')
    }
  }

  function handleCloseOrCancel() {
    if (isUploading) {
      const confirmCancel = window.confirm(
        'Bạn có chắc chắn muốn hủy quá trình tải lên video này không?',
      )
      if (confirmCancel) {
        cancelUpload()
      }
    } else {
      dismiss()
    }
  }

  return (
    <div
      aria-label="Cửa sổ tải lên video thu nhỏ"
      className="fixed bottom-5 right-5 sm:right-6 z-50 w-[340px] sm:w-[380px] bg-[#1e1e24]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden select-none transition-all duration-300 animate-in slide-in-from-bottom-5"
    >
      {/* Top Banner / Progress Indicator */}
      <div className="w-full h-1 bg-white/10 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isCompleted
              ? 'bg-emerald-500 w-full'
              : error
                ? 'bg-red-500 w-full'
                : 'bg-gradient-to-r from-red-600 to-rose-500'
          }`}
          style={{ width: isCompleted || error ? '100%' : `${progress}%` }}
        />
      </div>

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            {/* Status Icon */}
            {isUploading && (
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[17px] animate-spin">
                  progress_activity
                </span>
              </div>
            )}
            {isCompleted && (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
            )}
            {error && (
              <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">error</span>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate leading-snug tracking-tight">
                {title || 'Tệp video'}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-white/60">
                {isUploading && (
                  <>
                    <span className="text-white font-semibold">{progress}%</span>
                    <span>•</span>
                    <span>Đang tải lên</span>
                    {resumedFromParts > 0 && (
                      <span className="text-amber-400 text-[10px] font-mono">
                        (tiếp tục từ mảnh {resumedFromParts}/{totalPartCount})
                      </span>
                    )}
                  </>
                )}
                {isCompleted && (
                  <span className="text-emerald-400 font-medium">Đã tải xong • Đang xử lý</span>
                )}
                {error && <span className="text-red-400 truncate">{error}</span>}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={handleOpenWorkstation}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Phóng to cửa sổ tải lên"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_full</span>
            </button>
            <button
              type="button"
              onClick={handleCloseOrCancel}
              className="p-1.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
              title={isUploading ? 'Hủy tải lên' : 'Đóng thông báo'}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Footer Quick Links */}
        {isCompleted && videoId && (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[11px] text-white/50">Mã: {videoId}</span>
            <button
              type="button"
              onClick={() => navigate(`/watch/${videoId}`)}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Xem trang phát</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
