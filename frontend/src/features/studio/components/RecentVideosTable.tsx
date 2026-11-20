import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { StudioVideoRow } from '../types/studio.types'
import { EditVideoModal } from './EditVideoModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'

interface RecentVideosTableProps {
  videos: StudioVideoRow[]
  onVideoDeleted?: (id: string) => void
  onVideoUpdated?: (updated: StudioVideoRow) => void
}

export function RecentVideosTable({
  videos,
  onVideoDeleted,
  onVideoUpdated,
}: RecentVideosTableProps) {
  const [editingVideo, setEditingVideo] = useState<StudioVideoRow | null>(null)
  const [deletingVideo, setDeletingVideo] = useState<StudioVideoRow | null>(null)

  return (
    <div className="rounded-2xl bg-[#1c1b1d] border border-white/10 overflow-hidden shadow-xl transition-all">
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Video của kênh
            </h3>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Danh sách toàn bộ nội dung video thật từ cơ sở dữ liệu AWS DynamoDB
          </p>
        </div>
        <Link
          to="/upload"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#69d8d4] hover:bg-[#69d8d4]/10 border border-[#69d8d4]/20 hover:border-[#69d8d4]/40 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">upload_file</span>
          <span>TẢI THÊM VIDEO</span>
        </Link>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/[0.03] text-white/50 border-b border-white/10 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-3.5 px-5 font-semibold">Video</th>
              <th className="py-3.5 px-5 font-semibold">Chế độ hiển thị</th>
              <th className="py-3.5 px-5 font-semibold">Ngày tạo</th>
              <th className="py-3.5 px-5 font-semibold text-right">Lượt xem</th>
              <th className="py-3.5 px-5 font-semibold text-right">Bình luận</th>
              <th className="py-3.5 px-5 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-[#f1f1f1]">
            {videos.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 px-5 text-center text-white/40">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="material-symbols-outlined text-[32px] text-white/20">video_library</span>
                    <p className="text-sm font-medium text-white/70">Chưa có video nào trong danh sách</p>
                    <p className="text-xs text-white/40">Tải lên video đầu tiên để bắt đầu xây dựng kênh của bạn</p>
                  </div>
                </td>
              </tr>
            ) : (
              videos.map((video) => (
                <tr key={video.id} className="hover:bg-white/[0.04] transition-colors group">
                  <td className="py-3.5 px-5 flex items-center gap-3.5 min-w-[280px]">
                    <Link
                      to={`/watch/${video.id}`}
                      className="w-24 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 relative border border-white/10 group-hover:scale-105 transition-transform"
                    >
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#131315] text-white/20">
                          <span className="material-symbols-outlined text-[20px]">movie</span>
                        </div>
                      )}
                      {video.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/85 text-white/90 text-[10px] px-1 font-mono rounded font-semibold">
                          {video.duration}
                        </span>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/watch/${video.id}`}
                        className="font-semibold text-white group-hover:text-red-400 line-clamp-1 text-[13px] transition-colors"
                      >
                        {video.title}
                      </Link>
                      <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1 font-mono">ID: {video.id}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      video.visibility === 'Riêng tư'
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                        : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    }`}>
                      <span className="material-symbols-outlined text-[15px]">
                        {video.visibility === 'Riêng tư' ? 'lock' : 'public'}
                      </span>
                      <span>{video.visibility}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap text-white/50 font-mono">
                    {video.publishedDate}
                  </td>
                  <td className="py-3.5 px-5 text-right font-bold text-white font-mono text-[13px]">
                    {video.views}
                  </td>
                  <td className="py-3.5 px-5 text-right text-white/70 font-mono">{video.comments}</td>
                  <td className="py-3.5 px-5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingVideo(video)}
                        title="Chỉnh sửa thông tin video"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingVideo(video)}
                        title="Xóa vĩnh viễn video"
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-colors cursor-pointer active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Video Modal */}
      {editingVideo && (
        <EditVideoModal
          key={editingVideo.id}
          video={editingVideo}
          isOpen={Boolean(editingVideo)}
          onClose={() => setEditingVideo(null)}
          onSuccess={(updated) => {
            onVideoUpdated?.(updated)
            setEditingVideo(null)
          }}
        />
      )}

      {/* Hard Delete Video Confirm Modal */}
      {deletingVideo && (
        <DeleteConfirmModal
          key={deletingVideo.id}
          video={deletingVideo}
          isOpen={Boolean(deletingVideo)}
          onClose={() => setDeletingVideo(null)}
          onSuccess={(deletedId) => {
            onVideoDeleted?.(deletedId)
            setDeletingVideo(null)
          }}
        />
      )}

      <div className="px-5 sm:px-6 py-3.5 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-xs text-white/50">
        <div>Hiển thị {videos.length} video thật của kênh</div>
        <div className="text-[11px] font-mono text-white/40">
          Lọc theo GSI1_PK = UploaderID
        </div>
      </div>
    </div>
  )
}
