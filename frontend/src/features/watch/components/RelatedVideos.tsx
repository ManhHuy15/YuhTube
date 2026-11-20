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
    <aside className="lg:col-span-4 space-y-3 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-red-500">playlist_play</span>
          <span>Video tiếp theo</span>
        </h3>
        {videos.length > 0 && (
          <span className="text-[11px] font-mono text-[#69d8d4] font-semibold">
            {videos.length} video
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 p-2 rounded-xl animate-pulse">
              <div className="w-36 aspect-video rounded-lg bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-white/10 rounded w-5/6" />
                <div className="h-2.5 bg-white/5 rounded w-1/2" />
                <div className="h-2 bg-white/5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="p-6 rounded-2xl bg-[#18181c]/60 border border-white/10 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/40">
            <span className="material-symbols-outlined text-[20px]">video_library</span>
          </div>
          <p className="text-xs font-medium text-white/80">Chưa có video đề xuất khác</p>
          <p className="text-[11px] text-white/50">
            Tải thêm video để mở rộng thư viện phát của nền tảng YuhTube.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-semibold border border-red-500/30 transition-all cursor-pointer mt-1"
          >
            <span className="material-symbols-outlined text-[15px]">upload</span>
            <span>Tải video mới</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {videos.map((video) => (
            <Link
              key={video.id}
              to={`/watch/${video.id}`}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex gap-3 group p-2 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all duration-200 cursor-pointer"
            >
              <div className="w-36 sm:w-40 aspect-video rounded-lg overflow-hidden bg-black shrink-0 relative border border-white/10 shadow-md">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1c1b1d] text-white/20">
                    <span className="material-symbols-outlined text-[24px]">movie</span>
                  </div>
                )}
                {video.duration && (
                  <span className="absolute bottom-1 right-1 bg-black/85 text-white text-[10px] px-1.5 py-0.5 font-mono rounded font-medium border border-white/10">
                    {video.duration}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-xs font-semibold text-white group-hover:text-red-400 line-clamp-2 leading-snug transition-colors">
                  {video.title}
                </h4>
                <p className="text-[11px] text-white/50 mt-1 truncate flex items-center gap-1">
                  <span>{video.uploader.name}</span>
                  {video.uploader.isVerified && (
                    <span className="material-symbols-outlined text-[13px] text-red-500">
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
