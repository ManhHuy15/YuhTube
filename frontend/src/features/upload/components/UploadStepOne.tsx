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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-white/60 font-mono uppercase tracking-wider">
            <label htmlFor="video-title" className="flex items-center gap-1">
              Tiêu đề video <span className="text-red-500 font-bold">*</span>
            </label>
            <span>{title.length}/100</span>
          </div>
          <div className="relative bg-[#0e0e10] border border-white/10 focus-within:border-red-500 rounded-xl p-3 transition-colors">
            <input
              id="video-title"
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Thêm tiêu đề mô tả ngắn gọn nội dung của bạn"
              className="w-full bg-transparent text-[15px] font-medium text-white focus:outline-none placeholder-white/30"
            />
          </div>
        </div>

        {/* Section 2: Technical Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-white/60 font-mono uppercase tracking-wider">
            <label htmlFor="video-desc">Mô tả tóm tắt</label>
            <span className="text-[11px] text-white/40 font-mono">
              Hỗ trợ Markdown &amp; Timestamps
            </span>
          </div>
          <div className="bg-[#0e0e10] border border-white/10 focus-within:border-red-500 rounded-xl flex flex-col overflow-hidden transition-colors">
            {/* Micro Markdown Toolbar */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-[#201f21] border-b border-white/10 text-white/60">
              <button
                type="button"
                className="p-1 rounded hover:text-white hover:bg-white/10 transition-colors"
                title="In đậm"
              >
                <span className="material-symbols-outlined text-[16px]">format_bold</span>
              </button>
              <button
                type="button"
                className="p-1 rounded hover:text-white hover:bg-white/10 transition-colors"
                title="In nghiêng"
              >
                <span className="material-symbols-outlined text-[16px]">format_italic</span>
              </button>
              <button
                type="button"
                className="p-1 rounded hover:text-white hover:bg-white/10 transition-colors"
                title="Chèn liên kết"
              >
                <span className="material-symbols-outlined text-[16px]">link</span>
              </button>
              <button
                type="button"
                className="p-1 rounded hover:text-white hover:bg-white/10 transition-colors"
                title="Mã khối"
              >
                <span className="material-symbols-outlined text-[16px]">code</span>
              </button>
              <div className="w-px h-3 bg-white/20 mx-1.5"></div>
              <span className="text-[11px] text-red-400 font-mono">
                #Serverless #AWS #HLS #MediaConvert
              </span>
            </div>
            <textarea
              id="video-desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả nội dung chi tiết, các mốc thời gian (00:00 Giới thiệu, 05:20 Kiến trúc...)"
              className="w-full bg-transparent p-3 text-sm text-white focus:outline-none resize-none placeholder-white/30 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Section 3: Thumbnail Selector (Custom Upload) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-white/60 font-mono uppercase tracking-wider font-semibold">
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
              className={`w-full max-w-[240px] aspect-video rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all border ${
                customThumbnail
                  ? 'ring-2 ring-red-500 bg-[#201f21] border-transparent'
                  : 'bg-[#201f21] hover:bg-[#2a2a2c] border-dashed border-white/20'
              }`}
            >
              {customThumbnail ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden group">
                  <img
                    src={customThumbnail}
                    alt="Custom Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs gap-1">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                    <span>Đổi ảnh bìa</span>
                  </div>
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                    <span className="material-symbols-outlined text-[11px]">check</span>
                  </div>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[24px] text-white/60">
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
        <div className="bg-[#201f21] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          {/* Video Player / Preview Canvas */}
          <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-[#0e0e10] group border border-white/10">
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
            <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-[#69d8d4] font-bold border border-[#69d8d4]/30">
                4K HDR
              </span>
              <span className="px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-white/90">
                60 FPS
              </span>
            </div>
          </div>

          {/* Video Destination Link Box */}
          <div className="bg-[#0e0e10] border border-white/10 rounded-xl p-3 flex flex-col gap-1">
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
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                title="Sao chép liên kết"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isCopied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
          </div>

          {/* Real File Metadata Specs */}
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-white/50">Tên tệp:</span>
              <span className="text-white truncate max-w-[220px]" title={file.name}>
                {file.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">Kích thước file:</span>
              <span className="text-white">{formatFileSize(file.size)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">Định dạng (MIME):</span>
              <span className="text-white">{file.type || 'video/mp4'}</span>
            </div>
          </div>

          {/* Real AWS S3 Multipart Pipeline Status Bar */}
          <div className="bg-[#0e0e10] border border-white/10 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isUploading
                      ? 'bg-amber-400 animate-ping'
                      : result
                      ? 'bg-emerald-400'
                      : 'bg-white/40'
                  }`}
                ></span>
                <span>
                  {isUploading
                    ? `Đang tải lên S3 (${progress}%)...`
                    : result
                    ? `Đã tải lên S3 100% (${result.parts.length}/${result.partCount} parts)`
                    : 'Sẵn sàng tải lên'}
                </span>
              </span>
              <span className="text-[#69d8d4] text-[11px]">
                {result ? 'MediaConvert Sẵn sàng' : 'S3 Chunks'}
              </span>
            </div>

            {/* Hairline Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  result ? 'bg-[#69d8d4]' : 'bg-gradient-to-r from-red-500 to-amber-400'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
              <span>{result ? `Object: ${result.objectKey}` : 'AWS Multi-Part 5MB Chunks'}</span>
              <span>{isUploading ? 'Đang truyền...' : '0.00s trễ xử lý'}</span>
            </div>
          </div>

          {/* Background Checks Indicator */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0e0e10] border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#69d8d4] text-[18px]">verified</span>
              <span className="text-white">
                Kiểm tra tự động ngầm:{' '}
                <span className="text-[#69d8d4] font-semibold">
                  {result ? 'Hoàn tất' : isUploading ? 'Đang kiểm tra' : 'Sẵn sàng'}
                </span>
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/50">Hệ thống sẵn sàng</span>
          </div>
        </div>
      </div>
    </div>
  )
}
