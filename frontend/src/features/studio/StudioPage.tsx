import { Link, useNavigate } from 'react-router-dom'
import { StudioHeader } from './components/StudioHeader'
import { StudioSidebar } from './components/StudioSidebar'
import { LatestVideoPerformanceCard } from './components/LatestVideoPerformanceCard'
import { ChannelAnalyticsCard } from './components/ChannelAnalyticsCard'
import { RecentCommentsCard } from './components/RecentCommentsCard'
import { RecentVideosTable } from './components/RecentVideosTable'
import { useStudioDashboard } from './hooks/useStudioDashboard'

export function StudioPage() {
  const navigate = useNavigate()
  const { videos, latestVideo, analytics, isLoading } = useStudioDashboard()

  if (isLoading || !latestVideo || !analytics) {
    return (
      <div className="min-h-screen bg-[#161616] text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161616] text-[#f1f1f1] flex flex-col selection:bg-red-600/30">
      {/* Top Header */}
      <StudioHeader onOpenUpload={() => navigate('/upload')} />

      <div className="flex flex-1 pt-14">
        {/* Left Sidebar */}
        <StudioSidebar />

        {/* Main Studio Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-[#161616] p-4 sm:p-6 lg:p-8 lg:ml-64">
          <div className="max-w-[1440px] mx-auto space-y-6">
            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">
                    Bảng điều khiển Studio
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-xs text-white/50">v2.5 Pro Reimagined</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Trang tổng quan của kênh
                </h1>
                <p className="text-xs text-white/60 mt-1">
                  Tổng quan hiệu suất kênh và hoạt động phân phối video thời gian thực
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
              <ChannelAnalyticsCard analytics={analytics} />

              {/* Card 3: Recent Comments & Creator News */}
              <RecentCommentsCard />
            </div>

            {/* Card 4: Recent Published Videos Table */}
            <RecentVideosTable videos={videos} />
          </div>
        </main>
      </div>
    </div>
  )
}
