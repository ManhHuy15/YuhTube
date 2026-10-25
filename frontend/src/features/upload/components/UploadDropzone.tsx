import type { DragEvent } from 'react'
import { Link } from 'react-router-dom'

interface UploadDropzoneProps {
  isDragOver: boolean
  onDragOver: (e: DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (e: DragEvent<HTMLDivElement>) => void
  onSelectFile: () => void
}

export function UploadDropzone({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onSelectFile,
}: UploadDropzoneProps) {
  return (
    <div className="w-full max-w-4xl bg-[#1c1b1d] rounded-2xl border border-white/10 shadow-2xl p-8 sm:p-12 flex flex-col items-center text-center animate-in fade-in duration-300">
      <div className="flex items-center justify-between w-full pb-6 mb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">upload</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Tải video lên</h1>
        </div>
        <Link
          to="/studio"
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          title="Đóng"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </Link>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onSelectFile}
        className={`w-full max-w-2xl py-16 px-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-red-500 bg-red-500/10 scale-[1.01]'
            : 'border-white/20 bg-[#201f21]/60 hover:border-white/40 hover:bg-[#201f21]'
        }`}
      >
        <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/60 mb-5 shadow-inner">
          <span className="material-symbols-outlined text-[42px] text-red-500">cloud_upload</span>
        </div>
        <h3 className="text-lg font-bold text-white">Kéo và thả tệp video để tải lên</h3>
        <p className="text-xs text-white/50 mt-1.5 max-w-md">
          Hệ thống hỗ trợ tải lên đa luồng trực tiếp (AWS S3 Multipart Upload). Các video sẽ ở chế độ
          riêng tư cho đến khi bạn xuất bản.
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelectFile()
          }}
          className="mt-6 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
        >
          CHỌN TỆP
        </button>
      </div>

      <div className="mt-8 text-[11px] text-white/40 max-w-xl text-center leading-relaxed">
        Bằng việc gửi video, bạn xác nhận rằng bạn đồng ý với Điều khoản dịch vụ của YuhTube. Định
        dạng hỗ trợ: MP4, MOV, WebM, MKV với chuẩn mã hóa H.264, H.265 và AV1.
      </div>
    </div>
  )
}
