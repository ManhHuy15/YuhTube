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
    <div className="w-full max-w-4xl bg-white/[0.03] rounded-[32px] border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 sm:p-12 flex flex-col items-center text-center animate-in fade-in duration-300">
      <div className="flex items-center justify-between w-full pb-6 mb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">upload</span>
          </div>
          <div className="text-left">
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Tải video lên YuhTube</h1>
            <p className="text-[11px] text-white/50">Hệ thống chuyển mã đa luồng HLS ABR</p>
          </div>
        </div>
        <Link
          to="/studio"
          className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          title="Đóng về Studio"
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
        className={`w-full max-w-2xl py-16 px-6 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-rose-500 bg-rose-500/10 scale-[1.01]'
            : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
        }`}
      >
        <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/60 mb-5 shadow-inner group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[42px] text-rose-500">cloud_upload</span>
        </div>
        <h3 className="text-lg font-bold text-white">Kéo và thả tệp video vào đây</h3>
        <p className="text-xs text-white/50 mt-1.5 max-w-md">
          Video của bạn sẽ tự động lưu bản nháp và chuyển mã sang chuẩn HLS Adaptive Bitrate.
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelectFile()
          }}
          className="mt-6 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs uppercase tracking-wider px-7 py-3 rounded-full shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
        >
          CHỌN TỆP TỪ THIẾT BỊ
        </button>
      </div>

      <div className="mt-8 text-[11px] text-white/40 max-w-xl text-center leading-relaxed font-mono">
        Định dạng hỗ trợ: MP4, MOV, WebM, MKV • Tối đa 4K HDR • Lưu trữ bền vững trên AWS S3
      </div>
    </div>
  )
}
