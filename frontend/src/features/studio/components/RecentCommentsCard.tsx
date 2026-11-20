export function RecentCommentsCard() {
  return (
    <div className="space-y-6 flex flex-col justify-between">
      {/* Latest Comments Card */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <h3 className="text-sm font-bold text-white tracking-tight">Bình luận mới nhất</h3>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10 font-medium">
            Hộp thư
          </span>
        </div>

        {/* Empty state for comments */}
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
            <span className="material-symbols-outlined text-[22px]">forum</span>
          </div>
          <p className="text-xs font-bold text-white/80">Chưa có bình luận mới cần xử lý</p>
          <p className="text-[11px] text-white/50 max-w-xs leading-relaxed">
            Khi người xem bình luận về video của bạn, các tương tác mới nhất sẽ xuất hiện tại đây để bạn phản hồi nhanh chóng.
          </p>
        </div>

        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
          <span className="text-white/40 text-[11px] font-mono">Đồng bộ từ AWS Social API</span>
        </div>
      </div>

      {/* Creator Tips & News Card */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
          <span className="material-symbols-outlined text-[17px]">tips_and_updates</span>
          <span>Mẹo phát triển kênh YuhTube</span>
        </div>
        <h4 className="text-xs font-bold text-white leading-snug">
          Tối ưu hóa độ phân giải 4K QVBR &amp; Tỷ lệ nhấp hình thu nhỏ
        </h4>
        <p className="text-[11px] text-white/60 leading-relaxed">
          Tải lên ảnh bìa tùy chỉnh tỷ lệ 16:9 với độ tương phản cao giúp tăng CTR trung bình lên hơn 12% trên nguồn cấp dữ liệu trang chủ.
        </p>
      </div>
    </div>
  )
}
