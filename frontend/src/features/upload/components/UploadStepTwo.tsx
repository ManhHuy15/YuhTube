import { formatFileSize } from '../constants/upload.constants'
import type { VisibilityMode } from '../types/upload.types'

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
}: UploadStepTwoProps) {
  return (
    <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Release Review & Settings (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Video Title Banner */}
        <div className="bg-[#201f21] border border-white/10 p-5 rounded-2xl flex flex-col gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold">
            Tiêu đề phát hành
          </span>
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">{title}</h2>
            <button
              type="button"
              onClick={onBackToStepOne}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
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
        <div className="bg-[#201f21] border border-white/10 p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-[20px]">visibility</span>
              <span className="text-sm font-bold text-white">Chế độ hiển thị &amp; Xuất bản</span>
            </div>
            <span className="text-[10px] font-mono bg-[#0e0e10] text-[#69d8d4] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#69d8d4]/30">
              Bước hoàn tất
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Option: Private */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${
                visibility === 'private'
                  ? 'bg-[#2a2a2c] border-red-500/50'
                  : 'bg-[#1c1b1d] border-white/5 hover:bg-[#2a2a2c]'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                className="mt-1 text-red-600 focus:ring-0 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Riêng tư (Private)</span>
                <span className="text-xs text-white/50 mt-0.5">
                  Chỉ bạn mới có thể xem video này. Video sẽ không xuất hiện trên bảng tin chung.
                </span>
              </div>
            </label>

            {/* Option: Public */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${
                visibility === 'public'
                  ? 'bg-[#2a2a2c] border-red-500/50 shadow-md shadow-red-950/20'
                  : 'bg-[#1c1b1d] border-white/5 hover:bg-[#2a2a2c]'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                className="mt-1 text-red-600 focus:ring-0 cursor-pointer"
              />
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Công khai (Public)</span>
                  <span className="text-[10px] bg-[#69d8d4]/15 text-[#69d8d4] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    Khuyên dùng
                  </span>
                </div>
                <span className="text-xs text-white/50 mt-0.5">
                  Mọi người đều có thể tìm kiếm và xem video của bạn trên YuhTube.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Technical Telemetry Specs */}
        <div className="bg-[#201f21] border border-white/10 p-5 rounded-2xl flex flex-col gap-3">
          <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold">
            Thông số kỹ thuật tệp phát
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="bg-[#0e0e10] p-3 rounded-xl border border-white/5 flex flex-col">
              <span className="text-white/40 text-[10px]">Độ phân giải</span>
              <span className="text-white font-medium mt-0.5">4K 2160p @ 60fps</span>
            </div>
            <div className="bg-[#0e0e10] p-3 rounded-xl border border-white/5 flex flex-col">
              <span className="text-white/40 text-[10px]">Mã hóa (Codec)</span>
              <span className="text-white font-medium mt-0.5">AV1 / HEVC Main10</span>
            </div>
            <div className="bg-[#0e0e10] p-3 rounded-xl border border-white/5 flex flex-col">
              <span className="text-white/40 text-[10px]">Âm thanh</span>
              <span className="text-white font-medium mt-0.5">Stereo 384kbps AAC</span>
            </div>
            <div className="bg-[#0e0e10] p-3 rounded-xl border border-white/5 flex flex-col">
              <span className="text-white/40 text-[10px]">Kích thước gốc</span>
              <span className="text-white font-medium mt-0.5">{formatFileSize(file.size)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Player Canvas & Global Distribution (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Video Player Canvas */}
        <div className="bg-[#201f21] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-xl">
          <div className="relative w-full aspect-video bg-[#0e0e10] overflow-hidden group">
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
            <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold border border-white/15">
                4K UHD
              </span>
              <span className="px-2 py-0.5 rounded bg-black/80 text-[#69d8d4] font-mono text-[10px] font-semibold border border-[#69d8d4]/30">
                60 FPS
              </span>
            </div>
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
        </div>

        {/* Official Share Link & Quick Actions */}
        <div className="bg-[#201f21] border border-white/10 p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold">
              Đường liên kết phát hành
            </span>
            <span className="text-xs text-[#69d8d4] font-mono">Trực tiếp toàn cầu</span>
          </div>

          <div className="flex items-center gap-2 bg-[#0e0e10] border border-white/10 rounded-xl p-1.5">
            <input
              type="text"
              readOnly
              value={videoShareUrl}
              className="bg-transparent text-xs text-white font-mono flex-1 px-2.5 focus:outline-none"
            />
            <button
              type="button"
              onClick={copyVideoLink}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isCopied ? 'check' : 'content_copy'}
              </span>
              <span>{isCopied ? 'Đã chép!' : 'Sao chép'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={copyVideoLink}
              className="flex-1 py-2 px-2 rounded-xl bg-[#1c1b1d] hover:bg-[#2a2a2c] text-white/70 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/5"
            >
              <span className="material-symbols-outlined text-[15px]">share</span>
              <span>Chia sẻ X</span>
            </button>
            <button
              type="button"
              onClick={copyVideoLink}
              className="flex-1 py-2 px-2 rounded-xl bg-[#1c1b1d] hover:bg-[#2a2a2c] text-white/70 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/5"
            >
              <span className="material-symbols-outlined text-[15px]">code</span>
              <span>Mã nhúng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
