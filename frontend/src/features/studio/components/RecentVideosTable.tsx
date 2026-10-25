import { Link } from 'react-router-dom'
import type { StudioVideoRow } from '../types/studio.types'

interface RecentVideosTableProps {
  videos: StudioVideoRow[]
}

export function RecentVideosTable({ videos }: RecentVideosTableProps) {
  return (
    <div className="rounded-2xl bg-[#1e1e24]/70 backdrop-blur-xl border border-white/[0.08] overflow-hidden shadow-xl transition-all">
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <h3 className="text-[16px] font-bold text-white tracking-tight">
              Video đã xuất bản gần đây
            </h3>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Danh sách các nội dung phát hành gần nhất trên kênh và chỉ số tương tác
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#3ea6ff] hover:bg-[#3ea6ff]/10 border border-[#3ea6ff]/20 hover:border-[#3ea6ff]/40 transition-all flex items-center gap-1"
          >
            <span>XEM NỘI DUNG ĐẦY ĐỦ</span>
            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
          </a>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/[0.03] text-white/50 border-b border-white/[0.08] uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-3.5 px-5 font-semibold">Video</th>
              <th className="py-3.5 px-5 font-semibold">Chế độ hiển thị</th>
              <th className="py-3.5 px-5 font-semibold">Giới hạn</th>
              <th className="py-3.5 px-5 font-semibold">Ngày đăng</th>
              <th className="py-3.5 px-5 font-semibold text-right">Lượt xem</th>
              <th className="py-3.5 px-5 font-semibold text-right">Bình luận</th>
              <th className="py-3.5 px-5 font-semibold text-right">Tỷ lệ thích</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-[#f1f1f1]">
            {videos.map((video) => (
              <tr key={video.id} className="hover:bg-white/[0.04] transition-colors group cursor-pointer">
                <td className="py-3.5 px-5 flex items-center gap-3.5 min-w-[300px]">
                  <Link
                    to={`/watch/${video.id}`}
                    className="w-24 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 relative border border-white/10 group-hover:scale-105 transition-transform"
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/85 text-white/90 text-[10px] px-1 font-mono rounded font-semibold">
                      {video.duration}
                    </span>
                  </Link>
                  <div>
                    <Link
                      to={`/watch/${video.id}`}
                      className="font-semibold text-white group-hover:text-[#3ea6ff] line-clamp-1 text-[13px] transition-colors"
                    >
                      {video.title}
                    </Link>
                    <p className="text-[11px] text-white/40 mt-0.5">{video.subtitle}</p>
                  </div>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    <span className="material-symbols-outlined text-[15px]">public</span>
                    <span>{video.visibility}</span>
                  </span>
                </td>
                <td className="py-3.5 px-5 whitespace-nowrap text-white/50">{video.restrictions}</td>
                <td className="py-3.5 px-5 whitespace-nowrap text-white/50 font-mono">
                  {video.publishedDate}
                </td>
                <td className="py-3.5 px-5 text-right font-bold text-white font-mono text-[13px]">
                  {video.views}
                </td>
                <td className="py-3.5 px-5 text-right text-white/70 font-mono">{video.comments}</td>
                <td className="py-3.5 px-5 text-right font-bold text-emerald-400 font-mono">
                  {video.likePercentage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 sm:px-6 py-3.5 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between text-xs text-white/50">
        <div>Hiển thị 1–{videos.length} trong tổng số 48 video</div>
        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 transition-all cursor-pointer" disabled>
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <span className="font-mono font-medium text-white/70">Trang 1 / 12</span>
          <button className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}
