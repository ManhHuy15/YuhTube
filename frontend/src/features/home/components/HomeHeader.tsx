import { Link } from 'react-router-dom'
import { UserNavButton } from '../../auth/components/UserNavButton'

interface HomeHeaderProps {
  onToggleSidebar: () => void
}

export function HomeHeader({ onToggleSidebar }: HomeHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0b0b0e]/80 backdrop-blur-2xl border-b border-white/[0.08] z-50 flex items-center justify-between px-4 sm:px-6 select-none transition-all duration-300">
      {/* Left: Menu & Brand */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
          title="Thanh điều hướng"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <Link to="/" className="flex items-center gap-2.5 group py-1" title="Trang chủ YuhTube">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-600/25 group-hover:scale-105 group-hover:shadow-rose-600/40 transition-all duration-300">
            <span className="material-symbols-outlined text-[17px] text-white">play_arrow</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-lg tracking-tight text-white">
              Yuh<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-400">Tube</span>
            </span>
            <span className="text-[10px] text-rose-300/80 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 rounded-full font-mono font-medium tracking-wide">
              PRO
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Search Bar (Arc-style Frosted Pill) */}
      <div className="flex items-center justify-center flex-1 max-w-2xl px-4 sm:px-8">
        <div className="flex items-center w-full max-w-lg h-10 rounded-full border border-white/[0.12] bg-white/[0.04] backdrop-blur-2xl px-3.5 focus-within:bg-white/[0.08] focus-within:border-white/25 focus-within:ring-2 focus-within:ring-white/10 transition-all duration-300 shadow-inner group">
          <span className="material-symbols-outlined text-[18px] text-white/40 mr-2.5 group-focus-within:text-white/80 transition-colors">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm video, nội dung 4K..."
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none tracking-tight"
          />
        </div>
      </div>

      {/* Right: Upload Pill & User Nav */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Link
          to="/upload"
          className="flex items-center gap-1.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] backdrop-blur-xl text-white px-3.5 py-2 rounded-full font-medium text-xs tracking-wide transition-all duration-200 active:scale-95 shadow-sm"
          title="Tải video mới"
        >
          <span className="material-symbols-outlined text-[17px] text-rose-400">add_circle</span>
          <span className="hidden sm:inline">Tải lên</span>
        </Link>

        <UserNavButton />
      </div>
    </header>
  )
}
