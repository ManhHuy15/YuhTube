import { Link, useNavigate } from 'react-router-dom'
import { StudioHeader } from './components/StudioHeader'
import { StudioSidebar } from './components/StudioSidebar'
import { LatestVideoPerformanceCard } from './components/LatestVideoPerformanceCard'
import { ChannelAnalyticsCard } from './components/ChannelAnalyticsCard'
import { RecentCommentsCard } from './components/RecentCommentsCard'
import { RecentVideosTable } from './components/RecentVideosTable'
import { useStudioDashboard } from './hooks/useStudioDashboard'
import type { StudioVideoRow } from './types/studio.types'

export function StudioPage() {
  const navigate = useNavigate()
  const { videos, setVideos, latestVideo, analytics, isLoading } = useStudioDashboard()

  function handleVideoDeleted(id: string) {
    setVideos((prev) => prev.filter((v) => v.id !== id))
  }

  function handleVideoUpdated(updated: StudioVideoRow) {
    setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] text-white flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-white/50 font-mono tracking-wider">Đang tải dữ liệu Studio từ AWS...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0e0e10] text-[#f1f1f1] flex flex-col selection:bg-red-600/30">
      {/* Top Header */}
      <StudioHeader onOpenUpload={() => navigate('/upload')} />

      <div className="flex flex-1 pt-14">
        {/* Left Sidebar */}
        <StudioSidebar />

        {/* Main Studio Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-[#0e0e10] p-4 sm:p-6 lg:p-8 lg:ml-64">
          <div className="max-w-[1440px] mx-auto space-y-6">
            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">
                    Bảng điều khiển Studio
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-xs text-white/50 font-mono">Dữ liệu thời gian thực</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Trang tổng quan của kênh
                </h1>
                <p className="text-xs text-white/60 mt-1">
                  Tổng quan hiệu suất kênh và quản lý video từ cơ sở dữ liệu AWS DynamoDB
                </p>
              </div>

              <Link
                to="/upload"
                className="self-start sm:self-auto flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">upload</span>
                <span>TẢI VIDEO LÊN</span>
              </Link>
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
    </div>
  )
}
