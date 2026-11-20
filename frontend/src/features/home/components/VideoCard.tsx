import { Link } from 'react-router-dom'
import type { VideoFeedItem } from '../types/home.types'

interface VideoCardProps {
  video: VideoFeedItem
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link
      to={`/watch/${video.id}`}
      className="flex flex-col group cursor-pointer select-none p-2.5 rounded-[26px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.16] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] active:scale-[0.99]"
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-[18px] overflow-hidden bg-[#141418] border border-white/[0.08] shadow-md">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#101014] to-[#181820] text-white/20 gap-2">
            <span className="material-symbols-outlined text-[36px]">play_circle</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">HLS Cinema</span>
          </div>
        )}

        {/* Ambient Gradient Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Video Duration Badge */}
        {video.duration && (
          <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xl text-white font-mono text-[10px] px-2 py-0.5 rounded-full font-medium border border-white/15 shadow-sm">
            {video.duration}
          </span>
        )}

        {/* Video Special Badge */}
        {video.badge && (
          <span className="absolute top-2.5 left-2.5 bg-rose-500/90 backdrop-blur-md text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shadow-md shadow-rose-500/30 border border-white/20">
            {video.badge}
          </span>
        )}
      </div>

      {/* Metadata Info Row */}
      <div className="flex gap-3 mt-3 px-1 items-start">
        <img
          src={video.uploader.avatar}
          alt={video.uploader.name}
          className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-white/15 shadow-sm"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-[13px] font-semibold text-white/95 group-hover:text-rose-400 line-clamp-2 leading-snug tracking-tight transition-colors">
            {video.title}
          </h3>

          <div className="flex items-center gap-1 mt-1 text-[11px] text-white/50 truncate">
            <span className="hover:text-white/80 transition-colors">{video.uploader.name}</span>
            {video.uploader.isVerified && (
              <span className="material-symbols-outlined text-[13px] text-rose-400">
                verified
              </span>
            )}
          </div>

          <div className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5 font-mono">
            <span>{video.views} lượt xem</span>
            <span>•</span>
            <span>{video.createdAt}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
