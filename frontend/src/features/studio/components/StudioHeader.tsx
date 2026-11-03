import { Link } from 'react-router-dom'
import { UserNavButton } from '../../auth/components/UserNavButton'

interface StudioHeaderProps {
  onOpenUpload?: () => void
}

export function StudioHeader({ onOpenUpload }: StudioHeaderProps) {
  return (
    <header className="h-14 bg-[#141416]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 sm:px-6 fixed top-0 left-0 right-0 z-50 select-none shadow-lg shadow-black/40">
      <div className="flex items-center gap-4">
        <button
          aria-label="Menu"
          className="p-2 rounded-xl hover:bg-white/10 transition-all text-[#f1f1f1] flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <Link to="/" className="flex items-center gap-2 group" title="Về trang chủ">
          <div className="w-8 h-6 bg-gradient-to-tr from-red-600 to-rose-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[16px] text-white">play_arrow</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold tracking-tight text-white text-[17px]">Studio</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-white/10 text-white/80 rounded font-semibold uppercase tracking-widest border border-white/10">
              VN
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 max-w-xl mx-6 hidden md:block">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[19px] text-white/40">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm trên kênh của bạn"
            className="w-full bg-white/[0.04] border border-white/10 focus:border-red-500 rounded-xl py-1.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          title="Trợ giúp"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </button>

        <Link
          to="/upload"
          onClick={() => onOpenUpload?.()}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-4 py-1.5 rounded-full font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-red-600/30 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">video_call</span>
          <span>TẠO</span>
        </Link>

        <UserNavButton />
      </div>
    </header>
  )
}
