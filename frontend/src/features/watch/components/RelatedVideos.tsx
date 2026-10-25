import { Link } from 'react-router-dom'
import { WATCH_RELATED_VIDEOS } from '../constants/watch.constants'

export function RelatedVideos() {
  return (
    <aside className="lg:col-span-4 space-y-3">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Video tiếp theo</h3>
      {WATCH_RELATED_VIDEOS.map((video) => (
        <Link
          key={video.id}
          to={`/watch/${video.id}`}
          className="flex gap-3 group p-2 rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer"
        >
          <div className="w-40 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 relative border border-white/10 group-hover:scale-105 transition-transform duration-300">
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
            <span className="absolute bottom-1 right-1 bg-black/85 text-white text-[10px] px-1 font-mono rounded font-semibold">
              {video.duration}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white group-hover:text-red-400 line-clamp-2 leading-snug transition-colors">
              {video.title}
            </h4>
            <p className="text-[11px] text-white/50 mt-1">{video.channel}</p>
            <p className="text-[11px] text-white/40">
              {video.views} • {video.time}
            </p>
          </div>
        </Link>
      ))}
    </aside>
  )
}
