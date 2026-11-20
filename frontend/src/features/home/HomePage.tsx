import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FloatingNavbar } from './components/FloatingNavbar'
import { HeroBillboard } from './components/HeroBillboard'
import { CategoryChips } from './components/CategoryChips'
import { VideoCard } from './components/VideoCard'
import { VideoCardSkeleton } from './components/VideoCardSkeleton'
import { useHomeFeed } from './hooks/useHomeFeed'

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [searchQuery, setSearchQuery] = useState('')
  const { allVideos, videos, categories, isLoading } = useHomeFeed(selectedCategory)

  // Featured video for Hero Billboard (top platform video)
  const featuredVideo = allVideos.length > 0 ? allVideos[0] : null

  // Filter by live search query if present
  const gridVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos
    const query = searchQuery.trim().toLowerCase()
    return videos.filter((v) => (v.title || '').toLowerCase().includes(query))
  }, [videos, searchQuery])

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-[#f4f4f6] flex flex-col selection:bg-rose-600/30">
      {/* Floating Island Navigation */}
      <FloatingNavbar onSearch={setSearchQuery} />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 sm:pt-28 pb-20 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Top Hero Billboard */}
          {isLoading ? (
            <div className="w-full h-80 sm:h-[420px] rounded-[32px] bg-white/[0.03] animate-pulse border border-white/[0.06] flex items-center justify-center">
              <span className="text-xs text-white/30 font-mono">Đang tải tiêu điểm thịnh hành...</span>
            </div>
          ) : (
            <HeroBillboard featuredVideo={featuredVideo} />
          )}

          {/* Category Chips Bar (Dynamically derived from real video content) */}
          <div className="pt-2">
            <CategoryChips
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat)
                setSearchQuery('')
              }}
            />
          </div>

          {/* Videos Grid Section */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {searchQuery.trim()
                    ? `Kết quả tìm kiếm cho "${searchQuery}"`
                    : selectedCategory === 'Tất cả'
                    ? 'Video đề xuất'
                    : selectedCategory === 'Mới nhất'
                    ? 'Video mới nhất'
                    : selectedCategory === 'Phổ biến'
                    ? 'Xem nhiều nhất'
                    : `Danh mục: ${selectedCategory}`}
                </h2>
                {!isLoading && (
                  <span className="text-[11px] font-mono text-white/40 bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-full font-semibold">
                    {gridVideos.length} video
                  </span>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <VideoCardSkeleton key={i} />
                ))}
              </div>
            ) : gridVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/30">
                  <span className="material-symbols-outlined text-3xl">filter_alt_off</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1 tracking-tight">
                  {searchQuery.trim()
                    ? `Không tìm thấy video nào cho từ khóa "${searchQuery}"`
                    : `Chưa có video nào trong danh mục "${selectedCategory}"`}
                </h3>
                <p className="text-xs text-white/50 max-w-sm mb-6 leading-relaxed">
                  {searchQuery.trim()
                    ? 'Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh sách.'
                    : 'Các video công khai hiện có không chứa nội dung khớp với danh mục này.'}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('Tất cả')
                      setSearchQuery('')
                    }}
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    Xem tất cả video
                  </button>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-full text-xs font-bold tracking-wider uppercase shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                    <span>Tải video lên</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
                {gridVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
