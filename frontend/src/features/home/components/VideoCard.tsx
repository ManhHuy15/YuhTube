import { Link } from 'react-router-dom'
import type { VideoFeedItem } from '../types/home.types'

interface VideoCardProps {
  video: VideoFeedItem
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link to={`/watch/${video.id}`} className="flex flex-col group cursor-pointer">
      {/* Thumbnail */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-lg group-hover:rounded-lg transition-all duration-300">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute bottom-2 right-2 bg-black/85 text-white font-mono text-[11px] px-2 py-0.5 rounded-md font-semibold border border-white/10">
          {video.duration}
        </span>
        {video.badge && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full shadow-md shadow-red-600/40 border border-white/20">
            {video.badge}
          </span>
        )}
      </div>

      {/* Metadata info */}
      <div className="flex gap-3 mt-3 items-start">
        <img
          src={video.uploader.avatar}
          alt={video.uploader.name}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5 ring-1 ring-white/10"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white group-hover:text-red-400 line-clamp-2 leading-snug transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-white/50">
            <span>{video.uploader.name}</span>
            {video.uploader.isVerified && (
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
            )}
          </div>
          <div className="text-xs text-white/40">
            <span>{video.views} lượt xem</span>
            <span className="mx-1">•</span>
            <span>{video.createdAt}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
