export function RecentCommentsCard() {
  return (
    <div className="space-y-6 flex flex-col justify-between">
      {/* Latest Comments */}
      <div className="rounded-2xl bg-[#1e1e24]/70 backdrop-blur-xl border border-white/[0.08] p-5 shadow-xl transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400"></div>
            <h3 className="text-[15px] font-bold text-white tracking-tight">Bình luận mới nhất</h3>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-medium">
            Chưa trả lời
          </span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {/* Comment 1 */}
          <div className="py-3 group">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                T
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white truncate">Trần Hoàng Long</span>
                  <span className="text-[11px] text-white/40 font-mono">12m trước</span>
                </div>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  Phần pipeline xử lý chunking 5MB chạy mượt thật sự anh ơi! Giải pháp AV1 SVT tiết kiệm được bao nhiêu chi phí S3 vậy ạ?
                </p>
                <div className="flex items-center gap-3 mt-2 text-white/50 text-[11px]">
                  <button className="hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">favorite</span> Thả tim
                  </button>
                  <button className="hover:text-[#3ea6ff] transition-colors flex items-center gap-1 cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">reply</span> Trả lời
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comment 2 */}
          <div className="py-3 group">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                V
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white truncate">Vũ Nguyễn Dev</span>
                  <span className="text-[11px] text-white/40 font-mono">1h trước</span>
                </div>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  Chất lượng hình ảnh 4K HDR trên màn OLED xem sướng mắt kinh khủng!
                </p>
                <div className="flex items-center gap-3 mt-2 text-white/50 text-[11px]">
                  <button className="hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">favorite</span> Thả tim
                  </button>
                  <button className="hover:text-[#3ea6ff] transition-colors flex items-center gap-1 cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">reply</span> Trả lời
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.08]">
          <a
            href="#"
            className="text-[#3ea6ff] hover:text-[#70beff] text-xs font-bold uppercase tracking-wider flex items-center gap-1"
          >
            <span>XEM TẤT CẢ BÌNH LUẬN (184)</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </a>
        </div>
      </div>

      {/* Creator News */}
      <div className="rounded-2xl bg-gradient-to-b from-[#241c22]/90 to-[#1e1e24]/70 backdrop-blur-xl border border-white/[0.08] p-5 shadow-xl transition-all">
        <div className="flex items-center gap-2 text-red-400 mb-2.5">
          <span className="material-symbols-outlined text-[18px]">campaign</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-300">
            Tin tức &amp; Ý tưởng cho nhà sáng tạo
          </span>
        </div>
        <h4 className="text-[14px] font-bold text-white leading-snug">
          Bảo vệ kênh của bạn với xác thực 2 bước nâng cao và khóa bảo mật FIDO2
        </h4>
        <p className="text-xs text-white/60 mt-2 leading-relaxed">
          Tìm hiểu các tiêu chuẩn bảo vệ tài nguyên video và phân quyền tài khoản quản trị Studio mới được YuhTube cập nhật.
        </p>
        <div className="mt-3.5">
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/15 transition-all"
          >
            <span>TÌM HIỂU THÊM</span>
            <span className="material-symbols-outlined text-[14px]">launch</span>
          </a>
        </div>
      </div>
    </div>
  )
}
