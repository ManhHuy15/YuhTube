import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchHomeFeed } from '../../home/services/home.service'
import type { VideoFeedItem } from '../../home/types/home.types'

interface RelatedVideosProps {
  currentVideoId?: string
}

export function RelatedVideos({ currentVideoId }: RelatedVideosProps) {
  const [videos, setVideos] = useState<VideoFeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    fetchHomeFeed()
      .then((items) => {
        if (!isCancelled) {
          const filtered = currentVideoId
            ? items.filter((item) => item.id !== currentVideoId)
            : items
          setVideos(filtered)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setVideos([])
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [currentVideoId])

  return (
    <aside className="lg:col-span-4 space-y-4 select-none">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Video tiếp theo
          </h3>
        </div>
        {videos.length > 0 && (
          <span className="text-[11px] font-mono text-[#69d8d4] bg-[#69d8d4]/10 border border-[#69d8d4]/20 px-2 py-0.5 rounded-full font-semibold">
            {videos.length} video
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse">
              <div className="w-36 aspect-video rounded-xl bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-white/10 rounded w-5/6" />
                <div className="h-2.5 bg-white/5 rounded w-1/2" />
                <div className="h-2 bg-white/5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
            <span className="material-symbols-outlined text-[24px]">video_library</span>
          </div>
          <p className="text-xs font-bold text-white/80">Chưa có video đề xuất khác</p>
          <p className="text-[11px] text-white/50 leading-relaxed">
            Tải thêm video để mở rộng thư viện phát trực tuyến chuẩn HLS của bạn.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all cursor-pointer mt-1"
          >
            <span className="material-symbols-outlined text-[16px]">upload</span>
            <span>TẢI VIDEO MỚI</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {videos.map((video) => (
            <Link
              key={video.id}
              to={`/watch/${video.id}`}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex gap-3.5 group p-2 rounded-2xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] backdrop-blur-xl transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              <div className="w-36 sm:w-40 aspect-video rounded-xl overflow-hidden bg-black shrink-0 relative border border-white/10 shadow-md">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#141418] text-white/20">
                    <span className="material-symbols-outlined text-[24px]">movie</span>
                  </div>
                )}
                {video.duration && (
                  <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md text-white text-[10px] px-1.5 py-0.5 font-mono rounded font-semibold border border-white/10">
                    {video.duration}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-xs font-bold text-white group-hover:text-rose-400 line-clamp-2 leading-snug transition-colors">
                  {video.title}
                </h4>
                <p className="text-[11px] text-white/50 mt-1.5 truncate flex items-center gap-1 font-medium">
                  <span>{video.uploader.name}</span>
                  {video.uploader.isVerified && (
                    <span className="material-symbols-outlined text-[13px] text-rose-500">
                      verified
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-white/40 font-mono mt-0.5">
                  {video.views} lượt xem • {video.createdAt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </aside>
  )
}
