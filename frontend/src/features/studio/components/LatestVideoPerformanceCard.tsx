import { Link } from 'react-router-dom'
import type { LatestVideoStats } from '../types/studio.types'

interface LatestVideoPerformanceCardProps {
  stats: LatestVideoStats
}

export function LatestVideoPerformanceCard({ stats }: LatestVideoPerformanceCardProps) {
  return (
    <div className="relative group rounded-2xl bg-[#1e1e24]/70 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all hover:shadow-2xl hover:shadow-red-500/5">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500"></div>
            <h3 className="text-[15px] font-bold text-white tracking-tight">Hiệu suất video mới nhất</h3>
          </div>
          <button className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[19px]">more_vert</span>
          </button>
        </div>

        {/* Video Preview */}
        <Link to="/watch/v1" className="block mt-4 group/thumb cursor-pointer">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-lg">
            <img
              alt="Latest video thumbnail"
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
              src={stats.thumbnailUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white font-mono text-[11px] px-2 py-0.5 rounded-md font-semibold border border-white/10">
              {stats.duration}
            </span>
            <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full shadow-md shadow-red-600/40 border border-white/20">
              MỚI ĐĂNG
            </div>
          </div>
          <h4 className="text-[14px] font-semibold text-white line-clamp-2 mt-3 leading-snug group-hover/thumb:text-[#3ea6ff] transition-colors">
            {stats.title}
          </h4>
        </Link>

        {/* Metrics List */}
        <div className="mt-4 space-y-2.5 pt-3.5 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white/[0.02]">
            <span className="text-white/60">Xếp hạng theo lượt xem:</span>
            <span className="font-medium text-white flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {stats.rank}
              </span>
              <span className="text-[11px] text-white/40">(24 giờ đầu)</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white/[0.02]">
            <span className="text-white/60">Lượt xem:</span>
            <div className="flex items-center gap-1.5 font-medium text-white">
              <span className="text-[14px] font-bold text-white tracking-tight">{stats.views}</span>
              <span className="inline-flex items-center text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {stats.viewsGrowth}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white/[0.02]">
            <span className="text-white/60">Tỷ lệ nhấp (CTR):</span>
            <div className="flex items-center gap-1.5 font-medium text-white">
              <span className="text-[14px] font-bold text-white">{stats.ctr}</span>
              <span className="inline-flex items-center text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {stats.ctrGrowth}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white/[0.02]">
            <span className="text-white/60">Thời lượng xem trung bình:</span>
            <div className="flex items-center gap-1.5 font-medium text-white">
              <span className="text-[14px] font-bold text-white">{stats.avgDuration}</span>
              <span className="inline-flex items-center text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-white/[0.08]">
        <Link
          to="/watch/v1"
          className="inline-flex items-center justify-between w-full text-[#3ea6ff] hover:text-[#70beff] text-xs font-bold tracking-wider uppercase transition-colors group/btn"
        >
          <span>CHUYỂN ĐẾN SỐ LIỆU PHÂN TÍCH VIDEO</span>
          <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  )
}
