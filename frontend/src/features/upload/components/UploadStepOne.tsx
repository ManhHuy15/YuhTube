import type { RefObject, ChangeEvent } from 'react'
import { formatFileSize } from '../constants/upload.constants'
import type { VideoUploadResult } from '../types/upload.types'

interface UploadStepOneProps {
  file: File
  videoPreviewUrl: string | null
  title: string
  setTitle: (title: string) => void
  description: string
  setDescription: (desc: string) => void
  selectedThumbnail: string
  customThumbnail: string | null
  thumbInputRef: RefObject<HTMLInputElement | null>
  onCustomThumbChange: (e: ChangeEvent<HTMLInputElement>) => void
  videoShareUrl: string
  copyVideoLink: () => void
  isCopied: boolean
  isUploading: boolean
  progress: number
  result: VideoUploadResult | null
}

export function UploadStepOne({
  file,
  videoPreviewUrl,
  title,
  setTitle,
  description,
  setDescription,
  selectedThumbnail,
  customThumbnail,
  thumbInputRef,
  onCustomThumbChange,
  videoShareUrl,
  copyVideoLink,
  isCopied,
  isUploading,
  progress,
  result,
}: UploadStepOneProps) {
  return (
    <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Form Details (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Section 1: Video Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/60 font-mono uppercase tracking-wider">
            <label htmlFor="video-title" className="flex items-center gap-1 font-semibold text-white/80">
              Tiêu đề video <span className="text-rose-500 font-bold">*</span>
            </label>
            <span>{title.length}/100</span>
          </div>
          <div className="relative bg-white/[0.03] border border-white/[0.1] focus-within:border-rose-500/50 focus-within:ring-2 focus-within:ring-rose-500/10 rounded-2xl p-3.5 transition-all shadow-inner">
            <input
              id="video-title"
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Thêm tiêu đề mô tả ngắn gọn nội dung của bạn"
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-white focus:outline-none placeholder-white/30 tracking-tight"
            />
          </div>
        </div>

        {/* Section 2: Technical Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/60 font-mono uppercase tracking-wider">
            <label htmlFor="video-desc" className="font-semibold text-white/80">Mô tả tóm tắt</label>
            <span className="text-[11px] text-white/40 font-mono">
              Hỗ trợ Markdown &amp; Timestamps
            </span>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.1] focus-within:border-rose-500/50 focus-within:ring-2 focus-within:ring-rose-500/10 rounded-2xl flex flex-col overflow-hidden transition-all shadow-inner">
            {/* Micro Markdown Toolbar */}
            <div className="flex items-center gap-1 px-3.5 py-2 bg-white/[0.02] border-b border-white/[0.06] text-white/60">
              <button
                type="button"
                className="p-1 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                title="In đậm"
              >
                <span className="material-symbols-outlined text-[16px]">format_bold</span>
              </button>
              <button
                type="button"
                className="p-1 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                title="In nghiêng"
              >
                <span className="material-symbols-outlined text-[16px]">format_italic</span>
              </button>
              <button
                type="button"
                className="p-1 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                title="Chèn liên kết"
              >
                <span className="material-symbols-outlined text-[16px]">link</span>
              </button>
              <button
                type="button"
                className="p-1 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                title="Mã khối"
              >
                <span className="material-symbols-outlined text-[16px]">code</span>
              </button>
              <div className="w-px h-3 bg-white/20 mx-1.5" />
              <span className="text-[11px] text-rose-400 font-mono">
                #Serverless #AWS #HLS #MediaConvert
              </span>
            </div>
            <textarea
              id="video-desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả nội dung chi tiết, các mốc thời gian (00:00 Giới thiệu, 05:20 Kiến trúc...)"
              className="w-full bg-transparent p-3.5 text-xs sm:text-sm text-white focus:outline-none resize-none placeholder-white/30 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Section 3: Thumbnail Selector (Custom Upload) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-white/70 font-mono uppercase tracking-wider font-semibold">
                Ảnh bìa (Thumbnail)
              </span>
              <p className="text-xs text-white/40 mt-0.5">
                Tải lên một hình ảnh thể hiện nội dung video
              </p>
            </div>
            <span className="text-xs text-[#69d8d4] font-mono">Chuẩn 1280x720</span>
          </div>

          <div className="pt-1">
            {/* Slot: Custom Upload */}
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onCustomThumbChange}
            />
            <div
              onClick={() => thumbInputRef.current?.click()}
              className={`w-full max-w-[260px] aspect-video rounded-2xl p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all border ${
                customThumbnail
                  ? 'ring-2 ring-rose-500 bg-white/[0.04] border-transparent shadow-lg'
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border-dashed border-white/20 hover:border-white/40'
              }`}
            >
              {customThumbnail ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden group">
                  <img
                    src={customThumbnail}
                    alt="Custom Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs gap-1 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                    <span>Đổi ảnh bìa</span>
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[13px]">check</span>
                  </div>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[26px] text-white/60">
                    add_photo_alternate
                  </span>
                  <span className="text-xs text-white font-medium mt-1">Tải ảnh lên</span>
                  <span className="text-[10px] text-white/40 font-mono">PNG, JPG ≤ 2MB</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live Video Preview & Real AWS Multipart Upload Specs (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-xl">
          {/* Video Player / Preview Canvas */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden relative bg-black group border border-white/10 shadow-lg">
            {videoPreviewUrl ? (
              <video
                src={videoPreviewUrl}
                poster={selectedThumbnail || undefined}
                controls
                className="w-full h-full object-cover"
              />
            ) : selectedThumbnail ? (
              <img
                src={selectedThumbnail}
                alt="Video Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/30 text-xs gap-1.5">
                <span className="material-symbols-outlined text-[32px] text-white/20">video_file</span>
                <span>Chờ tải video</span>
              </div>
            )}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md font-mono text-[10px] text-[#69d8d4] font-bold border border-[#69d8d4]/30">
                4K HDR
              </span>
              <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md font-mono text-[10px] text-white/90 border border-white/10">
                60 FPS
              </span>
            </div>
          </div>

          {/* Video Destination Link Box */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-3.5 flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/50">
              Đường liên kết của video
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-[#69d8d4] font-mono truncate select-all">
                {videoShareUrl}
              </span>
              <button
                type="button"
                onClick={copyVideoLink}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                title="Sao chép liên kết"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isCopied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
          </div>

          {/* Real File Metadata Specs */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
              <span className="text-white/50">Tên tệp:</span>
              <span className="text-white truncate max-w-[220px]" title={file.name}>
                {file.name}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
              <span className="text-white/50">Kích thước file:</span>
              <span className="text-white">{formatFileSize(file.size)}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-white/50">Định dạng (MIME):</span>
              <span className="text-white">{file.type || 'video/mp4'}</span>
            </div>
          </div>

          {/* Upload & Processing Status Bar */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isUploading
                      ? 'bg-amber-400 animate-pulse'
                      : result
                      ? 'bg-emerald-400'
                      : 'bg-white/40'
                  }`}
                />
                <span className="text-white font-medium">
                  {isUploading
                    ? `Đang tải video lên... ${progress}%`
                    : result
                    ? 'Tải lên hoàn tất 100%'
                    : 'Chờ tải lên'}
                </span>
              </div>
              <span className="text-[11px]">
                {result ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    Sẵn sàng xử lý
                  </span>
                ) : isUploading ? (
                  <span className="text-amber-400 font-mono">Đang truyền tải</span>
                ) : (
                  <span className="text-white/40 font-mono">Đang chờ</span>
                )}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  result ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-amber-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] text-white/50 leading-relaxed">
              {result
                ? 'Video đã tải lên thành công. Hệ thống đang tiến hành xử lý các độ phân giải tối ưu trong nền.'
                : 'Đang tải tệp lên hệ thống. Bạn có thể tiếp tục chỉnh sửa tiêu đề và mô tả trong lúc chờ.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
