import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserNavButton } from '../../auth/components/UserNavButton'

interface FloatingNavbarProps {
  onSearch?: (query: string) => void
}

export function FloatingNavbar({ onSearch }: FloatingNavbarProps) {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const isHome = location.pathname === '/'
  const isStudio = location.pathname.startsWith('/studio')

  return (
    <header className="fixed top-4 left-3 right-3 sm:left-6 sm:right-6 md:left-8 md:right-8 z-50 max-w-7xl mx-auto h-16 rounded-full bg-[#121217]/85 backdrop-blur-3xl border border-white/[0.12] px-3 sm:px-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center justify-between transition-all duration-300">
      {/* Left: Brand Logo & Navigation Links */}
      <div className="flex items-center gap-3 sm:gap-6">
        <Link to="/" className="flex items-center gap-2.5 group py-1 select-none" title="Trang chủ YuhTube">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 group-hover:shadow-rose-600/50 transition-all duration-300">
            <span className="material-symbols-outlined text-[19px] text-white">play_arrow</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
              Yuh<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-400">Tube</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] text-rose-300/90 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-mono font-medium tracking-wider">
              STUDIO
            </span>
          </div>
        </Link>

        {/* Desktop Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              isHome
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Khám phá
          </Link>
          <Link
            to="/studio"
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              isStudio
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Kênh của tôi
          </Link>
        </nav>
      </div>

      {/* Center: Arc-style Frosted Search Island */}
      <form
        onSubmit={handleSearchSubmit}
        className={`flex items-center transition-all duration-300 ${
          isSearchExpanded ? 'w-48 sm:w-72 md:w-80' : 'w-36 sm:w-56 md:w-64'
        }`}
      >
        <div className="flex items-center w-full h-9 sm:h-10 rounded-full border border-white/[0.12] bg-white/[0.04] backdrop-blur-2xl px-3 focus-within:bg-white/[0.09] focus-within:border-white/30 focus-within:ring-2 focus-within:ring-white/10 transition-all duration-300 shadow-inner group">
          <span className="material-symbols-outlined text-[17px] text-white/40 mr-2 group-focus-within:text-white/80 transition-colors">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm video..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              onSearch?.(e.target.value)
            }}
            onFocus={() => setIsSearchExpanded(true)}
            onBlur={() => setIsSearchExpanded(false)}
            className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none tracking-tight"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                onSearch?.('')
              }}
              className="text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          )}
        </div>
      </form>

      {/* Right: Upload Button & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/upload"
          className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-lg shadow-rose-600/30 active:scale-95 cursor-pointer"
          title="Tải video lên"
        >
          <span className="material-symbols-outlined text-[17px]">upload</span>
          <span className="hidden sm:inline">Tải lên</span>
        </Link>

        <UserNavButton />
      </div>
    </header>
  )
}
