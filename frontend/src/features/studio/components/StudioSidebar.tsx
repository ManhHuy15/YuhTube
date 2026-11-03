import { Link } from 'react-router-dom'
import { useAuthStore } from '../../auth/hooks/useAuthStore'

export function StudioSidebar() {
  const { user, openAvatarModal } = useAuthStore()
  const channelName = user?.name || user?.email?.split('@')[0] || 'Studio Master'
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(channelName)}`
  const avatarUrl = user?.avatar || defaultAvatar

  return (
    <aside className="w-64 bg-[#141416]/70 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between flex-shrink-0 select-none overflow-y-auto hidden lg:flex fixed top-14 bottom-0 left-0">
      <div>
        <div className="px-5 py-6 flex flex-col items-center text-center border-b border-white/[0.08]">
          <button
            type="button"
            onClick={openAvatarModal}
            className="relative mb-3 group cursor-pointer"
            title="Click to customize avatar"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full blur opacity-40 group-hover:opacity-75 transition-opacity"></div>
            <img
              alt="Channel Logo"
              className="relative w-20 h-20 rounded-full object-cover ring-2 ring-white/20 shadow-xl bg-[#222]"
              src={avatarUrl}
            />
            <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-red-600 border-2 border-[#141416] text-white flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[13px]">photo_camera</span>
            </span>
          </button>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 mb-1">
            Studio Creator
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <h2 className="text-[14px] font-semibold text-white tracking-tight truncate max-w-[150px]">
              {channelName}
            </h2>
            <button
              type="button"
              onClick={openAvatarModal}
              title="Đổi tên kênh và ảnh đại diện"
              className="p-1 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
            </button>
          </div>
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
          <button
            type="button"
            onClick={openAvatarModal}
            className="w-full flex items-center gap-4 px-4 py-2.5 text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            <span>Tùy chỉnh kênh</span>
          </button>
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
