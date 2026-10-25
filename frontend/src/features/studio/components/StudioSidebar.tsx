import { Link } from 'react-router-dom'

export function StudioSidebar() {
  return (
    <aside className="w-64 bg-[#141416]/70 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between flex-shrink-0 select-none overflow-y-auto hidden lg:flex fixed top-14 bottom-0 left-0">
      <div>
        <div className="px-5 py-6 flex flex-col items-center text-center border-b border-white/[0.08]">
          <div className="relative mb-3 group cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full blur opacity-40 group-hover:opacity-75 transition-opacity"></div>
            <img
              alt="Channel Logo"
              className="relative w-20 h-20 rounded-full object-cover ring-2 ring-white/20 shadow-xl"
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80"
            />
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 mb-1">
            Studio Master
          </span>
          <h2 className="text-[14px] font-semibold text-white tracking-tight">AWS Cloud Arch VN</h2>
        </div>

        <nav className="py-3 px-3 space-y-1">
          <Link
            to="/studio"
            className="flex items-center gap-4 px-4 py-2.5 text-[14px] font-medium rounded-xl bg-gradient-to-r from-red-500/20 to-red-500/5 text-white border border-red-500/30 shadow-sm relative"
          >
            <span className="material-symbols-outlined text-[20px] text-red-400">dashboard</span>
            <span className="font-semibold">Trang tổng quan</span>
            <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-red-400"></span>
          </Link>
          <a
            href="#"
            className="flex items-center gap-4 px-4 py-2.5 text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">video_library</span>
            <span>Nội dung</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-4 px-4 py-2.5 text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span>Số liệu phân tích</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-4 px-4 py-2.5 text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">comment</span>
            <span>Bình luận</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-4 px-4 py-2.5 text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">monetization_on</span>
            <span>Kiếm tiền</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-4 px-4 py-2.5 text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            <span>Tùy chỉnh</span>
          </a>
        </nav>
      </div>

      <div className="p-3 border-t border-white/[0.08] space-y-1">
        <Link
          to="/"
          className="flex items-center gap-4 px-4 py-2 text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">smart_display</span>
          <span>Xem kênh trên YuhTube</span>
        </Link>
        <a
          href="#"
          className="flex items-center gap-4 px-4 py-2 text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>Cài đặt</span>
        </a>
      </div>
    </aside>
  )
}
