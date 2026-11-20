import { Link } from 'react-router-dom'
import type { LatestVideoStats } from '../types/studio.types'

interface LatestVideoPerformanceCardProps {
  stats: LatestVideoStats | null
}

export function LatestVideoPerformanceCard({ stats }: LatestVideoPerformanceCardProps) {
  if (!stats) {
    return (
      <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl p-6 flex flex-col justify-between shadow-xl transition-all">
        <div className="flex items-center gap-2 pb-3.5 border-b border-white/[0.08]">
          <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
          <h3 className="text-sm font-bold text-white tracking-tight">Hiệu suất video mới nhất</h3>
        </div>

        <div className="my-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
            <span className="material-symbols-outlined text-[28px]">video_call</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Bạn chưa có video nào</h4>
            <p className="text-xs text-white/50 max-w-xs mt-1 leading-relaxed">
              Hãy tải lên video đầu tiên để bắt đầu theo dõi lượt xem, tỷ lệ nhấp và tương tác của khán giả từ AWS DynamoDB.
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-full text-xs font-bold tracking-wider uppercase shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">upload</span>
            <span>TẢI VIDEO ĐẦU TIÊN</span>
          </Link>
        </div>

        <div className="pt-3 border-t border-white/[0.08] text-center">
          <span className="text-[11px] text-white/40 font-mono">Dữ liệu thời gian thực từ AWS DynamoDB</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all hover:border-white/20">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <h3 className="text-sm font-bold text-white tracking-tight">Hiệu suất video mới nhất</h3>
          </div>
          <span className="text-[11px] text-[#69d8d4] font-mono font-medium bg-[#69d8d4]/10 border border-[#69d8d4]/20 px-2 py-0.5 rounded-full">
            Thời gian thực
          </span>
        </div>

        {/* Video Preview */}
        <div className="block mt-4 group/thumb">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-lg">
            {stats.thumbnailUrl ? (
              <img
                alt="Latest video thumbnail"
                className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                src={stats.thumbnailUrl}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#131315] text-white/20">
                <span className="material-symbols-outlined text-[32px]">movie</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white font-mono text-[11px] px-2 py-0.5 rounded-md font-semibold border border-white/10">
              {stats.duration}
            </span>
            <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full shadow-md shadow-rose-600/40 border border-white/20">
              MỚI ĐĂNG
            </div>
          </div>
          <h4 className="text-sm font-bold text-white line-clamp-2 mt-3 leading-snug">
            {stats.title}
          </h4>
        </div>

        {/* Metrics List */}
        <div className="mt-4 space-y-2.5 pt-3.5 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-white/60">Xếp hạng theo lượt xem:</span>
            <span className="font-medium text-white flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 font-mono">
                {stats.rank}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-white/60">Số lượt xem:</span>
            <span className="font-bold text-white font-mono">{stats.views}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-white/60">Tỷ lệ nhấp (CTR):</span>
            <span className="font-bold text-[#69d8d4] font-mono">{stats.ctr}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-white/60">Thời lượng xem trung bình:</span>
            <span className="font-bold text-white font-mono">{stats.avgDuration}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/[0.08] mt-4 flex items-center justify-between">
        <Link
          to="/upload"
          className="text-rose-400 hover:text-rose-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>TẢI VIDEO MỚI</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  )
}
