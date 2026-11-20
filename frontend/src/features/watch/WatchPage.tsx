import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { VideoPlayer } from './components/VideoPlayer'
import { CommentSection } from './components/CommentSection'
import { RelatedVideos } from './components/RelatedVideos'
import { useWatchVideo } from './hooks/useWatchVideo'
import { recordVideoView } from './services/watch.service'
import { FloatingNavbar } from '../home/components/FloatingNavbar'

export function WatchPage() {
  const { videoId = 'v1' } = useParams<{ videoId: string }>()
  const {
    video,
    comments,
    isLoading,
    isLiking,
    isSubmittingComment,
    hasLiked,
    likesCount,
    toggleLike,
    addComment,
    deleteComment,
  } = useWatchVideo(videoId)

  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isDescExpanded, setIsDescExpanded] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] text-white flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-white/50 font-mono tracking-wider">Đang tải luồng phát trực tuyến HLS...</span>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] text-[#f1f1f1] flex flex-col selection:bg-rose-600/30">
        <FloatingNavbar />

        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pt-28">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white/30">
            <span className="material-symbols-outlined text-4xl">video_library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Không tìm thấy video</h1>
          <p className="text-white/60 max-w-md mb-8 text-xs leading-relaxed">
            Video này hiện không khả dụng hoặc chưa hoàn tất xử lý chuyển mã trên AWS MediaConvert. Vui lòng thử lại sau.
          </p>
          <Link
            to="/"
            className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs rounded-full transition-all inline-flex items-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Về trang chủ</span>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-[#f1f1f1] flex flex-col selection:bg-rose-600/30">
      {/* Floating Island Navigation */}
      <FloatingNavbar />

      {/* Main Watch Page Container */}
      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1760px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Player & Video Info */}
          <section className="lg:col-span-8 flex flex-col space-y-4">
            {/* Video Player with Cinema Ambilight Glow */}
            <div className="relative group">
              {video.posterUrl && (
                <div
                  className="absolute -inset-4 sm:-inset-6 bg-cover bg-center rounded-[36px] blur-3xl opacity-30 pointer-events-none -z-10 transition-opacity duration-700"
                  style={{ backgroundImage: `url(${video.posterUrl})` }}
                />
              )}
              <div className="rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/[0.12]">
                <VideoPlayer
                  title={video.title}
                  posterUrl={video.posterUrl}
                  playbackUrl={video.playbackUrl}
                  onViewQualified={() => recordVideoView(video.id)}
                />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
              {video.title}
            </h1>

            {/* Channel Bar & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <img
                  src={video.uploader.avatar}
                  alt={video.uploader.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/40 shadow-md"
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
                      : 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-md shadow-white/10'
                  }`}
                >
                  {isSubscribed ? 'Đã đăng ký' : 'Đăng ký'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.09] backdrop-blur-xl rounded-full overflow-hidden shadow-sm transition-all">
                  <button
                    onClick={toggleLike}
                    disabled={isLiking}
                    aria-label={hasLiked ? 'Bỏ thích video' : 'Thích video'}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer active:scale-95 ${
                      hasLiked ? 'text-rose-400 font-bold' : 'text-white/90'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={hasLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      thumb_up
                    </span>
                    <span>{likesCount.toLocaleString()}</span>
                  </button>
                  <div className="w-[1px] h-4 bg-white/15" />
                  <button
                    aria-label="Không thích video"
                    className="px-3 py-2 text-xs font-medium hover:bg-white/10 transition-colors text-white/70 hover:text-white cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">thumb_down</span>
                  </button>
                </div>

                <button className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] backdrop-blur-xl px-4 py-2 rounded-full text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm">
                  <span className="material-symbols-outlined text-[18px] text-white/70">share</span>
                  <span className="hidden sm:inline">Chia sẻ</span>
                </button>

                <button className="p-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] backdrop-blur-xl rounded-full text-white/80 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </button>
              </div>
            </div>

            {/* Description Card (Frosted Glass luxury) */}
            <div
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="p-5 rounded-3xl bg-white/[0.03] hover:bg-white/[0.05] transition-all duration-300 cursor-pointer text-xs space-y-2.5 border border-white/[0.08] backdrop-blur-xl shadow-lg"
            >
              <div className="flex items-center gap-3 font-semibold text-white/90 font-mono text-[11px]">
                <span>{video.views}</span>
                <span className="text-white/30">•</span>
                <span>{video.publishedAt}</span>
                <span className="text-rose-400 font-sans">#HLS #Serverless #AppleTVStyle</span>
              </div>
              <p className={`text-white/80 leading-relaxed font-sans ${isDescExpanded ? '' : 'line-clamp-2'}`}>
                {video.description || 'Chưa có phần mô tả chi tiết cho video này.'}
              </p>
              <button className="font-semibold text-white/50 hover:text-white cursor-pointer pt-0.5">
                {isDescExpanded ? 'Thu gọn' : '...xem thêm'}
              </button>
            </div>

            {/* Comments Section */}
            <CommentSection
              comments={comments}
              onAddComment={addComment}
              onDeleteComment={deleteComment}
              isSubmitting={isSubmittingComment}
            />
          </section>

          {/* Right Column: Related Videos */}
          <RelatedVideos currentVideoId={videoId} />
        </div>
      </main>
    </div>
  )
}
