import { formatFileSize } from '../constants/upload.constants'
import type { VideoUploadResult, VisibilityMode } from '../types/upload.types'

interface UploadStepTwoProps {
  file: File
  videoPreviewUrl: string | null
  title: string
  description: string
  selectedThumbnail: string
  visibility: VisibilityMode
  setVisibility: (mode: VisibilityMode) => void
  videoShareUrl: string
  copyVideoLink: () => void
  isCopied: boolean
  onBackToStepOne: () => void
  isUploading?: boolean
  progress?: number
  result?: VideoUploadResult | null
}

export function UploadStepTwo({
  file,
  videoPreviewUrl,
  title,
  description,
  selectedThumbnail,
  visibility,
  setVisibility,
  videoShareUrl,
  copyVideoLink,
  isCopied,
  onBackToStepOne,
  isUploading = false,
  progress = 0,
  result = null,
}: UploadStepTwoProps) {
  return (
    <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Release Review & Settings (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Video Title Banner */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl p-5 sm:p-6 rounded-3xl flex flex-col gap-2.5 shadow-xl">
          <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold">
            Tiêu đề phát hành
          </span>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">{title}</h2>
            <button
              type="button"
              onClick={onBackToStepOne}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
              title="Chỉnh sửa ở Bước 1"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
            {description || 'Không có mô tả cho video này.'}
          </p>
        </div>

        {/* Release Mode & Visibility Config */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl p-5 sm:p-6 rounded-3xl flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-[20px]">visibility</span>
              <span className="text-sm font-bold text-white">Chế độ hiển thị &amp; Xuất bản</span>
            </div>
            <span className="text-[10px] font-mono bg-white/5 text-[#69d8d4] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#69d8d4]/30">
              Bước hoàn tất
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Option: Private */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl cursor-pointer transition-all border ${
                visibility === 'private'
                  ? 'bg-rose-500/10 border-rose-500/40 shadow-md shadow-rose-950/20'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                className="mt-1 text-rose-600 focus:ring-0 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Riêng tư (Private)</span>
                <span className="text-xs text-white/50 mt-0.5">
                  Chỉ bạn mới có thể xem video này. Video sẽ không xuất hiện trên nguồn cấp dữ liệu chung.
                </span>
              </div>
            </label>

            {/* Option: Public */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-2xl cursor-pointer transition-all border ${
                visibility === 'public'
                  ? 'bg-rose-500/10 border-rose-500/40 shadow-md shadow-rose-950/20'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                className="mt-1 text-rose-600 focus:ring-0 cursor-pointer"
              />
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Công khai (Public)</span>
                  <span className="text-[10px] bg-[#69d8d4]/15 text-[#69d8d4] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    Khuyên dùng
                  </span>
                </div>
                <span className="text-xs text-white/50 mt-0.5">
                  Mọi người đều có thể tìm kiếm và xem video của bạn trên YuhTube chuẩn 4K HDR.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Real File & Publishing Checks */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl p-5 sm:p-6 rounded-3xl flex flex-col gap-3 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
            <span className="text-xs uppercase font-mono tracking-wider text-white font-semibold">
              Kiểm tra bản quyền &amp; tính tương thích
            </span>
          </div>
          <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between text-white/70">
              <span>Bản quyền nội dung:</span>
              <span className="text-emerald-400 font-semibold">Không tìm thấy vấn đề</span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>Định dạng tệp:</span>
              <span className="text-white">{file.type || 'video/mp4'}</span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>Dung lượng gốc:</span>
              <span className="text-white">{formatFileSize(file.size)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Player Canvas & Global Distribution (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Video Player Canvas */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl overflow-hidden flex flex-col shadow-xl">
          <div className="relative w-full aspect-video bg-black overflow-hidden group">
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
                alt="Final Video Preview"
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/30 text-xs gap-1.5">
                <span className="material-symbols-outlined text-[32px] text-white/20">video_file</span>
                <span>Chờ tải video</span>
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col gap-1 text-xs">
            <span className="text-white/50 font-mono">
              Tên tệp gốc:{' '}
              <span className="text-white truncate max-w-[200px]" title={file.name}>
                {file.name}
              </span>
            </span>
            <span className="text-white/50 font-mono">
              Kích thước: <span className="text-[#69d8d4]">{formatFileSize(file.size)}</span>
            </span>
          </div>

          {/* Upload Progress Status Card */}
          <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-white font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isUploading
                      ? 'bg-amber-400 animate-pulse'
                      : result
                        ? 'bg-emerald-400'
                        : 'bg-white/40'
                  }`}
                />
                {isUploading ? `Đang tải lên (${progress}%)` : result ? 'Đã tải xong 100%' : 'Chờ tải'}
              </span>
              <span className="font-mono text-[11px] text-[#69d8d4] font-bold">
                {isUploading ? `${progress}%` : result ? '100%' : '0%'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  result ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-[#69d8d4]'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Official Share Link & Quick Actions */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl p-5 sm:p-6 rounded-3xl flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold">
              Đường liên kết phát hành
            </span>
            <span className="text-xs text-[#69d8d4] font-mono">Trực tiếp toàn cầu</span>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.08] rounded-2xl p-1.5">
            <input
              type="text"
              readOnly
              value={videoShareUrl}
              className="bg-transparent text-xs text-white font-mono flex-1 px-3 focus:outline-none"
            />
            <button
              type="button"
              onClick={copyVideoLink}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isCopied ? 'check' : 'content_copy'}
              </span>
              <span>{isCopied ? 'Đã chép!' : 'Sao chép'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
