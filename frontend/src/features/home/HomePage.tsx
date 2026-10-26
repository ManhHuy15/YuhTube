import { useState } from 'react'
import { HomeHeader } from './components/HomeHeader'
import { HomeSidebar } from './components/HomeSidebar'
import { CategoryChips } from './components/CategoryChips'
import { VideoCard } from './components/VideoCard'
import { useHomeFeed } from './hooks/useHomeFeed'

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { videos, isLoading } = useHomeFeed(selectedCategory)

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1] flex flex-col selection:bg-red-600/30">
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
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40">
                  <span className="material-symbols-outlined text-3xl">smart_display</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">No videos found</h3>
                <p className="text-sm text-white/50 max-w-sm">
                  There are no videos available in this category. Upload a video or try selecting another category.
                </p>
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
