import type { ChannelAnalytics } from '../types/studio.types'

interface ChannelAnalyticsCardProps {
  analytics: ChannelAnalytics
}

export function ChannelAnalyticsCard({ analytics }: ChannelAnalyticsCardProps) {
  return (
    <div className="relative group rounded-2xl bg-[#1e1e24]/70 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all hover:shadow-2xl hover:shadow-blue-500/5">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#3ea6ff] shadow-sm shadow-blue-500"></div>
            <h3 className="text-[15px] font-bold text-white tracking-tight">Số liệu phân tích về kênh</h3>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 font-medium">
            28 ngày qua
          </span>
        </div>

        {/* Subscribers Section */}
        <div className="py-4 border-b border-white/[0.08]">
          <p className="text-xs text-white/50 font-medium">Số người đăng ký hiện tại</p>
          <div className="flex items-baseline gap-3 mt-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight">
              {analytics.subscribers}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span>{analytics.subscribersGrowth}</span>
            </div>
          </div>

          {/* Sparkline SVG */}
          <div className="mt-3 h-8 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 280 32">
              <defs>
                <linearGradient id="gradSub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ba640" stopOpacity="0.3"></stop>
                  <stop offset="100%" stopColor="#2ba640" stopOpacity="0.0"></stop>
                </linearGradient>
              </defs>
              <path
                d="M0,26 Q40,24 70,18 T140,15 T210,8 T280,3 L280,32 L0,32 Z"
                fill="url(#gradSub)"
              ></path>
              <path
                d="M0,26 Q40,24 70,18 T140,15 T210,8 T280,3"
                fill="none"
                stroke="#2ba640"
                strokeLinecap="round"
                strokeWidth="2.5"
              ></path>
            </svg>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="py-3.5 border-b border-white/[0.08] space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Tóm tắt hiệu suất 28 ngày
          </p>
          <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/[0.02]">
            <span className="text-white/60">Lượt xem:</span>
            <div className="flex items-center gap-1.5 font-medium text-white">
              <span className="font-bold text-sm text-white">{analytics.views28Days}</span>
              <span className="material-symbols-outlined text-emerald-400 text-[14px]">
                arrow_upward
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/[0.02]">
            <span className="text-white/60">Thời gian xem (giờ):</span>
            <div className="flex items-center gap-1.5 font-medium text-white">
              <span className="font-bold text-sm text-white">{analytics.watchTimeHours}</span>
              <span className="material-symbols-outlined text-emerald-400 text-[14px]">
                arrow_upward
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/10">
            <span className="text-emerald-400 font-medium">Doanh thu ước tính:</span>
            <div className="flex items-center gap-1.5 font-medium text-white">
              <span className="font-bold text-sm text-emerald-400">{analytics.estimatedRevenue}</span>
              <span className="material-symbols-outlined text-emerald-400 text-[14px]">
                arrow_upward
              </span>
            </div>
          </div>
        </div>

        {/* Top Videos in 48h */}
        <div className="pt-3">
          <p className="text-[11px] font-bold text-white/40 mb-2 uppercase tracking-wider">
            Video hàng đầu (48 giờ)
          </p>
          <div className="space-y-1.5">
            {analytics.topVideos48h.map((v, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs hover:bg-white/[0.06] p-2 rounded-lg transition-colors cursor-pointer group/row"
              >
                <span className="truncate max-w-[200px] text-white/90 group-hover/row:text-white font-medium">
                  {v.title}
                </span>
                <span className="font-mono font-bold text-white/60 group-hover/row:text-white">
                  {v.views}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-white/[0.08]">
        <a
          href="#"
          className="inline-flex items-center justify-between w-full text-[#3ea6ff] hover:text-[#70beff] text-xs font-bold tracking-wider uppercase transition-colors group/btn"
        >
          <span>CHUYỂN ĐẾN SỐ LIỆU PHÂN TÍCH KÊNH</span>
          <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </a>
      </div>
    </div>
  )
}
