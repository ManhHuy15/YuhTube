import type { ChannelAnalytics } from '../types/studio.types'

interface ChannelAnalyticsCardProps {
  analytics: ChannelAnalytics
}

export function ChannelAnalyticsCard({ analytics }: ChannelAnalyticsCardProps) {
  return (
    <div className="relative group rounded-2xl bg-[#1c1b1d] border border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all hover:border-white/20">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#69d8d4] shadow-sm shadow-[#69d8d4]/50" />
            <h3 className="text-sm font-bold text-white tracking-tight">Số liệu phân tích về kênh</h3>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 font-medium">
            28 ngày qua
          </span>
        </div>

        {/* Subscribers Section */}
        <div className="py-4 border-b border-white/10">
          <p className="text-xs text-white/50 font-medium">Số người đăng ký hiện tại</p>
          <div className="flex items-baseline gap-3 mt-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
              {analytics.subscribers}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
              <span>{analytics.subscribersGrowth}</span>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="py-3.5 border-b border-white/10 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Tổng quan hiệu suất
          </p>
          <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-white/[0.03]">
            <span className="text-white/60">Tổng lượt xem:</span>
            <span className="font-bold text-white font-mono">{analytics.views28Days}</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-white/[0.03]">
            <span className="text-white/60">Thời gian xem ước tính:</span>
            <span className="font-bold text-[#69d8d4] font-mono">{analytics.watchTimeHours}</span>
          </div>
        </div>

        {/* Top Videos in 48h */}
        <div className="pt-3.5">
          <p className="text-[11px] font-bold text-white/40 mb-2 uppercase tracking-wider">
            Video hàng đầu của kênh
          </p>
          {analytics.topVideos48h.length === 0 ? (
            <p className="text-xs text-white/40 py-2 italic">Chưa có đủ lượt xem trong 48 giờ qua</p>
          ) : (
            <div className="space-y-1.5">
              {analytics.topVideos48h.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs hover:bg-white/[0.06] p-2 rounded-lg transition-colors cursor-pointer group/row"
                >
                  <span className="truncate max-w-[200px] text-white/90 group-hover/row:text-white font-medium">
                    {v.title}
                  </span>
                  <span className="font-mono font-bold text-[#69d8d4]">
                    {v.views}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-white/10">
        <span className="text-xs text-white/40 font-mono">Dữ liệu tổng hợp từ AWS DynamoDB</span>
      </div>
    </div>
  )
}
