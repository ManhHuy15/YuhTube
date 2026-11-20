import { Link, useLocation } from 'react-router-dom'

export function HomeSidebar() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <aside className="w-60 bg-[#0b0b0e]/80 backdrop-blur-2xl border-r border-white/[0.06] flex flex-col justify-between flex-shrink-0 select-none overflow-y-auto fixed top-16 bottom-0 left-0 z-40 hidden md:flex p-3.5 space-y-4 transition-all duration-300">
      <div className="space-y-1.5">
        <Link
          to="/"
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
            isHome
              ? 'bg-white/[0.1] text-white border border-white/[0.08] shadow-sm'
              : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${isHome ? 'text-rose-500' : 'text-white/50'}`}>
            home
          </span>
          <span>Khám phá</span>
        </Link>

        <a
          href="#"
          className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-all duration-200 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px] text-white/50">bolt</span>
          <span>Shorts</span>
        </a>

        <a
          href="#"
          className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-all duration-200 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px] text-white/50">subscriptions</span>
          <span>Kênh theo dõi</span>
        </a>
      </div>

      <div className="pt-3.5 border-t border-white/[0.06] space-y-1.5">
        <span className="px-3.5 text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">
          Thư viện
        </span>

        <a
          href="#"
          className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-all duration-200 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px] text-white/50">history</span>
          <span>Đã xem</span>
        </a>

        <Link
          to="/studio"
          className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-all duration-200 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px] text-rose-400">dashboard</span>
          <span>Studio sáng tạo</span>
        </Link>
      </div>

      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-bold">
          <span className="material-symbols-outlined text-[16px]">hd</span>
          <span>Apple TV+ Quality</span>
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed font-mono">
          H.264 Multi-Bitrate QVBR
        </p>
      </div>
    </aside>
  )
}
