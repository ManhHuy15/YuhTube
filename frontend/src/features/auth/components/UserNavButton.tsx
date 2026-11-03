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
      <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        onClick={() => openModal('signin')}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 hover:bg-white/10 text-white font-semibold text-xs tracking-wide transition-all cursor-pointer shadow-sm active:scale-95"
      >
        <span className="material-symbols-outlined text-[18px] text-red-500">account_circle</span>
        <span>Sign in</span>
      </button>
    )
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/10 hover:ring-red-500/50 transition-all cursor-pointer bg-gradient-to-tr from-red-600 to-rose-500"
        title={user.name || user.email}
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#212121] border border-white/10 shadow-2xl py-2 z-50 text-white select-none">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-base shadow-sm bg-gradient-to-tr from-red-600 to-rose-500 flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
            </div>
          </div>

          {/* Menu links */}
          <div className="py-1">
            <Link
              to="/studio"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">smart_display</span>
              <span>YuhTube Studio</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false)
                openAvatarModal()
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-left"
            >
              <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
              <span>Tùy chỉnh kênh</span>
            </button>
          </div>

          {/* Logout button */}
          <div className="pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={async () => {
                setIsDropdownOpen(false)
                await logout()
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors cursor-pointer text-left"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
