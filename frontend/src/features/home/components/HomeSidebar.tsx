import { Link } from 'react-router-dom'

export function HomeSidebar() {
  return (
    <aside className="w-60 bg-[#0f0f0f] border-r border-white/10 flex flex-col justify-between flex-shrink-0 select-none overflow-y-auto fixed top-14 bottom-0 left-0 z-40 hidden md:flex p-3 space-y-4">
      <div className="space-y-1">
        <Link
          to="/"
          className="flex items-center gap-4 px-3.5 py-2.5 rounded-xl bg-white/10 font-semibold text-white text-sm"
        >
          <span className="material-symbols-outlined text-[22px] text-red-500">home</span>
          <span>Trang chủ</span>
        </Link>
        <a
          href="#"
          className="flex items-center gap-4 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">bolt</span>
          <span>Shorts</span>
        </a>
        <a
          href="#"
          className="flex items-center gap-4 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">subscriptions</span>
          <span>Kênh đăng ký</span>
        </a>
      </div>

      <div className="pt-3 border-t border-white/10 space-y-1">
        <span className="px-3.5 text-xs font-bold text-white/40 uppercase tracking-wider">Bạn</span>
        <a
          href="#"
          className="flex items-center gap-4 px-3.5 py-2 rounded-xl hover:bg-white/5 text-white/70 hover:text-white text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">history</span>
          <span>Video đã xem</span>
        </a>
        <a
          href="#"
          className="flex items-center gap-4 px-3.5 py-2 rounded-xl hover:bg-white/5 text-white/70 hover:text-white text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">playlist_play</span>
          <span>Danh sách phát</span>
        </a>
        <Link
          to="/studio"
          className="flex items-center gap-4 px-3.5 py-2 rounded-xl hover:bg-white/5 text-white/70 hover:text-white text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[22px] text-red-400">dashboard</span>
          <span>Kênh Studio</span>
        </Link>
      </div>

      <div className="pt-3 border-t border-white/10 text-xs text-white/30 px-3.5 leading-relaxed">
        <p>© 2026 YuhTube Platform</p>
        <p className="text-[11px] text-white/20">AWS Serverless HLS</p>
      </div>
    </aside>
  )
}
