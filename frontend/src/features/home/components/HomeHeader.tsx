import { Link } from 'react-router-dom'

interface HomeHeaderProps {
  onToggleSidebar: () => void
}

export function HomeHeader({ onToggleSidebar }: HomeHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-4 select-none">
      {/* Left: Menu & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer text-white"
          title="Thanh điều hướng"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <Link to="/" className="flex items-center gap-2 group py-1" title="Trang chủ YuhTube">
          <div className="w-8 h-6 bg-gradient-to-tr from-red-600 to-rose-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[16px] text-white">play_arrow</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-lg tracking-tight text-white">
              Yuh<span className="text-red-500">Tube</span>
            </span>
            <span className="text-[9px] text-red-300 bg-red-500/20 px-1 py-0.2 rounded font-semibold uppercase tracking-wider">
              VN
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Search Bar & Mic */}
      <div className="flex items-center justify-center flex-1 max-w-2xl px-4">
        <div className="flex items-center w-full max-w-xl group">
          <div className="flex items-center flex-1 h-10 rounded-l-full border border-white/15 bg-[#121212] pl-4 pr-3 overflow-hidden focus-within:border-red-500 transition-all">
            <span className="material-symbols-outlined text-[18px] text-white/40 mr-2">search</span>
            <input
              type="text"
              placeholder="Tìm kiếm video, công nghệ, kênh..."
              className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
            />
          </div>
          <button className="w-16 h-10 rounded-r-full border border-l-0 border-white/15 bg-white/10 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
        </div>
        <button className="w-10 h-10 ml-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer hidden sm:flex">
          <span className="material-symbols-outlined text-[20px]">mic</span>
        </button>
      </div>

      {/* Right: Studio & Profile */}
      <div className="flex items-center gap-3">
        <Link
          to="/upload"
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-4 py-1.5 rounded-full font-semibold text-xs tracking-wide transition-all shadow-md shadow-red-600/30 active:scale-95"
          title="Tạo video mới trên YuhTube Studio"
        >
          <span className="material-symbols-outlined text-[18px]">video_call</span>
          <span className="hidden sm:inline">TẠO</span>
        </Link>

        <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer hidden sm:flex">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
            9+
          </span>
        </button>

        <Link
          to="/studio"
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/10"
        >
          Y
        </Link>
      </div>
    </header>
  )
}
