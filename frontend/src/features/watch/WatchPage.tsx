import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { VideoPlayer } from './components/VideoPlayer'
import { CommentSection } from './components/CommentSection'
import { RelatedVideos } from './components/RelatedVideos'
import { useWatchVideo } from './hooks/useWatchVideo'

export function WatchPage() {
  const { videoId = 'v1' } = useParams<{ videoId: string }>()
  const { video, comments, isLoading, addComment } = useWatchVideo(videoId)

  const [isSubscribed, setIsSubscribed] = useState(false)
  const [likesCount, setLikesCount] = useState(4820)
  const [hasLiked, setHasLiked] = useState(false)
  const [isDescExpanded, setIsDescExpanded] = useState(false)

  function handleLike() {
    if (hasLiked) {
      setLikesCount((prev) => prev - 1)
      setHasLiked(false)
    } else {
      setLikesCount((prev) => prev + 1)
      setHasLiked(true)
    }
  }

  if (isLoading || !video) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1] flex flex-col selection:bg-red-600/30">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-6 bg-gradient-to-tr from-red-600 to-rose-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30">
              <span className="material-symbols-outlined text-[16px] text-white">play_arrow</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Yuh<span className="text-red-500">Tube</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-6 hidden sm:block">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Tìm kiếm video..."
              className="w-full bg-[#181818] border border-white/15 focus:border-red-500 rounded-full py-1.5 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none transition-all"
            />
            <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-white/40">
              search
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/studio"
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-red-500">video_call</span>
            <span>Studio</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
            Y
          </div>
        </div>
      </header>

      {/* Main Watch Page Container */}
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1760px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Player & Video Info */}
          <section className="lg:col-span-8 flex flex-col space-y-4">
            <VideoPlayer
              title={video.title}
              posterUrl={video.posterUrl}
              playbackUrl={video.playbackUrl}
            />

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              {video.title}
            </h1>

            {/* Channel Bar & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={video.uploader.avatar}
                  alt={video.uploader.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-red-500/40"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm text-white">{video.uploader.name}</span>
                    {video.uploader.isVerified && (
                      <span className="material-symbols-outlined text-[15px] text-white/50">verified</span>
                    )}
                  </div>
                  <p className="text-xs text-white/50">{video.uploader.subscribers}</p>
                </div>

                <button
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`ml-3 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isSubscribed
                      ? 'bg-white/10 text-white/80 hover:bg-white/20'
                      : 'bg-white text-black hover:bg-white/90 shadow-md shadow-white/10'
                  }`}
                >
                  {isSubscribed ? 'Đã đăng ký' : 'Đăng ký'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/10 rounded-full overflow-hidden">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer ${
                      hasLiked ? 'text-red-400 font-bold' : 'text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                    <span>{likesCount.toLocaleString()}</span>
                  </button>
                  <div className="w-[1px] h-5 bg-white/20"></div>
                  <button className="px-3 py-2 text-xs font-medium hover:bg-white/10 transition-colors text-white cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">thumb_down</span>
                  </button>
                </div>

                <button className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-full text-xs font-medium text-white transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  <span className="hidden sm:inline">Chia sẻ</span>
                </button>

                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </button>
              </div>
            </div>

            {/* Description Card */}
            <div
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] transition-colors cursor-pointer text-xs space-y-2 border border-white/5"
            >
              <div className="flex items-center gap-3 font-semibold text-white/90">
                <span>{video.views}</span>
                <span>•</span>
                <span>{video.publishedAt}</span>
                <span className="text-red-400">#Serverless #AWS #HLS #Streaming</span>
              </div>
              <p className={`text-white/80 leading-relaxed ${isDescExpanded ? '' : 'line-clamp-2'}`}>
                {video.description}
              </p>
              <button className="font-semibold text-white/50 hover:text-white cursor-pointer">
                {isDescExpanded ? 'Thu gọn' : '...thêm'}
              </button>
            </div>

            {/* Comments Section */}
            <CommentSection comments={comments} onAddComment={addComment} />
          </section>

          {/* Right Column: Related Videos */}
          <RelatedVideos />
        </div>
      </main>
    </div>
  )
}
