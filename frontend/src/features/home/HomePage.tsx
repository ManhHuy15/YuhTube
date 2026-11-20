import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HomeHeader } from './components/HomeHeader'
import { HomeSidebar } from './components/HomeSidebar'
import { CategoryChips } from './components/CategoryChips'
import { VideoCard } from './components/VideoCard'
import { VideoCardSkeleton } from './components/VideoCardSkeleton'
import { useHomeFeed } from './hooks/useHomeFeed'

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { videos, isLoading } = useHomeFeed(selectedCategory)

  return (
    <div className="min-h-screen bg-[#0e0e10] text-[#f4f4f6] flex flex-col selection:bg-red-600/30">
      <HomeHeader onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1 pt-14">
        {isSidebarOpen && <HomeSidebar />}

        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all ${isSidebarOpen ? 'md:ml-60' : ''}`}>
          <div className="max-w-[1760px] mx-auto space-y-6">
            <CategoryChips
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <VideoCardSkeleton key={i} />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/30">
                  <span className="material-symbols-outlined text-3xl">smart_display</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 tracking-tight">Chưa có video nào trên trang chủ</h3>
                <p className="text-xs text-white/50 max-w-sm mb-6 leading-relaxed">
                  Hiện chưa có video công khai nào trong danh mục này. Hãy trở thành người đầu tiên tải lên nội dung!
                </p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  <span>TẢI VIDEO LÊN NGAY</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
