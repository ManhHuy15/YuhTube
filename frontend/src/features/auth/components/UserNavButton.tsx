import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'

export function UserNavButton() {
  const { user, isAuthenticated, isLoading, openModal, openAvatarModal, logout } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isLoading) {
    return (
      <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        onClick={() => openModal('signin')}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-xs tracking-wide transition-all cursor-pointer shadow-sm active:scale-95"
      >
        <span className="material-symbols-outlined text-[17px] text-rose-400">account_circle</span>
        <span>Đăng nhập</span>
      </button>
    )
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/15 hover:ring-rose-500/50 transition-all cursor-pointer bg-gradient-to-tr from-rose-600 to-red-500 active:scale-95"
        title={user.name || user.email}
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#121217]/95 backdrop-blur-3xl border border-white/15 shadow-2xl py-2 z-50 text-white select-none animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-white/[0.08] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-base shadow-md bg-gradient-to-tr from-rose-600 to-red-500 flex-shrink-0 ring-1 ring-white/20">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs sm:text-sm truncate text-white">{user.name}</p>
              <p className="text-[11px] text-white/50 truncate font-mono">{user.email}</p>
            </div>
          </div>

          {/* Menu links */}
          <div className="py-1.5 px-1.5 space-y-0.5">
            <Link
              to="/studio"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-xl text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <span className="material-symbols-outlined text-[19px] text-rose-400">smart_display</span>
              <span>YuhTube Studio</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false)
                openAvatarModal()
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-xl text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-left"
            >
              <span className="material-symbols-outlined text-[19px] text-cyan-400">manage_accounts</span>
              <span>Tùy chỉnh kênh</span>
            </button>
          </div>

          {/* Logout button */}
          <div className="pt-1.5 px-1.5 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={async () => {
                setIsDropdownOpen(false)
                await logout()
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
            >
              <span className="material-symbols-outlined text-[19px]">logout</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
