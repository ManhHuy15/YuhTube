import { Link } from 'react-router-dom'
import type { VideoFeedItem } from '../types/home.types'

interface HeroBillboardProps {
  featuredVideo?: VideoFeedItem | null
}

export function HeroBillboard({ featuredVideo }: HeroBillboardProps) {
  if (!featuredVideo) {
    return (
      <div className="relative w-full rounded-[32px] overflow-hidden bg-gradient-to-br from-[#181820] via-[#121216] to-[#0b0b0e] border border-white/[0.08] p-8 sm:p-12 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span>NỀN TẢNG VIDEO HLS THỜI GIAN THỰC</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Trải nghiệm phát trực tuyến chuẩn <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-400 to-amber-300">Cinematic 4K</span>
          </h1>

          <p className="text-sm sm:text-base text-white/60 leading-relaxed">
            Hệ thống phân phối video serverless thế hệ mới với AWS Elemental MediaConvert, phân giải đa luồng ABR mượt mà và Single-Table DynamoDB Design.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold text-xs tracking-wider uppercase transition-all shadow-xl shadow-white/10 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">upload</span>
              <span>Tải video đầu tiên lên</span>
            </Link>

            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] backdrop-blur-xl text-white font-semibold text-xs tracking-wide transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-rose-400">dashboard</span>
              <span>Studio sáng tạo</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-[32px] overflow-hidden bg-black border border-white/[0.1] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] group select-none">
      {/* Dynamic Background Image with Ambilight Blur */}
      {featuredVideo.thumbnailUrl ? (
        <div className="absolute inset-0">
          <img
            src={featuredVideo.thumbnailUrl}
            alt={featuredVideo.title}
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Ambilight Glow spreading out */}
          <div
            className="absolute -inset-10 bg-cover bg-center blur-3xl opacity-25 -z-10"
            style={{ backgroundImage: `url(${featuredVideo.thumbnailUrl})` }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#16161c] via-[#101014] to-black" />
      )}

      {/* Cinematic Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0e] via-[#0b0b0e]/50 to-transparent" />

      {/* Billboard Foreground Content */}
      <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-3xl flex flex-col justify-end min-h-[360px] sm:min-h-[440px] space-y-4">
        {/* Spotlight Pill Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/80 backdrop-blur-xl text-white text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-rose-500/30 border border-white/20">
            ★ Nổi bật hôm nay
          </span>
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl text-white/90 text-[11px] font-mono border border-white/10">
            {featuredVideo.duration} • 4K HDR
          </span>
        </div>

        {/* Video Big Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1] line-clamp-2 drop-shadow-md">
          {featuredVideo.title}
        </h1>

        {/* Author & Stats Meta */}
        <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
          <img
            src={featuredVideo.uploader.avatar}
            alt={featuredVideo.uploader.name}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-white/20 shadow-md"
          />
          <span className="font-semibold text-white">{featuredVideo.uploader.name}</span>
          <span className="text-white/30">•</span>
          <span className="font-mono text-white/70">{featuredVideo.views} lượt xem</span>
          <span className="text-white/30">•</span>
          <span className="text-white/70">{featuredVideo.createdAt}</span>
        </div>

        {/* Action Buttons (Apple TV Style) */}
        <div className="pt-2 flex flex-wrap items-center gap-3.5">
          <Link
            to={`/watch/${featuredVideo.id}`}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs tracking-wider uppercase transition-all shadow-2xl shadow-white/20 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-zinc-950">play_arrow</span>
            <span>PHÁT VIDEO NGAY</span>
          </Link>

          <Link
            to={`/watch/${featuredVideo.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-2xl text-white font-semibold text-xs tracking-wide transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>Chi tiết</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
