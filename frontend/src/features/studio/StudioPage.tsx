import { Link } from 'react-router-dom'
import { LatestVideoPerformanceCard } from './components/LatestVideoPerformanceCard'
import { ChannelAnalyticsCard } from './components/ChannelAnalyticsCard'
import { RecentCommentsCard } from './components/RecentCommentsCard'
import { RecentVideosTable } from './components/RecentVideosTable'
import { useStudioDashboard } from './hooks/useStudioDashboard'
import { useAuthStore } from '../auth/hooks/useAuthStore'
import { FloatingNavbar } from '../home/components/FloatingNavbar'
import type { StudioVideoRow } from './types/studio.types'

export function StudioPage() {
  const { videos, setVideos, latestVideo, analytics, isLoading } = useStudioDashboard()
  const { user, openAvatarModal } = useAuthStore()

  const channelName = user?.name || user?.email?.split('@')[0] || 'Studio Master'
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channelName)}`
  const avatarUrl = user?.avatar || defaultAvatar

  function handleVideoDeleted(id: string) {
    setVideos((prev) => prev.filter((v) => v.id !== id))
  }

  function handleVideoUpdated(updated: StudioVideoRow) {
    setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] text-white flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-white/50 font-mono tracking-wider">Đang tải dữ liệu Studio từ AWS...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-[#f4f4f6] flex flex-col selection:bg-rose-600/30">
      {/* Floating Island Navigation */}
      <FloatingNavbar />

      {/* Main Studio Dashboard Content */}
      <main className="flex-1 pt-24 sm:pt-28 pb-20 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Channel Hero Profile Card */}
          <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] p-6 sm:p-8 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Ambient Accent Glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-5">
              <button
                type="button"
                onClick={openAvatarModal}
                className="relative group cursor-pointer shrink-0"
                title="Thay đổi ảnh đại diện kênh"
              >
                <div className="absolute -inset-1 bg-gradient-to-tr from-rose-500 to-red-500 rounded-full blur opacity-40 group-hover:opacity-80 transition-opacity" />
                <img
                  alt="Channel Avatar"
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-white/20 shadow-xl bg-zinc-900"
                  src={avatarUrl}
                />
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-rose-600 border-2 border-[#121217] text-white flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                </span>
              </button>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-rose-300 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                    Pro Creator Studio
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-[11px] text-white/50 font-mono">AWS DynamoDB Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {channelName}
                  </h1>
                  <button
                    type="button"
                    onClick={openAvatarModal}
                    title="Đổi tên kênh"
                    className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                </div>
                <p className="text-xs text-white/50">
                  {videos.length} video công khai • Phân phối thích ứng HLS ABR
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <Link
                to="/upload"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs tracking-wider uppercase shadow-xl shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">upload</span>
                <span>TẢI VIDEO MỚI</span>
              </Link>
            </div>
          </div>

          {/* 3-Column Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Card 1: Latest Video Performance */}
            <LatestVideoPerformanceCard stats={latestVideo} />

            {/* Card 2: Channel Analytics */}
            {analytics && <ChannelAnalyticsCard analytics={analytics} />}

            {/* Card 3: Recent Comments & Creator News */}
            <RecentCommentsCard />
          </div>

          {/* Card 4: Recent Published Videos Table */}
          <RecentVideosTable
            videos={videos}
            onVideoDeleted={handleVideoDeleted}
            onVideoUpdated={handleVideoUpdated}
          />
        </div>
      </main>
    </div>
  )
}
